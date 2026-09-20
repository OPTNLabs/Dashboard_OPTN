import { s as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { d as useRouterState, v as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { c as Slot, l as require_react_dom } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { i as getServerFnById, r as createServerFn, t as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { a as MAX_FEE_SATS } from "./artifacts-lsD7QsAY.mjs";
import { a as number, c as string, n as array, o as object, r as boolean, s as record, t as _enum } from "../_libs/zod.mjs";
import { B as ArrowRight, E as FileStack, F as Check, H as Activity, L as Boxes, O as FileCheck2, R as Blocks, T as Fingerprint, V as ArrowLeft, b as LayoutDashboard, c as ShieldCheck, i as UsersRound, j as Compass, l as ScrollText, n as Wallet, r as WalletCards, s as Shield, t as X, u as RotateCcw, w as FlaskConical, y as ListChecks } from "../_libs/lucide-react.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-Ch8UWRqP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom());
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function Badge({ className, tone = "neutral", children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide", {
			neutral: "border-border text-muted",
			accent: "border-accent/40 text-accent",
			pass: "border-pass/40 text-pass",
			warn: "border-warn/40 text-warn",
			fail: "border-fail/40 text-fail",
			demo: "border-demo/40 text-demo"
		}[tone], className),
		children
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[opacity,transform,background-color] duration-150 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 active:scale-[0.98]", {
	variants: {
		variant: {
			default: "bg-accent text-accent-fg hover:opacity-90",
			secondary: "bg-surface-2 text-fg border border-border hover:bg-surface-3",
			ghost: "text-muted hover:text-fg hover:bg-surface-2",
			danger: "bg-fail text-fg hover:opacity-90",
			outline: "border border-border-strong bg-transparent hover:bg-surface-2"
		},
		size: {
			default: "h-10 px-4",
			sm: "h-8 px-3 text-xs",
			lg: "h-11 px-5",
			icon: "size-10"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
var MOCKNET_UTXOS = {
	funding: {
		outpoint: "mock-funding-6cf2…:0",
		valueSatoshis: "100001000",
		lockingType: "P2PKH",
		state: "wallet-controlled"
	},
	vault: {
		outpoint: "mock-vault-91a7…:0",
		valueSatoshis: "100000000",
		lockingType: "P2SH32 · BoundedRelease",
		state: "provider-proven unspent"
	}
};
var MOCKNET_TRANSACTION = {
	txid: "mock-release-47bd…",
	inputValueSatoshis: "100000000",
	paymentValueSatoshis: "2000000",
	successorValueSatoshis: "97999000",
	feeSatoshis: "1000",
	status: "mocknet-confirmed"
};
var MOCKNET_WALKTHROUGH = [
	{
		route: "/",
		target: "overview-chain",
		eyebrow: "1 · Observe",
		title: "Inspect a mock funding UTXO",
		description: "Start with a discrete output, not an account balance. This mock funding output is the only money available to place under a policy.",
		action: "Open the Mocknet funding record",
		productionAction: "Refresh chain data and inspect the wallet's UTXOs before proposing any movement.",
		checks: ["The UTXO is unspent and belongs to the selected network.", "BCH value and CashToken state are evaluated independently."],
		record: {
			kind: "utxo",
			label: "Mocknet funding UTXO",
			id: MOCKNET_UTXOS.funding.outpoint,
			status: MOCKNET_UTXOS.funding.state,
			fields: [
				{
					label: "Value",
					value: "1.00001000 BCH"
				},
				{
					label: "Lock",
					value: MOCKNET_UTXOS.funding.lockingType
				},
				{
					label: "Token state",
					value: "none"
				}
			]
		}
	},
	{
		route: "/wallet",
		target: "wallet-connect",
		eyebrow: "2 · Authenticate",
		title: "Pair the operator identity",
		description: "The mock operator approves a BCH message challenge. It proves account control for login only; it does not authorize a spend or reveal a key.",
		action: "Accept mock bch_signMessage login",
		productionAction: "Generate a WalletConnect QR, verify the BCH message signature, and confirm the selected Chipnet account.",
		checks: ["The signed challenge binds origin, network, account, nonce, and expiry.", "Login has no bch_signTransaction permission and cannot spend by itself."],
		record: {
			kind: "utxo",
			label: "Mock operator",
			id: "bchmock:qoperator7k4…",
			status: "login verified · owner role",
			fields: [
				{
					label: "Requested method",
					value: "bch_signMessage"
				},
				{
					label: "Spend permission",
					value: "not granted"
				},
				{
					label: "Network",
					value: "Mocknet"
				}
			]
		}
	},
	{
		route: "/vaults",
		target: "wallet-utxos",
		eyebrow: "3 · Constrain",
		title: "Attach the covenant vault",
		description: "The mock funding output is now represented by a BoundedRelease P2SH32 vault. Attaching records the outpoint only after the locking bytecode matches the reviewed artifact.",
		action: "Attach mock vault outpoint",
		productionAction: "Fund the reviewed covenant, then attach its exact txid and output index after provider verification.",
		checks: ["The output is still unspent, native BCH only, and on the expected network.", "The P2SH32 lock must equal the reviewed covenant artifact byte-for-byte."],
		record: {
			kind: "utxo",
			label: "Mocknet covenant vault",
			id: MOCKNET_UTXOS.vault.outpoint,
			status: MOCKNET_UTXOS.vault.state,
			fields: [
				{
					label: "Value",
					value: "1.00000000 BCH"
				},
				{
					label: "Lock",
					value: MOCKNET_UTXOS.vault.lockingType
				},
				{
					label: "Evidence",
					value: "artifact matched · token-free"
				}
			]
		}
	},
	{
		route: "/studio",
		target: "policy-studio",
		eyebrow: "4 · Define",
		title: "Publish a bounded payment route",
		description: "The policy controls the intended business flow: one reviewed vendor, a 0.05 BCH per-payment cap, a 2-of-3 off-chain approval gate, and a required successor vault output.",
		action: "Publish mock vendor policy",
		productionAction: "Use Policy Studio to define routes and limits, then review and publish the version before proposals use it.",
		checks: ["Destination, amount, fee cap, and successor-output shape are bound to the intent.", "The 2-of-3 rule is an off-chain workflow control; the covenant enforces its own on-chain conditions."],
		record: {
			kind: "policy",
			label: "Mocknet policy v1",
			id: "policy:mock-vendor-cap-05",
			status: "published · reviewed",
			fields: [
				{
					label: "Vendor cap",
					value: "0.05000000 BCH"
				},
				{
					label: "Approvals",
					value: "2 of 3 off-chain"
				},
				{
					label: "Successor",
					value: "required at output 1"
				}
			]
		}
	},
	{
		route: "/proposals",
		target: "proposal-flow",
		eyebrow: "5 · Propose",
		title: "Bind an exact transaction intent",
		description: "The mock operator asks to pay 0.02 BCH. The proposal commits to the selected vault input, reviewed recipient, successor amount, and a 1,000-satoshi fee cap.",
		action: "Create mock 0.02 BCH proposal",
		productionAction: "Create a proposal from an active policy; inspect its exact source UTXO, outputs, intent hash, and expiry.",
		checks: ["The payment is below the route cap and the remaining allowance.", "The request has one covenant input and the exact reviewed output ordering."],
		record: {
			kind: "proposal",
			label: "Mocknet allocation proposal",
			id: "proposal:mock-2026-09-18-01",
			status: "policy-valid · awaiting approvals",
			fields: [
				{
					label: "Payment",
					value: "0.02000000 BCH → reviewed vendor"
				},
				{
					label: "Successor",
					value: "0.97999000 BCH → same covenant"
				},
				{
					label: "Fee",
					value: "1,000 sats"
				}
			]
		}
	},
	{
		route: "/proposals",
		target: "proposal-flow",
		eyebrow: "6 · Approve",
		title: "Collect quorum on the same intent",
		description: "Two mock approvers sign the proposal's intent hash. A changed recipient, value, outpoint, or policy version would require new approvals.",
		action: "Record two mock approvals",
		productionAction: "Request independent approver signatures and verify every approval refers to the same non-expired intent hash.",
		checks: ["Duplicate accounts and a proposer-only quorum are rejected.", "Approvals bind the intent hash; they do not sign a mutable draft."],
		record: {
			kind: "proposal",
			label: "Mocknet approval evidence",
			id: "intent:mock-4d21…",
			status: "2 of 2 approvals · ready to build",
			fields: [
				{
					label: "Owner",
					value: "mock approval accepted"
				},
				{
					label: "Approver",
					value: "mock approval accepted"
				},
				{
					label: "Expiry",
					value: "still valid"
				}
			]
		}
	},
	{
		route: "/proposals",
		target: "proposal-flow",
		eyebrow: "7 · Sign and validate",
		title: "Validate the signed successor transaction",
		description: "A separate mock signing session signs the already-approved transaction. CashVM then validates the covenant path before any network submission is considered.",
		action: "Mock-sign and run CashVM",
		productionAction: "Request bch_signTransaction only after quorum, then verify the signed bytes, fee, covenant path, and provider preflight result.",
		checks: ["The wallet cannot alter the agreed outputs, fee, locktime, or input sequence.", "CashVM accepts the vendor output and exact same-lock successor output."],
		record: {
			kind: "transaction",
			label: "Mocknet signed transaction",
			id: MOCKNET_TRANSACTION.txid,
			status: "signed · CashVM valid · preflight accepted",
			fields: [
				{
					label: "Input",
					value: MOCKNET_UTXOS.vault.outpoint
				},
				{
					label: "Outputs",
					value: "vendor + successor"
				},
				{
					label: "Transaction fee",
					value: "1,000 sats"
				}
			]
		}
	},
	{
		route: "/proposals",
		target: "proposal-flow",
		eyebrow: "8 · Observe outcome",
		title: "Confirm the Mocknet transition",
		description: "Mocknet now marks the original covenant outpoint spent and exposes the successor as the next controlled state. The platform records mempool and confirmation as separate evidence stages.",
		action: "Confirm mock transaction",
		productionAction: "Explicitly broadcast only after all gates pass, then reconcile provider mempool and confirmation evidence before treating the allocation as final.",
		checks: ["The broadcast lock prevents sending the same signed transaction twice.", "The successor vault is the new UTXO to inspect for the next allocation."],
		record: {
			kind: "transaction",
			label: "Mocknet confirmed transition",
			id: MOCKNET_TRANSACTION.txid,
			status: MOCKNET_TRANSACTION.status,
			fields: [
				{
					label: "Vendor output",
					value: "0.02000000 BCH"
				},
				{
					label: "Successor output",
					value: "0.97999000 BCH"
				},
				{
					label: "Prior vault",
					value: "spent in mock ledger"
				}
			]
		}
	}
];
function mocknetCompletedActions(stepIndex) {
	return Math.max(0, Math.min(stepIndex, MOCKNET_WALKTHROUGH.length));
}
var recordIcon = {
	utxo: WalletCards,
	policy: ShieldCheck,
	proposal: FileCheck2,
	transaction: Blocks
};
function MocknetLesson({ stepIndex }) {
	const step = MOCKNET_WALKTHROUGH[stepIndex];
	if (!step) return null;
	const Icon = recordIcon[step.record.kind];
	const completed = mocknetCompletedActions(stepIndex);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2 rounded-lg border border-demo/30 bg-demo/5 px-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Blocks, {
						className: "size-4 text-demo",
						"aria-hidden": "true"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-medium text-fg",
						children: "Mocknet simulation"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					tone: "demo",
					children: [completed, "/8 actions simulated"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-lg border border-border bg-bg p-3",
				"aria-label": "Mocknet record",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							className: "size-4 shrink-0 text-accent",
							"aria-hidden": "true"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium",
								children: step.record.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate font-mono text-[11px] text-subtle",
								children: step.record.id
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "pass",
						children: step.record.status
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
					className: "mt-3 grid gap-2 border-t border-border pt-3 text-xs sm:grid-cols-3",
					children: step.record.fields.map((field) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-subtle",
						children: field.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "mt-0.5 font-mono text-fg",
						children: field.value
					})] }, field.label))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-lg border border-border bg-surface p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium text-fg",
						children: "What you do in production"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs leading-5 text-muted",
						children: step.productionAction
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 space-y-1.5 border-t border-border pt-3 text-xs leading-5 text-muted",
						children: step.checks.map((check) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
								className: "mt-0.5 size-3.5 shrink-0 text-pass",
								"aria-hidden": "true"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: check })]
						}, check))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "rounded-lg border border-border bg-surface px-3 py-2 text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
					className: "cursor-pointer font-medium text-muted",
					children: "View complete Mocknet ledger"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 space-y-2 border-t border-border pt-3 text-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-subtle",
								children: "Funding:"
							}),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono",
								children: MOCKNET_UTXOS.funding.outpoint
							}),
							" · 1.00001000 BCH · unspent"
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-subtle",
								children: "Vault:"
							}),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono",
								children: MOCKNET_UTXOS.vault.outpoint
							}),
							" · 1.00000000 BCH · BoundedRelease P2SH32"
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-subtle",
								children: "Release:"
							}),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono",
								children: MOCKNET_TRANSACTION.txid
							}),
							" · 0.02000000 BCH vendor · 0.97999000 BCH successor · 1,000 sats fee"
						] })
					]
				})]
			})
		]
	});
}
var TOUR_SESSION_KEY = "optn-guided-tour";
function storedTourState() {
	if (typeof window === "undefined") return {
		open: false,
		stepIndex: 0
	};
	try {
		const parsed = JSON.parse(window.sessionStorage.getItem(TOUR_SESSION_KEY) ?? "null");
		if (!parsed?.open || !Number.isInteger(parsed.stepIndex)) return {
			open: false,
			stepIndex: 0
		};
		return {
			open: true,
			stepIndex: Math.min(MOCKNET_WALKTHROUGH.length - 1, Math.max(0, parsed.stepIndex ?? 0))
		};
	} catch {
		return {
			open: false,
			stepIndex: 0
		};
	}
}
function GuidedTour({ pathname }) {
	const navigate = useNavigate();
	const [tour, setTour] = (0, import_react.useState)({
		open: false,
		stepIndex: 0
	});
	const [mounted, setMounted] = (0, import_react.useState)(false);
	const { open, stepIndex } = tour;
	const step = MOCKNET_WALKTHROUGH[stepIndex];
	(0, import_react.useEffect)(() => {
		setMounted(true);
		setTour(storedTourState());
	}, []);
	(0, import_react.useEffect)(() => {
		function openMocknetWalkthrough() {
			const next = {
				open: true,
				stepIndex: 0
			};
			setTour(next);
			window.sessionStorage.setItem(TOUR_SESSION_KEY, JSON.stringify(next));
		}
		window.addEventListener("optn:open-mocknet-walkthrough", openMocknetWalkthrough);
		return () => window.removeEventListener("optn:open-mocknet-walkthrough", openMocknetWalkthrough);
	}, []);
	function updateTour(next) {
		setTour(next);
		if (next.open) window.sessionStorage.setItem(TOUR_SESSION_KEY, JSON.stringify(next));
		else window.sessionStorage.removeItem(TOUR_SESSION_KEY);
	}
	(0, import_react.useEffect)(() => {
		if (!open || !step) return;
		if (pathname !== step.route) {
			navigate({ to: step.route });
			return;
		}
		const timer = window.setTimeout(() => {
			const target = document.querySelector(`[data-tour="${step.target}"]`);
			if (!target) return;
			target.dataset.tourActive = "true";
			target.scrollIntoView({
				behavior: "smooth",
				block: "center"
			});
		}, 80);
		return () => {
			window.clearTimeout(timer);
			document.querySelectorAll("[data-tour-active]").forEach((target) => {
				delete target.dataset.tourActive;
			});
		};
	}, [
		navigate,
		open,
		pathname,
		step
	]);
	function close() {
		updateTour({
			open: false,
			stepIndex: 0
		});
		document.querySelectorAll("[data-tour-active]").forEach((target) => {
			delete target.dataset.tourActive;
		});
	}
	if (!open) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		type: "button",
		size: "sm",
		variant: "outline",
		disabled: !mounted,
		onClick: () => {
			updateTour({
				open: true,
				stepIndex: 0
			});
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Compass, {
			className: "size-4",
			"aria-hidden": "true"
		}), "Walkthrough"]
	});
	if (!step) return null;
	const last = stepIndex === MOCKNET_WALKTHROUGH.length - 1;
	return (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none fixed inset-0 z-30 bg-bg/55",
		"aria-hidden": "true"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		role: "dialog",
		"aria-modal": "true",
		"aria-labelledby": "guided-tour-title",
		className: "fixed inset-x-4 bottom-4 z-50 ml-auto flex max-h-[calc(100dvh-2rem)] max-w-2xl flex-col overflow-hidden rounded-xl border border-accent/50 bg-surface-2 p-4 shadow-2xl md:bottom-6 md:right-6 md:left-auto",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs uppercase tracking-[0.16em] text-accent",
					children: step.eyebrow
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: "guided-tour-title",
					className: "mt-1 text-lg font-medium",
					children: step.title
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: close,
					className: "rounded-md p-2 text-muted hover:bg-surface-3 hover:text-fg",
					"aria-label": "Close walkthrough",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-h-0 flex-1 overflow-y-auto pr-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm leading-6 text-muted",
						children: step.description
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MocknetLesson, { stepIndex }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 flex gap-1",
						"aria-label": `Step ${stepIndex + 1} of ${MOCKNET_WALKTHROUGH.length}`,
						children: MOCKNET_WALKTHROUGH.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: index <= stepIndex ? "h-1 flex-1 rounded-full bg-accent" : "h-1 flex-1 rounded-full bg-border-strong" }, `${item.target}-${index}`))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "outline",
						size: "sm",
						onClick: () => updateTour({
							open: true,
							stepIndex: Math.max(0, stepIndex - 1)
						}),
						disabled: stepIndex === 0,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), "Back"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "outline",
						size: "sm",
						onClick: () => updateTour({
							open: true,
							stepIndex: 0
						}),
						disabled: stepIndex === 0,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), "Restart"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					size: "sm",
					onClick: () => {
						if (last) close();
						else updateTour({
							open: true,
							stepIndex: stepIndex + 1
						});
					},
					children: [last ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" }), last ? "Finish Mocknet demo" : `Simulate: ${step.action}`]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-subtle",
				children: "Mocknet only. This tour does not connect a wallet, sign, broadcast, or change live records."
			})
		]
	})] }), document.body);
}
var NAV = [
	{
		to: "/",
		label: "Overview",
		icon: LayoutDashboard
	},
	{
		to: "/wallet",
		label: "Wallet",
		icon: Wallet
	},
	{
		to: "/organization",
		label: "Organization",
		icon: UsersRound
	},
	{
		to: "/vaults",
		label: "Vaults",
		icon: Boxes
	},
	{
		to: "/plans",
		label: "Plans",
		icon: FileStack
	},
	{
		to: "/studio",
		label: "Studio",
		icon: Activity
	},
	{
		to: "/mock",
		label: "Mock workspace",
		icon: FlaskConical
	},
	{
		to: "/proposals",
		label: "Proposals",
		icon: ListChecks
	},
	{
		to: "/approvals",
		label: "Approvals",
		icon: Fingerprint
	},
	{
		to: "/audit",
		label: "Audit",
		icon: ScrollText
	},
	{
		to: "/capabilities",
		label: "Capabilities",
		icon: Shield
	}
];
function ModeBadge({ mode, network }) {
	if (mode === "demo") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap gap-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
			tone: "demo",
			children: "Demo"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
			tone: "accent",
			children: network === "chipnet" ? "Chipnet fixtures" : "Mainnet gated"
		})]
	});
	if (mode === "mainnet-live") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		tone: "fail",
		children: "Mainnet live"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		tone: "accent",
		children: "Chipnet live"
	});
}
function AppShell({ config, session, children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-bg text-fg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-screen",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "hidden w-56 shrink-0 border-r border-border bg-surface md:flex md:flex-col",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-b border-border px-4 py-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-[11px] uppercase tracking-[0.2em] text-muted",
							children: "OPTN"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm font-medium",
							children: "Control Plane"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "flex flex-1 flex-col gap-0.5 p-2",
						children: NAV.map((item) => {
							const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
							const Icon = item.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: item.to,
								className: cn("flex h-10 items-center gap-2 rounded-md px-3 text-sm text-muted hover:bg-surface-2 hover:text-fg", active && "bg-surface-2 text-fg"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), item.label]
							}, item.to);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "border-t border-border p-3 text-[11px] text-subtle",
						children: "No keys in the browser. Broadcast is never one-click."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 flex-col",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface/80 px-4 py-3 backdrop-blur",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-mono text-xs uppercase tracking-[0.18em] text-muted md:hidden",
									children: "OPTN"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModeBadge, {
									mode: config.mode,
									network: config.network
								}),
								config.network === "mainnet" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: "fail",
									children: "Mainnet"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: "accent",
									children: "Chipnet"
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 text-xs text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GuidedTour, { pathname }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "hidden sm:inline",
									children: session ? `${session.role} · ${session.account.slice(0, 22)}…` : "Not authenticated"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/wallet",
									className: "text-accent hover:underline",
									children: session ? "Session" : "Connect"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-1 overflow-x-auto border-b border-border px-2 py-2 md:hidden",
						children: NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: item.to,
							className: cn("shrink-0 rounded-full border border-border px-3 py-1.5 text-xs text-muted", pathname === item.to && "border-accent text-fg"),
							children: item.label
						}, item.to))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
						className: "flex-1 p-4 md:p-6",
						children
					})
				]
			})]
		})
	});
}
function Card({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("rounded-xl border border-border bg-surface p-4 shadow-[0_0_0_1px_rgb(255_255_255/0.03)]", className),
		...props
	});
}
function CardHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("mb-3 flex items-start justify-between gap-3", className),
		...props
	});
}
function CardTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
		className: cn("text-sm font-medium tracking-tight", className),
		...props
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var satoshisSchema = string().regex(/^\d+$/, "Satoshis must be a non-negative integer string");
var canvasSchema = object({
	nodes: array(object({
		id: string().min(1),
		kind: _enum([
			"source",
			"vault",
			"asset",
			"route",
			"constraint",
			"governance",
			"recovery",
			"evidence"
		]),
		label: string(),
		x: number().finite(),
		y: number().finite(),
		data: record(string(), string())
	})),
	edges: array(object({
		id: string().min(1),
		source: string().min(1),
		target: string().min(1),
		kind: _enum([
			"bch",
			"successor",
			"approval",
			"recovery"
		]),
		label: string()
	}))
});
createServerFn({ method: "GET" }).handler(createSsrRpc("1ad1f03003647e56861c8678a90101b67900c817f6bc95d0dcf1330dca50b36e"));
var getCurrentSession = createServerFn({ method: "GET" }).handler(createSsrRpc("1f9e7a54e6c69bd4c9106557f70495589993c2103227da314dfc0288c8a7c88f"));
var loadOrganization = createServerFn({ method: "GET" }).handler(createSsrRpc("717f56c946a2ddc3921f7c85fede9df652988ebd5a69cc9762c49ad43709ebd8"));
var listDemoIdentities = createServerFn({ method: "GET" }).handler(createSsrRpc("cbfafd7724b333c5e8a9af78662a1132addf080c7ef4b97c9868de3c93b8979a"));
var issueLoginChallenge = createServerFn({ method: "POST" }).validator(object({
	account: string(),
	network: _enum(["chipnet", "mainnet"])
})).handler(createSsrRpc("d4bc7d69cbc8bfe8e9774d8046b712361acb2f227287a90cb4b2714f2391c5f4"));
var demoLogin = createServerFn({ method: "POST" }).validator(object({ account: string() })).handler(createSsrRpc("575ed8a6f18f2f4416f1872a282ca2b2466cf192729961d157eefc60d0fea3c7"));
var verifyLogin = createServerFn({ method: "POST" }).validator(object({
	account: string(),
	nonce: string(),
	signature: string(),
	network: _enum(["chipnet", "mainnet"])
})).handler(createSsrRpc("b30824df6eabb780722aa506ae26c5e2dbb949d19ca9ca654eae2ee5ca697e09"));
var logout = createServerFn({ method: "POST" }).handler(createSsrRpc("842a10e90c1eca8e402b45d6d274de7de9c3e28a30444d53340e6db4f8c5497c"));
var bootstrapOrganization = createServerFn({ method: "POST" }).handler(createSsrRpc("4ab10be263850758309b6b6000d6a4e35025012143e6f792dd5100645ecdb2bf"));
/**
* Session roles are only a cache. Reconcile them against the organization
* record after a WalletConnect login; this never promotes an unrelated wallet.
*/
var refreshOrganizationAccess = createServerFn({ method: "POST" }).handler(createSsrRpc("f7f5638487d71002f75f3308b18fc12b68231488f71ee2d28fecefd3db030f40"));
var issueOrganizationInvite = createServerFn({ method: "POST" }).validator(object({ kind: _enum([
	"operator",
	"approver",
	"recipient"
]) })).handler(createSsrRpc("055d5e7723442d087f802681195d1246c3401ec522e35cc82307959d698e711a"));
var enrollSelfAsRecipient = createServerFn({ method: "POST" }).handler(createSsrRpc("eb3d2edae73229e26dde0b584252c2d5c41b12631c89d52d751e52d826b55222"));
var saveCovenantBlueprint = createServerFn({ method: "POST" }).validator(object({
	maxPaymentSatoshis: satoshisSchema,
	maxFeeSatoshis: satoshisSchema
})).handler(createSsrRpc("d0b1033aa40c233c16f00fa7dff9626c98b220fe208695fa6c0ca74ed07bf207"));
var redeemOrganizationInvite = createServerFn({ method: "POST" }).validator(object({ code: string().min(24) })).handler(createSsrRpc("b4e24e5d8ee6f1974b0bd5cf23ab4586dae798dc0a961282b0d10e3e0069c0ea"));
var loadOverview = createServerFn({ method: "GET" }).handler(createSsrRpc("3bdb947955485b2122398a4a5ae93a49389178c256d8a8cd21885e6f639f909d"));
var loadVaults = createServerFn({ method: "GET" }).handler(createSsrRpc("5ef176b5e1e22eaf27059fc5ecced4e2f79a193d2d3c2b4ebbe7f280fc4d53fe"));
var attachVault = createServerFn({ method: "POST" }).validator(object({
	txid: string().regex(/^[0-9a-f]{64}$/i, "Transaction id must be 32-byte hex"),
	vout: number().int().nonnegative(),
	expectedLockingBytecodeHex: string().optional()
})).handler(createSsrRpc("8d0de0a465d496eb25f577f0bf1825d6c6f86beb4d23161c1fdcbffd86419b17"));
var loadPlans = createServerFn({ method: "GET" }).handler(createSsrRpc("afefc797935bd9017cce56c5ea27280cf055540428a98f3338f0d52065e2555a"));
createServerFn({ method: "POST" }).validator(object({ id: string() })).handler(createSsrRpc("f2a59d90627ddf4b413b419f9bb2f0816557bf0723e78eedb93304c57fdb0b60"));
var savePlanDraft = createServerFn({ method: "POST" }).validator(object({
	id: string().optional(),
	name: string().min(1),
	description: string(),
	perPaymentSatoshis: satoshisSchema,
	sessionAllowanceSatoshis: satoshisSchema,
	maxFeeSatoshis: satoshisSchema,
	threshold: number().int().min(1).max(3),
	pause: boolean(),
	canvas: canvasSchema.optional()
})).handler(createSsrRpc("b3c1235b821cf759266b5d9423dc9c74642d67b47fbae41b2e21f67239943124"));
var publishPlan = createServerFn({ method: "POST" }).validator(object({ id: string() })).handler(createSsrRpc("05225a2d7eac590123dc96e65b45a3f980e0c2f6878df2bb7015a198728e4b89"));
var createProposal = createServerFn({ method: "POST" }).validator(object({
	planId: string(),
	routeId: number().int(),
	amountSatoshis: satoshisSchema,
	feeSatoshis: satoshisSchema.default(MAX_FEE_SATS),
	idempotencyKey: string().optional()
})).handler(createSsrRpc("a64b0696fac88ff7122968eff01b22953931e3ffd86487a1f9aee1914a0f04e9"));
var loadProposal = createServerFn({ method: "POST" }).validator(object({ id: string() })).handler(createSsrRpc("6e12cc054573c597fbfd0096c7420328dbf4d35d9a09c214fd5a18b8b8fe8cb3"));
var loadProposals = createServerFn({ method: "GET" }).handler(createSsrRpc("31d3cbedc86c5e8848e230e52bcf588af224061c76122ddf6fedd9249f4990c1"));
var approveProposal = createServerFn({ method: "POST" }).validator(object({
	id: string(),
	signature: string().optional(),
	demo: boolean().optional()
})).handler(createSsrRpc("342c268c6056eb24c3fcb07e370254d3046c1c3bc5b5e048cf78016245aedbb2"));
var approvalPayload = createServerFn({ method: "POST" }).validator(object({ id: string() })).handler(createSsrRpc("607bd0c2d22af9610ca170c10f2c8fe9896199127fea3199ed20ff06a0d7bb34"));
var buildProposalTx = createServerFn({ method: "POST" }).validator(object({ id: string() })).handler(createSsrRpc("ea96676233f3829456ec5b536bfdf5b6709e83ed8c833806451eab0dd411efed"));
var simulateLocalSign = createServerFn({ method: "POST" }).validator(object({ id: string() })).handler(createSsrRpc("f1f190728672fe0cba037cb076bc5ea5acb64c4ea40dcf4fd03f68bd7d7799b2"));
var verifySignedTx = createServerFn({ method: "POST" }).validator(object({
	id: string(),
	signedTxHex: string().regex(/^(?:[0-9a-f]{2})+$/i, "Signed transaction must be hex")
})).handler(createSsrRpc("92b20b76d38f70681eea98f5da46a6fd009dddd1579c134f12e8440eb2e69a66"));
var signingPayload = createServerFn({ method: "POST" }).validator(object({ id: string() })).handler(createSsrRpc("841349b1fad647a3929c52ec41f03662e713b4323aae590b7522d40e791642c4"));
var broadcastProposal = createServerFn({ method: "POST" }).validator(object({
	id: string(),
	explicitConfirm: boolean()
})).handler(createSsrRpc("39c84cb8ce5e67990f9f1f682dfd0521f8cbf06bed5e2d51b4dfc0b40e41dbea"));
var reconcileBroadcast = createServerFn({ method: "POST" }).validator(object({ id: string() })).handler(createSsrRpc("169ff87a3dfe93e96363d557729b17a2b125305d2792d0ff88c829781a4c314c"));
var refreshProposalStatus = createServerFn({ method: "POST" }).validator(object({ id: string() })).handler(createSsrRpc("02a86496db7ff13db310f851e098eed737f39e58156f3820415eeefc882b12e8"));
var loadAudit = createServerFn({ method: "GET" }).handler(createSsrRpc("b205befb6bc6e2932d4ebaa3076b6780d08aedd129a516fef9fa0294d9bdcd53"));
var loadCapabilities = createServerFn({ method: "GET" }).handler(createSsrRpc("549d0030a8654e2f83fa37cfe83d2c223eec051b7c109115581074b0364218fa"));
var runScenario = createServerFn({ method: "POST" }).validator(object({ scenario: string() })).handler(createSsrRpc("2839caf665de1c5d93a60fa9e31bc0f266aae1166647711d0b5bdfdc80a60b26"));
createServerFn({ method: "GET" }).handler(createSsrRpc("bc1500be8093921884ac7e0bbba5034ac2af9c95848734885c016a529e7391cc"));
//#endregion
export { publishPlan as A, verifyLogin as B, loadOrganization as C, loadProposals as D, loadProposal as E, runScenario as F, saveCovenantBlueprint as I, savePlanDraft as L, redeemOrganizationInvite as M, refreshOrganizationAccess as N, loadVaults as O, refreshProposalStatus as P, signingPayload as R, loadCapabilities as S, loadPlans as T, verifySignedTx as V, getCurrentSession as _, CardHeader as a, listDemoIdentities as b, approveProposal as c, broadcastProposal as d, buildProposalTx as f, enrollSelfAsRecipient as g, demoLogin as h, Card as i, reconcileBroadcast as j, logout as k, attachVault as l, createProposal as m, Badge as n, CardTitle as o, cn as p, Button as r, approvalPayload as s, AppShell as t, bootstrapOrganization as u, issueLoginChallenge as v, loadOverview as w, loadAudit as x, issueOrganizationInvite as y, simulateLocalSign as z };
