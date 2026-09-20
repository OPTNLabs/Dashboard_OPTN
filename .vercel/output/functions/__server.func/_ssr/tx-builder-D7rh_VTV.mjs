import { a as SigningSerializationTypeBCH, b as hexToBin, c as encodeTransaction, i as encodeDataPush, m as secp256k1, o as generateSigningSerializationBCH, p as hash256, s as decodeTransaction, v as binToHex } from "../_libs/bitauth__libauth.mjs";
import { D as isDustValue, L as txidFromEncoded, T as formatBch, d as addressFromLockingBytecode, g as boundedReleaseRedeemSource, k as parseSatoshis, n as BOUNDED_RELEASE_SHAPE_ID, r as EMPTY_TOKEN, w as evaluateReviewedShape, x as concatBins } from "./artifacts-lsD7QsAY.mjs";
import { i as buildCanonicalIntent, n as SEQUENCE_ENABLE_LOCKTIME, u as hashIntent } from "./fixtures-CzelxbGa.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tx-builder-D7rh_VTV.js
function rule(partial) {
	return partial;
}
function evaluatePolicy(input) {
	const { plan, utxo } = input;
	const route = plan.routes.find((item) => item.id === input.routeId);
	const amount = parseSatoshis(input.amountSatoshis);
	const fee = parseSatoshis(input.feeSatoshis);
	const inputValue = parseSatoshis(utxo.valueSatoshis);
	const successorValue = inputValue - amount - fee;
	const remainingAllowance = parseSatoshis(plan.limits.sessionAllowanceSatoshis) - parseSatoshis(plan.limits.sessionConsumedSatoshis);
	const rules = [];
	rules.push(rule({
		id: "network.mismatch",
		label: "Proposal network matches the plan and UTXO",
		pass: plan.network === utxo.network,
		enforcement: "off-chain-policy",
		detail: `plan ${plan.network} / utxo ${utxo.network}`
	}));
	rules.push(rule({
		id: "plan.paused",
		label: "Plan is not paused",
		pass: !plan.pause && plan.status !== "paused",
		enforcement: "off-chain-policy",
		detail: `status ${plan.status}, pause=${String(plan.pause)}`
	}));
	rules.push(rule({
		id: "plan.not-active",
		label: "Plan is an active published version",
		pass: plan.status === "active",
		enforcement: "off-chain-policy",
		detail: `status ${plan.status} v${plan.version}`
	}));
	rules.push(rule({
		id: "asset.native-only",
		label: "Asset is native BCH",
		pass: plan.asset.type === "native-bch" && utxo.token.categoryHex === null,
		enforcement: "off-chain-policy",
		detail: plan.asset.type === "native-bch" ? "Native BCH route. Token presence is rejected by policy; this BoundedRelease script does not inspect token fields." : "Fungible CashToken payment is not a reviewed live route"
	}));
	rules.push(rule({
		id: "asset.token-leak",
		label: "Native-BCH route carries no token state (off-chain policy)",
		pass: utxo.token.categoryHex === null && utxo.token.amount === "0",
		enforcement: "off-chain-policy",
		detail: utxo.token.categoryHex ? `token ${utxo.token.categoryHex}` : "no token"
	}));
	rules.push(rule({
		id: "utxo.spent",
		label: "Source outpoint is unspent",
		pass: !utxo.spent,
		enforcement: "off-chain-policy",
		detail: utxo.spent ? "UTXO marked spent" : "unspent"
	}));
	rules.push(rule({
		id: "utxo.missing",
		label: "Source UTXO locking bytecode matches the vault",
		pass: utxo.lockingBytecodeHex === input.vaultLockingBytecodeHex,
		enforcement: "on-chain",
		detail: "Vault instance lock must equal the observed UTXO lock"
	}));
	rules.push(rule({
		id: "amount.non-positive",
		label: "Payment amount is positive",
		pass: amount > 0n,
		enforcement: "on-chain",
		detail: `${amount.toString()} sats`
	}));
	rules.push(rule({
		id: "amount.over-per-payment",
		label: "Payment is within the plan per-payment cap (covenant also has a compiled on-chain cap)",
		pass: amount <= parseSatoshis(plan.limits.perPaymentSatoshis),
		enforcement: "off-chain-policy",
		detail: `${amount.toString()} vs ${plan.limits.perPaymentSatoshis} sats`
	}));
	rules.push(rule({
		id: "amount.over-session",
		label: "Payment is within remaining session allowance (off-chain, not covenant-enforced, not atomically reserved)",
		pass: amount <= remainingAllowance,
		enforcement: "not-implemented",
		detail: `remaining ${remainingAllowance.toString()} sats`
	}));
	rules.push(rule({
		id: "amount.over-window",
		label: "Daily window cap (not implemented; not atomically reserved; not covenant-enforced)",
		pass: true,
		enforcement: "not-implemented",
		detail: `window ${plan.limits.windowKind} cap ${plan.limits.windowCapSatoshis} sats is display-only`
	}));
	rules.push(rule({
		id: "destination.not-allowlisted",
		label: "Destination is a reviewed route",
		pass: Boolean(route),
		enforcement: "off-chain-policy",
		detail: route ? route.label : `Unknown route ${input.routeId}`
	}));
	rules.push(rule({
		id: "destination.lock-mismatch",
		label: "Destination lock matches the reviewed route",
		pass: Boolean(route && route.destinationLockingBytecodeHex === input.destinationLockingBytecodeHex),
		enforcement: route?.enforcement ?? "off-chain-policy",
		detail: route?.whyConstrained ?? "No reviewed route"
	}));
	rules.push(rule({
		id: "fee.over-cap",
		label: "Fee is within the plan fee cap",
		pass: fee <= parseSatoshis(plan.limits.maxFeeSatoshis) && fee >= 0n,
		enforcement: "off-chain-policy",
		detail: `${fee.toString()} vs ${plan.limits.maxFeeSatoshis} sats`
	}));
	rules.push(rule({
		id: "value.conservation",
		label: "Input value equals payment + successor + fee",
		pass: successorValue >= 0n && amount + fee + successorValue === inputValue,
		enforcement: "on-chain",
		detail: `${inputValue.toString()} in = ${amount.toString()} + ${successorValue.toString()} + ${fee.toString()} fee`
	}));
	rules.push(rule({
		id: "dust.output",
		label: "No dust outputs",
		pass: !isDustValue(amount) && !isDustValue(successorValue),
		enforcement: "on-chain",
		detail: `payment ${amount.toString()} / successor ${successorValue.toString()}`
	}));
	rules.push(rule({
		id: "successor.required",
		label: "Successor covenant output is required",
		pass: Boolean(route?.successor.required),
		enforcement: "on-chain",
		detail: "Output 1 must continue the vault"
	}));
	rules.push(rule({
		id: "successor.lock-mismatch",
		label: "Successor lock equals the vault covenant",
		pass: input.successorLockingBytecodeHex === input.vaultLockingBytecodeHex,
		enforcement: "on-chain",
		detail: "Same P2SH32 covenant lock"
	}));
	rules.push(rule({
		id: "shape.unreviewed",
		label: "Route uses a reviewed shape",
		pass: plan.reviewedShapeId === BOUNDED_RELEASE_SHAPE_ID,
		enforcement: "off-chain-policy",
		detail: plan.reviewedShapeId
	}));
	if (input.liveBroadcast) rules.push(rule({
		id: "broadcast.blocked",
		label: "Live broadcast requires an on-chain recipient-enforcing shape",
		pass: plan.reviewedShapeId === BOUNDED_RELEASE_SHAPE_ID,
		enforcement: "on-chain",
		detail: "Simulation-only shapes cannot broadcast"
	}));
	if (input.approvals) {
		const unique = new Set(input.approvals.map((item) => item.account));
		rules.push(rule({
			id: "approval.threshold",
			label: `Off-chain approval policy: ${plan.governance.threshold} of ${plan.governance.authorizedAccounts.length} distinct accounts`,
			pass: unique.size >= plan.governance.threshold,
			enforcement: "off-chain-policy",
			detail: `${unique.size} distinct approvals`
		}));
		rules.push(rule({
			id: "approval.duplicate-account",
			label: "Approvals are from distinct accounts",
			pass: unique.size === input.approvals.length,
			enforcement: "off-chain-policy",
			detail: `${input.approvals.length} signatures, ${unique.size} accounts`
		}));
		if (plan.governance.proposerCannotBeSoleApprover && input.proposerAccount) {
			const others = [...unique].filter((account) => account !== input.proposerAccount);
			rules.push(rule({
				id: "approval.proposer-sole",
				label: "Proposer cannot be the sole approver",
				pass: others.length > 0 || plan.governance.threshold === 0,
				enforcement: "off-chain-policy",
				detail: "Separation of duties"
			}));
		}
	}
	const blocking = rules.filter((item) => !item.pass);
	const covenant = evaluateReviewedShape({
		shapeId: plan.reviewedShapeId,
		inputCount: 1,
		outputCount: 2,
		activeInputIndex: 0,
		paymentLockingBytecodeHex: input.destinationLockingBytecodeHex,
		expectedPaymentLockingBytecodeHex: route?.destinationLockingBytecodeHex ?? input.destinationLockingBytecodeHex,
		successorLockingBytecodeHex: input.successorLockingBytecodeHex,
		expectedSuccessorLockingBytecodeHex: input.vaultLockingBytecodeHex,
		paymentSatoshis: input.amountSatoshis,
		maxPaymentSatoshis: plan.limits.perPaymentSatoshis,
		feeSatoshis: input.feeSatoshis,
		maxFeeSatoshis: plan.limits.maxFeeSatoshis,
		inputTokenCategory: utxo.token.categoryHex,
		outputTokenCategories: [null, null]
	});
	const covenantBlocking = covenant.rules.filter((item) => !item.pass);
	return {
		policy: {
			allowed: blocking.length === 0 && covenantBlocking.length === 0,
			rules,
			blocking: [...blocking, ...covenantBlocking]
		},
		covenant
	};
}
function explainDecision(decision) {
	if (decision.allowed) return "All policy and covenant checks passed.";
	return decision.blocking.map((item) => `${item.label}: ${item.detail}`).join(" · ");
}
function validateCanvas(plan) {
	const kinds = new Set(plan.canvas.nodes.map((node) => node.kind));
	const results = [];
	for (const kind of [
		"source",
		"vault",
		"asset",
		"route",
		"governance",
		"evidence"
	]) results.push({
		id: kind === "route" ? "destination.not-allowlisted" : "shape.unreviewed",
		label: `Canvas includes a ${kind} node`,
		pass: kinds.has(kind),
		enforcement: "off-chain-policy",
		detail: kinds.has(kind) ? "present" : "missing"
	});
	results.push({
		id: "asset.native-only",
		label: "Native BCH asset node only",
		pass: plan.asset.type === "native-bch",
		enforcement: "off-chain-policy",
		detail: plan.asset.type
	});
	return results;
}
function constructorValue(vault, key) {
	const value = vault.constructor[key];
	if (!value) throw new Error(`Attached vault is missing immutable constructor field ${key}`);
	return value;
}
function directRoute(plan) {
	const route = plan.routes.find((item) => item.id === 0 && item.type === "DIRECT_PAYMENT");
	if (!route) throw new Error("Plan has no executable direct-payment route at output 0");
	return route;
}
function positionMap(canvas) {
	return new Map(canvas.nodes.map((node) => [node.id, {
		x: node.x,
		y: node.y
	}]));
}
function node(positions, id, kind, label, fallback, data) {
	const position = positions.get(id) ?? fallback;
	return {
		id,
		kind,
		label,
		x: position.x,
		y: position.y,
		data
	};
}
/** Fail closed when a plan claims a different execution surface than its UTXO covenant. */
function assertPlanMatchesVaultArtifact(plan, vault) {
	if (plan.sourceVaultId !== vault.id) throw new Error("Plan source vault does not match the attached vault");
	if (plan.reviewedShapeId !== "bounded-release-v1" || vault.reviewedShapeId !== "bounded-release-v1") throw new Error("Only the reviewed BoundedRelease shape has an executable Studio mapping");
	if (!vault.reviewed || !vault.onChainRecipientEnforced) throw new Error("Attached vault is not a reviewed recipient-enforcing covenant");
	if (plan.artifactHash !== vault.artifactHash) throw new Error("Plan artifact hash does not match the funded vault artifact");
	const route = directRoute(plan);
	const recipientLock = constructorValue(vault, "recipientLock");
	const maxPaymentSatoshis = constructorValue(vault, "maxPaymentSatoshis");
	const maxFeeSatoshis = constructorValue(vault, "maxFeeSatoshis");
	constructorValue(vault, "operatorPkh");
	if (route.destinationLockingBytecodeHex !== recipientLock) throw new Error("Plan payment destination differs from the funded covenant recipient lock");
	if (route.maxAmountSatoshis !== maxPaymentSatoshis) throw new Error("Plan route cap differs from the funded covenant payment cap");
	if (plan.limits.perPaymentSatoshis !== maxPaymentSatoshis) throw new Error("Plan payment cap differs from the funded covenant payment cap");
	if (plan.limits.maxFeeSatoshis !== maxFeeSatoshis) throw new Error("Plan fee cap differs from the funded covenant fee cap");
}
function compileExecutableStudio(plan, vault) {
	assertPlanMatchesVaultArtifact(plan, vault);
	const route = directRoute(plan);
	const operatorPkhHex = constructorValue(vault, "operatorPkh");
	const recipientLockingBytecodeHex = constructorValue(vault, "recipientLock");
	const maxPaymentSatoshis = constructorValue(vault, "maxPaymentSatoshis");
	const maxFeeSatoshis = constructorValue(vault, "maxFeeSatoshis");
	const positions = positionMap(plan.canvas);
	return {
		canvas: {
			nodes: [
				node(positions, "source-utxo", "source", "Attached vault UTXO", {
					x: 40,
					y: 200
				}, {
					outpoint: `${vault.stateOutpoint.txid}:${vault.stateOutpoint.vout}`,
					valueSatoshis: vault.state.valueSatoshis
				}),
				node(positions, "bounded-release", "vault", "BoundedRelease P2SH32", {
					x: 290,
					y: 200
				}, {
					artifactHash: vault.artifactHash,
					lockingBytecodeHex: vault.covenantLockingBytecodeHex
				}),
				node(positions, "native-bch", "asset", "Native BCH only", {
					x: 290,
					y: 50
				}, {
					asset: "native-bch",
					tokenPolicy: "reject-token-bearing-input"
				}),
				node(positions, "payment-output-0", "route", "Payment — output 0", {
					x: 560,
					y: 90
				}, {
					outputIndex: "0",
					routeId: String(route.id),
					lockingBytecodeHex: recipientLockingBytecodeHex
				}),
				node(positions, "successor-output-1", "route", "Successor covenant — output 1", {
					x: 560,
					y: 260
				}, {
					outputIndex: "1",
					lockingBytecodeHex: vault.covenantLockingBytecodeHex
				}),
				node(positions, "compiled-limits", "constraint", "Compiled payment and fee caps", {
					x: 830,
					y: 90
				}, {
					maxPaymentSatoshis,
					maxFeeSatoshis,
					display: `${formatBch(maxPaymentSatoshis)} / ${maxFeeSatoshis} sats fee`
				}),
				node(positions, "approval-policy", "governance", "Off-chain approval policy", {
					x: 830,
					y: 260
				}, {
					threshold: String(plan.governance.threshold),
					authorizedAccounts: String(plan.governance.authorizedAccounts.length),
					enforcement: "off-chain-policy"
				}),
				node(positions, "reviewed-artifact", "evidence", "Reviewed covenant artifact", {
					x: 830,
					y: 410
				}, {
					artifactHash: vault.artifactHash,
					redeemBytecodeHex: vault.redeemBytecodeHex
				})
			],
			edges: [
				{
					id: "input-0",
					source: "source-utxo",
					target: "bounded-release",
					kind: "bch",
					label: "input 0"
				},
				{
					id: "native-asset",
					source: "native-bch",
					target: "bounded-release",
					kind: "bch",
					label: "native BCH"
				},
				{
					id: "output-0",
					source: "bounded-release",
					target: "payment-output-0",
					kind: "bch",
					label: "output 0"
				},
				{
					id: "output-1",
					source: "bounded-release",
					target: "successor-output-1",
					kind: "successor",
					label: "output 1"
				},
				{
					id: "caps",
					source: "payment-output-0",
					target: "compiled-limits",
					kind: "bch",
					label: "on-chain caps"
				},
				{
					id: "approval",
					source: "successor-output-1",
					target: "approval-policy",
					kind: "approval",
					label: "workflow approval"
				},
				{
					id: "artifact",
					source: "approval-policy",
					target: "reviewed-artifact",
					kind: "approval",
					label: "bound artifact"
				}
			]
		},
		transaction: {
			input: {
				index: 0,
				outpoint: `${vault.stateOutpoint.txid}:${vault.stateOutpoint.vout}`,
				lockingBytecodeHex: vault.covenantLockingBytecodeHex
			},
			outputs: [{
				index: 0,
				role: "payment",
				lockingBytecodeHex: recipientLockingBytecodeHex,
				constraint: `value > 0 and value <= ${maxPaymentSatoshis} sats`
			}, {
				index: 1,
				role: "successor",
				lockingBytecodeHex: vault.covenantLockingBytecodeHex,
				constraint: "same P2SH32 lock; value = input - payment - fee"
			}]
		},
		covenant: {
			operatorPkhHex,
			recipientLockingBytecodeHex,
			maxPaymentSatoshis,
			maxFeeSatoshis
		},
		sourceAssembly: boundedReleaseRedeemSource({
			operatorPkhHex,
			recipientLockingBytecodeHex,
			maxPaymentSatoshis,
			maxFeeSatoshis
		})
	};
}
/** Human-readable binding for a selected graph element, sourced from the same compiler inputs. */
function executableElementDetail(id, execution) {
	const payment = execution.transaction.outputs[0];
	const successor = execution.transaction.outputs[1];
	return {
		"source-utxo": {
			title: "Provider-proven covenant UTXO",
			transactionBinding: `Transaction input 0 spends ${execution.transaction.input.outpoint}.`,
			enforcement: "provider-evidence",
			editable: "Select a different vault only by attaching a separately provider-proven UTXO."
		},
		"bounded-release": {
			title: "P2SH32 covenant lock",
			transactionBinding: "Input 0 must reveal this vault's redeem bytecode and satisfy its signature and output checks.",
			enforcement: "on-chain",
			editable: "Not editable. Altering it creates a different P2SH32 address and requires new funding.",
			assembly: execution.sourceAssembly
		},
		"native-bch": {
			title: "Native BCH input policy",
			transactionBinding: "The builder rejects a token-bearing source UTXO and constructs token-free outputs.",
			enforcement: "off-chain-policy",
			editable: "CashToken routes require a separately reviewed covenant and transaction builder."
		},
		"payment-output-0": {
			title: "Payment output 0",
			transactionBinding: `Output 0 is locked to ${payment.lockingBytecodeHex}.`,
			enforcement: "on-chain",
			editable: "Recipient is immutable for this funded vault. Enroll a new recipient and fund a new covenant to change it.",
			assembly: `<0> OP_OUTPUTBYTECODE <0x${payment.lockingBytecodeHex}> OP_EQUALVERIFY`
		},
		"successor-output-1": {
			title: "Successor covenant output 1",
			transactionBinding: `Output 1 is locked to ${successor.lockingBytecodeHex} with value = input - payment - fee.`,
			enforcement: "on-chain",
			editable: "Not editable. It preserves the covenant for the remaining BCH.",
			assembly: "<0> OP_UTXOBYTECODE <1> OP_OUTPUTBYTECODE OP_EQUALVERIFY"
		},
		"compiled-limits": {
			title: "Compiled payment and fee limits",
			transactionBinding: `Payment <= ${execution.covenant.maxPaymentSatoshis} sats; fee <= ${execution.covenant.maxFeeSatoshis} sats.`,
			enforcement: "on-chain",
			editable: "These limits are constructor values. A changed limit requires a newly compiled and funded vault.",
			assembly: `<0> OP_OUTPUTVALUE <${execution.covenant.maxPaymentSatoshis}> OP_LESSTHANOREQUAL OP_VERIFY\n<0> OP_UTXOVALUE <0> OP_OUTPUTVALUE OP_SUB <1> OP_OUTPUTVALUE OP_SUB <${execution.covenant.maxFeeSatoshis}> OP_LESSTHANOREQUAL`
		},
		"approval-policy": {
			title: "Organization approval policy",
			transactionBinding: "Approval signatures bind the canonical intent before the transaction can be built.",
			enforcement: "off-chain-policy",
			editable: "Threshold is editable within the configured organization. It is not a BoundedRelease opcode."
		},
		"reviewed-artifact": {
			title: "Reviewed artifact binding",
			transactionBinding: "The plan and attached UTXO both bind this artifact hash before proposal and transaction stages proceed.",
			enforcement: "on-chain",
			editable: "A different artifact is a different covenant. It must be reviewed, funded, and attached separately.",
			assembly: execution.sourceAssembly
		},
		"input-0": {
			title: "Input binding",
			transactionBinding: "The redeem script requires exactly one input and the active covenant input at index 0.",
			enforcement: "on-chain",
			editable: "The input set is fixed by the covenant; adding fee inputs is rejected.",
			assembly: "OP_TXINPUTCOUNT <1> OP_NUMEQUALVERIFY OP_INPUTINDEX <0> OP_NUMEQUALVERIFY"
		},
		"output-0": {
			title: "Payment-output binding",
			transactionBinding: "The redeem script requires the reviewed recipient payment at transaction output 0.",
			enforcement: "on-chain",
			editable: "Output ordering is not editable for this covenant shape.",
			assembly: `<0> OP_OUTPUTBYTECODE <0x${payment.lockingBytecodeHex}> OP_EQUALVERIFY`
		},
		"output-1": {
			title: "Successor-output binding",
			transactionBinding: "The remaining BCH must be placed in the same covenant at transaction output 1.",
			enforcement: "on-chain",
			editable: "Output ordering and successor lock are fixed after funding.",
			assembly: "<0> OP_UTXOBYTECODE <1> OP_OUTPUTBYTECODE OP_EQUALVERIFY"
		},
		caps: {
			title: "Value and fee controls",
			transactionBinding: "The contract checks the payment cap and derives the fee from input minus both outputs.",
			enforcement: "on-chain",
			editable: "Use a replacement-vault design to alter these constructor values.",
			assembly: `<0> OP_OUTPUTVALUE <${execution.covenant.maxPaymentSatoshis}> OP_LESSTHANOREQUAL OP_VERIFY`
		},
		approval: {
			title: "Approval workflow binding",
			transactionBinding: "The visual edge represents an off-chain gate before signing; it does not add an opcode to the covenant.",
			enforcement: "off-chain-policy",
			editable: "Edit the organization threshold and publish a new policy version."
		},
		artifact: {
			title: "Artifact-review binding",
			transactionBinding: "The policy ID and artifact hash are included in proposal validation and signing review.",
			enforcement: "off-chain-policy",
			editable: "Review and fund a new artifact to change code-level behavior."
		}
	}[id] ?? null;
}
function executableStudioRules(plan, vault) {
	return [
		{
			id: "input.cardinality",
			label: "Exactly one covenant input at index 0",
			detail: "The transaction builder and redeem script both require one input.",
			test: () => assertPlanMatchesVaultArtifact(plan, vault)
		},
		{
			id: "output.cardinality",
			label: "Exactly two outputs",
			detail: "Output 0 is the payment; output 1 is the covenant successor.",
			test: () => assertPlanMatchesVaultArtifact(plan, vault)
		},
		{
			id: "destination.lock-mismatch",
			label: "Payment lock is the funded covenant recipient lock",
			detail: "The recipient bytecode is immutable after funding.",
			test: () => assertPlanMatchesVaultArtifact(plan, vault)
		},
		{
			id: "successor.lock-mismatch",
			label: "Successor keeps the exact P2SH32 vault lock",
			detail: "Remaining BCH cannot become ordinary change.",
			test: () => assertPlanMatchesVaultArtifact(plan, vault)
		},
		{
			id: "amount.over-per-payment",
			label: "Payment cap is the compiled covenant cap",
			detail: "The Studio cannot raise the cap after the vault is funded.",
			test: () => assertPlanMatchesVaultArtifact(plan, vault)
		},
		{
			id: "fee.over-cap",
			label: "Fee cap is the compiled covenant cap",
			detail: "The Studio cannot raise the fee ceiling after the vault is funded.",
			test: () => assertPlanMatchesVaultArtifact(plan, vault)
		}
	].map((check) => {
		try {
			check.test();
			return {
				id: check.id,
				label: check.label,
				pass: true,
				enforcement: "on-chain",
				detail: check.detail
			};
		} catch (error) {
			return {
				id: check.id,
				label: check.label,
				pass: false,
				enforcement: "on-chain",
				detail: error instanceof Error ? error.message : "Executable mapping is unavailable"
			};
		}
	});
}
function planOutputs(args) {
	return [{
		index: 0,
		role: "payment",
		valueSatoshis: args.paymentSatoshis.toString(),
		lockingBytecodeHex: args.paymentLockingBytecodeHex,
		address: addressFromLockingBytecode(args.network, args.paymentLockingBytecodeHex),
		token: EMPTY_TOKEN
	}, {
		index: 1,
		role: "successor",
		valueSatoshis: args.successorSatoshis.toString(),
		lockingBytecodeHex: args.successorLockingBytecodeHex,
		address: addressFromLockingBytecode(args.network, args.successorLockingBytecodeHex),
		token: EMPTY_TOKEN
	}];
}
function buildUnsignedVaultRelease(args) {
	if (args.utxo.spent) throw new Error("Source outpoint is spent");
	if (args.utxo.token.categoryHex) throw new Error("Native-BCH route rejects token-bearing inputs");
	const inputValue = parseSatoshis(args.utxo.valueSatoshis);
	const amount = parseSatoshis(args.amountSatoshis);
	const fee = parseSatoshis(args.feeSatoshis);
	if (amount <= 0n) throw new Error("Payment must be positive");
	if (fee < 0n) throw new Error("Fee cannot be negative");
	const successor = inputValue - amount - fee;
	if (successor < 0n) throw new Error("Outputs plus fee exceed input value");
	if (isDustValue(amount) || isDustValue(successor)) throw new Error("Dust output rejected");
	const outputs = planOutputs({
		network: args.utxo.network,
		paymentLockingBytecodeHex: args.paymentLockingBytecodeHex,
		successorLockingBytecodeHex: args.successorLockingBytecodeHex,
		paymentSatoshis: amount,
		successorSatoshis: successor
	});
	const tx = {
		version: 2,
		locktime: 0,
		inputs: [{
			outpointIndex: args.utxo.outpoint.vout,
			outpointTransactionHash: hexToBin(args.utxo.outpoint.txid),
			sequenceNumber: SEQUENCE_ENABLE_LOCKTIME,
			unlockingBytecode: /* @__PURE__ */ new Uint8Array()
		}],
		outputs: outputs.map((output) => ({
			lockingBytecode: hexToBin(output.lockingBytecodeHex),
			valueSatoshis: parseSatoshis(output.valueSatoshis)
		}))
	};
	const raw = encodeTransaction(tx);
	return {
		rawHex: binToHex(raw),
		txid: txidFromEncoded(raw),
		feeSatoshis: fee.toString(),
		outputs,
		conservationLine: `${inputValue.toString()} in = ${amount.toString()} payment + ${successor.toString()} successor + ${fee.toString()} fee`,
		sourceOutputs: [{
			lockingBytecodeHex: args.utxo.lockingBytecodeHex,
			valueSatoshis: args.utxo.valueSatoshis
		}]
	};
}
function signVaultRelease(args) {
	const decoded = decodeTransaction(hexToBin(args.unsignedHex));
	if (typeof decoded === "string") throw new Error(decoded);
	const redeem = hexToBin(args.redeemHex);
	const sourceOutputs = [{
		lockingBytecode: hexToBin(args.sourceLockingBytecodeHex),
		valueSatoshis: parseSatoshis(args.sourceValueSatoshis)
	}];
	const typeByte = SigningSerializationTypeBCH.allOutputsAllUtxos;
	const serialization = generateSigningSerializationBCH({
		inputIndex: 0,
		sourceOutputs,
		transaction: decoded
	}, {
		coveredBytecode: redeem,
		signingSerializationType: Uint8Array.of(typeByte)
	});
	const sig = secp256k1.signMessageHashSchnorr(args.privateKey, hash256(serialization));
	if (typeof sig === "string") throw new Error(sig);
	const sigWithType = new Uint8Array(sig.length + 1);
	sigWithType.set(sig, 0);
	sigWithType[sig.length] = typeByte;
	decoded.inputs[0].unlockingBytecode = concatBins([
		encodeDataPush(sigWithType),
		encodeDataPush(args.publicKey),
		encodeDataPush(redeem)
	]);
	const raw = encodeTransaction(decoded);
	return {
		signedHex: binToHex(raw),
		txid: txidFromEncoded(raw)
	};
}
function parseSignedTransaction(hex) {
	const decoded = decodeTransaction(hexToBin(hex));
	if (typeof decoded === "string") throw new Error(decoded);
	return decoded;
}
function signedMatchesIntent(args) {
	const tx = parseSignedTransaction(args.signedHex);
	if ((args.expectedVersion ?? 2) !== tx.version) return {
		ok: false,
		reason: "Transaction version changed"
	};
	if ((args.expectedLocktime ?? 0) !== tx.locktime) return {
		ok: false,
		reason: "Locktime changed"
	};
	if (tx.inputs.length !== args.expectedOutpoints.length) return {
		ok: false,
		reason: "Input count changed by the wallet"
	};
	for (const [index, input] of tx.inputs.entries()) {
		const expected = args.expectedOutpoints[index];
		if (!expected) return {
			ok: false,
			reason: "Missing expected outpoint"
		};
		if (binToHex(input.outpointTransactionHash) !== expected.txid.toLowerCase()) return {
			ok: false,
			reason: "Wallet changed an input outpoint"
		};
		if (input.outpointIndex !== expected.vout) return {
			ok: false,
			reason: "Wallet changed an input index"
		};
		if ((args.expectedSequence ?? 4294967294) !== input.sequenceNumber) return {
			ok: false,
			reason: "Input sequence changed"
		};
	}
	if (tx.outputs.length !== args.expectedOutputs.length) return {
		ok: false,
		reason: "Output count changed by the wallet"
	};
	for (const [index, output] of tx.outputs.entries()) {
		const expected = args.expectedOutputs[index];
		if (!expected) return {
			ok: false,
			reason: "Missing expected output"
		};
		if (binToHex(output.lockingBytecode) !== expected.lockingBytecodeHex) return {
			ok: false,
			reason: `Output ${index} locking bytecode changed`
		};
		if (output.valueSatoshis !== parseSatoshis(expected.valueSatoshis)) return {
			ok: false,
			reason: `Output ${index} value changed`
		};
		if (output.token) return {
			ok: false,
			reason: `Output ${index} unexpectedly carries a token`
		};
	}
	const outSum = tx.outputs.reduce((sum, output) => sum + output.valueSatoshis, 0n);
	if (parseSatoshis(args.inputValueSatoshis) - outSum !== parseSatoshis(args.expectedFee)) return {
		ok: false,
		reason: "Fee changed by the wallet"
	};
	return {
		ok: true,
		reason: null
	};
}
function previewTransition(input) {
	const amount = parseSatoshis(input.amountSatoshis);
	const fee = parseSatoshis(input.feeSatoshis);
	const inputValue = parseSatoshis(input.utxo.valueSatoshis);
	const successor = inputValue - amount - fee;
	const built = planOutputs({
		network: input.utxo.network,
		paymentLockingBytecodeHex: input.destinationLockingBytecodeHex,
		successorLockingBytecodeHex: input.successorLockingBytecodeHex,
		paymentSatoshis: amount,
		successorSatoshis: successor < 0n ? 0n : successor
	});
	const { policy, covenant } = evaluatePolicy(input);
	const intent = buildCanonicalIntent({
		plan: input.plan,
		proposalId: input.proposalId,
		vaultId: input.plan.sourceVaultId,
		utxo: input.utxo,
		routeId: input.routeId,
		amountSatoshis: input.amountSatoshis,
		feeSatoshis: input.feeSatoshis,
		destinationLockingBytecodeHex: input.destinationLockingBytecodeHex,
		successorLockingBytecodeHex: input.successorLockingBytecodeHex,
		successorValueSatoshis: (successor < 0n ? 0n : successor).toString(),
		nonce: input.nonce,
		createdAt: input.createdAt,
		expiresAt: input.expiresAt
	});
	const emptyToken = (token) => token.categoryHex === null && token.amount === "0";
	return {
		input: input.utxo,
		outputs: built,
		feeSatoshis: input.feeSatoshis,
		assetDeltas: [
			{
				asset: "bch",
				inValue: input.utxo.valueSatoshis,
				outValue: (amount + (successor < 0n ? 0n : successor)).toString(),
				conserved: amount + fee + (successor < 0n ? 0n : successor) === inputValue,
				detail: "Native BCH conserved independently of tokens"
			},
			{
				asset: "fee",
				inValue: "0",
				outValue: input.feeSatoshis,
				conserved: true,
				detail: "Fee is input minus outputs"
			},
			{
				asset: "fungible-token",
				inValue: input.utxo.token.amount,
				outValue: "0",
				conserved: emptyToken(input.utxo.token),
				detail: "No fungible token on this native-BCH route"
			},
			{
				asset: "nft",
				inValue: input.utxo.token.nftCapability,
				outValue: "none",
				conserved: input.utxo.token.nftCapability === "none",
				detail: "NFT state is not a budget balance"
			}
		],
		policyDecision: policy,
		covenantDecision: covenant,
		intentHash: hashIntent(intent),
		evidence: [input.utxo.chainEvidence === "fixture" ? "FIXTURE" : "DESIGNED"],
		conservationLine: `${inputValue.toString()} in = ${amount.toString()} payment + ${successor.toString()} successor + ${fee.toString()} fee`
	};
}
//#endregion
export { executableElementDetail as a, previewTransition as c, validateCanvas as d, evaluatePolicy as i, signVaultRelease as l, buildUnsignedVaultRelease as n, executableStudioRules as o, compileExecutableStudio as r, explainDecision as s, assertPlanMatchesVaultArtifact as t, signedMatchesIntent as u };
