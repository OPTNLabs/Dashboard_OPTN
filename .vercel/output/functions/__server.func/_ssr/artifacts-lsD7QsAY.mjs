import { S as binToBase64, _ as bigIntToCompactUint, b as hexToBin, d as encodeLockingBytecodeP2sh32, f as lockingBytecodeToCashAddress, g as utf8ToBin, h as sha256, l as hashTransactionUiOrder, m as secp256k1, n as cashAssemblyToBin, p as hash256, t as publicKeyToP2pkhCashAddress, u as cashAddressToLockingBytecode, v as binToHex, x as base64ToBin, y as flattenBinArray } from "../_libs/bitauth__libauth.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/artifacts-lsD7QsAY.js
var NETWORK_CONFIG = {
	chipnet: {
		id: "chipnet",
		label: "Chipnet",
		walletConnectChainId: "bch:bchtest",
		addressPrefix: "bchtest",
		enabledByDefault: true,
		explorerTx: (txid) => `https://chipnet.chaingraph.cash/tx/${txid}`
	},
	mainnet: {
		id: "mainnet",
		label: "Mainnet",
		walletConnectChainId: "bch:bitcoincash",
		addressPrefix: "bitcoincash",
		enabledByDefault: false,
		explorerTx: (txid) => `https://explorer.bitcoinunlimited.info/tx/${txid}`
	}
};
function chainIdFor(network) {
	return NETWORK_CONFIG[network].walletConnectChainId;
}
function prefixFor(network) {
	return NETWORK_CONFIG[network].addressPrefix;
}
function isPlainObject(value) {
	return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function canonicalize(value) {
	if (typeof value === "bigint") return value.toString();
	if (value instanceof Uint8Array) return Array.from(value, (b) => b.toString(16).padStart(2, "0")).join("");
	if (Array.isArray(value)) return value.map(canonicalize);
	if (!isPlainObject(value)) return value;
	const keys = Object.keys(value).sort();
	const out = {};
	for (const key of keys) {
		const item = value[key];
		if (item === void 0) continue;
		out[key] = canonicalize(item);
	}
	return out;
}
function canonicalJson(value) {
	return JSON.stringify(canonicalize(value));
}
var EMPTY_TOKEN = {
	categoryHex: null,
	amount: "0",
	nftCapability: "none",
	commitmentHex: null
};
function sha256Hex(bytes) {
	return binToHex(sha256.hash(bytes));
}
function utf8Sha256Hex(text) {
	return sha256Hex(utf8ToBin(text));
}
function concatBins(parts) {
	return flattenBinArray(parts);
}
function compileAsm(source) {
	const result = cashAssemblyToBin(source);
	if (typeof result === "string") throw new Error(`CashAssembly compile failed: ${result}`);
	return result;
}
function p2sh32LockFromRedeem(redeem) {
	return encodeLockingBytecodeP2sh32(hash256(redeem));
}
function lockingBytecodeHexFromAddress(address) {
	const decoded = cashAddressToLockingBytecode(address);
	if (typeof decoded === "string") throw new Error(decoded);
	return binToHex(decoded.bytecode);
}
function addressFromLockingBytecode(network, lockingBytecodeHex) {
	const result = lockingBytecodeToCashAddress({
		bytecode: hexToBin(lockingBytecodeHex),
		prefix: prefixFor(network)
	});
	if (typeof result === "string") return null;
	return result.address;
}
function p2pkhAddressFromPublicKey(network, publicKey) {
	const result = publicKeyToP2pkhCashAddress({
		publicKey,
		prefix: prefixFor(network)
	});
	if (typeof result === "string") throw new Error(result);
	return result.address;
}
function testVectorPrivateKey(n) {
	if (n < 1 || n > 255) throw new Error("test vector out of range");
	const key = /* @__PURE__ */ new Uint8Array(32);
	key[31] = n;
	return key;
}
function detectLockingType(lockingBytecodeHex) {
	const bin = hexToBin(lockingBytecodeHex);
	if (bin.length === 25 && bin[0] === 118 && bin[1] === 169 && bin[23] === 136 && bin[24] === 172) return "p2pkh";
	if (bin.length === 35 && bin[0] === 170 && bin[1] === 32 && bin[34] === 135) return "p2sh32";
	if (bin.length === 23 && bin[0] === 169 && bin[22] === 135) return "p2sh20";
	if (bin.length > 0) return "covenant";
	return "unknown";
}
var MESSAGE_MAGIC = "Bitcoin Signed Message:\n";
function bchSignedMessageHash(message) {
	const magic = utf8ToBin(MESSAGE_MAGIC);
	const msg = utf8ToBin(message);
	return hash256(flattenBinArray([
		Uint8Array.of(magic.length),
		magic,
		bigIntToCompactUint(BigInt(msg.length)),
		msg
	]));
}
function signBchMessage(privateKey, message) {
	const digest = bchSignedMessageHash(message);
	const rec = secp256k1.signMessageHashRecoverableCompact(privateKey, digest);
	if (typeof rec === "string") throw new Error(rec);
	const flag = 31 + rec.recoveryId;
	return binToBase64(flattenBinArray([Uint8Array.of(flag), rec.signature]));
}
function recoverBchMessagePublicKey(message, signatureB64) {
	const bin = base64ToBin(signatureB64);
	if (typeof bin === "string") throw new Error(bin);
	if (bin.length !== 65) throw new Error("BCH message signature must be 65 bytes");
	const flag = bin[0] ?? 0;
	const recoveryId = flag - (flag >= 31 ? 31 : 27);
	if (recoveryId < 0 || recoveryId > 3) throw new Error("Invalid BCH message recovery flag");
	const recovered = secp256k1.recoverPublicKeyCompressed(bin.slice(1), recoveryId, bchSignedMessageHash(message));
	if (typeof recovered === "string") throw new Error(recovered);
	return recovered;
}
function verifyBchMessageAddress(network, account, message, signatureB64) {
	try {
		return p2pkhAddressFromPublicKey(network, recoverBchMessagePublicKey(message, signatureB64)) === account;
	} catch {
		return false;
	}
}
function txidFromEncoded(raw) {
	return binToHex(hashTransactionUiOrder(raw));
}
function dustThresholdSatoshis() {
	return 546n;
}
function isDustValue(value) {
	return value < dustThresholdSatoshis();
}
function pkhFromP2pkhLock(lockingBytecodeHex) {
	if (detectLockingType(lockingBytecodeHex) !== "p2pkh") throw new Error("Locking bytecode is not P2PKH");
	return lockingBytecodeHex.slice(6, 46);
}
function assertHex(value, label, byteLength) {
	const trimmed = value.trim().toLowerCase();
	if (!/^[0-9a-f]+$/.test(trimmed) || trimmed.length % 2 !== 0) throw new Error(`${label} must be even-length hex`);
	if (byteLength !== void 0 && trimmed.length !== byteLength * 2) throw new Error(`${label} must be ${byteLength} bytes`);
	return trimmed;
}
var IDENTITIES = {
	alice: {
		label: "Alice (DEMO)",
		role: "owner",
		account: "bchtest:qp63uahgrxged4z5jswyt5dn5v3lzsem6cq85x00dt",
		publicKeyHex: "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
		pkhHex: "751e76e8199196d454941c45d1b3a323f1433bd6",
		lockingBytecodeHex: "76a914751e76e8199196d454941c45d1b3a323f1433bd688ac",
		synthetic: true
	},
	bob: {
		label: "Bob (DEMO)",
		role: "approver",
		account: "bchtest:qqr2l4rteh7j9mu54sfz4gglysfyfgm7escmcz2hd6",
		publicKeyHex: "02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5",
		pkhHex: "06afd46bcdfd22ef94ac122aa11f241244a37ecc",
		lockingBytecodeHex: "76a91406afd46bcdfd22ef94ac122aa11f241244a37ecc88ac",
		synthetic: true
	},
	carol: {
		label: "Carol (DEMO)",
		role: "approver",
		account: "bchtest:qp7av4vj6z4jlcxsy474wx4lqvkdnkunms9kkx0r2k",
		publicKeyHex: "02f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9",
		pkhHex: "7dd65592d0ab2fe0d0257d571abf032cd9db93dc",
		lockingBytecodeHex: "76a9147dd65592d0ab2fe0d0257d571abf032cd9db93dc88ac",
		synthetic: true
	},
	vendor: {
		label: "Acme vendor payout (DEMO)",
		role: "viewer",
		account: "bchtest:qpr506r5dnwmxwc00726jruflz0m8p7tkcm9mmsrqy",
		publicKeyHex: "022f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe4",
		pkhHex: "4747e8746cddb33b0f7f95a90f89f89fb387cbb6",
		lockingBytecodeHex: "76a9144747e8746cddb33b0f7f95a90f89f89fb387cbb688ac",
		synthetic: true
	},
	recovery: {
		label: "Recovery destination (DEMO)",
		role: "viewer",
		account: "bchtest:qpla488syrqket8498y8mr0gn078pwxfevta6yxfc2",
		publicKeyHex: "03fff97bd5755eeea420453a14355235d382f6472f8568a18b2f057a1460297556",
		pkhHex: "7fda9cf020c16cacf529c87d8de89bfc70b8c9cb",
		lockingBytecodeHex: "76a9147fda9cf020c16cacf529c87d8de89bfc70b8c9cb88ac",
		synthetic: true
	}
};
var TEST_VECTOR_INDEX = {
	alice: 1,
	bob: 2,
	carol: 3,
	vendor: 5,
	recovery: 6
};
function identityByAccount(account) {
	return Object.values(IDENTITIES).find((item) => item.account === account);
}
function roleForAccount(account, network) {
	if (network === "mainnet") return "viewer";
	return identityByAccount(account)?.role ?? "viewer";
}
function authorizedApprovers() {
	return [
		IDENTITIES.alice.account,
		IDENTITIES.bob.account,
		IDENTITIES.carol.account
	];
}
var SATOSHIS_PER_BCH = 100000000n;
function parseSatoshis(value) {
	if (typeof value === "bigint") return value;
	if (typeof value === "number") {
		if (!Number.isInteger(value) || value < 0) throw new Error("Satoshis must be a non-negative integer");
		return BigInt(value);
	}
	const trimmed = value.trim();
	if (!/^\d+$/.test(trimmed)) throw new Error(`Invalid satoshi amount: ${value}`);
	return BigInt(trimmed);
}
function satoshisToBch(satoshis) {
	const value = parseSatoshis(satoshis);
	const whole = value / SATOSHIS_PER_BCH;
	const frac = value % SATOSHIS_PER_BCH;
	if (frac === 0n) return `${whole}`;
	return `${whole}.${frac.toString().padStart(8, "0").replace(/0+$/, "")}`;
}
function bchToSatoshis(bch) {
	const trimmed = bch.trim();
	if (!/^\d+(\.\d{1,8})?$/.test(trimmed)) throw new Error("BCH amount must have at most 8 decimal places");
	const [whole, frac = ""] = trimmed.split(".");
	return BigInt(whole ?? "0") * SATOSHIS_PER_BCH + BigInt((frac ?? "").padEnd(8, "0"));
}
function formatBch(satoshis, digits = 4) {
	return `${Number(satoshisToBch(satoshis)).toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: digits
	})} BCH`;
}
function formatSats(satoshis) {
	return `${parseSatoshis(satoshis).toLocaleString("en-US")} sats`;
}
function percentConsumed(consumed, total) {
	const c = parseSatoshis(consumed);
	const t = parseSatoshis(total);
	if (t === 0n) return 0;
	return Math.min(100, Math.round(Number(c * 1000n / t) / 10));
}
var BOUNDED_RELEASE_SHAPE_ID = "bounded-release-v1";
var LEGACY_TREASURY_SHAPE_ID = "treasury-vault-unreviewed-v0";
function boundedReleaseRedeemSource(params) {
	return [
		`OP_DUP OP_HASH160 <0x${params.operatorPkhHex}> OP_EQUALVERIFY OP_CHECKSIGVERIFY`,
		"OP_TXINPUTCOUNT <1> OP_NUMEQUALVERIFY",
		"OP_TXOUTPUTCOUNT <2> OP_NUMEQUALVERIFY",
		"OP_INPUTINDEX <0> OP_NUMEQUALVERIFY",
		"<0> OP_UTXOBYTECODE <1> OP_OUTPUTBYTECODE OP_EQUALVERIFY",
		`<0> OP_OUTPUTBYTECODE <0x${params.recipientLockingBytecodeHex}> OP_EQUALVERIFY`,
		`<0> OP_OUTPUTVALUE <${params.maxPaymentSatoshis}> OP_LESSTHANOREQUAL OP_VERIFY`,
		`<0> OP_UTXOVALUE <0> OP_OUTPUTVALUE OP_SUB <1> OP_OUTPUTVALUE OP_SUB <${params.maxFeeSatoshis}> OP_LESSTHANOREQUAL`
	].join(" ");
}
function compileBoundedRelease(params) {
	const redeem = compileAsm(boundedReleaseRedeemSource(params));
	const lockingBytecode = p2sh32LockFromRedeem(redeem);
	return {
		redeem,
		lockingBytecode,
		redeemHex: binToHex(redeem),
		lockingBytecodeHex: binToHex(lockingBytecode)
	};
}
/** Legacy fixture that declares a recipient but does not check output 0. */
function legacyTreasuryRedeemSource(params) {
	return [
		`OP_DUP OP_HASH160 <0x${params.operatorPkhHex}> OP_EQUALVERIFY OP_CHECKSIGVERIFY`,
		"OP_TXINPUTCOUNT <1> OP_NUMEQUALVERIFY",
		"OP_TXOUTPUTCOUNT <2> OP_NUMEQUALVERIFY",
		"OP_INPUTINDEX <0> OP_NUMEQUALVERIFY",
		"<0> OP_UTXOBYTECODE <1> OP_OUTPUTBYTECODE OP_EQUALVERIFY",
		`<0x${params.unusedRecipientPkhHex}> OP_DROP`,
		"<0> OP_OUTPUTVALUE <0> OP_UTXOVALUE OP_LESSTHANOREQUAL"
	].join(" ");
}
function compileLegacyTreasury(params) {
	const redeem = compileAsm(legacyTreasuryRedeemSource(params));
	const lockingBytecode = p2sh32LockFromRedeem(redeem);
	return {
		redeem,
		lockingBytecode,
		redeemHex: binToHex(redeem),
		lockingBytecodeHex: binToHex(lockingBytecode)
	};
}
function rule(id, label, pass, enforcement, detail) {
	return {
		id,
		label,
		pass,
		enforcement,
		detail
	};
}
function evaluateReviewedShape(input) {
	const onChain = input.shapeId === BOUNDED_RELEASE_SHAPE_ID;
	const enforcement = onChain ? "on-chain" : "simulation-only";
	const rules = [
		rule("input.cardinality", "Exactly one vault input", input.inputCount === 1 && input.activeInputIndex === 0, enforcement, `${input.inputCount} input(s), active index ${input.activeInputIndex}`),
		rule("output.cardinality", "Exactly two outputs (payment + successor)", input.outputCount === 2, enforcement, `${input.outputCount} output(s)`),
		rule("output.order", "Output 0 is payment, output 1 is successor", true, enforcement, "Reviewed shape requires payment at index 0, successor at index 1"),
		rule("destination.lock-mismatch", "Payment locking bytecode matches reviewed destination", input.paymentLockingBytecodeHex === input.expectedPaymentLockingBytecodeHex, onChain ? "on-chain" : "off-chain-policy", onChain ? "BoundedRelease enforces the recipient lock in the redeem script" : "Legacy TreasuryVault declared recipientPkh but never checked output 0"),
		rule("successor.lock-mismatch", "Successor retains the covenant lock", input.successorLockingBytecodeHex === input.expectedSuccessorLockingBytecodeHex, enforcement, "Successor output must use the same P2SH32 covenant lock"),
		rule("amount.over-per-payment", "Payment is within the on-chain per-payment cap", parseSatoshis(input.paymentSatoshis) > 0n && parseSatoshis(input.paymentSatoshis) <= parseSatoshis(input.maxPaymentSatoshis), enforcement, `${input.paymentSatoshis} sats vs cap ${input.maxPaymentSatoshis}`),
		rule("fee.over-cap", "Fee is within the on-chain fee cap", parseSatoshis(input.feeSatoshis) <= parseSatoshis(input.maxFeeSatoshis), enforcement, `${input.feeSatoshis} sats vs cap ${input.maxFeeSatoshis}`),
		rule("asset.token-leak", "Native-BCH policy rejects token-bearing inputs/outputs (not inspected by this redeem script)", input.inputTokenCategory === null && input.outputTokenCategories.every((c) => c === null), "off-chain-policy", "Fungible CashToken payment is not implemented for this reviewed route")
	];
	if (!onChain) rules.push(rule("shape.simulation-only", "Legacy shape cannot broadcast", false, "simulation-only", "treasury-vault-unreviewed-v0 does not enforce the recipient on-chain"));
	return {
		shapeId: input.shapeId,
		onChainRecipientEnforced: onChain,
		vmAttempted: false,
		vmValid: null,
		vmError: null,
		rules
	};
}
function defaultDirectPaymentRoute(args) {
	return {
		id: 0,
		type: "DIRECT_PAYMENT",
		label: "Vendor payout",
		destinationAddress: args.destinationAddress,
		destinationLockingBytecodeHex: args.destinationLockingBytecodeHex,
		maxAmountSatoshis: args.maxAmountSatoshis,
		successor: {
			required: true,
			outputIndex: 1,
			sameCovenantLock: true,
			description: "Same covenant, remaining BCH minus fee"
		},
		reviewedShapeId: BOUNDED_RELEASE_SHAPE_ID,
		enforcement: "on-chain",
		whyConstrained: "P2SH32 BoundedRelease redeem script requires output 0 to equal the reviewed recipient lock, output 1 to retain the covenant lock, payment ≤ cap, and fee ≤ cap."
	};
}
var PER_PAYMENT_SATS = "5000000";
var MAX_FEE_SATS = "2000";
var SESSION_ALLOWANCE_SATS = "240000000";
var VAULT_VALUE_SATS = "1250000000";
var ARTIFACT_COMPILER = {
	library: "@bitauth/libauth",
	version: "3.0.0"
};
function validateBoundedReleaseParams(params, network = "chipnet") {
	const operatorPkhHex = assertHex(params.operatorPkhHex, "operatorPkh", 20);
	const recipientLockingBytecodeHex = assertHex(params.recipientLockingBytecodeHex, "recipientLockingBytecode");
	if (detectLockingType(recipientLockingBytecodeHex) === "unknown") throw new Error("Recipient locking bytecode is not a recognized lock");
	const maxPaymentSatoshis = parseSatoshis(params.maxPaymentSatoshis);
	const maxFeeSatoshis = parseSatoshis(params.maxFeeSatoshis);
	if (maxPaymentSatoshis <= 0n) throw new Error("Payment cap must be positive");
	if (maxFeeSatoshis <= 0n) throw new Error("Fee cap must be positive");
	if (network !== "chipnet" && network !== "mainnet") throw new Error("Unknown artifact network");
	return {
		operatorPkhHex,
		recipientLockingBytecodeHex,
		maxPaymentSatoshis: maxPaymentSatoshis.toString(),
		maxFeeSatoshis: maxFeeSatoshis.toString()
	};
}
function hashReviewedArtifact(input) {
	return utf8Sha256Hex(canonicalJson({
		redeemBytecodeHex: input.redeemBytecodeHex,
		lockingBytecodeHex: input.lockingBytecodeHex,
		operatorPkhHex: input.operatorPkhHex,
		recipientLockingBytecodeHex: input.recipientLockingBytecodeHex,
		maxPaymentSatoshis: input.maxPaymentSatoshis,
		maxFeeSatoshis: input.maxFeeSatoshis,
		network: input.network,
		sourceAssembly: input.sourceAssembly
	}));
}
function buildBoundedReleaseArtifact(params, network = "chipnet") {
	const valid = validateBoundedReleaseParams(params, network);
	const compiled = compileBoundedRelease(valid);
	const sourceAssembly = boundedReleaseRedeemSource(valid);
	const rec = compileBoundedRelease(valid);
	if (rec.redeemHex !== compiled.redeemHex || rec.lockingBytecodeHex !== compiled.lockingBytecodeHex) throw new Error("Artifact compile is not deterministic");
	if (detectLockingType(compiled.lockingBytecodeHex) !== "p2sh32") throw new Error("BoundedRelease must wrap as P2SH32");
	const record = {
		id: BOUNDED_RELEASE_SHAPE_ID,
		protocol: "bch",
		network,
		name: "BoundedReleaseVault",
		version: "1.0.0",
		compiler: ARTIFACT_COMPILER,
		sourceAssembly,
		redeemBytecodeHex: compiled.redeemHex,
		lockingBytecodeHex: compiled.lockingBytecodeHex,
		operatorPkhHex: valid.operatorPkhHex,
		recipientLockingBytecodeHex: valid.recipientLockingBytecodeHex,
		maxPaymentSatoshis: valid.maxPaymentSatoshis,
		maxFeeSatoshis: valid.maxFeeSatoshis,
		reviewStatus: "reviewed",
		liveSpendEnabled: true,
		onChainRecipientEnforced: true,
		constructor: {
			operatorPkh: valid.operatorPkhHex,
			recipientLock: valid.recipientLockingBytecodeHex,
			maxPaymentSatoshis: valid.maxPaymentSatoshis,
			maxFeeSatoshis: valid.maxFeeSatoshis
		},
		notes: [
			"P2SH32 wrapper around a CashAssembly redeem script.",
			"On-chain: operator signature, 1-in/2-out, recipient lock, successor lock, payment cap, fee cap.",
			"Not on-chain: 2-of-3 approval, session/daily budgets, recovery, token state."
		]
	};
	return {
		...record,
		artifactHash: hashReviewedArtifact(record)
	};
}
var boundedReleaseArtifact = compileBoundedRelease({
	operatorPkhHex: IDENTITIES.alice.pkhHex,
	recipientLockingBytecodeHex: IDENTITIES.vendor.lockingBytecodeHex,
	maxPaymentSatoshis: PER_PAYMENT_SATS,
	maxFeeSatoshis: MAX_FEE_SATS
});
var reviewedBoundedRelease = buildBoundedReleaseArtifact({
	operatorPkhHex: IDENTITIES.alice.pkhHex,
	recipientLockingBytecodeHex: IDENTITIES.vendor.lockingBytecodeHex,
	maxPaymentSatoshis: PER_PAYMENT_SATS,
	maxFeeSatoshis: MAX_FEE_SATS
});
var legacyTreasuryArtifact = compileLegacyTreasury({
	operatorPkhHex: IDENTITIES.alice.pkhHex,
	unusedRecipientPkhHex: IDENTITIES.vendor.pkhHex
});
var ARTIFACT_REGISTRY = [reviewedBoundedRelease, {
	id: LEGACY_TREASURY_SHAPE_ID,
	protocol: "bch",
	network: "chipnet",
	name: "TreasuryVault (unreviewed fixture)",
	version: "0.0.0-unreviewed",
	compiler: ARTIFACT_COMPILER,
	sourceAssembly: "legacy unused recipientPkh",
	redeemBytecodeHex: legacyTreasuryArtifact.redeemHex,
	lockingBytecodeHex: legacyTreasuryArtifact.lockingBytecodeHex,
	operatorPkhHex: IDENTITIES.alice.pkhHex,
	recipientLockingBytecodeHex: IDENTITIES.vendor.lockingBytecodeHex,
	maxPaymentSatoshis: PER_PAYMENT_SATS,
	maxFeeSatoshis: MAX_FEE_SATS,
	artifactHash: utf8Sha256Hex(legacyTreasuryArtifact.redeemHex),
	reviewStatus: "unreviewed",
	liveSpendEnabled: false,
	onChainRecipientEnforced: false,
	constructor: {
		operatorPkh: IDENTITIES.alice.pkhHex,
		unusedRecipientPkh: IDENTITIES.vendor.pkhHex
	},
	notes: ["Declared recipientPkh is not used to constrain output 0.", "Kept only as a regression fixture. Live broadcast is blocked."]
}];
function assertArtifactMatchesLock(artifact, lockingBytecodeHex) {
	if (artifact.lockingBytecodeHex !== lockingBytecodeHex.toLowerCase() && artifact.lockingBytecodeHex !== lockingBytecodeHex) throw new Error("Observed locking bytecode does not match the reviewed artifact");
	if (compileBoundedRelease({
		operatorPkhHex: artifact.operatorPkhHex,
		recipientLockingBytecodeHex: artifact.recipientLockingBytecodeHex,
		maxPaymentSatoshis: artifact.maxPaymentSatoshis,
		maxFeeSatoshis: artifact.maxFeeSatoshis
	}).lockingBytecodeHex !== artifact.lockingBytecodeHex) throw new Error("Stored artifact bytecode does not match its constructor; fund a new vault");
	if (hashReviewedArtifact(artifact) !== artifact.artifactHash) throw new Error("Reviewed artifact hash does not match its canonical contents");
}
//#endregion
export { percentConsumed as A, detectLockingType as C, isDustValue as D, formatSats as E, signBchMessage as F, testVectorPrivateKey as I, txidFromEncoded as L, reviewedBoundedRelease as M, roleForAccount as N, lockingBytecodeHexFromAddress as O, satoshisToBch as P, utf8Sha256Hex as R, defaultDirectPaymentRoute as S, formatBch as T, buildBoundedReleaseArtifact as _, MAX_FEE_SATS as a, compileBoundedRelease as b, SESSION_ALLOWANCE_SATS as c, addressFromLockingBytecode as d, assertArtifactMatchesLock as f, boundedReleaseRedeemSource as g, boundedReleaseArtifact as h, IDENTITIES as i, pkhFromP2pkhLock as j, parseSatoshis as k, TEST_VECTOR_INDEX as l, bchToSatoshis as m, BOUNDED_RELEASE_SHAPE_ID as n, NETWORK_CONFIG as o, authorizedApprovers as p, EMPTY_TOKEN as r, PER_PAYMENT_SATS as s, ARTIFACT_REGISTRY as t, VAULT_VALUE_SATS as u, canonicalJson as v, evaluateReviewedShape as w, concatBins as x, chainIdFor as y, verifyBchMessageAddress as z };
