import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { A as percentConsumed, T as formatBch, k as parseSatoshis } from "./artifacts-lsD7QsAY.mjs";
import { a as successIndex, i as isFailureStage } from "./lifecycle-DdjHZIfU.mjs";
import { R as Blocks, d as RefreshCw, p as Radio, r as WalletCards } from "../_libs/lucide-react.mjs";
import { a as CardHeader, i as Card, n as Badge, o as CardTitle, r as Button, t as AppShell, w as loadOverview } from "./api-Ch8UWRqP.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as EvidenceChip } from "./evidence-chip-BebahhVt.mjs";
import { t as LiveSetupCallout } from "./live-setup-callout-CZNqgy2x.mjs";
import { t as LifecycleStrip } from "./lifecycle-strip-BArd95Av.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Bfewl4s9.js
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const query = useQuery({
		queryKey: ["overview"],
		queryFn: () => loadOverview(),
		refetchInterval: 3e4
	});
	if (query.isLoading || !query.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		config: {
			appName: "OPTN",
			network: "chipnet",
			mode: "demo",
			mainnetEnabled: false,
			mainnetDisabledReason: null,
			walletConnectConfigured: false,
			walletConnectProjectId: null,
			walletConnectChainId: "bch:bchtest",
			indexerConfigured: false,
			broadcastConfigured: false,
			liveSpendAvailable: false,
			unavailable: []
		},
		session: null,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted",
			children: "Loading control plane…"
		})
	});
	const { config, session, chain, wallet, walletError, vaults, organization, plans, proposals, events, totals } = query.data;
	const vault = vaults[0];
	const plan = plans[0];
	const lineage = proposals.reduce((best, item) => {
		if (!best) return item;
		if (isFailureStage(best.stage) && !isFailureStage(item.stage)) return item;
		if (!isFailureStage(item.stage) && successIndex(item.stage) > successIndex(best.stage)) return item;
		return best;
	}, proposals[0]);
	const remaining = plan != null ? (parseSatoshis(plan.limits.sessionAllowanceSatoshis) - parseSatoshis(plan.limits.sessionConsumedSatoshis)).toString() : "0";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		config,
		session,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs uppercase tracking-[0.18em] text-muted",
					children: "Command center"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 text-2xl font-medium tracking-tight",
					children: "Treasury posture"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap justify-end gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "outline",
							onClick: () => void query.refetch(),
							disabled: query.isFetching,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: query.isFetching ? "size-4 animate-spin" : "size-4" }), "Refresh chain"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "secondary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/studio",
								children: "Open Policy Studio"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/wallet",
								children: session ? "Switch operator" : "Enter as operator"
							})
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-4 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-muted",
				children: config.mode === "demo" ? "DEMO mode uses deterministic fixtures and the same policy, intent, and CashVM paths. It will not present a fixture as a Chipnet confirmation." : "Live chain reads come from the configured Chipnet provider. Plans and approvals remain local control-plane records; each spend still requires policy, quorum, wallet signature, VM validation, and explicit broadcast."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-tour": "overview-chain",
				className: "grid gap-3 md:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "relative overflow-hidden",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: "Chipnet tip"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 font-mono text-xl tabular-nums",
								children: chain.height == null ? "Unavailable" : chain.height.toLocaleString()
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Blocks, {
								className: "size-5 text-accent",
								"aria-hidden": "true"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 truncate font-mono text-[11px] text-subtle",
							children: [
								chain.provider,
								" · ",
								chain.source
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: "Connected wallet"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 font-mono text-xl tabular-nums",
							children: wallet ? formatBch(wallet.balanceSatoshis) : session ? "Unavailable" : "Not connected"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WalletCards, {
							className: "size-5 text-accent",
							"aria-hidden": "true"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-[11px] text-subtle",
						children: wallet ? `${wallet.confirmedUtxoCount} confirmed UTXOs` : session ? "No provider-verified wallet balance" : "WalletConnect supplies the address at runtime"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: "Wallet UTXOs"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 font-mono text-xl tabular-nums",
							children: wallet?.utxoCount ?? "—"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, {
							className: "size-5 text-accent",
							"aria-hidden": "true"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-[11px] text-subtle",
						children: wallet ? `${wallet.tokenUtxoCount} token-bearing; BCH and tokens kept separate` : session ? "Wallet script hash lookup unavailable" : "Connect to query the wallet script hash"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: "Attached covenant vaults"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 font-mono text-xl tabular-nums",
							children: vaults.length
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-[11px] text-subtle",
							children: vaults.length > 0 ? `${formatBch(totals.protectedBchSatoshis)} provider-observed` : "No provider-proven vault attached"
						})
					] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2 text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: chain.reachable ? "pass" : "fail",
						children: chain.reachable ? `Live · ${chain.serverVersion ?? chain.provider}` : "Chain provider unavailable"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: ["Pending approvals ", totals.pendingApprovals] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						tone: totals.blocked > 0 ? "fail" : "pass",
						children: ["Blocked proposals ", totals.blocked]
					}),
					chain.latencyMs != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: [chain.latencyMs, " ms read"] }) : null
				]
			}),
			chain.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-sm text-fail",
				children: ["Chain read failed: ", chain.error]
			}) : null,
			walletError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-sm text-fail",
				children: ["Wallet lookup failed: ", walletError]
			}) : null,
			vault ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: vault.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: vault.onChainRecipientEnforced && vault.liveSpendEnabled ? "pass" : vault.onChainRecipientEnforced ? "accent" : "fail",
						children: vault.onChainRecipientEnforced ? vault.liveSpendEnabled ? "Recipient on-chain (live artifact matched)" : "Recipient on-chain (reviewed fixture; live spend disabled)" : "Allowlist only"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-xs text-muted",
						children: [
							vault.state.outpoint.txid.slice(0, 18),
							"…:",
							vault.state.outpoint.vout,
							" ·",
							" ",
							formatBch(vault.state.valueSatoshis)
						]
					}),
					plan ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs text-subtle",
						children: [
							"Session remaining ",
							formatBch(remaining),
							" ·",
							" ",
							percentConsumed(plan.limits.sessionConsumedSatoshis, plan.limits.sessionAllowanceSatoshis),
							"% consumed",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-1 block",
								children: "Off-chain accounting only — not covenant-enforced and not atomically reserved."
							})
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-1.5",
						children: vault.evidence.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EvidenceChip, { level: item }, item))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-2 text-xs text-muted",
							children: "Selected vault lineage"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LifecycleStrip, { stage: lineage?.stage ?? "intent" })]
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveSetupCallout, {
					title: "Live control plane is not funded yet",
					description: organization ? "The organization is recorded, but none of this wallet's discovered UTXOs matches the reviewed BoundedRelease P2SH32 covenant. Fund that exact artifact externally, then attach its outpoint here." : "The wallet and network data are live. Create a WalletConnect organization before preparing a recipient-bound covenant artifact and funding its exact P2SH32 lock."
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid gap-3 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Recent evidence" }), events.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-2",
					children: events.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-start justify-between gap-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: event.summary }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-mono text-[11px] text-subtle",
							children: [event.eventHash.slice(0, 16), "…"]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EvidenceChip, { level: event.evidence })]
					}, event.id))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: "No live control-plane events yet."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Unavailable live steps" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-1.5 text-sm text-muted",
					children: config.unavailable.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["— ", item] }, item))
				})] })]
			})
		]
	});
}
//#endregion
export { Home as component };
