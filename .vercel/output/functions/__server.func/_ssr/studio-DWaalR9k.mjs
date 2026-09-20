import { s as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as DialogOverlay, i as DialogDescription, n as DialogClose, o as DialogPortal, r as DialogContent, s as DialogTitle, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { P as satoshisToBch, R as utf8Sha256Hex, T as formatBch, b as compileBoundedRelease, g as boundedReleaseRedeemSource, i as IDENTITIES, k as parseSatoshis, m as bchToSatoshis, r as EMPTY_TOKEN } from "./artifacts-lsD7QsAY.mjs";
import { o as demoPlan } from "./fixtures-CzelxbGa.mjs";
import { a as executableElementDetail, d as validateCanvas, i as evaluatePolicy, n as buildUnsignedVaultRelease, o as executableStudioRules, r as compileExecutableStudio } from "./tx-builder-D7rh_VTV.mjs";
import { D as FileCode2, I as Braces, M as CircleX, N as CircleCheck, g as PencilLine, j as Compass, t as X, u as RotateCcw, v as LockKeyhole } from "../_libs/lucide-react.mjs";
import { A as publishPlan, C as loadOrganization, L as savePlanDraft, T as loadPlans, _ as getCurrentSession, i as Card, m as createProposal, n as Badge, o as CardTitle, p as cn, r as Button, t as AppShell } from "./api-Ch8UWRqP.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as Label, t as Input } from "./input-D-klI4jJ.mjs";
import { t as LiveSetupCallout } from "./live-setup-callout-CZNqgy2x.mjs";
import { a as addEdge, c as useNodesState, i as MiniMap, l as Position, n as Controls, o as index, r as Handle, s as useEdgesState, t as Background } from "../_libs/@xyflow/react+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/studio-DWaalR9k.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KIND_TONE = {
	source: "border-accent/50",
	vault: "border-pass/50",
	asset: "border-border-strong",
	route: "border-accent/40",
	constraint: "border-warn/40",
	governance: "border-fg/20",
	recovery: "border-fail/40",
	evidence: "border-muted/40"
};
function FlowNode({ data }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("min-w-40 rounded-lg border bg-surface-2 px-3 py-2 shadow-sm", KIND_TONE[data.kind], data.selected && "ring-1 ring-accent", data.runStatus === "active" && "border-accent bg-accent/10 ring-1 ring-accent animate-pulse", data.runStatus === "passed" && "border-pass bg-pass/10", data.runStatus === "blocked" && "border-fail bg-fail/10"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Handle, {
				type: "target",
				position: Position.Left,
				id: "target",
				className: "!size-2 !border-border !bg-accent"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[10px] uppercase tracking-wide text-subtle",
				children: data.kind
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium",
				children: data.label
			}),
			data.detail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-48 truncate text-[11px] text-muted",
				children: data.detail
			}) : null,
			data.runStatus ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("mt-1 font-mono text-[10px] uppercase tracking-wide", data.runStatus === "blocked" ? "text-fail" : data.runStatus === "passed" ? "text-pass" : "text-accent"),
				children: data.runStatus
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Handle, {
				type: "source",
				position: Position.Right,
				id: "source",
				className: "!size-2 !border-border !bg-accent"
			})
		]
	});
}
var nodeTypes = { optn: FlowNode };
function edgeStroke(kind) {
	if (kind === "successor") return "#3ecf8e";
	if (kind === "recovery") return "#e15d5d";
	if (kind === "approval") return "#e0b044";
	return "#4aa3e8";
}
function runStatus(id, run) {
	if (!run) return void 0;
	if (run.blockedNodeIds?.includes(id) || run.blockedEdgeIds?.includes(id)) return "blocked";
	if (run.activeNodeIds.includes(id) || run.activeEdgeIds.includes(id)) return "active";
	if (run.completedNodeIds.includes(id) || run.completedEdgeIds.includes(id)) return "passed";
}
function toFlow(plan, run) {
	return {
		nodes: plan.canvas.nodes.map((node) => ({
			id: node.id,
			type: "optn",
			position: {
				x: node.x,
				y: node.y
			},
			data: {
				label: node.label,
				kind: node.kind,
				detail: Object.values(node.data)[0],
				runStatus: runStatus(node.id, run)
			}
		})),
		edges: plan.canvas.edges.map((edge) => {
			const status = runStatus(edge.id, run);
			return {
				id: edge.id,
				source: edge.source,
				target: edge.target,
				sourceHandle: "source",
				targetHandle: "target",
				label: edge.label,
				data: { kind: edge.kind },
				animated: status === "active",
				style: {
					stroke: status === "passed" ? "#3ecf8e" : status === "blocked" ? "#e15d5d" : edgeStroke(edge.kind),
					strokeWidth: status ? 2.5 : 1
				}
			};
		})
	};
}
function fromFlow(nodes, edges, plan) {
	return {
		nodes: nodes.map((node) => {
			const original = plan.canvas.nodes.find((item) => item.id === node.id);
			return {
				id: node.id,
				kind: node.data.kind ?? original?.kind ?? "constraint",
				label: String(node.data.label ?? original?.label ?? node.id),
				x: node.position.x,
				y: node.position.y,
				data: original?.data ?? {}
			};
		}),
		edges: edges.map((edge) => {
			const original = plan.canvas.edges.find((item) => item.id === edge.id);
			const kind = edge.data?.kind ?? original?.kind ?? "bch";
			return {
				id: edge.id,
				source: edge.source,
				target: edge.target,
				kind,
				label: String(edge.label ?? original?.label ?? "")
			};
		})
	};
}
var PALETTE = [
	{
		kind: "source",
		label: "Existing vault UTXO"
	},
	{
		kind: "vault",
		label: "Reviewed vault"
	},
	{
		kind: "asset",
		label: "Native BCH"
	},
	{
		kind: "route",
		label: "Fixed recipient"
	},
	{
		kind: "constraint",
		label: "Per-payment cap"
	},
	{
		kind: "governance",
		label: "Approval quorum"
	},
	{
		kind: "recovery",
		label: "Recovery route"
	},
	{
		kind: "evidence",
		label: "Artifact hash"
	}
];
function PolicyCanvas({ plan, onChange, editableTopology = true, onSelect, reference = false, run }) {
	const seed = (0, import_react.useMemo)(() => toFlow(plan, run), [plan, run]);
	const [nodes, setNodes, onNodesChange] = useNodesState(seed.nodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(seed.edges);
	(0, import_react.useEffect)(() => {
		const next = toFlow(plan, run);
		setNodes(next.nodes);
		setEdges(next.edges);
	}, [
		plan,
		run,
		setEdges,
		setNodes
	]);
	const persist = (0, import_react.useCallback)((nextNodes, nextEdges) => {
		onChange?.(fromFlow(nextNodes, nextEdges, plan));
	}, [onChange, plan]);
	const onConnect = (0, import_react.useCallback)((connection) => {
		setEdges((current) => {
			const next = addEdge({
				...connection,
				sourceHandle: connection.sourceHandle ?? "source",
				targetHandle: connection.targetHandle ?? "target",
				label: "bch",
				data: { kind: "bch" },
				style: { stroke: edgeStroke("bch") }
			}, current);
			persist(nodes, next);
			return next;
		});
	}, [
		nodes,
		persist,
		setEdges
	]);
	function addNode(kind, label) {
		const id = `${kind}-${nodes.length + 1}`;
		const next = [...nodes, {
			id,
			type: "optn",
			position: {
				x: 80 + nodes.length * 24,
				y: 80 + nodes.length * 18
			},
			data: {
				label,
				kind
			}
		}];
		setNodes(next);
		persist(next, edges);
	}
	function selectNode(id) {
		setNodes((current) => current.map((node) => ({
			...node,
			data: {
				...node.data,
				selected: node.id === id
			}
		})));
		onSelect?.({
			kind: "node",
			id
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-3 lg:grid-cols-[220px_1fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl border border-border bg-surface p-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-xs font-medium uppercase tracking-wide text-muted",
					children: editableTopology ? "Reviewed palette" : reference ? "Reference mapping" : "Executable mapping"
				}),
				editableTopology ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-1.5",
					children: PALETTE.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => addNode(item.kind, item.label),
						className: "rounded-md border border-border bg-surface-2 px-3 py-2 text-left text-xs hover:border-accent/40",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block font-mono text-[10px] uppercase text-subtle",
							children: item.kind
						}), item.label]
					}, item.label))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-md border border-pass/30 bg-surface-2 p-3 text-xs leading-relaxed text-muted",
					children: reference ? "This graph is a contract-family specification only. It has no dashboard artifact, state builder, signer, or broadcast path." : "This graph is compiled from the attached vault's redeem bytecode and plan record. Drag nodes to arrange the view; topology, locks, output order, and compiled limits are not editable here."
				}),
				run ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("mt-3 rounded-md border p-3 text-xs leading-relaxed", run.phase === "blocked" ? "border-fail/40 bg-fail/5 text-fail" : run.phase === "passed" ? "border-pass/40 bg-pass/5 text-pass" : "border-accent/40 bg-accent/5 text-accent"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: run.phase === "running" ? "Local build in progress" : run.phase === "passed" ? "Local build passed" : "Local build blocked"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1",
						children: run.label
					})]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-[11px] leading-relaxed text-subtle",
					children: editableTopology ? "Only reviewed route templates can be placed. Operators configure limits; they cannot drop opcodes or CashScript onto the canvas." : reference ? "Click a node or edge to see its state-transition role and implementation gate. Reference controls cannot be edited or funded in this dashboard yet." : "Click a node or edge to inspect its transaction binding. Only reviewed, exposed controls can be edited; recipient, output order, and successor lock changes require a new covenant vault."
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "optn-grid h-[520px] overflow-hidden rounded-xl border border-border bg-bg",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(index, {
				nodes,
				edges,
				nodeTypes,
				onNodesChange,
				onEdgesChange: editableTopology ? onEdgesChange : void 0,
				onConnect: editableTopology ? onConnect : void 0,
				onNodeDragStop: () => persist(nodes, edges),
				onNodeClick: (_, node) => selectNode(node.id),
				onEdgeClick: (_, edge) => onSelect?.({
					kind: "edge",
					id: edge.id
				}),
				nodesConnectable: editableTopology,
				deleteKeyCode: editableTopology ? "Backspace" : null,
				fitView: true,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Background, {
						color: "#243041",
						gap: 24
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Controls, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniMap, {
						pannable: true,
						zoomable: true,
						maskColor: "rgb(8 11 16 / 0.7)",
						nodeColor: "#1c2531",
						className: "!bg-surface !border-border"
					})
				]
			})
		})]
	});
}
var DEFAULT_MOCKNET_CONTRACT_INPUT = {
	paymentCapBch: "0.05",
	feeCapSatoshis: "2000",
	approvalThreshold: 2,
	paymentBch: "0.02",
	feeSatoshis: "1000"
};
var MOCK_VAULT_VALUE_SATOSHIS = "100000000";
function draftPlan(args) {
	const plan = demoPlan();
	const route = plan.routes[0];
	return {
		...plan,
		artifactHash: args.artifactHash,
		routes: [{
			...route,
			maxAmountSatoshis: args.paymentCapSatoshis
		}],
		governance: {
			...plan.governance,
			threshold: args.approvalThreshold
		},
		recovery: {
			...plan.recovery,
			enabled: false
		},
		limits: {
			...plan.limits,
			perPaymentSatoshis: args.paymentCapSatoshis,
			maxFeeSatoshis: args.feeCapSatoshis
		}
	};
}
function mockVault(lockingBytecodeHex) {
	return {
		network: "chipnet",
		outpoint: {
			txid: utf8Sha256Hex("optn-mocknet-contract-composer-v1"),
			vout: 0
		},
		valueSatoshis: MOCK_VAULT_VALUE_SATOSHIS,
		lockingBytecodeHex,
		address: null,
		token: EMPTY_TOKEN,
		spent: false,
		spentEvidence: "fixture",
		tokenEvidence: "fixture",
		confirmations: 0,
		chainEvidence: "fixture",
		lockingType: "p2sh32"
	};
}
function executableCanvas(args) {
	return {
		nodes: [
			{
				id: "operator-signature",
				kind: "governance",
				label: "Owner signature",
				x: 30,
				y: 50,
				data: { operatorPkh: IDENTITIES.alice.pkhHex }
			},
			{
				id: "vault-input",
				kind: "source",
				label: "Mock covenant UTXO — input 0",
				x: 30,
				y: 230,
				data: {
					outpoint: `${args.utxo.outpoint.txid}:${args.utxo.outpoint.vout}`,
					value: args.utxo.valueSatoshis
				}
			},
			{
				id: "bounded-release",
				kind: "vault",
				label: "BoundedRelease P2SH32",
				x: 330,
				y: 180,
				data: { lockingBytecode: args.lockingBytecodeHex }
			},
			{
				id: "payment-output-0",
				kind: "route",
				label: "Payout — output 0",
				x: 620,
				y: 75,
				data: {
					recipientLock: IDENTITIES.vendor.lockingBytecodeHex,
					cap: args.paymentCapSatoshis
				}
			},
			{
				id: "successor-output-1",
				kind: "route",
				label: "Controlled remainder — output 1",
				x: 620,
				y: 280,
				data: { successorLock: args.lockingBytecodeHex }
			},
			{
				id: "compiled-limits",
				kind: "constraint",
				label: `Cap ${args.paymentCapSatoshis} sats · fee ${args.feeCapSatoshis} sats`,
				x: 900,
				y: 75,
				data: {
					paymentCap: args.paymentCapSatoshis,
					feeCap: args.feeCapSatoshis
				}
			},
			{
				id: "approval-workflow",
				kind: "governance",
				label: `Workflow quorum ${args.approvalThreshold} of 3`,
				x: 900,
				y: 280,
				data: {
					threshold: String(args.approvalThreshold),
					enforcement: "off-chain-policy"
				}
			},
			{
				id: "artifact",
				kind: "evidence",
				label: "Generated artifact",
				x: 900,
				y: 420,
				data: { artifactHash: args.artifactHash }
			}
		],
		edges: [
			{
				id: "authorize",
				source: "operator-signature",
				target: "bounded-release",
				kind: "approval",
				label: "CHECKSIG"
			},
			{
				id: "input-0",
				source: "vault-input",
				target: "bounded-release",
				kind: "bch",
				label: "input 0"
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
				label: "compiled caps"
			},
			{
				id: "approval",
				source: "successor-output-1",
				target: "approval-workflow",
				kind: "approval",
				label: "approval gate"
			},
			{
				id: "artifact",
				source: "approval-workflow",
				target: "artifact",
				kind: "approval",
				label: "review evidence"
			}
		]
	};
}
function buildMocknetContract(input) {
	const paymentCapSatoshis = bchToSatoshis(input.paymentCapBch).toString();
	const feeCapSatoshis = parseSatoshis(input.feeCapSatoshis).toString();
	const paymentSatoshis = bchToSatoshis(input.paymentBch).toString();
	const feeSatoshis = parseSatoshis(input.feeSatoshis).toString();
	if (!Number.isInteger(input.approvalThreshold) || input.approvalThreshold < 1 || input.approvalThreshold > 3) throw new Error("Approval threshold must be between 1 and 3 for the mock organization");
	if (parseSatoshis(paymentCapSatoshis) <= 0n || parseSatoshis(feeCapSatoshis) <= 0n) throw new Error("Payment and fee caps must be positive");
	const parameters = {
		operatorPkhHex: IDENTITIES.alice.pkhHex,
		recipientLockingBytecodeHex: IDENTITIES.vendor.lockingBytecodeHex,
		maxPaymentSatoshis: paymentCapSatoshis,
		maxFeeSatoshis: feeCapSatoshis
	};
	const artifact = compileBoundedRelease(parameters);
	const draftPlanRecord = draftPlan({
		artifactHash: utf8Sha256Hex(artifact.redeemHex),
		paymentCapSatoshis,
		feeCapSatoshis,
		approvalThreshold: input.approvalThreshold
	});
	const utxo = mockVault(artifact.lockingBytecodeHex);
	const transition = buildUnsignedVaultRelease({
		utxo,
		paymentLockingBytecodeHex: IDENTITIES.vendor.lockingBytecodeHex,
		successorLockingBytecodeHex: artifact.lockingBytecodeHex,
		amountSatoshis: paymentSatoshis,
		feeSatoshis
	});
	const evaluation = evaluatePolicy({
		plan: draftPlanRecord,
		vaultLockingBytecodeHex: artifact.lockingBytecodeHex,
		utxo,
		routeId: 0,
		amountSatoshis: paymentSatoshis,
		feeSatoshis,
		destinationLockingBytecodeHex: IDENTITIES.vendor.lockingBytecodeHex,
		successorLockingBytecodeHex: artifact.lockingBytecodeHex,
		approvals: [
			{ account: IDENTITIES.bob.account },
			{ account: IDENTITIES.alice.account },
			{ account: IDENTITIES.carol.account }
		].slice(0, input.approvalThreshold),
		proposerAccount: IDENTITIES.alice.account
	});
	const canvas = executableCanvas({
		utxo,
		lockingBytecodeHex: artifact.lockingBytecodeHex,
		artifactHash: utf8Sha256Hex(artifact.redeemHex),
		paymentCapSatoshis,
		feeCapSatoshis,
		approvalThreshold: input.approvalThreshold
	});
	return {
		input,
		parameters,
		artifact,
		plan: {
			...draftPlanRecord,
			canvas
		},
		utxo,
		transition,
		evaluation,
		sourceAssembly: boundedReleaseRedeemSource(parameters)
	};
}
/**
* Return the contract/transaction explanation for a graph node or edge. The
* text deliberately comes from the same compiled execution object rendered in
* the workbench, rather than from a second decorative graph model.
*/
function mocknetElementDetail(id, execution) {
	const payment = execution.transition.outputs[0];
	const successor = execution.transition.outputs[1];
	const capRules = [`<${execution.parameters.maxPaymentSatoshis}> OP_LESSTHANOREQUAL`, `<${execution.parameters.maxFeeSatoshis}> OP_LESSTHANOREQUAL`].join("\n");
	const paymentLockRule = `<0> OP_OUTPUTBYTECODE <0x${execution.parameters.recipientLockingBytecodeHex}> OP_EQUALVERIFY`;
	const successorLockRule = `<0> OP_UTXOBYTECODE <1> OP_OUTPUTBYTECODE OP_EQUALVERIFY`;
	switch (id) {
		case "operator-signature":
		case "authorize": return {
			title: "Owner authorization",
			enforcement: "on-chain",
			transactionBinding: "The unlocking script supplies the owner public key and a signature for input 0.",
			description: "The redeem script hashes that public key and compares it with the enrolled owner hash before OP_CHECKSIG verifies the transaction signature.",
			editable: "none",
			immutableReason: "The owner identity is a covenant constructor value. Changing it creates a different P2SH32 lock and requires a newly funded vault.",
			cashAssembly: `<0> OP_UTXOVALUE OP_DROP\nOP_DUP OP_HASH160 <0x${execution.parameters.operatorPkhHex}> OP_EQUALVERIFY\nOP_CHECKSIG`
		};
		case "vault-input":
		case "input-0": return {
			title: "Covenant UTXO at transaction input 0",
			enforcement: "on-chain",
			transactionBinding: `${execution.utxo.outpoint.txid}:${execution.utxo.outpoint.vout} is the single mock input; value ${execution.utxo.valueSatoshis} sats; token state is native BCH only.`,
			description: "BoundedRelease accepts exactly one input and requires the covenant UTXO to be input index 0. This prevents an unreviewed input set from changing the intended transition shape.",
			editable: "none",
			immutableReason: "A spend consumes a specific funded UTXO. Select or fund a different vault only through the dedicated vault lifecycle, never by editing a transaction diagram.",
			cashAssembly: `OP_TXINPUTCOUNT <1> OP_NUMEQUALVERIFY\nOP_INPUTINDEX <0> OP_NUMEQUALVERIFY\nOP_UTXOTOKENCATEGORY OP_SIZE <0> OP_NUMEQUALVERIFY`
		};
		case "bounded-release": return {
			title: "BoundedRelease P2SH32 covenant",
			enforcement: "on-chain",
			transactionBinding: `The active input is locked by P2SH32 bytecode ${execution.artifact.lockingBytecodeHex}.`,
			description: "This reviewed template is the executable contract. It binds owner authorization, one native-BCH input, output count and ordering, the payment destination, caps, and a same-lock successor.",
			editable: "none",
			immutableReason: "Template shape and its opcode sequence are reviewed code. Operators configure exposed constructor values; they do not modify CashAssembly directly in this MVP.",
			cashAssembly: execution.sourceAssembly
		};
		case "payment-output-0":
		case "output-0": return {
			title: "Payment at transaction output 0",
			enforcement: "on-chain",
			transactionBinding: `Output 0 pays ${payment.valueSatoshis} sats to the enrolled recipient lock. It must remain output index 0.`,
			description: "Change the proposed payment to construct a different unsigned transaction. The output lock remains fixed by the covenant; the amount must be positive and no greater than the compiled per-payment cap.",
			editable: "payment",
			cashAssembly: `${paymentLockRule}\n<0> OP_OUTPUTVALUE OP_DUP OP_0NOTEQUALVERIFY\n<${execution.parameters.maxPaymentSatoshis}> OP_LESSTHANOREQUALVERIFY`
		};
		case "compiled-limits":
		case "caps": return {
			title: "Compiled payment and fee caps",
			enforcement: "on-chain",
			transactionBinding: `Payment ≤ ${execution.parameters.maxPaymentSatoshis} sats and fee ≤ ${execution.parameters.maxFeeSatoshis} sats are embedded in this covenant instance.`,
			description: "These controls are constructor values. Editing either recompiles the redeem script, changes the P2SH32 locking bytecode, and produces a different vault that must be separately funded before any real spend.",
			editable: "limits",
			cashAssembly: capRules
		};
		case "successor-output-1":
		case "output-1": return {
			title: "Controlled successor at transaction output 1",
			enforcement: "on-chain",
			transactionBinding: `Output 1 retains ${successor.valueSatoshis} sats and exactly reuses the active covenant's P2SH32 lock.`,
			description: "The remaining BCH stays constrained for the next state transition. The covenant fixes both output count and output order, so there is no unbounded change output or alternate recipient path.",
			editable: "none",
			immutableReason: "The successor locking bytecode and output position are safety invariants, not dashboard preferences. Changing either would bypass this covenant's preservation rule.",
			cashAssembly: `OP_TXOUTPUTCOUNT <2> OP_NUMEQUALVERIFY\n${successorLockRule}`
		};
		case "approval-workflow":
		case "approval": return {
			title: "Off-chain approval workflow",
			enforcement: "off-chain policy",
			transactionBinding: `${execution.input.approvalThreshold} of 3 recorded approvers must approve the same intent before an operator may request a wallet signature.`,
			description: "This workflow is advisory to the covenant: it protects the dashboard's authorization process, but it is not an opcode in BoundedRelease and cannot override the on-chain recipient, caps, or successor rules.",
			editable: "approval",
			cashAssembly: "No CashAssembly: this is an off-chain workflow gate evaluated before signing."
		};
		case "artifact": return {
			title: "Generated contract artifact",
			enforcement: "evidence",
			transactionBinding: `Artifact hash ${execution.plan.artifactHash} identifies the reviewed redeem source and its P2SH32 lock.`,
			description: "Use this evidence to compare the reviewed contract source, constructor values, and funded vault locking bytecode before attaching a real UTXO.",
			editable: "none",
			immutableReason: "Evidence is derived from the compiled contract. Edit a permitted control instead; the artifact will be regenerated deterministically.",
			cashAssembly: execution.sourceAssembly
		};
		default: return {
			title: "Reviewed graph element",
			enforcement: "evidence",
			transactionBinding: "This element is part of the compiler-generated BoundedRelease transition.",
			description: "The graph is derived from the contract and transaction builder, so unknown elements are read-only until a reviewed template explicitly exposes them.",
			editable: "none"
		};
	}
}
function graph(nodes, edges) {
	return {
		nodes,
		edges
	};
}
var FLOWGUARD_REFERENCE_TEMPLATES = [
	{
		id: "multisig-treasury",
		title: "Multi-member treasury",
		short: "M-of-N spend with period caps and pause controls",
		description: "A stateful treasury UTXO carries CashToken NFT commitment fields for status and period spending. A spend pays an allowlisted recipient and recreates the same covenant with updated state.",
		controls: [
			"three signer identities",
			"M-of-N threshold",
			"period duration and cap",
			"recipient allowlist",
			"pause / resume / emergency lock"
		],
		requiredImplementation: [
			"CashToken NFT commitment encoder",
			"three-signature CashScript artifact",
			"state-transition transaction builder",
			"CashToken-aware VM vectors"
		],
		canvas: graph([
			{
				id: "treasury-state",
				kind: "source",
				label: "Treasury UTXO + state NFT",
				x: 30,
				y: 190,
				data: { state: "active · period spend" }
			},
			{
				id: "treasury-signers",
				kind: "governance",
				label: "2 of 3 signer quorum",
				x: 30,
				y: 40,
				data: { mode: "M-of-N" }
			},
			{
				id: "treasury-covenant",
				kind: "vault",
				label: "Stateful treasury covenant",
				x: 330,
				y: 180,
				data: { state: "CashToken NFT commitment" }
			},
			{
				id: "treasury-payout",
				kind: "route",
				label: "Allowlisted payment — output 0",
				x: 620,
				y: 75,
				data: { check: "recipient + period cap" }
			},
			{
				id: "treasury-successor",
				kind: "route",
				label: "Updated vault state — output 1",
				x: 620,
				y: 280,
				data: { check: "same lock + updated NFT" }
			},
			{
				id: "treasury-controls",
				kind: "constraint",
				label: "Period cap / recipient cap",
				x: 900,
				y: 75,
				data: { enforcement: "on-chain" }
			},
			{
				id: "treasury-pause",
				kind: "recovery",
				label: "Pause or emergency lock",
				x: 900,
				y: 280,
				data: { enforcement: "on-chain state transition" }
			}
		], [
			{
				id: "treasury-auth",
				source: "treasury-signers",
				target: "treasury-covenant",
				kind: "approval",
				label: "distinct signatures"
			},
			{
				id: "treasury-input",
				source: "treasury-state",
				target: "treasury-covenant",
				kind: "bch",
				label: "state input"
			},
			{
				id: "treasury-payment",
				source: "treasury-covenant",
				target: "treasury-payout",
				kind: "bch",
				label: "output 0"
			},
			{
				id: "treasury-successor-edge",
				source: "treasury-covenant",
				target: "treasury-successor",
				kind: "successor",
				label: "output 1"
			},
			{
				id: "treasury-cap",
				source: "treasury-payout",
				target: "treasury-controls",
				kind: "bch",
				label: "cap checks"
			},
			{
				id: "treasury-pause-edge",
				source: "treasury-successor",
				target: "treasury-pause",
				kind: "recovery",
				label: "state path"
			}
		])
	},
	{
		id: "recurring-payment",
		title: "Recurring payment",
		short: "Fixed cadence payroll, retainer, or subscription",
		description: "A schedule state UTXO tracks the next payable timestamp, payment count, and total paid. When the time gate is reached, a payment goes to the fixed recipient and a successor recreates the schedule state.",
		controls: [
			"recipient",
			"amount per interval",
			"cadence",
			"start and end time",
			"total runway",
			"cancel / pause / refill flags"
		],
		requiredImplementation: [
			"locktime-aware CashScript artifact",
			"schedule NFT commitment encoder",
			"recurring successor builder",
			"time-bound CashVM vectors"
		],
		canvas: graph([
			{
				id: "recurring-state",
				kind: "source",
				label: "Schedule UTXO + state NFT",
				x: 30,
				y: 190,
				data: { state: "next payment time" }
			},
			{
				id: "recurring-time",
				kind: "constraint",
				label: "Cadence / locktime gate",
				x: 30,
				y: 40,
				data: { check: "tx.locktime >= next payment" }
			},
			{
				id: "recurring-covenant",
				kind: "vault",
				label: "Recurring payment covenant",
				x: 330,
				y: 180,
				data: { state: "payment count + total paid" }
			},
			{
				id: "recurring-payout",
				kind: "route",
				label: "Fixed payment — output 0",
				x: 620,
				y: 75,
				data: { check: "fixed recipient + amount" }
			},
			{
				id: "recurring-successor",
				kind: "route",
				label: "Advanced schedule — output 1",
				x: 620,
				y: 280,
				data: { check: "next time + interval" }
			},
			{
				id: "recurring-runway",
				kind: "constraint",
				label: "Total runway / end date",
				x: 900,
				y: 75,
				data: { check: "completion state" }
			},
			{
				id: "recurring-admin",
				kind: "recovery",
				label: "Pause / resume / cancel / refill",
				x: 900,
				y: 280,
				data: { check: "sender authority" }
			}
		], [
			{
				id: "recurring-time-edge",
				source: "recurring-time",
				target: "recurring-covenant",
				kind: "approval",
				label: "time eligible"
			},
			{
				id: "recurring-input",
				source: "recurring-state",
				target: "recurring-covenant",
				kind: "bch",
				label: "state input"
			},
			{
				id: "recurring-payment",
				source: "recurring-covenant",
				target: "recurring-payout",
				kind: "bch",
				label: "output 0"
			},
			{
				id: "recurring-successor-edge",
				source: "recurring-covenant",
				target: "recurring-successor",
				kind: "successor",
				label: "output 1"
			},
			{
				id: "recurring-runway-edge",
				source: "recurring-payout",
				target: "recurring-runway",
				kind: "bch",
				label: "schedule checks"
			},
			{
				id: "recurring-admin-edge",
				source: "recurring-successor",
				target: "recurring-admin",
				kind: "recovery",
				label: "admin paths"
			}
		])
	},
	{
		id: "linear-vesting",
		title: "Linear vesting with optional cliff",
		short: "Time-proportional releases to a beneficiary",
		description: "A beneficiary claims only the amount vested at the transaction locktime. The successor preserves remaining BCH or tokens and state tracks already released value, pause time, and recipient.",
		controls: [
			"beneficiary",
			"total allocation",
			"start / end time",
			"cliff",
			"cancelable / transferable",
			"BCH or CashToken asset"
		],
		requiredImplementation: [
			"vesting math artifact",
			"BCH and CashToken transition builders",
			"state NFT encoder",
			"claim, pause, resume, and cancellation VM vectors"
		],
		canvas: graph([
			{
				id: "vesting-state",
				kind: "source",
				label: "Vesting UTXO + release state",
				x: 30,
				y: 190,
				data: { state: "released + effective time" }
			},
			{
				id: "vesting-clock",
				kind: "constraint",
				label: "Start / cliff / end clock",
				x: 30,
				y: 40,
				data: { check: "claimable at locktime" }
			},
			{
				id: "vesting-covenant",
				kind: "vault",
				label: "Linear vesting covenant",
				x: 330,
				y: 180,
				data: { state: "vested - released" }
			},
			{
				id: "vesting-claim",
				kind: "route",
				label: "Beneficiary claim — output 0",
				x: 620,
				y: 75,
				data: { check: "claimable amount" }
			},
			{
				id: "vesting-successor",
				kind: "route",
				label: "Remaining vesting state — output 1",
				x: 620,
				y: 280,
				data: { check: "updated released amount" }
			},
			{
				id: "vesting-schedule",
				kind: "constraint",
				label: "Linear vesting calculation",
				x: 900,
				y: 75,
				data: { check: "time proportion" }
			},
			{
				id: "vesting-admin",
				kind: "recovery",
				label: "Pause / resume / cancel",
				x: 900,
				y: 280,
				data: { check: "sender authorization" }
			}
		], [
			{
				id: "vesting-time-edge",
				source: "vesting-clock",
				target: "vesting-covenant",
				kind: "approval",
				label: "time gate"
			},
			{
				id: "vesting-input",
				source: "vesting-state",
				target: "vesting-covenant",
				kind: "bch",
				label: "state input"
			},
			{
				id: "vesting-claim-edge",
				source: "vesting-covenant",
				target: "vesting-claim",
				kind: "bch",
				label: "output 0"
			},
			{
				id: "vesting-successor-edge",
				source: "vesting-covenant",
				target: "vesting-successor",
				kind: "successor",
				label: "output 1"
			},
			{
				id: "vesting-schedule-edge",
				source: "vesting-claim",
				target: "vesting-schedule",
				kind: "bch",
				label: "claimable check"
			},
			{
				id: "vesting-admin-edge",
				source: "vesting-successor",
				target: "vesting-admin",
				kind: "recovery",
				label: "admin paths"
			}
		])
	},
	{
		id: "tranche-vesting",
		title: "Custom tranche release",
		short: "Up to eight scheduled milestone unlocks",
		description: "A bounded schedule stores immutable cumulative unlock checkpoints. At each eligible timestamp, the beneficiary can claim the newly unlocked difference while the successor retains the updated state.",
		controls: [
			"beneficiary",
			"total allocation",
			"two to eight checkpoint dates",
			"cumulative unlock amounts",
			"pause / cancel policy",
			"BCH or CashToken asset"
		],
		requiredImplementation: [
			"bounded tranche compiler",
			"checkpoint monotonicity validation",
			"CashToken-aware state builder",
			"all checkpoint and cancellation VM vectors"
		],
		canvas: graph([
			{
				id: "tranche-state",
				kind: "source",
				label: "Tranche UTXO + release state",
				x: 30,
				y: 190,
				data: { state: "released amount" }
			},
			{
				id: "tranche-clock",
				kind: "constraint",
				label: "Checkpoint schedule",
				x: 30,
				y: 40,
				data: { check: "current tranche eligible" }
			},
			{
				id: "tranche-covenant",
				kind: "vault",
				label: "Tranche vesting covenant",
				x: 330,
				y: 180,
				data: { state: "bounded schedule" }
			},
			{
				id: "tranche-claim",
				kind: "route",
				label: "Milestone claim — output 0",
				x: 620,
				y: 75,
				data: { check: "new cumulative unlock" }
			},
			{
				id: "tranche-successor",
				kind: "route",
				label: "Remaining schedule — output 1",
				x: 620,
				y: 280,
				data: { check: "same lock + updated state" }
			},
			{
				id: "tranche-controls",
				kind: "constraint",
				label: "Up to eight immutable tranches",
				x: 900,
				y: 75,
				data: { check: "monotonic schedule" }
			},
			{
				id: "tranche-admin",
				kind: "recovery",
				label: "Pause / resume / cancel",
				x: 900,
				y: 280,
				data: { check: "sender authorization" }
			}
		], [
			{
				id: "tranche-time-edge",
				source: "tranche-clock",
				target: "tranche-covenant",
				kind: "approval",
				label: "checkpoint gate"
			},
			{
				id: "tranche-input",
				source: "tranche-state",
				target: "tranche-covenant",
				kind: "bch",
				label: "state input"
			},
			{
				id: "tranche-claim-edge",
				source: "tranche-covenant",
				target: "tranche-claim",
				kind: "bch",
				label: "output 0"
			},
			{
				id: "tranche-successor-edge",
				source: "tranche-covenant",
				target: "tranche-successor",
				kind: "successor",
				label: "output 1"
			},
			{
				id: "tranche-controls-edge",
				source: "tranche-claim",
				target: "tranche-controls",
				kind: "bch",
				label: "tranche checks"
			},
			{
				id: "tranche-admin-edge",
				source: "tranche-successor",
				target: "tranche-admin",
				kind: "recovery",
				label: "admin paths"
			}
		])
	}
];
function referenceTemplatePlan(template) {
	return {
		...demoPlan(),
		name: `${template.title} — reference preview`,
		description: template.description,
		reviewedShapeId: `reference-preview:${template.id}`,
		canvas: template.canvas
	};
}
function referenceElementDetail(args) {
	const node = args.plan.canvas.nodes.find((item) => item.id === args.id);
	const edge = args.plan.canvas.edges.find((item) => item.id === args.id);
	return {
		title: node?.label ?? edge?.label ?? args.id,
		enforcement: "evidence",
		transactionBinding: node ? `Reference ${node.kind} element. It describes a future state-transition component, not a compiled dashboard artifact.` : `Reference transition from ${edge?.source ?? "unknown"} to ${edge?.target ?? "unknown"}. It is not an actual BCH transaction edge.`,
		description: `${args.template.description} This element can be used to discuss the required contract shape, but has no editable constructor, CashAssembly, UTXO builder, signing path, or funding action in this MVP.`,
		editable: "none",
		immutableReason: "This FlowGuard-guided template is a reference preview. It must be independently specified, compiled, adversarially tested, and approved before it can expose operator controls."
	};
}
function GraphElementInspector({ detail, draft, onClose, onUpdate }) {
	const editable = detail.editable !== "none";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: true,
		onOpenChange: (open) => !open && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-40 bg-bg/80" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
			className: "fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "max-h-[calc(100vh-1.5rem)] w-full max-w-3xl overflow-y-auto shadow-2xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-xs uppercase tracking-[0.18em] text-demo",
								children: "Graph element inspector"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "mt-1 text-base",
									children: detail.title
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
								className: "sr-only",
								children: "Inspect the selected contract graph element and its permitted controls."
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								"aria-label": "Close graph element inspector",
								size: "icon",
								variant: "ghost",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: detail.enforcement === "on-chain" ? "pass" : "accent",
							children: detail.enforcement
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: editable ? "demo" : "neutral",
							children: editable ? "operator editable" : "read-only invariant"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-3 md:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-border bg-surface-2 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium uppercase tracking-wide text-muted",
								children: "Transaction binding"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm leading-6 text-fg",
								children: detail.transactionBinding
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-border bg-surface-2 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium uppercase tracking-wide text-muted",
								children: "What this enforces"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm leading-6 text-fg",
								children: detail.description
							})]
						})]
					}),
					editable ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 rounded-lg border border-demo/40 bg-demo/5 p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PencilLine, { className: "size-4 text-demo" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium",
									children: "Permitted operator controls"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs leading-5 text-muted",
								children: "Changes update the compiler-derived graph and local build together. They do not sign, fund, attach, or broadcast anything."
							}),
							detail.editable === "limits" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 grid gap-3 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "inspector-payment-cap",
									children: "Payment cap (BCH)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "inspector-payment-cap",
									value: draft.paymentCapBch,
									onChange: (event) => onUpdate("paymentCapBch", event.target.value)
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "inspector-fee-cap",
									children: "Fee cap (sats)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "inspector-fee-cap",
									value: draft.feeCapSatoshis,
									onChange: (event) => onUpdate("feeCapSatoshis", event.target.value)
								})] })]
							}) : null,
							detail.editable === "payment" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 grid gap-3 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "inspector-proposed-payment",
									children: "Proposed payment (BCH)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "inspector-proposed-payment",
									value: draft.paymentBch,
									onChange: (event) => onUpdate("paymentBch", event.target.value)
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "inspector-proposed-fee",
									children: "Proposed fee (sats)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "inspector-proposed-fee",
									value: draft.feeSatoshis,
									onChange: (event) => onUpdate("feeSatoshis", event.target.value)
								})] })]
							}) : null,
							detail.editable === "approval" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 max-w-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "inspector-approval-threshold",
									children: "Approval threshold"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "inspector-approval-threshold",
									max: 3,
									min: 1,
									type: "number",
									value: draft.approvalThreshold,
									onChange: (event) => onUpdate("approvalThreshold", Number(event.target.value))
								})]
							}) : null
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 rounded-lg border border-border bg-surface-2 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium uppercase tracking-wide text-muted",
							children: "Why this is not editable"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-6 text-fg",
							children: detail.immutableReason ?? "This element is derived from a reviewed contract artifact."
						})]
					}),
					detail.cashAssembly ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
						className: "mt-4 rounded-lg border border-border bg-surface-2 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
							className: "cursor-pointer text-sm font-medium",
							children: "CashAssembly / implementation mapping"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
							className: "mt-3 max-h-56 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-5 text-muted",
							children: detail.cashAssembly
						})]
					}) : null
				]
			})
		})] })
	});
}
var BUILD_TRACE = [
	{
		label: "Bind the owner authorization and source covenant UTXO.",
		nodes: ["operator-signature", "vault-input"],
		edges: ["authorize", "input-0"]
	},
	{
		label: "Apply the BoundedRelease redeem checks to input 0.",
		nodes: ["bounded-release"],
		edges: []
	},
	{
		label: "Construct and bind the reviewed payment at output 0.",
		nodes: ["payment-output-0", "compiled-limits"],
		edges: ["output-0", "caps"]
	},
	{
		label: "Construct the same-lock successor at output 1.",
		nodes: ["successor-output-1"],
		edges: ["output-1"]
	},
	{
		label: "Evaluate the off-chain approval gate and retain the reviewed artifact evidence.",
		nodes: ["approval-workflow", "artifact"],
		edges: ["approval", "artifact"]
	}
];
function graphBlockingIds(blocking) {
	const ids = /* @__PURE__ */ new Set();
	for (const rule of blocking) if (rule.id.includes("approval")) {
		ids.add("approval-workflow");
		ids.add("approval");
	} else if (rule.id.includes("successor") || rule.id.includes("output.order")) {
		ids.add("successor-output-1");
		ids.add("output-1");
	} else if (rule.id.includes("destination") || rule.id.includes("output.cardinality")) {
		ids.add("payment-output-0");
		ids.add("output-0");
	} else if (rule.id.includes("amount") || rule.id.includes("fee") || rule.id.includes("dust")) {
		ids.add("compiled-limits");
		ids.add("caps");
	} else if (rule.id.includes("token") || rule.id.includes("utxo") || rule.id.includes("input")) {
		ids.add("vault-input");
		ids.add("input-0");
	} else ids.add("bounded-release");
	return [...ids];
}
function MocknetContractComposer() {
	const [draft, setDraft] = (0, import_react.useState)(DEFAULT_MOCKNET_CONTRACT_INPUT);
	const [inspected, setInspected] = (0, import_react.useState)(null);
	const [templateId, setTemplateId] = (0, import_react.useState)("bounded-release");
	const [built, setBuilt] = (0, import_react.useState)(false);
	const [runStep, setRunStep] = (0, import_react.useState)(null);
	const [runOutcome, setRunOutcome] = (0, import_react.useState)(null);
	const result = (0, import_react.useMemo)(() => {
		try {
			return {
				value: buildMocknetContract(draft),
				error: null
			};
		} catch (error) {
			return {
				value: null,
				error: error instanceof Error ? error.message : "Unable to construct mock contract"
			};
		}
	}, [draft]);
	const update = (key, value) => {
		setBuilt(false);
		setRunStep(null);
		setRunOutcome(null);
		setDraft((current) => ({
			...current,
			[key]: value
		}));
	};
	const referenceTemplate = templateId === "bounded-release" ? null : FLOWGUARD_REFERENCE_TEMPLATES.find((template) => template.id === templateId) ?? null;
	const execution = result.value;
	const activePlan = referenceTemplate ? referenceTemplatePlan(referenceTemplate) : execution?.plan ?? null;
	const inspectedDetail = inspected && activePlan ? referenceTemplate ? referenceElementDetail({
		id: inspected.id,
		plan: activePlan,
		template: referenceTemplate
	}) : execution ? mocknetElementDetail(inspected.id, execution) : null : null;
	const checks = execution ? [...execution.evaluation.policy.rules, ...execution.evaluation.covenant.rules] : [];
	(0, import_react.useEffect)(() => {
		if (runStep === null || !execution || runOutcome) return;
		const finalStep = BUILD_TRACE.length - 1;
		const timer = window.setTimeout(() => {
			if (runStep < finalStep) {
				setRunStep(runStep + 1);
				return;
			}
			setRunOutcome(execution.evaluation.policy.allowed ? "passed" : "blocked");
			setBuilt(true);
		}, 520);
		return () => window.clearTimeout(timer);
	}, [
		execution,
		runOutcome,
		runStep
	]);
	const graphRun = (0, import_react.useMemo)(() => {
		if (!execution || referenceTemplate || runStep === null) return void 0;
		const completedTrace = BUILD_TRACE.slice(0, runOutcome ? BUILD_TRACE.length : runStep);
		const current = BUILD_TRACE[Math.min(runStep, BUILD_TRACE.length - 1)];
		const completedNodeIds = completedTrace.flatMap((stage) => [...stage.nodes]);
		const completedEdgeIds = completedTrace.flatMap((stage) => [...stage.edges]);
		const blocking = [...execution.evaluation.policy.blocking, ...execution.evaluation.covenant.rules.filter((rule) => !rule.pass)];
		const phase = runOutcome ?? "running";
		const allNodeIds = execution.plan.canvas.nodes.map((node) => node.id);
		const allEdgeIds = execution.plan.canvas.edges.map((edge) => edge.id);
		const blockedIds = phase === "blocked" ? graphBlockingIds(blocking) : [];
		return {
			phase,
			label: phase === "passed" ? "Unsigned BCH transaction built locally; every configured policy and covenant check passed." : phase === "blocked" ? `${blocking.length} local check${blocking.length === 1 ? "" : "s"} blocked this transaction. Red nodes and edges identify the affected contract path.` : current.label,
			activeNodeIds: phase === "running" ? [...current.nodes] : [],
			activeEdgeIds: phase === "running" ? [...current.edges] : [],
			completedNodeIds: phase === "passed" ? allNodeIds : completedNodeIds,
			completedEdgeIds: phase === "passed" ? allEdgeIds : completedEdgeIds,
			blockedNodeIds: blockedIds.filter((id) => allNodeIds.includes(id)),
			blockedEdgeIds: blockedIds.filter((id) => allEdgeIds.includes(id))
		};
	}, [
		execution,
		referenceTemplate,
		runOutcome,
		runStep
	]);
	const selectGraphElement = (selection) => {
		setInspected(selection);
	};
	const selectTemplate = (next) => {
		setBuilt(false);
		setRunStep(null);
		setRunOutcome(null);
		setInspected(null);
		setTemplateId(next);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4",
		"data-tour": "mocknet-contract-composer",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs uppercase tracking-[0.18em] text-demo",
							children: "Contract workbench"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "mt-1",
							children: referenceTemplate ? `${referenceTemplate.title} visualizer` : "Construct a mock Bounded Release contract"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 max-w-3xl text-sm leading-6 text-muted",
							children: referenceTemplate ? "Inspect a FlowGuard-guided state-transition shape and the implementation work required before it can become a dashboard contract." : "Choose the allowed controls, inspect the generated covenant, then build an unsigned mock transaction. Every change below recompiles the template; the graph is a view of the contract, not independent data."
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "demo",
						children: "mocknet only · no key access"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 grid gap-3 lg:grid-cols-[260px_minmax(0,1fr)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-surface-2 p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium uppercase tracking-wide text-muted",
								children: "1. Template gallery"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								"aria-pressed": templateId === "bounded-release",
								className: `mt-2 w-full rounded-lg border p-3 text-left ${templateId === "bounded-release" ? "border-accent bg-accent/10" : "border-border bg-bg hover:border-accent/50"}`,
								onClick: () => selectTemplate("bounded-release"),
								type: "button",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium",
										children: "Bounded Release"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs leading-5 text-muted",
										children: "Fixed recipient, per-payment ceiling, fee ceiling, and successor covenant."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										className: "mt-2",
										tone: "pass",
										children: "runnable mock"
									})
								]
							}),
							FLOWGUARD_REFERENCE_TEMPLATES.map((template) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								"aria-pressed": templateId === template.id,
								className: `mt-2 w-full rounded-lg border p-3 text-left ${templateId === template.id ? "border-warn bg-warn/10" : "border-border bg-bg hover:border-warn/50"}`,
								onClick: () => selectTemplate(template.id),
								type: "button",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium",
										children: template.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs leading-5 text-muted",
										children: template.short
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										className: "mt-2",
										tone: "warn",
										children: "reference preview"
									})
								]
							}, template.id)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 text-xs leading-5 text-subtle",
								children: "Reference previews follow FlowGuard's publicly documented covenant families. They are not imported artifacts, not executable in this dashboard, and cannot be funded or signed here."
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-2 text-xs font-medium uppercase tracking-wide text-muted",
							children: "2. Contract graph"
						}),
						activePlan ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolicyCanvas, {
							plan: activePlan,
							editableTopology: false,
							onSelect: selectGraphElement,
							reference: Boolean(referenceTemplate),
							run: graphRun
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-xl border border-fail/40 bg-fail/5 p-4 text-sm text-fail",
							children: "Fix the constructor values to generate an executable graph."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 rounded-lg border border-accent/30 bg-accent/5 p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium",
										children: "Inspect the executable mapping"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: "accent",
										children: "click a graph element"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: "Each node and edge opens a contract inspector showing its exact UTXO or output role, whether its enforcement is on-chain or off-chain, its CashAssembly mapping, and the reason it is editable or fixed."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-xs text-subtle",
									children: referenceTemplate ? "Click any node or edge for its state-transition role and its implementation gate. Select the runnable Bounded Release template to expose reviewed controls." : "Click any node or edge to open its transaction binding, enforcement rule, CashAssembly mapping, and only the controls that are safe to change."
								})
							]
						})
					] })]
				}),
				referenceTemplate ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 rounded-xl border border-warn/40 bg-warn/5 p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: "Reference template — implementation gate"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: "warn",
								children: "cannot compile or fund"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-6 text-muted",
							children: "Use this visualizer to decide whether the contract shape fits the business flow. It has no dashboard artifact, UTXO builder, signing path, or Chipnet funding action yet."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 grid gap-3 md:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium uppercase tracking-wide text-muted",
								children: "Operator controls to model"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-2 space-y-1 text-sm text-fg",
								children: referenceTemplate.controls.map((control) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["— ", control] }, control))
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium uppercase tracking-wide text-muted",
								children: "Required before enablement"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-2 space-y-1 text-sm text-fg",
								children: referenceTemplate.requiredImplementation.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["— ", item] }, item))
							})] })]
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 rounded-xl border border-dashed border-border bg-surface-2 p-4 text-sm leading-6 text-muted",
					children: [
						"Configure the contract on the graph: select",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-fg",
							children: "Compiled payment and fee caps"
						}),
						" to edit covenant constructor values, ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-fg",
							children: "Payout — output 0"
						}),
						" to construct the payment and fee, or ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-fg",
							children: "Workflow quorum"
						}),
						" to set the off-chain approval threshold. Every other element explains the invariant it protects."
					]
				})
			] }),
			inspectedDetail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraphElementInspector, {
				detail: inspectedDetail,
				draft,
				onClose: () => setInspected(null),
				onUpdate: update
			}) : null,
			!referenceTemplate ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-xs uppercase tracking-[0.18em] text-muted",
								children: "3. Compile and build"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "mt-1",
								children: "Deterministic mock transaction"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm leading-6 text-muted",
								children: "This performs local template compilation and unsigned BCH transaction serialization. It remains a simulation until a separately signed transaction is verified by CashVM."
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							disabled: !execution || runStep !== null && runOutcome === null,
							onClick: () => {
								setBuilt(false);
								setRunOutcome(null);
								setRunStep(0);
							},
							type: "button",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Braces, { className: "size-4" }), " Build unsigned mock transaction"]
						})]
					}),
					result.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm text-fail",
						children: ["Cannot build: ", result.error]
					}) : null,
					built && execution ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-border bg-surface-2 p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [execution.evaluation.policy.allowed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-5 text-pass" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-5 text-fail" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium",
										children: execution.evaluation.policy.allowed ? "Policy and covenant checks pass" : "Build produced a transaction, but checks block it"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
									className: "mt-3 grid gap-3 text-xs sm:grid-cols-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-subtle",
											children: "Mock covenant UTXO"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
											className: "mt-1 break-all font-mono text-fg",
											children: [
												execution.utxo.outpoint.txid,
												":",
												execution.utxo.outpoint.vout
											]
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-subtle",
											children: "New P2SH32 locking bytecode"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "mt-1 break-all font-mono text-fg",
											children: execution.artifact.lockingBytecodeHex
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-subtle",
											children: "Input value"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "mt-1 font-mono text-fg",
											children: formatBch(execution.utxo.valueSatoshis)
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-subtle",
											children: "Value equation"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "mt-1 font-mono text-fg",
											children: execution.transition.conservationLine
										})] })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 grid gap-2",
									children: execution.transition.outputs.map((output) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-md border border-border bg-bg p-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-sm font-medium",
												children: [
													"Output ",
													output.index,
													" · ",
													output.role
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 font-mono text-xs text-fg",
												children: formatBch(output.valueSatoshis)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 break-all font-mono text-[11px] text-muted",
												children: output.lockingBytecodeHex
											})
										]
									}, output.index))
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-border bg-surface-2 p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium",
									children: "Validation evidence"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-3 max-h-72 space-y-2 overflow-auto text-xs",
									children: checks.map((check, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex items-start justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-fg",
											children: check.label
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-subtle",
											children: check.detail
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											tone: check.pass ? "pass" : "fail",
											children: check.pass ? "pass" : "block"
										})]
									}, `${check.id}-${index}`))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-xs leading-5 text-subtle",
									children: "This validation is local and deterministic. It is not a WalletConnect signature, Chipnet provider preflight, broadcast, or confirmation."
								})
							]
						})]
					}) : null
				]
			}) : null,
			!referenceTemplate && execution ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs uppercase tracking-[0.18em] text-muted",
					children: "4. Inspect generated artifacts"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid gap-3 lg:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
						className: "rounded-lg border border-border bg-surface-2 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
							className: "cursor-pointer text-sm font-medium",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCode2, { className: "mr-2 inline size-4" }), "Generated CashAssembly redeem source"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
							className: "mt-3 max-h-64 overflow-auto font-mono text-xs leading-5 text-muted",
							children: execution.sourceAssembly
						})]
					}), built ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
						className: "rounded-lg border border-border bg-surface-2 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
							className: "cursor-pointer text-sm font-medium",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockKeyhole, { className: "mr-2 inline size-4" }), "Serialized unsigned BCH transaction"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
							className: "mt-3 max-h-64 overflow-auto break-all font-mono text-xs leading-5 text-muted",
							children: execution.transition.rawHex
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-lg border border-dashed border-border bg-surface-2 p-3 text-sm text-subtle",
						children: "Build the mock transaction to inspect its exact serialized bytes."
					})]
				})]
			}) : null
		]
	});
}
function StudioPage() {
	const client = useQueryClient();
	const sessionQuery = useQuery({
		queryKey: ["session"],
		queryFn: () => getCurrentSession()
	});
	const plansQuery = useQuery({
		queryKey: ["plans"],
		queryFn: () => loadPlans()
	});
	const organizationQuery = useQuery({
		queryKey: ["organization"],
		queryFn: () => loadOrganization()
	});
	const plan = plansQuery.data?.plans[0];
	const [name, setName] = (0, import_react.useState)();
	const [sessionAllowance, setSessionAllowance] = (0, import_react.useState)();
	const [threshold, setThreshold] = (0, import_react.useState)();
	const [pause, setPause] = (0, import_react.useState)();
	const [canvas, setCanvas] = (0, import_react.useState)();
	const [selection, setSelection] = (0, import_react.useState)(null);
	const [message, setMessage] = (0, import_react.useState)(null);
	const [mocknetOpen, setMocknetOpen] = (0, import_react.useState)(false);
	const working = (0, import_react.useMemo)(() => {
		if (!plan) return null;
		return {
			...plan,
			name: name ?? plan.name,
			limits: {
				...plan.limits,
				sessionAllowanceSatoshis: sessionAllowance ?? plan.limits.sessionAllowanceSatoshis
			},
			governance: {
				...plan.governance,
				threshold: threshold ?? plan.governance.threshold
			},
			canvas: canvas ?? plan.canvas,
			pause: pause ?? plan.pause
		};
	}, [
		plan,
		name,
		sessionAllowance,
		threshold,
		pause,
		canvas
	]);
	const save = useMutation({
		mutationFn: async () => {
			if (!working) throw new Error("No plan");
			return savePlanDraft({ data: {
				id: working.id,
				name: working.name,
				description: working.description,
				perPaymentSatoshis: working.limits.perPaymentSatoshis,
				sessionAllowanceSatoshis: working.limits.sessionAllowanceSatoshis,
				maxFeeSatoshis: working.limits.maxFeeSatoshis,
				threshold: working.governance.threshold,
				pause: working.pause,
				canvas: working.canvas
			} });
		},
		onSuccess: async (saved) => {
			setMessage(`Saved draft. Policy id ${saved.policyId.slice(0, 12)}…`);
			await client.invalidateQueries({ queryKey: ["plans"] });
		},
		onError: (err) => setMessage(err.message)
	});
	const createInitialPlan = useMutation({
		mutationFn: async () => {
			const memberCount = organizationQuery.data?.organization?.members.length ?? 1;
			const sourceVault = plansQuery.data?.vaults[0];
			const perPaymentSatoshis = sourceVault?.constructor.maxPaymentSatoshis;
			const maxFeeSatoshis = sourceVault?.constructor.maxFeeSatoshis;
			if (!sourceVault || !perPaymentSatoshis || !maxFeeSatoshis) throw new Error("The attached vault is missing immutable BoundedRelease limits");
			return savePlanDraft({ data: {
				name: "Initial bounded allocation",
				description: "Start with the attached BoundedRelease vault, then model and review the allowed payment path.",
				perPaymentSatoshis,
				sessionAllowanceSatoshis: "20000000",
				maxFeeSatoshis,
				threshold: Math.min(2, Math.max(1, memberCount)),
				pause: false,
				canvas: {
					nodes: [],
					edges: []
				}
			} });
		},
		onSuccess: async () => {
			setMessage("Initial draft created. Add the policy path in the visual editor before publishing.");
			await client.invalidateQueries({ queryKey: ["plans"] });
		},
		onError: (err) => setMessage(err.message)
	});
	const publish = useMutation({
		mutationFn: async () => {
			if (!plan) throw new Error("No plan");
			return publishPlan({ data: { id: plan.id } });
		},
		onSuccess: async (saved) => {
			setMessage(`Published v${saved.version}. Approvals on the previous policy id are invalid.`);
			await client.invalidateQueries({ queryKey: ["plans"] });
		},
		onError: (err) => setMessage(err.message)
	});
	const propose = useMutation({
		mutationFn: async () => {
			if (!plan) throw new Error("No plan");
			return createProposal({ data: {
				planId: plan.id,
				routeId: 0,
				amountSatoshis: "2000000",
				feeSatoshis: "1000"
			} });
		},
		onSuccess: async () => {
			setMessage("Created a 0.02 BCH vendor proposal.");
			await client.invalidateQueries();
		},
		onError: (err) => setMessage(err.message)
	});
	const config = sessionQuery.data?.config;
	if (!config || !plansQuery.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "p-8 text-muted",
		children: "Loading studio…"
	});
	if (!working) {
		if (mocknetOpen) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MocknetStudio, {
			config,
			session: sessionQuery.data?.session ?? null,
			onExit: () => setMocknetOpen(false)
		});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
			config,
			session: sessionQuery.data?.session ?? null,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-medium tracking-tight",
				children: "Policy Studio"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 max-w-3xl",
				"data-tour": "policy-studio",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveSetupCallout, {
						title: sessionQuery.data?.session ? "Policy Studio is waiting for a live source vault" : "Connect a wallet to begin",
						description: sessionQuery.data?.session ? "The visual editor opens after a WalletConnect organization has a recipient-bound BoundedRelease vault attached from provider evidence." : "WalletConnect login is required before the control-plane setup and policy editor are available."
					}),
					plansQuery.data.vaults.length > 0 && (sessionQuery.data?.session?.role === "owner" || sessionQuery.data?.session?.role === "operator") ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 rounded-lg border border-border bg-surface-1 p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: "Attached vault detected"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm leading-6 text-muted",
								children: "Create an empty local draft for this verified vault, then use the canvas to model the payment and successor outputs. Publishing remains blocked until the visual policy passes validation."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "mt-3",
								type: "button",
								onClick: () => createInitialPlan.mutate(),
								disabled: createInitialPlan.isPending,
								children: "Create first plan"
							})
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "mt-3",
						type: "button",
						variant: "outline",
						onClick: () => setMocknetOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Compass, { className: "size-4" }), "Explore Mocknet Studio"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-3 ml-2",
						type: "button",
						variant: "secondary",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/mock",
							children: "Open full Mock workspace"
						})
					}),
					message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-accent",
						children: message
					}) : null
				]
			})]
		});
	}
	const vault = plansQuery.data.vaults.find((item) => item.id === working.sourceVaultId);
	let executable = null;
	let issues = validateCanvas(working);
	if (vault) try {
		executable = compileExecutableStudio(working, vault);
		issues = executableStudioRules(working, vault);
	} catch (error) {
		issues = [{
			id: "shape.unreviewed",
			label: "Executable Studio mapping matches the funded vault",
			pass: false,
			enforcement: "on-chain",
			detail: error instanceof Error ? error.message : "Executable mapping is unavailable"
		}];
	}
	const selectedDetail = executable && selection ? executableElementDetail(selection.id, executable) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		config,
		session: sessionQuery.data?.session ?? null,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs uppercase tracking-[0.18em] text-muted",
					children: "Policy Studio"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-medium tracking-tight",
					children: working.name
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: () => save.mutate(),
							disabled: !sessionQuery.data?.session,
							children: "Save draft"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: () => publish.mutate(),
							disabled: !sessionQuery.data?.session,
							children: "Publish version"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => propose.mutate(),
							disabled: !sessionQuery.data?.session,
							children: "Propose 0.02 BCH"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex flex-wrap gap-2 text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: ["policy ", working.policyId.slice(0, 10)] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "accent",
						children: working.reviewedShapeId
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: working.status === "active" ? "pass" : "warn",
						children: working.status
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-tour": "policy-studio",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolicyCanvas, {
					plan: executable ? {
						...working,
						canvas: executable.canvas
					} : working,
					onChange: setCanvas,
					editableTopology: false,
					onSelect: setSelection
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Inspector" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid gap-3 md:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Plan name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: working.name,
								onChange: (e) => setName(e.target.value)
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Maximum per payment (BCH)" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: satoshisToBch(working.limits.perPaymentSatoshis),
									readOnly: true,
									disabled: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 font-mono text-[11px] text-subtle",
									children: [working.limits.perPaymentSatoshis, " sats · compiled into the funded vault"]
								})
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Fee ceiling (sats)" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: working.limits.maxFeeSatoshis,
									readOnly: true,
									disabled: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 font-mono text-[11px] text-subtle",
									children: "Immutable after funding the covenant"
								})
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Approval threshold" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									min: 1,
									max: 3,
									value: working.governance.threshold,
									onChange: (e) => setThreshold(Number(e.target.value))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-[11px] text-subtle",
									children: "Off-chain approval control"
								})
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Session allowance (BCH)" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: satoshisToBch(working.limits.sessionAllowanceSatoshis),
									onChange: (e) => {
										try {
											setSessionAllowance(bchToSatoshis(e.target.value).toString());
										} catch {}
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-[11px] text-subtle",
									children: "Off-chain accounting; proposal evaluation enforces it before signing."
								})
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Emergency pause" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									className: "mt-1 w-full",
									type: "button",
									variant: working.pause ? "danger" : "outline",
									onClick: () => setPause(!working.pause),
									children: working.pause ? "Paused — click to resume" : "Active — click to pause"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-[11px] text-subtle",
									children: "Off-chain policy control"
								})
							] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid gap-2 text-sm",
						children: working.routes.map((route) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-md border border-border bg-surface-2 p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium",
										children: route.label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: route.enforcement === "on-chain" ? "pass" : "warn",
										children: route.enforcement
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted",
									children: route.whyConstrained
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 font-mono text-[11px] text-subtle",
									children: [
										"dest ",
										route.destinationAddress,
										" · cap ",
										formatBch(route.maxAmountSatoshis)
									]
								})
							]
						}, route.id))
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Verification" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 space-y-2 text-sm",
						children: issues.map((issue) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: issue.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: issue.pass ? "pass" : "fail",
								children: issue.pass ? "pass" : "block"
							})]
						}, issue.label))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-xs text-subtle",
						children: "Drag/drop is visual layout only and is excluded from the policy hash. 2-of-3 is an off-chain approval policy; BoundedRelease enforces one operator CHECKSIG. The persisted canonical plan is re-hashed and revalidated on every proposal."
					}),
					message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-accent",
						children: message
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/proposals",
						className: "mt-3 inline-block text-sm text-accent hover:underline",
						children: "Review proposals"
					})
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Selected graph element" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Click a node or edge to inspect the rule that the transaction builder and covenant enforce."
					})] }), selectedDetail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "pass",
						children: selectedDetail.enforcement
					}) : null]
				}), selectedDetail ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: selectedDetail.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-6 text-muted",
							children: selectedDetail.transactionBinding
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 text-xs leading-5 text-subtle",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium text-fg",
								children: "Editability: "
							}), selectedDetail.editable]
						})
					] }), selectedDetail.assembly ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 text-xs font-medium uppercase tracking-wide text-muted",
						children: "CashAssembly rule"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
						className: "max-h-52 overflow-auto rounded-md border border-border bg-bg p-3 font-mono text-xs leading-5 text-muted",
						children: selectedDetail.assembly
					})] }) : null]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-subtle",
					children: "The live graph is compiler-derived. Select an element to see its exact UTXO and CashAssembly binding."
				})]
			}),
			executable ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Executable BCH transaction mapping" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-6 text-muted",
						children: "This is the exact template passed to the BCH transaction builder. The chart is a view of this mapping; it is not an independent policy language."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid gap-3 text-sm lg:grid-cols-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-border bg-surface-2 p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium",
									children: "Input 0"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 font-mono text-xs text-muted break-all",
									children: executable.transaction.input.outpoint
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-xs text-subtle",
									children: "The only input must use the attached vault lock."
								})
							]
						}), executable.transaction.outputs.map((output) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-border bg-surface-2 p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "font-medium",
									children: [
										"Output ",
										output.index,
										" · ",
										output.role
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 font-mono text-xs text-muted break-all",
									children: output.lockingBytecodeHex
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-xs text-subtle",
									children: output.constraint
								})
							]
						}, output.index))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid gap-2 text-xs text-subtle md:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "On-chain: operator signature, exact 1-input/2-output shape, recipient lock, successor lock, payment cap, and fee cap." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Off-chain only: organization approvals, session/daily accounting, and recovery. Those are never presented as covenant guarantees." })]
					})
				]
			}) : null
		]
	});
}
function MocknetStudio({ config, session, onExit }) {
	const [resetKey, setResetKey] = (0, import_react.useState)(0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		config,
		session,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex flex-wrap items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs uppercase tracking-[0.18em] text-demo",
					children: "Mocknet workspace"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 text-2xl font-medium tracking-tight",
					children: "Policy Studio sandbox"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-2xl text-sm text-muted",
					children: "Construct a reviewed contract template and inspect the transaction it would build. This workspace is local to the browser and cannot sign, fund, attach, or broadcast Chipnet records."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "outline",
					onClick: () => setResetKey((current) => current + 1),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), "Reset mock contract"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "secondary",
					onClick: onExit,
					children: "Return to live setup"
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MocknetContractComposer, {}, resetKey)]
	});
}
//#endregion
export { StudioPage as component };
