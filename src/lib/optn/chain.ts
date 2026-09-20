import type {
  ChainSnapshot,
  ChainTxStatus,
  Network,
  Outpoint,
  TokenState,
  UtxoState,
  WalletChainSnapshot,
} from "./types.ts";
import { ElectrumClient } from "@electrum-cash/network";
import { ElectrumWebSocket } from "@electrum-cash/web-socket";
import {
  binToHex,
  EMPTY_TOKEN,
  decodeTransaction,
  detectLockingType,
  hexToBin,
  lockingBytecodeHexFromAddress,
  sha256,
} from "./encoding.ts";
import { demoOperatorUtxos, demoVaultUtxo } from "./fixtures.ts";
import { parseSatoshis } from "./money.ts";

export type { ChainTxStatus };

export type ObservedOutput = UtxoState & {
  rawTxHex: string | null;
};

export interface ChainProvider {
  kind: "fixture" | "chronik" | "electrum";
  getSnapshot(network: Network): Promise<ChainSnapshot>;
  getRawTransaction(network: Network, txid: string): Promise<string | null>;
  getTransactionOutput(network: Network, outpoint: Outpoint): Promise<ObservedOutput | null>;
  proveUnspent(network: Network, outpoint: Outpoint): Promise<ObservedOutput>;
  getUtxos(network: Network, ownerOrLock: string): Promise<UtxoState[]>;
  getOutpoint(network: Network, outpoint: Outpoint): Promise<UtxoState | null>;
  getStatus(network: Network, txid: string): Promise<ChainTxStatus>;
  preflight(network: Network, rawTxHex: string): Promise<{ ok: boolean; error: string | null }>;
  broadcast(network: Network, rawTxHex: string): Promise<{ txid: string }>;
}

export type WalletChainRead = {
  utxos: UtxoState[];
  wallet: WalletChainSnapshot | null;
  walletError: string | null;
};

function summarizeWallet(account: string, utxos: UtxoState[]): WalletChainSnapshot {
  return {
    account,
    balanceSatoshis: utxos
      .reduce((sum, utxo) => sum + parseSatoshis(utxo.valueSatoshis), 0n)
      .toString(),
    utxoCount: utxos.length,
    tokenUtxoCount: utxos.filter((utxo) => utxo.token.categoryHex !== null).length,
    confirmedUtxoCount: utxos.filter((utxo) => utxo.confirmations > 0).length,
  };
}

export async function readWalletChainState(
  provider: ChainProvider,
  network: Network,
  account: string,
  allowFixtureData: boolean,
): Promise<WalletChainRead> {
  if (provider.kind === "fixture" && !allowFixtureData) {
    return {
      utxos: [],
      wallet: null,
      walletError: "No live chain provider is configured; wallet balance and UTXOs are unavailable",
    };
  }

  try {
    const utxos =
      provider.kind === "fixture" ? demoOperatorUtxos() : await provider.getUtxos(network, account);
    return { utxos, wallet: summarizeWallet(account, utxos), walletError: null };
  } catch (error) {
    return {
      utxos: [],
      wallet: null,
      walletError: error instanceof Error ? error.message : "Wallet chain lookup failed",
    };
  }
}

function keyOf(outpoint: Outpoint): string {
  return `${outpoint.txid.toLowerCase()}:${outpoint.vout}`;
}

function rawTxBody(rawTxHex: string): ArrayBuffer {
  const bytes = hexToBin(rawTxHex);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

export function parseChronikToken(output: {
  token?: {
    tokenId?: string;
    amount?: string | number;
    capability?: string;
    commitment?: string;
    nft?: { capability?: string; commitment?: string };
  } | null;
  tokenEvidence?: never;
}): { token: TokenState; tokenEvidence: UtxoState["tokenEvidence"] } {
  if (!("token" in output) || output.token === undefined) {
    return { token: EMPTY_TOKEN, tokenEvidence: "unknown" };
  }
  if (output.token === null) {
    return { token: EMPTY_TOKEN, tokenEvidence: "provider-omitted" };
  }
  const capability = (output.token.nft?.capability ??
    output.token.capability ??
    "none") as TokenState["nftCapability"];
  return {
    token: {
      categoryHex: output.token.tokenId ?? null,
      amount: String(output.token.amount ?? "0"),
      nftCapability: capability === "mutable" || capability === "minting" ? capability : "none",
      commitmentHex: output.token.nft?.commitment ?? output.token.commitment ?? null,
    },
    tokenEvidence: "provider-reported",
  };
}

export class FixtureChainProvider implements ChainProvider {
  kind = "fixture" as const;
  private spent = new Set<string>();
  private broadcasts = new Map<string, string>();

  private catalog() {
    return [demoVaultUtxo(), ...demoOperatorUtxos()];
  }

  async getSnapshot(network: Network): Promise<ChainSnapshot> {
    return {
      network,
      provider: "fixture",
      source: "deterministic fixture",
      reachable: false,
      height: null,
      serverVersion: null,
      genesisHash: null,
      latencyMs: null,
      checkedAt: new Date().toISOString(),
      error: "No live chain provider is configured",
    };
  }

  async getRawTransaction(_network: Network, txid: string): Promise<string | null> {
    return this.broadcasts.get(txid.toLowerCase()) ?? null;
  }

  async getTransactionOutput(network: Network, outpoint: Outpoint): Promise<ObservedOutput | null> {
    const match = this.catalog().find(
      (utxo) =>
        utxo.network === network &&
        utxo.outpoint.txid === outpoint.txid &&
        utxo.outpoint.vout === outpoint.vout,
    );
    if (!match) return null;
    const spent = this.spent.has(keyOf(outpoint));
    return {
      ...match,
      spent,
      spentEvidence: spent ? "provider-spent" : match.spentEvidence,
      rawTxHex: null,
    };
  }

  async proveUnspent(network: Network, outpoint: Outpoint): Promise<ObservedOutput> {
    const observed = await this.getTransactionOutput(network, outpoint);
    if (!observed) throw new Error("Outpoint not found");
    if (observed.spent || observed.spentEvidence === "provider-spent") {
      throw new Error("Outpoint is spent");
    }
    if (observed.spentEvidence !== "provider-unspent" && observed.spentEvidence !== "fixture") {
      throw new Error("Provider did not prove the outpoint is unspent");
    }
    return observed;
  }

  async getUtxos(network: Network, ownerOrLock: string): Promise<UtxoState[]> {
    return this.catalog()
      .filter((utxo) => utxo.network === network)
      .filter(
        (utxo) =>
          utxo.address === ownerOrLock ||
          utxo.lockingBytecodeHex === ownerOrLock ||
          ownerOrLock === "vault",
      )
      .map((utxo) => ({
        ...utxo,
        spent: this.spent.has(keyOf(utxo.outpoint)),
        spentEvidence: this.spent.has(keyOf(utxo.outpoint)) ? "provider-spent" : utxo.spentEvidence,
      }));
  }

  async getOutpoint(network: Network, outpoint: Outpoint): Promise<UtxoState | null> {
    return this.getTransactionOutput(network, outpoint);
  }

  async getStatus(_network: Network, txid: string): Promise<ChainTxStatus> {
    if (this.broadcasts.has(txid.toLowerCase())) {
      return {
        txid,
        kind: "unknown",
        mempool: false,
        confirmations: 0,
        confirmed: false,
        height: null,
        reason: "fixture-unbroadcastable",
      };
    }
    return {
      txid,
      kind: "not-found",
      mempool: false,
      confirmations: 0,
      confirmed: false,
      height: null,
    };
  }

  async preflight(
    network: Network,
    rawTxHex: string,
  ): Promise<{ ok: boolean; error: string | null }> {
    try {
      const decoded = decodeTransaction(hexToBin(rawTxHex));
      if (typeof decoded === "string") return { ok: false, error: decoded };
      for (const input of decoded.inputs) {
        const txid = [...input.outpointTransactionHash]
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        try {
          await this.proveUnspent(network, { txid, vout: input.outpointIndex });
        } catch (error) {
          return { ok: false, error: error instanceof Error ? error.message : "Preflight failed" };
        }
      }
      return { ok: true, error: null };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Preflight failed" };
    }
  }

  async broadcast(): Promise<{ txid: string }> {
    throw new Error(
      "Fixture provider refuses broadcast. Chipnet broadcast requires a configured provider.",
    );
  }

  markSpent(outpoint: Outpoint) {
    this.spent.add(keyOf(outpoint));
  }
}

type ChronikOutput = {
  sats?: string | number;
  outputScript?: string;
  token?: Parameters<typeof parseChronikToken>[0]["token"];
  spentBy?: { txid?: string; outIdx?: number } | null;
};

type ChronikTx = {
  txid?: string;
  hex?: string;
  raw?: string;
  block?: { height?: number };
  outputs?: ChronikOutput[];
};

export class ChronikChainProvider implements ChainProvider {
  kind = "chronik" as const;
  private readonly baseUrl: string;
  private readonly broadcastBaseUrl?: string;
  constructor(baseUrl: string, broadcastBaseUrl?: string) {
    this.baseUrl = baseUrl;
    this.broadcastBaseUrl = broadcastBaseUrl;
  }

  private url(path: string) {
    return `${this.baseUrl.replace(/\/$/, "")}${path}`;
  }

  private async fetchJson(path: string): Promise<{ status: number; body: unknown }> {
    const response = await fetch(this.url(path));
    const body = await response.json().catch(() => null);
    return { status: response.status, body };
  }

  async getSnapshot(network: Network): Promise<ChainSnapshot> {
    const started = Date.now();
    try {
      const { status, body } = await this.fetchJson("/blockchain-info");
      if (status !== 200) throw new Error(`Indexer returned ${status}`);
      const info = body as { tipHeight?: number; tipHash?: string; serverVersion?: string };
      return {
        network,
        provider: "chronik",
        source: new URL(this.baseUrl).host,
        reachable: true,
        height: info.tipHeight ?? null,
        serverVersion: info.serverVersion ?? "Chronik-compatible",
        genesisHash: null,
        latencyMs: Date.now() - started,
        checkedAt: new Date().toISOString(),
        error: null,
      };
    } catch (error) {
      return {
        network,
        provider: "chronik",
        source: safeProviderLabel(this.baseUrl),
        reachable: false,
        height: null,
        serverVersion: null,
        genesisHash: null,
        latencyMs: Date.now() - started,
        checkedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Indexer check failed",
      };
    }
  }

  async getRawTransaction(_network: Network, txid: string): Promise<string | null> {
    for (const path of [`/raw-tx/${txid}`, `/tx/${txid}/raw`]) {
      const response = await fetch(this.url(path));
      if (response.status === 404) continue;
      if (!response.ok) continue;
      const text = await response.text();
      const hex = text.replace(/"/g, "").trim();
      if (/^[0-9a-f]+$/i.test(hex) && hex.length > 20) return hex;
    }
    const { status, body } = await this.fetchJson(`/tx/${txid}`);
    if (status === 404) return null;
    if (status !== 200) throw new Error(`Indexer returned ${status}`);
    const tx = body as ChronikTx;
    return tx.hex ?? tx.raw ?? null;
  }

  async getTransactionOutput(network: Network, outpoint: Outpoint): Promise<ObservedOutput | null> {
    const { status, body } = await this.fetchJson(`/tx/${outpoint.txid}`);
    if (status === 404) return null;
    if (status !== 200) throw new Error(`Indexer returned ${status}`);
    const tx = body as ChronikTx;
    const output = tx.outputs?.[outpoint.vout];
    if (!output) return null;
    const lockingBytecodeHex = output.outputScript ?? "";
    const tokenFieldMissing = !("token" in output);
    const parsed = tokenFieldMissing
      ? { token: EMPTY_TOKEN, tokenEvidence: "unknown" as const }
      : parseChronikToken(output);
    const spentBy = output.spentBy;
    const spent = Boolean(spentBy?.txid);
    return {
      network,
      outpoint,
      valueSatoshis: String(output.sats ?? "0"),
      lockingBytecodeHex,
      address: null,
      token: parsed.token,
      tokenEvidence: parsed.tokenEvidence,
      spent,
      spentEvidence: spent ? "provider-spent" : "unknown",
      confirmations: tx.block?.height ? 1 : 0,
      chainEvidence: "provider-observed",
      lockingType: detectLockingType(lockingBytecodeHex),
      rawTxHex: tx.hex ?? tx.raw ?? null,
      blockHeight: tx.block?.height ?? null,
    };
  }

  private scriptUtxoPath(lockingBytecodeHex: string): string | null {
    const type = detectLockingType(lockingBytecodeHex);
    if (type === "p2pkh") return `/script/p2pkh/${lockingBytecodeHex.slice(6, 46)}/utxos`;
    if (type === "p2sh32") return `/script/p2sh32/${lockingBytecodeHex.slice(4, 68)}/utxos`;
    if (type === "p2sh20") return `/script/p2sh/${lockingBytecodeHex.slice(2, 42)}/utxos`;
    return `/script/other/${lockingBytecodeHex}/utxos`;
  }

  async proveUnspent(network: Network, outpoint: Outpoint): Promise<ObservedOutput> {
    const observed = await this.getTransactionOutput(network, outpoint);
    if (!observed) throw new Error("Outpoint not found");
    if (observed.spentEvidence === "provider-spent") throw new Error("Outpoint is spent");
    const path = this.scriptUtxoPath(observed.lockingBytecodeHex);
    if (!path) throw new Error("Cannot query UTXO set for this locking type");
    const { status, body } = await this.fetchJson(path);
    if (status !== 200) throw new Error(`UTXO set lookup failed (${status})`);
    const rows = Array.isArray(body)
      ? body
      : ((body as { utxos?: Array<{ outpoint?: { txid?: string; outIdx?: number } }> }).utxos ??
        []);
    const listed = rows.some(
      (row) =>
        (row.outpoint?.txid ?? "").toLowerCase() === outpoint.txid.toLowerCase() &&
        row.outpoint?.outIdx === outpoint.vout,
    );
    if (!listed) {
      throw new Error("Outpoint exists in history but is not in the UTXO set");
    }
    return {
      ...observed,
      spent: false,
      spentEvidence: "provider-unspent",
    };
  }

  async getUtxos(network: Network, ownerOrLock: string): Promise<UtxoState[]> {
    const lockingBytecodeHex = ownerOrLock.includes(":")
      ? lockingBytecodeHexFromAddress(ownerOrLock)
      : ownerOrLock;
    const path = this.scriptUtxoPath(lockingBytecodeHex);
    if (!path) return [];
    const { status, body } = await this.fetchJson(path);
    if (status !== 200) throw new Error(`Indexer returned ${status}`);
    const rows = Array.isArray(body)
      ? body
      : ((
          body as {
            utxos?: Array<{
              outpoint?: { txid?: string; outIdx?: number };
              sats?: string | number;
              token?: ChronikOutput["token"];
            }>;
          }
        ).utxos ?? []);
    return rows.map((row) => {
      const parsed =
        "token" in row
          ? parseChronikToken(row)
          : { token: EMPTY_TOKEN, tokenEvidence: "unknown" as const };
      return {
        network,
        outpoint: { txid: row.outpoint?.txid ?? "", vout: row.outpoint?.outIdx ?? 0 },
        valueSatoshis: String((row as { sats?: string | number }).sats ?? "0"),
        lockingBytecodeHex,
        address: ownerOrLock.includes(":") ? ownerOrLock : null,
        token: parsed.token,
        tokenEvidence: parsed.tokenEvidence,
        spent: false,
        spentEvidence: "provider-unspent" as const,
        confirmations: 0,
        chainEvidence: "provider-observed" as const,
        lockingType: detectLockingType(lockingBytecodeHex),
      };
    });
  }

  async getOutpoint(network: Network, outpoint: Outpoint): Promise<UtxoState | null> {
    try {
      return await this.proveUnspent(network, outpoint);
    } catch {
      const observed = await this.getTransactionOutput(network, outpoint);
      if (!observed) return null;
      return {
        ...observed,
        spent: true,
        spentEvidence: observed.spentEvidence === "provider-spent" ? "provider-spent" : "unknown",
      };
    }
  }

  async getStatus(_network: Network, txid: string): Promise<ChainTxStatus> {
    const { status, body } = await this.fetchJson(`/tx/${txid}`);
    if (status === 404) {
      return {
        txid,
        kind: "not-found",
        mempool: false,
        confirmations: 0,
        confirmed: false,
        height: null,
      };
    }
    if (status !== 200) {
      return {
        txid,
        kind: "unknown",
        mempool: false,
        confirmations: 0,
        confirmed: false,
        height: null,
        reason: `indexer ${status}`,
      };
    }
    const tx = body as ChronikTx;
    const height = tx.block?.height ?? null;
    if (height && height > 0) {
      return { txid, kind: "confirmed", mempool: false, confirmations: 1, confirmed: true, height };
    }
    return {
      txid,
      kind: "mempool",
      mempool: true,
      confirmations: 0,
      confirmed: false,
      height: null,
    };
  }

  async preflight(
    network: Network,
    rawTxHex: string,
  ): Promise<{ ok: boolean; error: string | null }> {
    try {
      const decoded = decodeTransaction(hexToBin(rawTxHex));
      if (typeof decoded === "string") return { ok: false, error: decoded };
      const binToHexLocal = (bin: Uint8Array) =>
        [...bin].map((b) => b.toString(16).padStart(2, "0")).join("");
      for (const input of decoded.inputs) {
        try {
          await this.proveUnspent(network, {
            txid: binToHexLocal(input.outpointTransactionHash),
            vout: input.outpointIndex,
          });
        } catch (error) {
          return { ok: false, error: error instanceof Error ? error.message : "Preflight failed" };
        }
      }
      // Chronik exposes a consensus/mempool preflight endpoint. Keep the
      // input-proof fallback for older Chronik-compatible providers, but never
      // turn a definitive provider rejection into a local success.
      const validation = await fetch(this.url("/validate-tx"), {
        method: "POST",
        headers: { "content-type": "application/octet-stream" },
        body: rawTxBody(rawTxHex),
      });
      if (validation.status !== 404 && validation.status !== 405) {
        if (!validation.ok) {
          const text = await validation.text();
          return { ok: false, error: `Provider validation rejected: ${validation.status} ${text}` };
        }
        return { ok: true, error: null };
      }
      return { ok: true, error: null };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Preflight failed" };
    }
  }

  async broadcast(_network: Network, rawTxHex: string): Promise<{ txid: string }> {
    const base = (this.broadcastBaseUrl ?? this.baseUrl).replace(/\/$/, "");
    const paths = ["/broadcast-tx", "/tx"];
    for (const path of paths) {
      const response = await fetch(`${base}${path}`, {
        method: "POST",
        headers: { "content-type": "application/octet-stream" },
        body: rawTxBody(rawTxHex),
      });
      if (response.status === 404 && path !== paths.at(-1)) continue;
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Broadcast rejected: ${response.status} ${text}`);
      }
      const body = await response.text();
      return { txid: body.replace(/"/g, "").trim() };
    }
    throw new Error("Broadcast endpoint was not found");
  }
}

type ElectrumToken = {
  amount?: string | number;
  category?: string;
  nft?: { capability?: string; commitment?: string };
};

type ElectrumUtxo = {
  tx_hash?: string;
  tx_pos?: number;
  value?: string | number;
  height?: number;
  token_data?: ElectrumToken;
};

type ElectrumHeader = { height?: number; hex?: string };
type ElectrumFeatures = { server_version?: string; genesis_hash?: string };

const EXPECTED_GENESIS: Record<Network, string> = {
  chipnet: "000000001dd410c49a788668ce26751718cc797474d3152a5fc073dd44fd9f7b",
  mainnet: "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f",
};

export function parseElectrumEndpoint(value: string): {
  host: string;
  port: number;
  encrypted: boolean;
  label: string;
} {
  const trimmed = value.trim();
  const url = trimmed.includes("://") ? new URL(trimmed) : new URL(`wss://${trimmed}`);
  if (url.protocol !== "wss:" && url.protocol !== "ws:") {
    throw new Error("Electrum endpoint must use wss:// (or ws:// on loopback)");
  }
  const loopback =
    url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "::1";
  if (url.protocol === "ws:" && !loopback) {
    throw new Error("Unencrypted Electrum WebSocket is allowed only on loopback");
  }
  const port = Number(url.port || (url.protocol === "wss:" ? 50004 : 50003));
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid Electrum port");
  return {
    host: url.hostname,
    port,
    encrypted: url.protocol === "wss:",
    label: `${url.hostname}:${port}`,
  };
}

export function electrumScriptHash(lockingBytecodeHex: string): string {
  return binToHex(sha256.hash(hexToBin(lockingBytecodeHex)).reverse());
}

export function parseElectrumToken(token: ElectrumToken | undefined): {
  token: TokenState;
  tokenEvidence: UtxoState["tokenEvidence"];
} {
  if (!token) return { token: EMPTY_TOKEN, tokenEvidence: "provider-reported" };
  const capability = token.nft?.capability;
  return {
    token: {
      categoryHex: token.category ?? null,
      amount: String(token.amount ?? "0"),
      nftCapability: capability === "mutable" || capability === "minting" ? capability : "none",
      commitmentHex: token.nft?.commitment ?? null,
    },
    tokenEvidence: "provider-reported",
  };
}

function safeProviderLabel(value: string): string {
  try {
    return new URL(value).host;
  } catch {
    return "configured provider";
  }
}

export class ElectrumChainProvider implements ChainProvider {
  kind = "electrum" as const;
  private readonly endpoint: ReturnType<typeof parseElectrumEndpoint>;

  constructor(endpoint: string) {
    this.endpoint = parseElectrumEndpoint(endpoint);
  }

  private async request<T>(
    method: string,
    ...parameters: Array<string | number | boolean>
  ): Promise<T> {
    const socket = new ElectrumWebSocket(
      this.endpoint.host,
      this.endpoint.port,
      this.endpoint.encrypted,
      8_000,
    );
    const client = new ElectrumClient("OPTN Dashboard", "1.4.1", socket);
    try {
      await client.connect();
      const result = await client.request(method, ...parameters);
      if (result instanceof Error) throw result;
      return result as T;
    } finally {
      await client.disconnect().catch(() => false);
    }
  }

  async getSnapshot(network: Network): Promise<ChainSnapshot> {
    const started = Date.now();
    try {
      const [header, features] = await Promise.all([
        this.request<ElectrumHeader>("blockchain.headers.subscribe"),
        this.request<ElectrumFeatures>("server.features"),
      ]);
      const genesisHash = features.genesis_hash ?? null;
      if (genesisHash?.toLowerCase() !== EXPECTED_GENESIS[network]) {
        throw new Error(`Provider genesis does not match ${network}`);
      }
      return {
        network,
        provider: "electrum",
        source: this.endpoint.label,
        reachable: true,
        height: header.height ?? null,
        serverVersion: features.server_version ?? "Electrum",
        genesisHash,
        latencyMs: Date.now() - started,
        checkedAt: new Date().toISOString(),
        error: null,
      };
    } catch (error) {
      return {
        network,
        provider: "electrum",
        source: this.endpoint.label,
        reachable: false,
        height: null,
        serverVersion: null,
        genesisHash: null,
        latencyMs: Date.now() - started,
        checkedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Electrum check failed",
      };
    }
  }

  async getRawTransaction(_network: Network, txid: string): Promise<string | null> {
    try {
      return await this.request<string>("blockchain.transaction.get", txid);
    } catch (error) {
      if (
        /not found|unknown transaction/i.test(
          error instanceof Error ? error.message : String(error),
        )
      )
        return null;
      throw error;
    }
  }

  async getTransactionOutput(network: Network, outpoint: Outpoint): Promise<ObservedOutput | null> {
    const rawTxHex = await this.getRawTransaction(network, outpoint.txid);
    if (!rawTxHex) return null;
    const decoded = decodeTransaction(hexToBin(rawTxHex));
    if (typeof decoded === "string")
      throw new Error(`Could not decode provider transaction: ${decoded}`);
    const output = decoded.outputs[outpoint.vout];
    if (!output) return null;
    const tokenData = output.token
      ? {
          category: binToHex(output.token.category),
          amount: output.token.amount.toString(),
          nft: output.token.nft
            ? {
                capability: output.token.nft.capability,
                commitment: binToHex(output.token.nft.commitment),
              }
            : undefined,
        }
      : undefined;
    const parsed = parseElectrumToken(tokenData);
    const status = await this.getStatus(network, outpoint.txid);
    const lockingBytecodeHex = binToHex(output.lockingBytecode);
    return {
      network,
      outpoint,
      valueSatoshis: output.valueSatoshis.toString(),
      lockingBytecodeHex,
      address: null,
      token: parsed.token,
      tokenEvidence: parsed.tokenEvidence,
      spent: false,
      spentEvidence: "unknown",
      confirmations: status.confirmations,
      chainEvidence: "provider-observed",
      lockingType: detectLockingType(lockingBytecodeHex),
      rawTxHex,
      blockHeight: status.height,
    };
  }

  async getUtxos(network: Network, ownerOrLock: string): Promise<UtxoState[]> {
    const lockingBytecodeHex = ownerOrLock.includes(":")
      ? lockingBytecodeHexFromAddress(ownerOrLock)
      : ownerOrLock;
    const [rows, snapshot] = await Promise.all([
      this.request<ElectrumUtxo[]>(
        "blockchain.scripthash.listunspent",
        electrumScriptHash(lockingBytecodeHex),
        "include_tokens",
      ),
      this.getSnapshot(network),
    ]);
    if (!snapshot.reachable || snapshot.height == null) {
      throw new Error(snapshot.error ?? "Could not verify Electrum network tip");
    }
    return rows.map((row) => {
      const height = Number(row.height ?? 0);
      const parsed = parseElectrumToken(row.token_data);
      return {
        network,
        outpoint: { txid: row.tx_hash ?? "", vout: Number(row.tx_pos ?? 0) },
        valueSatoshis: String(row.value ?? "0"),
        lockingBytecodeHex,
        address: ownerOrLock.includes(":") ? ownerOrLock : null,
        token: parsed.token,
        tokenEvidence: parsed.tokenEvidence,
        spent: false,
        spentEvidence: "provider-unspent" as const,
        confirmations: height > 0 ? Math.max(1, snapshot.height! - height + 1) : 0,
        chainEvidence: "provider-observed" as const,
        lockingType: detectLockingType(lockingBytecodeHex),
        blockHeight: height > 0 ? height : null,
      };
    });
  }

  async proveUnspent(network: Network, outpoint: Outpoint): Promise<ObservedOutput> {
    const observed = await this.getTransactionOutput(network, outpoint);
    if (!observed) throw new Error("Outpoint not found");
    const rows = await this.getUtxos(network, observed.lockingBytecodeHex);
    const match = rows.find(
      (row) =>
        row.outpoint.txid.toLowerCase() === outpoint.txid.toLowerCase() &&
        row.outpoint.vout === outpoint.vout,
    );
    if (!match) throw new Error("Outpoint exists in history but is not in the UTXO set");
    return { ...observed, ...match, rawTxHex: observed.rawTxHex };
  }

  async getOutpoint(network: Network, outpoint: Outpoint): Promise<UtxoState | null> {
    try {
      return await this.proveUnspent(network, outpoint);
    } catch {
      const observed = await this.getTransactionOutput(network, outpoint);
      return observed ? { ...observed, spent: true, spentEvidence: "provider-spent" } : null;
    }
  }

  async getStatus(_network: Network, txid: string): Promise<ChainTxStatus> {
    try {
      const result = await this.request<{ height?: number; confirmations?: number }>(
        "blockchain.transaction.get",
        txid,
        true,
      );
      const height = Number(result.height ?? 0);
      const confirmations = Number(result.confirmations ?? 0);
      if (height > 0 || confirmations > 0) {
        return { txid, kind: "confirmed", mempool: false, confirmations, confirmed: true, height };
      }
      return {
        txid,
        kind: "mempool",
        mempool: true,
        confirmations: 0,
        confirmed: false,
        height: null,
      };
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      if (/not found|unknown transaction/i.test(reason)) {
        return {
          txid,
          kind: "not-found",
          mempool: false,
          confirmations: 0,
          confirmed: false,
          height: null,
        };
      }
      return {
        txid,
        kind: "unknown",
        mempool: false,
        confirmations: 0,
        confirmed: false,
        height: null,
        reason,
      };
    }
  }

  async preflight(
    network: Network,
    rawTxHex: string,
  ): Promise<{ ok: boolean; error: string | null }> {
    const decoded = decodeTransaction(hexToBin(rawTxHex));
    if (typeof decoded === "string") return { ok: false, error: decoded };
    for (const input of decoded.inputs) {
      const txid = binToHex(input.outpointTransactionHash);
      try {
        await this.proveUnspent(network, { txid, vout: input.outpointIndex });
      } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : "Input proof failed" };
      }
    }
    return { ok: true, error: null };
  }

  async broadcast(_network: Network, rawTxHex: string): Promise<{ txid: string }> {
    const txid = await this.request<string>("blockchain.transaction.broadcast", rawTxHex);
    return { txid };
  }
}

export function createChainProvider(args: {
  indexerUrl: string | null;
  broadcastUrl: string | null;
}): ChainProvider {
  if (!args.indexerUrl) return new FixtureChainProvider();
  if (
    /^wss?:\/\//i.test(args.indexerUrl) ||
    (!args.indexerUrl.includes("://") && /^[^/]+(?::\d+)?$/.test(args.indexerUrl))
  ) {
    return new ElectrumChainProvider(args.indexerUrl);
  }
  return new ChronikChainProvider(args.indexerUrl, args.broadcastUrl ?? undefined);
}
