import { s as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as DialogOverlay, i as DialogDescription, n as DialogClose, o as DialogPortal, r as DialogContent, s as DialogTitle, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { E as formatSats, P as satoshisToBch, R as utf8Sha256Hex, T as formatBch, b as compileBoundedRelease, g as boundedReleaseRedeemSource, i as IDENTITIES, k as parseSatoshis, m as bchToSatoshis } from "./artifacts-lsD7QsAY.mjs";
import { C as GitBranch, N as CircleCheck, P as ChevronRight, _ as PackagePlus, c as ShieldCheck, f as RefreshCcw, h as Play, t as X } from "../_libs/lucide-react.mjs";
import { _ as getCurrentSession, i as Card, n as Badge, o as CardTitle, p as cn, r as Button, t as AppShell } from "./api-Ch8UWRqP.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as Label, t as Input } from "./input-D-klI4jJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mock-DU97woOg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DEFAULT_PAYMENT = "75000000";
var DEFAULT_FEE = "1000";
var DEFAULT_VAULT_VALUE = "844000000";
function createInstance(args) {
	const compiled = compileBoundedRelease({
		operatorPkhHex: IDENTITIES.alice.pkhHex,
		recipientLockingBytecodeHex: args.recipientLock,
		maxPaymentSatoshis: args.maxPaymentSatoshis,
		maxFeeSatoshis: args.maxFeeSatoshis
	});
	const redeemSource = boundedReleaseRedeemSource({
		operatorPkhHex: IDENTITIES.alice.pkhHex,
		recipientLockingBytecodeHex: args.recipientLock,
		maxPaymentSatoshis: args.maxPaymentSatoshis,
		maxFeeSatoshis: args.maxFeeSatoshis
	});
	return {
		id: `mock-instance-v${args.revision}`,
		revision: args.revision,
		status: args.status,
		maxPaymentSatoshis: args.maxPaymentSatoshis,
		maxFeeSatoshis: args.maxFeeSatoshis,
		recipientLock: args.recipientLock,
		lockingBytecodeHex: compiled.lockingBytecodeHex,
		redeemSource,
		artifactFingerprint: utf8Sha256Hex(compiled.redeemHex).slice(0, 16)
	};
}
function createMockWorkspace() {
	const fundedInstance = createInstance({
		revision: 1,
		maxPaymentSatoshis: "100000000",
		maxFeeSatoshis: "2000",
		recipientLock: IDENTITIES.vendor.lockingBytecodeHex,
		status: "funded"
	});
	return {
		template: {
			id: "bounded-release-v1",
			status: "reviewed",
			source: "Reviewed BoundedRelease native-BCH family"
		},
		fundedInstance,
		candidateInstance: null,
		vault: {
			outpoint: "mock:funding:0",
			valueSatoshis: DEFAULT_VAULT_VALUE,
			lockingBytecodeHex: fundedInstance.lockingBytecodeHex,
			instanceId: fundedInstance.id,
			state: "active",
			evidence: "mock-fixture",
			transition: 0
		},
		proposal: {
			id: "mock-proposal-001",
			instanceId: fundedInstance.id,
			amountSatoshis: DEFAULT_PAYMENT,
			feeSatoshis: DEFAULT_FEE,
			recipientLock: fundedInstance.recipientLock,
			revision: 1,
			workflow: "draft"
		},
		token: null,
		transitionCount: 0,
		audit: [{
			id: "mock-audit-seed",
			label: "Mock workspace initialized",
			detail: "A fixture covenant UTXO is available only for local deterministic scenarios.",
			evidence: "mock-fixture"
		}]
	};
}
function withCandidateInstance(state, changes) {
	const base = state.candidateInstance ?? state.fundedInstance;
	const candidate = createInstance({
		revision: state.fundedInstance.revision + 1,
		maxPaymentSatoshis: changes.maxPaymentSatoshis ?? base.maxPaymentSatoshis,
		maxFeeSatoshis: changes.maxFeeSatoshis ?? base.maxFeeSatoshis,
		recipientLock: changes.recipientLock ?? base.recipientLock,
		status: "unfunded"
	});
	return {
		...state,
		candidateInstance: candidate,
		audit: [{
			id: `mock-audit-instance-${candidate.revision}`,
			label: `Plan configuration v${candidate.revision} compiled`,
			detail: "This is an unfunded candidate instance. The active vault and its constraints remain v1.",
			evidence: "local-deterministic"
		}, ...state.audit]
	};
}
function reviseMockProposal(state, changes) {
	const workflow = state.proposal.workflow === "needs-review" ? "invalidated" : "draft";
	const proposal = {
		...state.proposal,
		...changes,
		revision: state.proposal.revision + 1,
		workflow
	};
	return {
		...state,
		proposal,
		audit: [{
			id: `mock-audit-proposal-${proposal.revision}`,
			label: `Proposal intent revised to r${proposal.revision}`,
			detail: "The transaction intent changed. Any workflow review is invalidated; the funded covenant instance did not change.",
			evidence: "local-deterministic"
		}, ...state.audit]
	};
}
function requestMockWorkflowReview(state) {
	return {
		...state,
		proposal: {
			...state.proposal,
			workflow: "needs-review"
		},
		audit: [{
			id: `mock-audit-review-${state.proposal.revision}`,
			label: "Mock workflow review requested",
			detail: "This records no signature and creates no approval authority. On-chain validation is independent.",
			evidence: "local-deterministic"
		}, ...state.audit]
	};
}
function simulateMockTransition(state, scenario = "happy") {
	const instance = state.fundedInstance;
	const input = state.vault;
	const payment = parseSatoshis(state.proposal.amountSatoshis);
	const fee = parseSatoshis(state.proposal.feeSatoshis);
	const inputValue = parseSatoshis(input.valueSatoshis);
	const recipientLock = scenario === "wrong-recipient" ? IDENTITIES.recovery.lockingBytecodeHex : state.proposal.recipientLock;
	const proposedPayment = scenario === "over-cap" ? parseSatoshis(instance.maxPaymentSatoshis) + 1n : payment;
	const proposedFee = scenario === "over-fee" ? parseSatoshis(instance.maxFeeSatoshis) + 1n : fee;
	const successorLock = scenario === "missing-successor" ? null : instance.lockingBytecodeHex;
	const simulatedSpent = scenario === "stale-input" || input.state === "spent";
	const successor = inputValue - proposedPayment - proposedFee;
	const validations = [
		{
			id: "input",
			label: "Input 0 is the active covenant UTXO",
			detail: `${input.outpoint} · ${satoshisToBch(input.valueSatoshis)} BCH`,
			kind: "construction",
			pass: !simulatedSpent
		},
		{
			id: "outputs",
			label: "Exactly two ordered outputs",
			detail: "output 0 = payment; output 1 = covenant successor",
			kind: "on-chain",
			pass: successorLock !== null
		},
		{
			id: "recipient",
			label: "Payment output 0 uses the enrolled recipient lock",
			detail: "Compared as locking bytecode, not as an account balance.",
			kind: "on-chain",
			pass: recipientLock === instance.recipientLock
		},
		{
			id: "cap",
			label: "Payment is within the on-chain cap",
			detail: `${proposedPayment.toString()} sats ≤ ${instance.maxPaymentSatoshis} sats`,
			kind: "on-chain",
			pass: proposedPayment > 0n && proposedPayment <= parseSatoshis(instance.maxPaymentSatoshis)
		},
		{
			id: "fee",
			label: "Fee is within the on-chain cap",
			detail: `${proposedFee.toString()} sats ≤ ${instance.maxFeeSatoshis} sats`,
			kind: "on-chain",
			pass: proposedFee >= 0n && proposedFee <= parseSatoshis(instance.maxFeeSatoshis)
		},
		{
			id: "successor",
			label: "Output 1 retains the same covenant lock",
			detail: "The next controlled state must be locked by this same instance.",
			kind: "on-chain",
			pass: successorLock === instance.lockingBytecodeHex
		},
		{
			id: "conservation",
			label: "BCH value is conserved",
			detail: `${inputValue.toString()} = ${proposedPayment.toString()} payment + ${successor.toString()} successor + ${proposedFee.toString()} fee`,
			kind: "construction",
			pass: successor > 546n
		},
		{
			id: "token",
			label: "No CashToken state enters this native-BCH route",
			detail: "CashToken accounting is separate and this reviewed template has no token route.",
			kind: "on-chain",
			pass: true
		}
	];
	return {
		scenario,
		input,
		paymentSatoshis: proposedPayment.toString(),
		feeSatoshis: proposedFee.toString(),
		recipientLock,
		successorLock,
		successorSatoshis: successor > 546n ? successor.toString() : null,
		validations,
		allowed: validations.every((item) => item.pass)
	};
}
function applyMockTransition(state, simulation) {
	if (!simulation.allowed || !simulation.successorSatoshis) return state;
	const transition = state.transitionCount + 1;
	const successor = {
		outpoint: `mock:transition-${transition}:1`,
		valueSatoshis: simulation.successorSatoshis,
		lockingBytecodeHex: state.fundedInstance.lockingBytecodeHex,
		instanceId: state.fundedInstance.id,
		state: "active",
		evidence: "local-deterministic",
		transition
	};
	return {
		...state,
		transitionCount: transition,
		vault: successor,
		proposal: {
			...state.proposal,
			amountSatoshis: DEFAULT_PAYMENT,
			feeSatoshis: DEFAULT_FEE,
			recipientLock: state.fundedInstance.recipientLock,
			revision: state.proposal.revision + 1,
			workflow: "draft"
		},
		audit: [{
			id: `mock-audit-transition-${transition}`,
			label: `Local deterministic transition ${transition} applied`,
			detail: `The mock input was consumed in the model and output 1 is now the active mock covenant UTXO. Nothing was signed or broadcast.`,
			evidence: "local-deterministic"
		}, ...state.audit]
	};
}
function issueMockCashToken(state, values) {
	const supply = values.supply.trim();
	if (!/^\d+$/.test(supply) || BigInt(supply) <= 0n) throw new Error("Initial fungible supply must be a positive whole number");
	const category = utf8Sha256Hex(`mock-cashtoken-genesis-vout-0:${values.name}:${values.ticker}:${supply}`).slice(0, 40);
	const token = {
		category,
		name: values.name.trim() || "Mock Credit",
		ticker: values.ticker.trim().toUpperCase() || "MOCK",
		supply,
		decimals: 0,
		genesisOutpoint: "mock:cashtoken-genesis:0",
		mintingNft: values.mintingNft,
		mutableNft: values.mutableNft
	};
	return {
		...state,
		token,
		audit: [{
			id: `mock-audit-token-${category.slice(0, 8)}`,
			label: `${token.ticker} mock CashToken issuance simulated`,
			detail: `Category derives from mock genesis output 0. ${token.supply} fungible units exist only in the mock ledger; metadata is not category identity.`,
			evidence: "local-deterministic"
		}, ...state.audit]
	};
}
function satsFromBch(value) {
	return bchToSatoshis(value).toString();
}
var NAV = [
	{
		id: "command",
		label: "Command Center"
	},
	{
		id: "assets",
		label: "Assets"
	},
	{
		id: "issuance",
		label: "Issuance Lab"
	},
	{
		id: "studio",
		label: "Control Studio"
	},
	{
		id: "proposals",
		label: "Proposals"
	},
	{
		id: "lineage",
		label: "Lineage"
	},
	{
		id: "audit",
		label: "Audit"
	}
];
function evidenceTone(evidence) {
	return evidence === "mock-fixture" ? "demo" : evidence === "local-deterministic" ? "pass" : "warn";
}
function EvidenceBadge({ evidence }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		tone: evidenceTone(evidence),
		children: evidence.replace("-", " ")
	});
}
function short(value, size = 16) {
	return value.length <= size ? value : `${value.slice(0, size)}…`;
}
function MockWorkspace() {
	const [view, setView] = (0, import_react.useState)("command");
	const [workspace, setWorkspace] = (0, import_react.useState)(() => createMockWorkspace());
	const [simulation, setSimulation] = (0, import_react.useState)(null);
	const [inspector, setInspector] = (0, import_react.useState)(null);
	const go = (next) => {
		setView(next);
		setSimulation(null);
	};
	const reset = () => {
		setWorkspace(createMockWorkspace());
		setSimulation(null);
		setView("command");
	};
	const render = () => {
		const props = {
			workspace,
			setWorkspace,
			go,
			simulation,
			setSimulation,
			setInspector
		};
		switch (view) {
			case "assets": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssetsView, { ...props });
			case "issuance": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IssuanceView, { ...props });
			case "studio": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudioView, { ...props });
			case "proposals": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalsView, { ...props });
			case "lineage": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LineageView, { ...props });
			case "audit": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuditView, { ...props });
			default: return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandView, { ...props });
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex flex-wrap items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "demo",
							children: "Mock / local"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "accent",
							children: "Chipnet-shaped"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "warn",
							children: "No wallet or network writes"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 text-2xl font-medium tracking-tight",
					children: "OPTN Control Plane workspace"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-3xl text-sm leading-6 text-muted",
					children: "A local teaching model: review a template, configure a contract instance, inspect the mock vault UTXO, then construct and validate a permitted transaction transition."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				variant: "outline",
				onClick: reset,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCcw, { className: "size-4" }), " Reset mock workspace"]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-5 flex gap-1 overflow-x-auto border-b border-border pb-2",
			children: NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => go(item.id),
				className: cn("shrink-0 rounded-md px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-fg", view === item.id && "bg-surface-2 text-fg ring-1 ring-accent/40"),
				children: item.label
			}, item.id))
		}),
		render(),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NodeInspector, {
			inspector,
			onClose: () => setInspector(null),
			workspace
		})
	] });
}
function CommandView({ workspace, go, setInspector }) {
	const protectedValue = workspace.vault.valueSatoshis;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs uppercase tracking-[0.18em] text-muted",
					children: "Current mock state"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 text-xl font-medium",
					children: "Control an explicit UTXO transition"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 md:grid-cols-2 xl:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							title: "Protected BCH",
							value: formatBch(protectedValue),
							detail: "1 active mock covenant UTXO",
							onClick: () => setInspector("source")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							title: "Contract instance",
							value: `v${workspace.fundedInstance.revision}`,
							detail: "Funded BoundedRelease instance",
							onClick: () => setInspector("template")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							title: "CashTokens",
							value: workspace.token ? workspace.token.ticker : "None",
							detail: workspace.token ? "Mock genesis output 0" : "Issue a mock category",
							onClick: () => go("issuance")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							title: "Proposal",
							value: `r${workspace.proposal.revision}`,
							detail: `${workspace.proposal.workflow.replace("-", " ")} · no signature`,
							onClick: () => go("proposals")
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Use the workspace in this order" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid gap-3 md:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlowStep, {
							number: "1",
							title: "Issue / inspect assets",
							detail: "Create a mock CashToken category from genesis output 0, or inspect the protected BCH UTXO.",
							action: "Open Assets",
							onClick: () => go("assets")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlowStep, {
							number: "2",
							title: "Configure a reviewed instance",
							detail: "Change only supported BoundedRelease constructor values; a change produces an unfunded v2.",
							action: "Open Studio",
							onClick: () => go("studio")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlowStep, {
							number: "3",
							title: "Simulate exact outputs",
							detail: "See input 0, payment output 0, successor output 1, fee, and each invariant.",
							action: "Build transition",
							onClick: () => go("studio")
						})
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "What is and is not real here" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid gap-3 text-sm md:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Boundary, {
							title: "Mock fixture",
							detail: "The starting vault and ordinary UTXOs are local data, not provider-observed chain state.",
							tone: "demo"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Boundary, {
							title: "Local deterministic",
							detail: "The BoundedRelease redeem source and the transition checks are recomputed in this browser.",
							tone: "pass"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Boundary, {
							title: "Not included",
							detail: "No keys, WalletConnect signing, funding, broadcast, mempool, confirmation, or explorer transaction IDs.",
							tone: "warn"
						})
					]
				})] })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Control lifecycle" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 space-y-3 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LifecycleItem, {
						title: "Reviewed template",
						value: "BoundedRelease v1",
						detail: "Native BCH only · fixed 1-input / 2-output shape"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LifecycleItem, {
						title: "Funded instance",
						value: `v${workspace.fundedInstance.revision}`,
						detail: `lock ${short(workspace.fundedInstance.lockingBytecodeHex)}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LifecycleItem, {
						title: "Active mock vault UTXO",
						value: workspace.vault.outpoint,
						detail: formatBch(workspace.vault.valueSatoshis)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LifecycleItem, {
						title: "Proposal intent",
						value: `r${workspace.proposal.revision}`,
						detail: "Separately versioned workflow record"
					})
				]
			}),
			workspace.candidateInstance ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 rounded-lg border border-warn/40 bg-surface-2 p-3 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-medium text-warn",
					children: [
						"Candidate v",
						workspace.candidateInstance.revision,
						" is unfunded"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs leading-5 text-muted",
					children: "Changing constructor values never retargets the existing vault. Funding is intentionally outside this mock."
				})]
			}) : null
		] })]
	});
}
function AssetsView({ workspace, go, setInspector }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-xs uppercase tracking-[0.18em] text-muted",
				children: "Mock UTXO inventory"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-1 text-xl font-medium",
				children: "Assets are outputs, not an account balance"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Each row names its state, lock, and evidence. BCH and CashToken state are accounted for separately."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-4 overflow-hidden p-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-[minmax(170px,1.2fr)_110px_minmax(130px,1fr)_110px] gap-3 border-b border-border px-4 py-3 font-mono text-[11px] uppercase tracking-wide text-subtle",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Outpoint" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "BCH" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Lock / token state" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Evidence" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssetRow, {
						outpoint: "mock:ordinary-source:0",
						amount: "12.00000000 BCH",
						detail: "P2PKH ordinary BCH · eligible mock source",
						evidence: "mock-fixture"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssetRow, {
						outpoint: workspace.vault.outpoint,
						amount: formatBch(workspace.vault.valueSatoshis),
						detail: `P2SH32 · funded instance v${workspace.fundedInstance.revision}`,
						evidence: workspace.vault.evidence,
						onClick: () => setInspector("source")
					}),
					workspace.token ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssetRow, {
						outpoint: workspace.token.genesisOutpoint,
						amount: "546 sats",
						detail: `${workspace.token.ticker} category ${short(workspace.token.category)} · ${workspace.token.supply} FTs`,
						evidence: "local-deterministic",
						onClick: () => go("issuance")
					}) : null
				]
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Safe next action" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-6 text-muted",
				children: "The funded BoundedRelease instance is native BCH only. A mock CashToken category is shown beside it, never silently placed in this covenant route."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "mt-4 w-full",
				onClick: () => go("issuance"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackagePlus, { className: "size-4" }), " Issue mock CashToken"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "mt-2 w-full",
				variant: "secondary",
				onClick: () => go("studio"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4" }), " Inspect protected BCH"]
			})
		] })]
	});
}
function IssuanceView({ workspace, setWorkspace, go }) {
	const [name, setName] = (0, import_react.useState)("Acme Credits");
	const [ticker, setTicker] = (0, import_react.useState)("ACME");
	const [supply, setSupply] = (0, import_react.useState)("10000000");
	const [mintingNft, setMintingNft] = (0, import_react.useState)(true);
	const [mutableNft, setMutableNft] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const issue = () => {
		try {
			setWorkspace(issueMockCashToken(workspace, {
				name,
				ticker,
				supply,
				mintingNft,
				mutableNft
			}));
			setError(null);
		} catch (next) {
			setError(next instanceof Error ? next.message : "Unable to create mock token");
		}
	};
	const token = workspace.token;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-xs uppercase tracking-[0.18em] text-muted",
			children: "CashToken issuance lab"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mt-1 text-xl font-medium",
			children: "Construct a mock genesis transaction"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 max-w-3xl text-sm leading-6 text-muted",
			children: "The category is derived from the mock genesis output at index 0. Display metadata does not define category identity; the initial fungible supply is fixed at genesis."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "1. Token details and authority" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 grid gap-3 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "mock-token-name",
							children: "Name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "mock-token-name",
							value: name,
							onChange: (event) => setName(event.target.value)
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "mock-token-ticker",
							children: "Ticker"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "mock-token-ticker",
							value: ticker,
							onChange: (event) => setTicker(event.target.value)
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "sm:col-span-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "mock-token-supply",
									children: "Initial fungible supply"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "mock-token-supply",
									inputMode: "numeric",
									value: supply,
									onChange: (event) => setSupply(event.target.value)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-subtle",
									children: "Whole units in this mock. No later fungible supply increase is modelled."
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-4 flex items-start gap-2 rounded-md border border-border bg-surface-2 p-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: mintingNft,
						onChange: (event) => setMintingNft(event.target.checked)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "NFT minting capability" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted",
							children: "Can create additional NFTs in this category; it cannot increase fungible supply."
						})
					] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-2 flex items-start gap-2 rounded-md border border-border bg-surface-2 p-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: mutableNft,
						onChange: (event) => setMutableNft(event.target.checked)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Mutable NFT capability" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted",
							children: "Allows NFT commitment state changes; it does not mutate fungible units."
						})
					] })]
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-fail",
					children: error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "mt-4",
					onClick: issue,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), " Simulate genesis issuance"]
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "2. Ordered mock outputs" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "Output ordering is displayed because the genesis category and future covenant transaction shape both depend on exact outputs."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 space-y-2 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OutputRow, {
							index: "0",
							title: "Genesis / Treasury fungible output",
							detail: token ? `${token.supply} ${token.ticker} · category ${short(token.category)}` : "Will derive the category from this mock output",
							tone: "pass"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OutputRow, {
							index: "1",
							title: "Operations allocation",
							detail: token ? `${Math.floor(Number(token.supply) * .3).toLocaleString()} ${token.ticker} (mock allocation)` : "Optional allocation preview",
							tone: "accent"
						}),
						mintingNft || mutableNft ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OutputRow, {
							index: "2",
							title: "Authority NFT",
							detail: `${mintingNft ? "minting" : ""}${mintingNft && mutableNft ? " + " : ""}${mutableNft ? "mutable" : ""} NFT capability · separate token output`,
							tone: "warn"
						}) : null
					]
				}),
				token ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 rounded-lg border border-pass/40 bg-surface-2 p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium text-pass",
								children: "Mock issuance ready to inspect"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EvidenceBadge, { evidence: "local-deterministic" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 font-mono text-xs text-muted",
							children: ["category ", token.category]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs leading-5 text-muted",
							children: "This is a local token ledger entry, not a signed or broadcast transaction."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "mt-3",
							variant: "secondary",
							size: "sm",
							onClick: () => go("assets"),
							children: ["View mock assets ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3" })]
						})
					]
				}) : null
			] })]
		})
	] });
}
function StudioView({ workspace, setWorkspace, go, simulation, setSimulation, setInspector }) {
	const [tab, setTab] = (0, import_react.useState)("design");
	const funded = workspace.fundedInstance;
	const candidate = workspace.candidateInstance;
	const run = (scenario) => {
		setSimulation(simulateMockTransition(workspace, scenario));
		setTab("simulate");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs uppercase tracking-[0.18em] text-muted",
					children: "Control Studio"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 text-xl font-medium",
					children: "One graph, one contract instance, one transaction shape"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-3xl text-sm text-muted",
					children: "The graph is a projection of BoundedRelease. Click a node to see its business meaning, exact transaction binding, editability, and enforcement."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				tone: "pass",
				children: "Reviewed native-BCH template"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 flex flex-wrap gap-1 border-b border-border pb-2",
			children: [
				"design",
				"transaction",
				"simulate",
				"evidence"
			].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setTab(item),
				className: cn("rounded-md px-3 py-2 text-sm capitalize text-muted hover:bg-surface-2", tab === item && "bg-surface-2 text-fg ring-1 ring-accent/40"),
				children: item === "transaction" ? "Transaction shape" : item
			}, item))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 xl:grid-cols-[250px_minmax(0,1fr)_300px]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ControlLibrary, {
					candidate,
					onEdit: (key) => setInspector(key)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TransactionGraph, {
					workspace,
					simulation,
					onInspect: setInspector
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 rounded-xl border border-border bg-surface p-4",
					children: [
						tab === "design" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DesignTab, {
							workspace,
							setWorkspace
						}) : null,
						tab === "transaction" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TransactionTab, {
							workspace,
							setWorkspace,
							onRun: () => run("happy")
						}) : null,
						tab === "simulate" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SimulationTab, {
							simulation,
							onRun: run,
							onApply: () => simulation && setWorkspace(applyMockTransition(workspace, simulation))
						}) : null,
						tab === "evidence" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EvidenceTab, {
							instance: funded,
							candidate
						}) : null
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InstancePanel, {
					workspace,
					go
				})
			]
		})
	] });
}
function ControlLibrary({ candidate, onEdit }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "h-fit",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Template-aware control library" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs leading-5 text-muted",
				children: "Only controls reviewed for this template can become constructor values."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LibraryButton, {
						title: "Max payment",
						detail: "outputs[0].value",
						onClick: () => onEdit("cap")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LibraryButton, {
						title: "Fixed recipient",
						detail: "outputs[0].locking bytecode",
						onClick: () => onEdit("recipient")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LibraryButton, {
						title: "Fee ceiling",
						detail: "input − outputs",
						onClick: () => onEdit("fee")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LibraryButton, {
						title: "Required successor",
						detail: "output 1, same lock",
						onClick: () => onEdit("successor")
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 border-t border-border pt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium text-subtle",
					children: "Requires a different reviewed family"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted",
					children: "Time schedule, recovery branch, token controls, arbitrary extra outputs, and multi-input routing are not composable into BoundedRelease."
				})]
			}),
			candidate ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 rounded-md border border-warn/40 p-2 text-xs text-warn",
				children: [
					"Candidate v",
					candidate.revision,
					" is compiled but unfunded."
				]
			}) : null
		]
	});
}
function DesignTab({ workspace, setWorkspace }) {
	const instance = workspace.candidateInstance ?? workspace.fundedInstance;
	const updateSats = (key, value, bch = false) => {
		try {
			setWorkspace(withCandidateInstance(workspace, { [key]: bch ? satsFromBch(value) : value }));
		} catch {}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-medium",
				children: "Configure a new contract instance"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Changing a constructor value creates an unfunded candidate. It cannot change the lock on the current mock vault UTXO."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				tone: workspace.candidateInstance ? "warn" : "pass",
				children: workspace.candidateInstance ? `candidate v${workspace.candidateInstance.revision}` : "funded v1"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-3 md:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "mock-instance-max-payment",
						children: "Maximum payment (BCH)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "mock-instance-max-payment",
						value: satoshisToBch(instance.maxPaymentSatoshis),
						onChange: (event) => updateSats("maxPaymentSatoshis", event.target.value, true)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-subtle",
						children: "On-chain: output 0 value"
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "mock-instance-max-fee",
						children: "Maximum fee (sats)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "mock-instance-max-fee",
						inputMode: "numeric",
						value: instance.maxFeeSatoshis,
						onChange: (event) => updateSats("maxFeeSatoshis", event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-subtle",
						children: "On-chain: input minus outputs"
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "mock-instance-recipient",
						children: "Recipient lock"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						id: "mock-instance-recipient",
						className: "h-10 w-full rounded-md border border-border bg-bg px-3 text-sm",
						value: instance.recipientLock,
						onChange: (event) => setWorkspace(withCandidateInstance(workspace, { recipientLock: event.target.value })),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: IDENTITIES.vendor.lockingBytecodeHex,
							children: "Approved vendor lock"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: IDENTITIES.recovery.lockingBytecodeHex,
							children: "Recovery lock (new instance)"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-subtle",
						children: "On-chain: output 0 bytecode"
					})
				] })
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 rounded-md border border-border bg-surface-2 p-3 text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-medium",
				children: "Versioning boundary"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-muted",
				children: "Template source/compiler changes make a new artifact. These constructor fields make a new plan + contract instance. A payment proposal changes only intent revision and is revalidated against the funded instance."
			})]
		})
	] });
}
function TransactionTab({ workspace, setWorkspace, onRun }) {
	const proposal = workspace.proposal;
	const changeBch = (key, value, bch) => {
		try {
			setWorkspace(reviseMockProposal(workspace, { [key]: bch ? satsFromBch(value) : value }));
		} catch {}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-medium",
			children: "Exact transaction construction"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: "Inputs and outputs have a fixed order. There is no arbitrary transaction builder for this reviewed shape."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-3 md:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "mock-proposal-payment",
					children: "Payment (BCH)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "mock-proposal-payment",
					value: satoshisToBch(proposal.amountSatoshis),
					onChange: (event) => changeBch("amountSatoshis", event.target.value, true)
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "mock-proposal-fee",
					children: "Fee (sats)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "mock-proposal-fee",
					value: proposal.feeSatoshis,
					onChange: (event) => changeBch("feeSatoshis", event.target.value, false)
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "mock-proposal-recipient",
					children: "Recipient"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					id: "mock-proposal-recipient",
					className: "h-10 w-full rounded-md border border-border bg-bg px-3 text-sm",
					value: proposal.recipientLock,
					onChange: (event) => setWorkspace(reviseMockProposal(workspace, { recipientLock: event.target.value })),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: workspace.fundedInstance.recipientLock,
						children: "Enrolled recipient"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: IDENTITIES.recovery.lockingBytecodeHex,
						children: "Deliberately wrong recipient"
					})]
				})] })
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TransactionLedger, { workspace }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			className: "mt-4",
			onClick: onRun,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), " Validate local transition"]
		})
	] });
}
function SimulationTab({ simulation, onRun, onApply }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-start justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-medium",
			children: "Scenario simulator"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: "Deliberately break one field and see the violated constraint. This is deterministic local validation, not CashVM signing or broadcasting."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-wrap gap-1",
			children: [
				"happy",
				"wrong-recipient",
				"over-cap",
				"over-fee",
				"missing-successor",
				"stale-input"
			].map((scenario) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: scenario === "happy" ? "secondary" : "outline",
				onClick: () => onRun(scenario),
				children: scenario.replaceAll("-", " ")
			}, scenario))
		})]
	}), simulation ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("rounded-lg border p-3", simulation.allowed ? "border-pass/40 bg-surface-2" : "border-fail/40 bg-surface-2"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: cn("font-medium", simulation.allowed ? "text-pass" : "text-fail"),
						children: simulation.allowed ? "Permitted mock transition" : "Blocked locally"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: simulation.allowed ? "pass" : "fail",
						children: simulation.scenario.replaceAll("-", " ")
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted",
					children: [
						"Input ",
						simulation.input.outpoint,
						" → output 0 payment",
						" ",
						formatBch(simulation.paymentSatoshis),
						" → output 1",
						" ",
						simulation.successorSatoshis ? formatBch(simulation.successorSatoshis) : "not constructible",
						" ",
						"→ fee ",
						formatSats(simulation.feeSatoshis)
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid gap-2",
				children: simulation.validations.map((rule) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3 rounded-md border border-border bg-surface-2 px-3 py-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: rule.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-xs text-muted",
						children: rule.detail
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: rule.pass ? "pass" : "fail",
						children: rule.pass ? rule.kind : "block"
					})]
				}, rule.id))
			}),
			simulation.allowed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "mt-4",
				onClick: onApply,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4" }), " Apply local successor state"]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-warn",
				children: "No override exists for an on-chain invariant. Adjust the proposal or create and later fund a new contract instance."
			})
		]
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-4 rounded-md border border-border bg-surface-2 p-3 text-sm text-muted",
		children: "Run the happy path or a failure scenario to render a validation trace."
	})] });
}
function EvidenceTab({ instance, candidate }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-medium",
			children: "Artifact and instance evidence"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: "The source below is the exact reviewed shape configured by the funded instance. It is inspectable, but this mock workspace does not claim a deployed or funded contract beyond its fixture state."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-3 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-md border border-border bg-surface-2 p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs font-medium uppercase tracking-wide text-muted",
						children: ["Funded instance v", instance.revision]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 font-mono text-xs break-all text-subtle",
						children: ["artifact ", instance.artifactFingerprint]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 font-mono text-xs break-all text-subtle",
						children: ["lock ", instance.lockingBytecodeHex]
					})
				]
			}), candidate ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-md border border-warn/40 bg-surface-2 p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs font-medium uppercase tracking-wide text-warn",
						children: ["Unfunded candidate v", candidate.revision]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 font-mono text-xs break-all text-subtle",
						children: ["artifact ", candidate.artifactFingerprint]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-muted",
						children: "It has no vault UTXO attached."
					})
				]
			}) : null]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
			className: "mt-4 max-h-80 overflow-auto rounded-md border border-border bg-bg p-3 font-mono text-xs leading-5 text-muted",
			children: instance.redeemSource
		})
	] });
}
function ProposalsView({ workspace, setWorkspace, go, setSimulation }) {
	const simulation = simulateMockTransition(workspace, "happy");
	const proposal = workspace.proposal;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-xs uppercase tracking-[0.18em] text-muted",
				children: "Proposal / intent record"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-1 text-xl font-medium",
				children: "Bind a proposed transaction to the funded instance"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, { children: [
							"Proposal ",
							proposal.id,
							" · revision ",
							proposal.revision
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Changing amount, fee, or recipient is an intent revision. It never alters the funded covenant or creates a signature."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: proposal.workflow === "invalidated" ? "fail" : proposal.workflow === "needs-review" ? "warn" : "neutral",
							children: proposal.workflow.replace("-", " ")
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TransactionLedger, { workspace }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: () => {
								setSimulation(simulation);
								go("studio");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), " Inspect validation"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: () => setWorkspace(requestMockWorkflowReview(workspace)),
							children: "Request mock workflow review"
						})]
					})
				]
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Workflow boundary" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-6 text-muted",
				children: "Workflow review is an off-chain record only. This iteration does not create a signature, co-sign, or approval authority. The covenant validates the exact transaction shape independently."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LifecycleItem, {
						title: "Funded instance",
						value: `v${workspace.fundedInstance.revision}`,
						detail: "on-chain constraints"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LifecycleItem, {
						title: "Intent revision",
						value: `r${proposal.revision}`,
						detail: "revalidate on change"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LifecycleItem, {
						title: "Workflow",
						value: proposal.workflow.replace("-", " "),
						detail: "no signatures in mock mode"
					})
				]
			})
		] })]
	});
}
function LineageView({ workspace, setInspector }) {
	const planned = parseInt(workspace.vault.valueSatoshis, 10) - parseInt(workspace.proposal.amountSatoshis, 10) - parseInt(workspace.proposal.feeSatoshis, 10);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-xs uppercase tracking-[0.18em] text-muted",
			children: "UTXO lineage"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mt-1 text-xl font-medium",
			children: "Current state is not an account balance"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: "Solid nodes are current mock state. Dashed nodes are only permitted future outputs until a local scenario is applied."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "mt-4 overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-[820px] items-center gap-3 py-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LineageNode, {
						label: "Active mock UTXO",
						value: formatBch(workspace.vault.valueSatoshis),
						detail: workspace.vault.outpoint,
						evidence: workspace.vault.evidence,
						onClick: () => setInspector("source")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Arrow, { label: "input 0" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LineageNode, {
						label: `BoundedRelease v${workspace.fundedInstance.revision}`,
						value: "P2SH32 covenant",
						detail: "reviewed transaction family",
						evidence: "local-deterministic",
						onClick: () => setInspector("template")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Arrow, { label: "two ordered outputs" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LineageNode, {
							label: "Payment output 0",
							value: formatBch(workspace.proposal.amountSatoshis),
							detail: "fixed recipient lock",
							evidence: "permitted-future",
							dashed: true,
							onClick: () => setInspector("payment")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LineageNode, {
							label: "Successor output 1",
							value: formatBch(String(Math.max(0, planned))),
							detail: "same covenant lock · NOT YET A UTXO",
							evidence: "permitted-future",
							dashed: true,
							onClick: () => setInspector("successor")
						})]
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "mt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "State table" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid gap-2 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-[90px_1fr_120px_150px] gap-3 border-b border-border pb-2 font-mono text-[11px] uppercase tracking-wide text-subtle",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "State" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Outpoint" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "BCH" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Evidence" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-[90px_1fr_120px_150px] gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Current" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-xs",
								children: workspace.vault.outpoint
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatBch(workspace.vault.valueSatoshis) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EvidenceBadge, { evidence: workspace.vault.evidence })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-[90px_1fr_120px_150px] gap-3 text-muted",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Future" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-xs",
								children: "output 1 of next permitted transition"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatBch(String(Math.max(0, planned))) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EvidenceBadge, { evidence: "permitted-future" })
						]
					})
				]
			})]
		})
	] });
}
function AuditView({ workspace }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-xs uppercase tracking-[0.18em] text-muted",
			children: "Local audit trail"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mt-1 text-xl font-medium",
			children: "Every mock mutation explains its boundary"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 grid gap-2",
			children: workspace.audit.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: entry.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: entry.detail
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EvidenceBadge, { evidence: entry.evidence })]
			}, entry.id))
		})
	] });
}
function TransactionGraph({ workspace, simulation, onInspect }) {
	const active = simulation ?? simulateMockTransition(workspace, "happy");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "overflow-x-auto",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex flex-wrap items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Compiled control graph" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted",
				children: "Node positions are visual only. The source, constraints, and output ordering come from the selected reviewed template."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				tone: active.allowed ? "pass" : "fail",
				children: active.allowed ? "current shape passes" : "scenario blocked"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-[760px] items-center gap-3 py-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraphNode, {
					title: "Input 0",
					value: formatBch(workspace.vault.valueSatoshis),
					detail: workspace.vault.outpoint,
					tone: "accent",
					onClick: () => onInspect("source")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Arrow, { label: "spend" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraphNode, {
					title: "BoundedRelease",
					value: `instance v${workspace.fundedInstance.revision}`,
					detail: "P2SH32 · reviewed",
					tone: "pass",
					onClick: () => onInspect("template")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraphNode, {
							title: "Spend cap",
							value: `≤ ${formatBch(workspace.fundedInstance.maxPaymentSatoshis)}`,
							detail: "outputs[0].value",
							tone: "warn",
							onClick: () => onInspect("cap")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraphNode, {
							title: "Recipient lock",
							value: "fixed output 0",
							detail: short(workspace.fundedInstance.recipientLock),
							tone: "warn",
							onClick: () => onInspect("recipient")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraphNode, {
							title: "Fee ceiling",
							value: `≤ ${formatSats(workspace.fundedInstance.maxFeeSatoshis)}`,
							detail: "input - outputs",
							tone: "warn",
							onClick: () => onInspect("fee")
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Arrow, { label: "enforced" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraphNode, {
						title: "Payment · output 0",
						value: formatBch(active.paymentSatoshis),
						detail: "recipient lock",
						tone: active.validations.find((rule) => rule.id === "recipient")?.pass ? "pass" : "fail",
						onClick: () => onInspect("payment")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraphNode, {
						title: "Successor · output 1",
						value: active.successorSatoshis ? formatBch(active.successorSatoshis) : "blocked",
						detail: "same covenant lock",
						tone: active.validations.find((rule) => rule.id === "successor")?.pass ? "accent" : "fail",
						onClick: () => onInspect("successor")
					})]
				})
			]
		})]
	});
}
function InstancePanel({ workspace, go }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "h-fit",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Selected contract state" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 space-y-3 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LifecycleItem, {
						title: "Template",
						value: "BoundedRelease v1",
						detail: "reviewed native-BCH only"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LifecycleItem, {
						title: "Funded instance",
						value: `v${workspace.fundedInstance.revision}`,
						detail: `artifact ${workspace.fundedInstance.artifactFingerprint}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LifecycleItem, {
						title: "Vault UTXO",
						value: short(workspace.vault.outpoint),
						detail: `${formatBch(workspace.vault.valueSatoshis)} · active`
					})
				]
			}),
			workspace.candidateInstance ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 rounded-md border border-warn/40 bg-surface-2 p-3 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-medium text-warn",
					children: [
						"v",
						workspace.candidateInstance.revision,
						" needs funding"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted",
					children: "The mock does not provide a funding action; this keeps the current vault truthful."
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "mt-4 w-full",
				size: "sm",
				variant: "secondary",
				onClick: () => go("lineage"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GitBranch, { className: "size-4" }), " View lineage"]
			})
		]
	});
}
function TransactionLedger({ workspace }) {
	const successor = parseSatoshisSafe(workspace.vault.valueSatoshis) - parseSatoshisSafe(workspace.proposal.amountSatoshis) - parseSatoshisSafe(workspace.proposal.feeSatoshis);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 overflow-hidden rounded-md border border-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-[80px_1fr_140px] gap-3 border-b border-border bg-surface-2 px-3 py-2 font-mono text-[11px] uppercase tracking-wide text-subtle",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Field" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Exact binding" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Value" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LedgerRow, {
				label: "Input 0",
				detail: `${workspace.vault.outpoint} · P2SH32 ${short(workspace.vault.lockingBytecodeHex)}`,
				value: formatBch(workspace.vault.valueSatoshis)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LedgerRow, {
				label: "Output 0",
				detail: `payment · recipient ${short(workspace.proposal.recipientLock)}`,
				value: formatBch(workspace.proposal.amountSatoshis)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LedgerRow, {
				label: "Output 1",
				detail: "successor · same covenant locking bytecode",
				value: successor > 0n ? formatBch(successor.toString()) : "invalid"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LedgerRow, {
				label: "Fee",
				detail: "input value − output values",
				value: formatSats(workspace.proposal.feeSatoshis)
			})
		]
	});
}
function NodeInspector({ inspector, onClose, workspace }) {
	const details = {
		source: {
			title: "Active mock covenant UTXO",
			meaning: "The discrete state being consumed. It is not an account balance.",
			binding: `input 0 = ${workspace.vault.outpoint}; value = ${workspace.vault.valueSatoshis} sats`,
			enforcement: "Transaction construction",
			editable: "No — select a different real UTXO only after provider evidence in a future live flow."
		},
		template: {
			title: "Reviewed BoundedRelease template",
			meaning: "A native-BCH covenant family with a fixed single-input, two-output release shape.",
			binding: "Redeem source checks input count, output count/order, recipient lock, payment cap, successor lock, and fee cap.",
			enforcement: "On-chain once funded and spent with the reviewed artifact",
			editable: "No arbitrary opcodes or edges. Change only supported constructor values."
		},
		cap: {
			title: "Maximum payment",
			meaning: "No one payment output may exceed this value.",
			binding: "outputs[0].value ≤ maxPaymentSatoshis",
			enforcement: "On-chain",
			editable: "Yes — creates a new contract instance and lock; the funded vault remains unchanged."
		},
		recipient: {
			title: "Fixed recipient lock",
			meaning: "The payment must use the reviewed locking bytecode, not merely a displayed address label.",
			binding: "outputs[0].lockingBytecode = recipientLockingBytecode",
			enforcement: "On-chain",
			editable: "Yes — creates a new contract instance and lock."
		},
		fee: {
			title: "Fee ceiling",
			meaning: "The amount not assigned to output 0 or output 1 cannot exceed the reviewed fee cap.",
			binding: "input[0].value − outputs[0].value − outputs[1].value ≤ maxFeeSatoshis",
			enforcement: "On-chain",
			editable: "Yes — creates a new contract instance and lock."
		},
		payment: {
			title: "Payment output 0",
			meaning: "The first output is the only permitted external payment in this template.",
			binding: `output 0 amount = proposal amount; lock = ${short(workspace.proposal.recipientLock)}`,
			enforcement: "On-chain recipient and cap checks",
			editable: "Amount is an intent field. Recipient must match the enrolled lock."
		},
		successor: {
			title: "Successor output 1",
			meaning: "The protected remainder becomes the next state only if it remains under the same covenant lock.",
			binding: `outputs[1].lockingBytecode = ${short(workspace.fundedInstance.lockingBytecodeHex)}`,
			enforcement: "On-chain",
			editable: "No — output index and successor lock are safety invariants."
		}
	};
	const detail = inspector ? details[inspector] : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: Boolean(detail),
		onOpenChange: (open) => !open && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-40 bg-bg/80 backdrop-blur-sm" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "fixed left-1/2 top-1/2 z-50 w-[min(92vw,620px)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-5 shadow-2xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "text-lg font-medium",
					children: detail?.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					className: "mt-1 text-sm text-muted",
					children: "Clicking this graph element exposes the control it represents; it does not make the graph an independent programming language."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "icon",
						variant: "ghost",
						"aria-label": "Close control inspector",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})
				})]
			}), detail ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid gap-3 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorRow, {
						title: "Business meaning",
						detail: detail.meaning
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorRow, {
						title: "Transaction field bound",
						detail: detail.binding,
						mono: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorRow, {
						title: "Where enforced",
						detail: detail.enforcement
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorRow, {
						title: "Can an operator change it?",
						detail: detail.editable
					})
				]
			}) : null]
		})] })
	});
}
function Metric({ title, value, detail, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: "rounded-xl border border-border bg-surface p-4 text-left transition hover:border-accent/50 hover:bg-surface-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xl font-medium tracking-tight",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-subtle",
				children: detail
			})
		]
	});
}
function FlowStep({ number, title, detail, action, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-surface-2 p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-xs text-accent",
				children: number
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm font-medium",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 min-h-10 text-xs leading-5 text-muted",
				children: detail
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "mt-3",
				size: "sm",
				variant: "secondary",
				onClick,
				children: [action, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3" })]
			})
		]
	});
}
function Boundary({ title, detail, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-border bg-surface-2 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
			tone,
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 leading-5 text-muted",
			children: detail
		})]
	});
}
function LifecycleItem({ title, value, detail }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border-l-2 border-accent/50 pl-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 font-medium",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-xs text-subtle",
				children: detail
			})
		]
	});
}
function AssetRow({ outpoint, amount, detail, evidence, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: cn("grid w-full grid-cols-[minmax(170px,1.2fr)_110px_minmax(130px,1fr)_110px] gap-3 border-b border-border px-4 py-3 text-left text-sm last:border-b-0", onClick && "hover:bg-surface-2"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-xs text-accent",
				children: outpoint
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: amount }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs text-muted",
				children: detail
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EvidenceBadge, { evidence }) })
		]
	});
}
function OutputRow({ index, title, detail, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex gap-3 rounded-md border border-border bg-surface-2 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
			tone,
			children: ["#", index]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-medium",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-xs text-muted",
			children: detail
		})] })]
	});
}
function LibraryButton({ title, detail, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: "rounded-md border border-border bg-surface-2 p-3 text-left hover:border-accent/50",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-medium",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 font-mono text-[11px] text-subtle",
			children: detail
		})]
	});
}
function GraphNode({ title, value, detail, tone, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: cn("w-40 rounded-xl border bg-surface-2 p-3 text-left hover:bg-surface-3", {
			accent: "border-accent/60",
			pass: "border-pass/60",
			warn: "border-warn/60",
			fail: "border-fail/60"
		}[tone]),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] uppercase tracking-wide text-muted",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm font-medium",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-mono text-[10px] text-subtle",
				children: detail
			})
		]
	});
}
function LineageNode({ label, value, detail, evidence, dashed, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: cn("w-48 rounded-xl border border-accent/60 bg-surface-2 p-3 text-left hover:bg-surface-3", dashed && "border-dashed opacity-80"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] uppercase tracking-wide text-muted",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-base font-medium",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-mono text-[10px] text-subtle",
				children: detail
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-2 inline-block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EvidenceBadge, { evidence })
			})
		]
	});
}
function Arrow({ label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-w-14 flex-col items-center gap-1 text-accent",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-6" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono text-[10px] text-subtle",
			children: label
		})]
	});
}
function LedgerRow({ label, detail, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-[80px_1fr_140px] gap-3 border-b border-border px-3 py-2 text-sm last:border-b-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-[11px] text-muted",
				children: detail
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: value })
		]
	});
}
function InspectorRow({ title, detail, mono }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-border bg-surface-2 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium text-muted",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: cn("mt-1 leading-6", mono && "font-mono text-xs break-all"),
			children: detail
		})]
	});
}
function parseSatoshisSafe(value) {
	try {
		return BigInt(value);
	} catch {
		return 0n;
	}
}
function MockWorkspacePage() {
	const sessionQuery = useQuery({
		queryKey: ["session"],
		queryFn: () => getCurrentSession()
	});
	if (!sessionQuery.data?.config) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "p-8 text-muted",
		children: "Loading mock workspace…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		config: sessionQuery.data.config,
		session: sessionQuery.data.session ?? null,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MockWorkspace, {})
	});
}
//#endregion
export { MockWorkspacePage as component };
