import { R as utf8Sha256Hex, S as defaultDirectPaymentRoute, a as MAX_FEE_SATS, c as SESSION_ALLOWANCE_SATS, h as boundedReleaseArtifact, i as IDENTITIES, n as BOUNDED_RELEASE_SHAPE_ID, p as authorizedApprovers, r as EMPTY_TOKEN, s as PER_PAYMENT_SATS, t as ARTIFACT_REGISTRY, u as VAULT_VALUE_SATS, v as canonicalJson, y as chainIdFor } from "./artifacts-lsD7QsAY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/fixtures-CzelxbGa.js
var SEQUENCE_ENABLE_LOCKTIME = 4294967294;
var INTENT_PROTOCOL = "OPTN-ALLOCATION-INTENT-V1";
var LOGIN_PROTOCOL = "OPTN-CONTROL-LOGIN-V1";
function buildCanonicalIntent(args) {
	const chainId = chainIdFor(args.plan.network);
	return {
		protocol: INTENT_PROTOCOL,
		network: args.plan.network,
		chainId,
		walletConnectChainId: chainId,
		planId: args.plan.id,
		planVersion: args.plan.version,
		policyId: args.plan.policyId,
		artifactId: args.artifactId ?? args.plan.reviewedShapeId,
		artifactHash: args.artifactHash ?? args.plan.artifactHash,
		proposalId: args.proposalId,
		vaultId: args.vaultId,
		sourceOutpoints: [args.utxo.outpoint],
		inputValueSatoshis: args.utxo.valueSatoshis,
		inputTokenCategory: args.utxo.token.categoryHex,
		inputTokenAmount: args.utxo.token.amount,
		inputTokenCapability: args.utxo.token.nftCapability,
		txVersion: args.txVersion ?? 2,
		locktime: args.locktime ?? 0,
		inputSequence: args.inputSequence ?? 4294967294,
		outputs: [{
			index: 0,
			role: "payment",
			valueSatoshis: args.amountSatoshis,
			lockingBytecodeHex: args.destinationLockingBytecodeHex,
			tokenCategory: null,
			tokenAmount: "0"
		}, {
			index: 1,
			role: "successor",
			valueSatoshis: args.successorValueSatoshis,
			lockingBytecodeHex: args.successorLockingBytecodeHex,
			tokenCategory: null,
			tokenAmount: "0"
		}],
		destinationLockingBytecodeHex: args.destinationLockingBytecodeHex,
		routeId: args.routeId,
		amountSatoshis: args.amountSatoshis,
		feeSatoshis: args.feeSatoshis,
		feeCapSatoshis: args.plan.limits.maxFeeSatoshis,
		successorLockingBytecodeHex: args.successorLockingBytecodeHex,
		threshold: args.plan.governance.threshold,
		nonce: args.nonce,
		createdAt: args.createdAt,
		expiresAt: args.expiresAt
	};
}
function hashIntent(intent) {
	return utf8Sha256Hex(canonicalJson(intent));
}
function hashPolicy(plan) {
	return utf8Sha256Hex(canonicalJson({
		schemaVersion: plan.schemaVersion,
		network: plan.network,
		asset: plan.asset,
		sourceVaultId: plan.sourceVaultId,
		reviewedShapeId: plan.reviewedShapeId,
		artifactHash: plan.artifactHash,
		routes: plan.routes,
		governance: plan.governance,
		recovery: plan.recovery,
		limits: {
			perPaymentSatoshis: plan.limits.perPaymentSatoshis,
			sessionAllowanceSatoshis: plan.limits.sessionAllowanceSatoshis,
			maxFeeSatoshis: plan.limits.maxFeeSatoshis,
			windowKind: plan.limits.windowKind,
			windowCapSatoshis: plan.limits.windowCapSatoshis
		},
		pause: plan.pause ?? false,
		version: plan.version
	}));
}
function loginMessage(args) {
	return [
		LOGIN_PROTOCOL,
		`domain: ${args.origin}`,
		`network: ${args.network}`,
		`account: ${args.account}`,
		`nonce: ${args.nonce}`,
		`issuedAt: ${args.issuedAt}`,
		`expiresAt: ${args.expiresAt}`,
		"purpose: authenticate operator access to the OPTN Dashboard"
	].join("\n");
}
function approvalMessage(intentHash, network, proposalId) {
	return [
		"OPTN-APPROVAL-V1",
		`network: ${network}`,
		`chainId: ${chainIdFor(network)}`,
		`proposal: ${proposalId}`,
		`intentHash: ${intentHash}`,
		"purpose: authorize this exact allocation intent"
	].join("\n");
}
var DEMO_VAULT_ID = "vault-acme-treasury";
var DEMO_PLAN_ID = "plan-acme-q3";
var DEMO_FUNDING_TXID = utf8Sha256Hex("optn-demo-vault-funding-v1");
function demoVaultUtxo() {
	return {
		network: "chipnet",
		outpoint: {
			txid: DEMO_FUNDING_TXID,
			vout: 0
		},
		valueSatoshis: VAULT_VALUE_SATS,
		lockingBytecodeHex: boundedReleaseArtifact.lockingBytecodeHex,
		address: null,
		token: EMPTY_TOKEN,
		spent: false,
		spentEvidence: "fixture",
		tokenEvidence: "fixture",
		confirmations: 144,
		chainEvidence: "fixture",
		lockingType: "p2sh32"
	};
}
function demoVault() {
	const artifact = ARTIFACT_REGISTRY[0];
	const state = demoVaultUtxo();
	return {
		id: DEMO_VAULT_ID,
		network: "chipnet",
		name: "Acme Treasury (DEMO)",
		contractName: artifact.name,
		contractVersion: artifact.version,
		artifactHash: artifact.artifactHash,
		reviewedShapeId: artifact.id,
		covenantLockingBytecodeHex: artifact.lockingBytecodeHex,
		redeemBytecodeHex: artifact.redeemBytecodeHex,
		stateOutpoint: state.outpoint,
		state,
		reviewed: true,
		liveSpendEnabled: false,
		onChainRecipientEnforced: true,
		constructor: { ...artifact.constructor },
		evidence: ["FIXTURE", "DESIGNED"],
		notes: [
			"Attached as a preconfigured reviewed instance. The dashboard did not deploy or fund this vault.",
			"liveSpendEnabled is false until a Chipnet provider proves the outpoint is unspent.",
			...artifact.notes
		]
	};
}
function canvasForPlan() {
	return {
		nodes: [
			{
				id: "source",
				kind: "source",
				label: "Acme treasury UTXO",
				x: 40,
				y: 180,
				data: { vaultId: DEMO_VAULT_ID }
			},
			{
				id: "vault",
				kind: "vault",
				label: "BoundedRelease P2SH32",
				x: 280,
				y: 180,
				data: { shape: BOUNDED_RELEASE_SHAPE_ID }
			},
			{
				id: "asset",
				kind: "asset",
				label: "Native BCH",
				x: 280,
				y: 40,
				data: { asset: "native-bch" }
			},
			{
				id: "pay",
				kind: "route",
				label: "Vendor payout",
				x: 560,
				y: 80,
				data: { route: "DIRECT_PAYMENT" }
			},
			{
				id: "handoff",
				kind: "route",
				label: "Covenant successor",
				x: 560,
				y: 220,
				data: { route: "COVENANT" }
			},
			{
				id: "recovery",
				kind: "recovery",
				label: "Recovery",
				x: 560,
				y: 360,
				data: { route: "RECOVERY" }
			},
			{
				id: "cap",
				kind: "constraint",
				label: "0.05 BCH / 2.4 BCH session",
				x: 800,
				y: 80,
				data: { perPayment: PER_PAYMENT_SATS }
			},
			{
				id: "gov",
				kind: "governance",
				label: "Off-chain 2 of 3 approvers",
				x: 800,
				y: 220,
				data: { threshold: "2" }
			},
			{
				id: "evidence",
				kind: "evidence",
				label: "Reviewed artifact",
				x: 800,
				y: 360,
				data: { hash: ARTIFACT_REGISTRY[0].artifactHash.slice(0, 12) }
			}
		],
		edges: [
			{
				id: "e1",
				source: "source",
				target: "vault",
				kind: "bch",
				label: "spend UTXO"
			},
			{
				id: "e2",
				source: "vault",
				target: "pay",
				kind: "bch",
				label: "output 0"
			},
			{
				id: "e3",
				source: "vault",
				target: "handoff",
				kind: "successor",
				label: "output 1"
			},
			{
				id: "e4",
				source: "vault",
				target: "recovery",
				kind: "recovery",
				label: "recovery path"
			},
			{
				id: "e5",
				source: "pay",
				target: "cap",
				kind: "bch",
				label: "cap"
			},
			{
				id: "e6",
				source: "handoff",
				target: "gov",
				kind: "approval",
				label: "quorum"
			},
			{
				id: "e7",
				source: "gov",
				target: "evidence",
				kind: "approval",
				label: "artifact"
			}
		]
	};
}
function demoPlan() {
	const draft = {
		schemaVersion: 1,
		id: DEMO_PLAN_ID,
		name: "Acme Q3 vendor allocation",
		description: "Bounded native-BCH payouts to the reviewed vendor lock, with a covenant successor.",
		network: "chipnet",
		asset: { type: "native-bch" },
		sourceVaultId: DEMO_VAULT_ID,
		reviewedShapeId: BOUNDED_RELEASE_SHAPE_ID,
		artifactHash: ARTIFACT_REGISTRY[0].artifactHash,
		routes: [defaultDirectPaymentRoute({
			destinationAddress: IDENTITIES.vendor.account,
			destinationLockingBytecodeHex: IDENTITIES.vendor.lockingBytecodeHex,
			maxAmountSatoshis: PER_PAYMENT_SATS
		}), {
			id: 1,
			type: "RECOVERY",
			label: "Recovery",
			destinationAddress: IDENTITIES.recovery.account,
			destinationLockingBytecodeHex: IDENTITIES.recovery.lockingBytecodeHex,
			maxAmountSatoshis: VAULT_VALUE_SATS,
			successor: {
				required: false,
				outputIndex: 0,
				sameCovenantLock: false,
				description: "Fixed recovery destination; separate authority"
			},
			reviewedShapeId: BOUNDED_RELEASE_SHAPE_ID,
			enforcement: "not-implemented",
			whyConstrained: "Recovery path is specified in the plan but not yet a live reviewed spend."
		}],
		governance: {
			threshold: 2,
			authorizedAccounts: authorizedApprovers(),
			proposerCannotBeSoleApprover: true,
			expirySeconds: 3600,
			separationOfDuties: true
		},
		recovery: {
			enabled: true,
			destinationAddress: IDENTITIES.recovery.account,
			destinationLockingBytecodeHex: IDENTITIES.recovery.lockingBytecodeHex,
			separateAuthority: true,
			enforcement: "not-implemented"
		},
		limits: {
			perPaymentSatoshis: PER_PAYMENT_SATS,
			sessionAllowanceSatoshis: SESSION_ALLOWANCE_SATS,
			sessionConsumedSatoshis: "0",
			maxFeeSatoshis: MAX_FEE_SATS,
			windowKind: "daily",
			windowCapSatoshis: "20000000"
		},
		pause: false,
		status: "active",
		version: 1,
		parentPolicyId: null,
		canvas: canvasForPlan(),
		createdAt: "2026-09-01T00:00:00.000Z",
		updatedAt: "2026-09-01T00:00:00.000Z",
		actor: IDENTITIES.alice.account
	};
	return {
		...draft,
		policyId: hashPolicy(draft)
	};
}
function emptyAuditGenesis(network = "chipnet") {
	const payload = {
		type: "system.seed",
		actor: "system",
		objectType: "system",
		objectId: "optn",
		correlationId: "seed",
		summary: "Control plane store initialized",
		evidence: "FIXTURE",
		at: "2026-09-01T00:00:00.000Z",
		detail: { mode: "demo" }
	};
	const eventHash = utf8Sha256Hex(canonicalJson({
		prev: "0".repeat(64),
		...payload
	}));
	return {
		id: "audit-genesis",
		network,
		seq: 1,
		prevHash: "0".repeat(64),
		eventHash,
		...payload
	};
}
function demoOperatorUtxos() {
	return [demoVaultUtxo(), {
		network: "chipnet",
		outpoint: {
			txid: utf8Sha256Hex("optn-demo-alice-p2pkh"),
			vout: 1
		},
		valueSatoshis: "12500000",
		lockingBytecodeHex: IDENTITIES.alice.lockingBytecodeHex,
		address: IDENTITIES.alice.account,
		token: EMPTY_TOKEN,
		spent: false,
		spentEvidence: "fixture",
		tokenEvidence: "fixture",
		confirmations: 12,
		chainEvidence: "fixture",
		lockingType: "p2pkh"
	}];
}
var SCENARIOS = [
	{
		id: "valid-spend",
		label: "Valid spend",
		detail: "0.02 BCH to the reviewed vendor lock"
	},
	{
		id: "over-limit",
		label: "Over-limit spend",
		detail: "0.08 BCH exceeds the 0.05 BCH cap"
	},
	{
		id: "wrong-recipient",
		label: "Wrong recipient",
		detail: "Payment lock is not the reviewed vendor"
	},
	{
		id: "wrong-category",
		label: "Wrong token category",
		detail: "Native route rejects a token-bearing UTXO"
	},
	{
		id: "altered-successor",
		label: "Altered successor",
		detail: "Successor lock does not match the vault"
	},
	{
		id: "stale-outpoint",
		label: "Stale outpoint",
		detail: "Source UTXO is already spent"
	},
	{
		id: "duplicate-intent",
		label: "Duplicate intent",
		detail: "Same idempotency key returns the original proposal"
	},
	{
		id: "insufficient-approvals",
		label: "Insufficient approvals",
		detail: "One signature cannot meet a 2-of-3 threshold"
	}
];
//#endregion
export { demoOperatorUtxos as a, demoVaultUtxo as c, hashPolicy as d, loginMessage as f, buildCanonicalIntent as i, emptyAuditGenesis as l, SEQUENCE_ENABLE_LOCKTIME as n, demoPlan as o, approvalMessage as r, demoVault as s, SCENARIOS as t, hashIntent as u };
