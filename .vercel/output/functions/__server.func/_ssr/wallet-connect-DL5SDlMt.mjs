import { s as __toESM } from "../_runtime.mjs";
import { b as hexToBin, i as encodeDataPush, s as decodeTransaction } from "../_libs/bitauth__libauth.mjs";
import { k as parseSatoshis, x as concatBins, y as chainIdFor } from "./artifacts-lsD7QsAY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/wallet-connect-DL5SDlMt.js
var signClientRegistry = globalThis.__optnDashboardSignClients ??= /* @__PURE__ */ new Map();
async function signClientFor(args) {
	const key = `${args.projectId}:${args.metadataUrl}`;
	const existing = signClientRegistry.get(key);
	if (existing) return existing;
	const initializing = import("../_libs/_7.mjs").then((m) => /* @__PURE__ */ __toESM(m.default)).then(({ default: Client }) => Client.init({
		projectId: args.projectId,
		metadata: {
			name: "OPTN Dashboard",
			description: "Covenant control plane for bounded BCH allocation",
			url: args.metadataUrl,
			icons: [`${args.metadataUrl}/favicon.svg`]
		}
	}));
	signClientRegistry.set(key, initializing);
	initializing.catch(() => signClientRegistry.delete(key));
	return initializing;
}
function loginMethods() {
	return ["bch_signMessage"];
}
function signingMethods() {
	return ["bch_signTransaction"];
}
function normalizeWalletConnectPairingUri(uri) {
	const normalized = uri.trim();
	if (!normalized.toLowerCase().startsWith("wc:")) throw new Error("WalletConnect did not return a valid wc: pairing URI");
	return normalized;
}
function parseCaip10Account(value, network) {
	const expected = chainIdFor(network);
	const parts = value.split(":");
	if (parts.length === 3 && parts[0] === "bch") {
		const chain = `${parts[0]}:${parts[1]}`;
		if (chain !== expected) throw new Error(`WalletConnect chain ${chain} does not match ${expected}`);
		return `${parts[1]}:${parts[2]}`;
	}
	if (network === "chipnet" && value.startsWith("bchtest:")) return value;
	if (network === "mainnet" && value.startsWith("bitcoincash:")) return value;
	throw new Error("WalletConnect account is not a Chipnet/Mainnet cashaddr");
}
function assertLoginNamespace(session, network) {
	const ns = session.namespaces?.bch;
	if (!ns) throw new Error("WalletConnect session has no bch namespace");
	const chainId = chainIdFor(network);
	const chains = ns.chains ?? [];
	const accounts = ns.accounts ?? [];
	if (!chains.includes(chainId) && !accounts.some((item) => item.startsWith(`${chainId}:`))) throw new Error(`WalletConnect session is not on ${chainId}`);
	const methods = ns.methods ?? [];
	if (methods.includes("bch_signTransaction") && !methods.includes("bch_signMessage")) throw new Error("Login session must grant bch_signMessage");
	if (!methods.includes("bch_signMessage")) throw new Error("Login session does not grant bch_signMessage");
}
function assertSigningNamespace(session, network, account) {
	const ns = session.namespaces?.bch;
	if (!ns) throw new Error("Signing session has no bch namespace");
	if (!(ns.methods ?? []).includes("bch_signTransaction")) throw new Error("Signing session does not grant bch_signTransaction");
	const cashAddress = account.includes(":") ? account.slice(account.indexOf(":") + 1) : account;
	const expected = `${chainIdFor(network)}:${cashAddress}`.toLowerCase();
	const accounts = ns.accounts ?? [];
	const normalized = accounts.map((item) => item.toLowerCase());
	if (accounts.length && !normalized.includes(expected)) throw new Error("Signing session account does not match the authenticated operator");
	return expected;
}
function buildSignMessageParams(account, message) {
	return {
		address: account,
		message
	};
}
function buildSignTransactionParams(args) {
	const decoded = decodeTransaction(hexToBin(args.unsignedHex));
	if (typeof decoded === "string") throw new Error(`Unsigned transaction is invalid: ${decoded}`);
	if (decoded.inputs.length !== 1) throw new Error("BoundedRelease signing requires exactly one input");
	const placeholderUnlockingBytecode = concatBins([
		encodeDataPush(/* @__PURE__ */ new Uint8Array(65)),
		encodeDataPush(/* @__PURE__ */ new Uint8Array(33)),
		encodeDataPush(hexToBin(args.redeemBytecodeHex))
	]);
	const transaction = {
		...decoded,
		inputs: decoded.inputs.map((input, index) => index === 0 ? {
			...input,
			unlockingBytecode: placeholderUnlockingBytecode
		} : input)
	};
	const sourceOutput = {
		...transaction.inputs[0],
		lockingBytecode: hexToBin(args.source.lockingBytecodeHex),
		valueSatoshis: parseSatoshis(args.source.valueSatoshis),
		contract: {
			abiFunction: {
				name: "spend",
				covenant: true,
				inputs: []
			},
			artifact: { contractName: args.contractName ?? "BoundedReleaseVault" },
			redeemScript: hexToBin(args.redeemBytecodeHex)
		}
	};
	return {
		account: args.account,
		broadcast: false,
		userPrompt: args.userPrompt,
		transaction,
		sourceOutputs: [sourceOutput]
	};
}
function extractSignedTransaction(result) {
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
		const record = result;
		if (typeof record.signedTransaction === "string") return record.signedTransaction;
		if (typeof record.signedTxHex === "string") return record.signedTxHex;
		if (typeof record.hex === "string") return record.hex;
	}
	throw new Error("Wallet did not return a signed transaction hex");
}
async function connectWithMethods(args) {
	const client = await signClientFor(args);
	const chainId = chainIdFor(args.network);
	const { uri, approval } = await client.connect({ requiredNamespaces: { bch: {
		chains: [chainId],
		methods: args.methods,
		events: ["addressesChanged"]
	} } });
	const pairingUri = uri ? normalizeWalletConnectPairingUri(uri) : null;
	if (pairingUri && args.onUri) args.onUri(pairingUri);
	const session = await approval();
	if (args.methods.includes("bch_signMessage") && !args.methods.includes("bch_signTransaction")) assertLoginNamespace(session, args.network);
	else assertSigningNamespace(session, args.network, parseCaip10Account((session.namespaces.bch?.accounts ?? [])[0] ?? "", args.network));
	const account = parseCaip10Account((session.namespaces.bch?.accounts ?? [])[0] ?? "", args.network);
	return {
		uri: pairingUri,
		account,
		chainId,
		topic: session.topic,
		methods: session.namespaces.bch?.methods ?? args.methods,
		async signMessage(message) {
			if (!(session.namespaces.bch?.methods ?? args.methods).includes("bch_signMessage")) throw new Error("This WalletConnect session does not grant bch_signMessage");
			const result = await client.request({
				topic: session.topic,
				chainId,
				request: {
					method: "bch_signMessage",
					params: buildSignMessageParams(account, message)
				}
			});
			return typeof result === "string" ? result : JSON.stringify(result);
		},
		async signTransaction(request) {
			if (!(session.namespaces.bch?.methods ?? args.methods).includes("bch_signTransaction")) throw new Error("This WalletConnect session does not grant bch_signTransaction. Connect a signing session after approval.");
			return extractSignedTransaction(await client.request({
				topic: session.topic,
				chainId,
				request: {
					method: "bch_signTransaction",
					params: request
				}
			}));
		},
		async disconnect() {
			await client.disconnect({
				topic: session.topic,
				reason: {
					code: 6e3,
					message: "User disconnected"
				}
			});
		}
	};
}
var cachedLogin = null;
var cachedSigning = null;
function cachedLoginHandle() {
	return cachedLogin;
}
function cachedSigningHandle() {
	return cachedSigning;
}
async function connectWalletConnectLogin(args) {
	const handle = await connectWithMethods({
		...args,
		methods: loginMethods()
	});
	cachedLogin = handle;
	return handle;
}
async function connectWalletConnectSigning(args) {
	const handle = await connectWithMethods({
		...args,
		methods: signingMethods()
	});
	cachedSigning = handle;
	return handle;
}
async function disconnectWalletConnectCaches() {
	try {
		await cachedLogin?.disconnect();
	} catch {}
	try {
		await cachedSigning?.disconnect();
	} catch {}
	cachedLogin = null;
	cachedSigning = null;
}
//#endregion
export { connectWalletConnectSigning as a, connectWalletConnectLogin as i, cachedLoginHandle as n, disconnectWalletConnectCaches as o, cachedSigningHandle as r, buildSignTransactionParams as t };
