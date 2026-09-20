import type { Network, UtxoState } from "./types.ts";
import type SignClient from "@walletconnect/sign-client";
import { chainIdFor } from "./networks.ts";
import { concatBins, decodeTransaction, encodeDataPush, hexToBin } from "./encoding.ts";
import { parseSatoshis } from "./money.ts";

export type WalletConnectHandle = {
  uri: string | null;
  account: string;
  chainId: string;
  topic: string;
  methods: string[];
  signMessage: (message: string) => Promise<string>;
  signTransaction: (request: unknown) => Promise<string>;
  disconnect: () => Promise<void>;
};

type SignClientRegistry = Map<string, Promise<SignClient>>;

const signClientRegistry = ((
  globalThis as typeof globalThis & {
    __optnDashboardSignClients?: SignClientRegistry;
  }
).__optnDashboardSignClients ??= new Map());

async function signClientFor(args: {
  projectId: string;
  metadataUrl: string;
}): Promise<SignClient> {
  const key = `${args.projectId}:${args.metadataUrl}`;
  const existing = signClientRegistry.get(key);
  if (existing) return existing;

  const initializing = import("@walletconnect/sign-client").then(({ default: Client }) =>
    Client.init({
      projectId: args.projectId,
      metadata: {
        name: "OPTN Dashboard",
        description: "Covenant control plane for bounded BCH allocation",
        url: args.metadataUrl,
        icons: [`${args.metadataUrl}/favicon.svg`],
      },
    }),
  );
  signClientRegistry.set(key, initializing);
  void initializing.catch(() => signClientRegistry.delete(key));
  return initializing;
}

export function loginMethods(): string[] {
  return ["bch_signMessage"];
}

export function signingMethods(): string[] {
  return ["bch_signTransaction"];
}

export function normalizeWalletConnectPairingUri(uri: string): string {
  const normalized = uri.trim();
  if (!normalized.toLowerCase().startsWith("wc:")) {
    throw new Error("WalletConnect did not return a valid wc: pairing URI");
  }
  return normalized;
}

export function parseCaip10Account(value: string, network: Network): string {
  const expected = chainIdFor(network);
  const parts = value.split(":");
  if (parts.length === 3 && parts[0] === "bch") {
    const chain = `${parts[0]}:${parts[1]}`;
    if (chain !== expected)
      throw new Error(`WalletConnect chain ${chain} does not match ${expected}`);
    return `${parts[1]}:${parts[2]}`;
  }
  if (network === "chipnet" && value.startsWith("bchtest:")) return value;
  if (network === "mainnet" && value.startsWith("bitcoincash:")) return value;
  throw new Error("WalletConnect account is not a Chipnet/Mainnet cashaddr");
}

export function assertLoginNamespace(
  session: {
    namespaces?: Record<string, { chains?: string[]; accounts?: string[]; methods?: string[] }>;
  },
  network: Network,
) {
  const ns = session.namespaces?.bch;
  if (!ns) throw new Error("WalletConnect session has no bch namespace");
  const chainId = chainIdFor(network);
  const chains = ns.chains ?? [];
  const accounts = ns.accounts ?? [];
  if (!chains.includes(chainId) && !accounts.some((item) => item.startsWith(`${chainId}:`))) {
    throw new Error(`WalletConnect session is not on ${chainId}`);
  }
  const methods = ns.methods ?? [];
  if (methods.includes("bch_signTransaction") && !methods.includes("bch_signMessage")) {
    throw new Error("Login session must grant bch_signMessage");
  }
  if (!methods.includes("bch_signMessage")) {
    throw new Error("Login session does not grant bch_signMessage");
  }
}

export function assertSigningNamespace(
  session: { namespaces?: Record<string, { methods?: string[]; accounts?: string[] }> },
  network: Network,
  account: string,
) {
  const ns = session.namespaces?.bch;
  if (!ns) throw new Error("Signing session has no bch namespace");
  if (!(ns.methods ?? []).includes("bch_signTransaction")) {
    throw new Error("Signing session does not grant bch_signTransaction");
  }
  const cashAddress = account.includes(":") ? account.slice(account.indexOf(":") + 1) : account;
  const expected = `${chainIdFor(network)}:${cashAddress}`.toLowerCase();
  const accounts = ns.accounts ?? [];
  const normalized = accounts.map((item) => item.toLowerCase());
  if (accounts.length && !normalized.includes(expected)) {
    throw new Error("Signing session account does not match the authenticated operator");
  }
  return expected;
}

export function buildSignMessageParams(account: string, message: string) {
  return { address: account, message };
}

export function buildSignTransactionParams(args: {
  account: string;
  unsignedHex: string;
  source: UtxoState;
  redeemBytecodeHex: string;
  contractName?: string;
  userPrompt: string;
}) {
  const decoded = decodeTransaction(hexToBin(args.unsignedHex));
  if (typeof decoded === "string") throw new Error(`Unsigned transaction is invalid: ${decoded}`);
  if (decoded.inputs.length !== 1)
    throw new Error("BoundedRelease signing requires exactly one input");

  // OPTNWallet and other BCH WalletConnect signers detect covenant inputs from
  // the standard placeholder unlocking script and the contract metadata. An
  // empty unlocking script is insufficient: the wallet cannot know where to
  // place the covenant signature/public key/redeem script.
  const placeholderUnlockingBytecode = concatBins([
    encodeDataPush(new Uint8Array(65)),
    encodeDataPush(new Uint8Array(33)),
    encodeDataPush(hexToBin(args.redeemBytecodeHex)),
  ]);
  const transaction = {
    ...decoded,
    inputs: decoded.inputs.map((input, index) =>
      index === 0 ? { ...input, unlockingBytecode: placeholderUnlockingBytecode } : input,
    ),
  };
  const sourceInput = transaction.inputs[0]!;
  const sourceOutput = {
    ...sourceInput,
    lockingBytecode: hexToBin(args.source.lockingBytecodeHex),
    valueSatoshis: parseSatoshis(args.source.valueSatoshis),
    contract: {
      abiFunction: { name: "spend", covenant: true, inputs: [] },
      artifact: { contractName: args.contractName ?? "BoundedReleaseVault" },
      redeemScript: hexToBin(args.redeemBytecodeHex),
    },
  };
  return {
    account: args.account,
    broadcast: false,
    userPrompt: args.userPrompt,
    transaction,
    sourceOutputs: [sourceOutput],
  };
}

export function extractSignedTransaction(result: unknown): string {
  if (typeof result === "string") {
    const trimmed = result.trim();
    if (/^[0-9a-f]+$/i.test(trimmed)) return trimmed;
    try {
      return extractSignedTransaction(JSON.parse(trimmed));
    } catch {
      return trimmed;
    }
  }
  if (result && typeof result === "object") {
    const record = result as Record<string, unknown>;
    if (typeof record.signedTransaction === "string") return record.signedTransaction;
    if (typeof record.signedTxHex === "string") return record.signedTxHex;
    if (typeof record.hex === "string") return record.hex;
  }
  throw new Error("Wallet did not return a signed transaction hex");
}

async function connectWithMethods(args: {
  projectId: string;
  network: Network;
  metadataUrl: string;
  methods: string[];
  onUri?: (uri: string) => void;
}): Promise<WalletConnectHandle> {
  const client = await signClientFor(args);
  const chainId = chainIdFor(args.network);
  const { uri, approval } = await client.connect({
    requiredNamespaces: {
      bch: {
        chains: [chainId],
        methods: args.methods,
        events: ["addressesChanged"],
      },
    },
  });
  const pairingUri = uri ? normalizeWalletConnectPairingUri(uri) : null;
  if (pairingUri && args.onUri) args.onUri(pairingUri);
  const session = await approval();
  if (args.methods.includes("bch_signMessage") && !args.methods.includes("bch_signTransaction")) {
    assertLoginNamespace(session, args.network);
  } else {
    assertSigningNamespace(
      session,
      args.network,
      parseCaip10Account((session.namespaces.bch?.accounts ?? [])[0] ?? "", args.network),
    );
  }
  const accounts = session.namespaces.bch?.accounts ?? [];
  const account = parseCaip10Account(accounts[0] ?? "", args.network);
  return {
    uri: pairingUri,
    account,
    chainId,
    topic: session.topic,
    methods: session.namespaces.bch?.methods ?? args.methods,
    async signMessage(message: string) {
      if (!(session.namespaces.bch?.methods ?? args.methods).includes("bch_signMessage")) {
        throw new Error("This WalletConnect session does not grant bch_signMessage");
      }
      const result = await client.request({
        topic: session.topic,
        chainId,
        request: { method: "bch_signMessage", params: buildSignMessageParams(account, message) },
      });
      return typeof result === "string" ? result : JSON.stringify(result);
    },
    async signTransaction(request: unknown) {
      if (!(session.namespaces.bch?.methods ?? args.methods).includes("bch_signTransaction")) {
        throw new Error(
          "This WalletConnect session does not grant bch_signTransaction. Connect a signing session after approval.",
        );
      }
      const result = await client.request({
        topic: session.topic,
        chainId,
        request: { method: "bch_signTransaction", params: request },
      });
      return extractSignedTransaction(result);
    },
    async disconnect() {
      await client.disconnect({
        topic: session.topic,
        reason: { code: 6000, message: "User disconnected" },
      });
    },
  };
}

let cachedLogin: WalletConnectHandle | null = null;
let cachedSigning: WalletConnectHandle | null = null;

export function cachedLoginHandle(): WalletConnectHandle | null {
  return cachedLogin;
}

export function cachedSigningHandle(): WalletConnectHandle | null {
  return cachedSigning;
}

export async function connectWalletConnect(args: {
  projectId: string;
  network: Network;
  metadataUrl: string;
  onUri?: (uri: string) => void;
}): Promise<WalletConnectHandle> {
  return connectWalletConnectLogin(args);
}

export async function connectWalletConnectLogin(args: {
  projectId: string;
  network: Network;
  metadataUrl: string;
  onUri?: (uri: string) => void;
}): Promise<WalletConnectHandle> {
  const handle = await connectWithMethods({ ...args, methods: loginMethods() });
  cachedLogin = handle;
  return handle;
}

export async function connectWalletConnectSigning(args: {
  projectId: string;
  network: Network;
  metadataUrl: string;
  onUri?: (uri: string) => void;
}): Promise<WalletConnectHandle> {
  const handle = await connectWithMethods({ ...args, methods: signingMethods() });
  cachedSigning = handle;
  return handle;
}

export async function disconnectWalletConnectCaches() {
  try {
    await cachedLogin?.disconnect();
  } catch {
    /* already gone */
  }
  try {
    await cachedSigning?.disconnect();
  } catch {
    /* already gone */
  }
  cachedLogin = null;
  cachedSigning = null;
}
