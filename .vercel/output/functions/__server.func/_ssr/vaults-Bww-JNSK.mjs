import { s as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { E as formatSats, T as formatBch, o as NETWORK_CONFIG } from "./artifacts-lsD7QsAY.mjs";
import { d as RefreshCw, k as ExternalLink } from "../_libs/lucide-react.mjs";
import { O as loadVaults, _ as getCurrentSession, i as Card, l as attachVault, n as Badge, o as CardTitle, r as Button, t as AppShell } from "./api-Ch8UWRqP.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as EvidenceChip } from "./evidence-chip-BebahhVt.mjs";
import { n as Label, t as Input } from "./input-D-klI4jJ.mjs";
import { t as LiveSetupCallout } from "./live-setup-callout-CZNqgy2x.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/vaults-Bww-JNSK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function VaultsPage() {
	const client = useQueryClient();
	const sessionQuery = useQuery({
		queryKey: ["session"],
		queryFn: () => getCurrentSession()
	});
	const vaultsQuery = useQuery({
		queryKey: ["vaults"],
		queryFn: () => loadVaults(),
		refetchInterval: 3e4
	});
	const [txid, setTxid] = (0, import_react.useState)("");
	const [vout, setVout] = (0, import_react.useState)("0");
	const [error, setError] = (0, import_react.useState)(null);
	const attach = useMutation({
		mutationFn: () => attachVault({ data: {
			txid,
			vout: Number(vout)
		} }),
		onSuccess: async () => {
			setError(null);
			await client.invalidateQueries({ queryKey: ["vaults"] });
		},
		onError: (err) => setError(err.message)
	});
	const config = sessionQuery.data?.config;
	if (!config || !vaultsQuery.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "p-8 text-muted",
		children: "Loading vaults…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		config,
		session: sessionQuery.data?.session ?? null,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-medium tracking-tight",
					children: "Vaults and UTXOs"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-2xl text-sm text-muted",
					children: "Each row is an outpoint, not an account balance. BCH value and token state are separate fields."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "outline",
					onClick: () => void vaultsQuery.refetch(),
					disabled: vaultsQuery.isFetching,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: vaultsQuery.isFetching ? "size-4 animate-spin" : "size-4" }), "Refresh UTXOs"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-5",
				"data-tour": "wallet-utxos",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Live Chipnet source" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 font-mono text-xs text-muted",
							children: [
								vaultsQuery.data.chain.provider,
								" · ",
								vaultsQuery.data.chain.source
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: vaultsQuery.data.chain.reachable ? "pass" : "fail",
							children: vaultsQuery.data.chain.reachable ? `Height ${vaultsQuery.data.chain.height?.toLocaleString() ?? "unknown"}` : "Provider unavailable"
						})]
					}),
					vaultsQuery.data.wallet ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-4 grid gap-3 text-sm sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-xs text-muted",
								children: "Wallet balance"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "mt-1 font-mono text-lg",
								children: formatBch(vaultsQuery.data.wallet.balanceSatoshis)
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-xs text-muted",
								children: "Unspent outputs"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "mt-1 font-mono text-lg",
								children: vaultsQuery.data.wallet.utxoCount
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-xs text-muted",
								children: "Token-bearing outputs"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "mt-1 font-mono text-lg",
								children: vaultsQuery.data.wallet.tokenUtxoCount
							})] })
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-4 text-sm text-muted",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/wallet",
								className: "text-accent hover:underline",
								children: "Connect OPTN Wallet"
							}),
							" ",
							"to query this wallet’s real Chipnet script hash and UTXOs."
						]
					}),
					vaultsQuery.data.chain.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm text-fail",
						children: ["Chain read failed: ", vaultsQuery.data.chain.error]
					}) : null,
					vaultsQuery.data.walletError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm text-fail",
						children: ["Wallet lookup failed: ", vaultsQuery.data.walletError]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid gap-3",
				children: [vaultsQuery.data.vaults.map((vault) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: vault.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 font-mono text-xs text-muted",
							children: [
								vault.state.outpoint.txid,
								":",
								vault.state.outpoint.vout
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: vault.reviewed ? "pass" : "fail",
									children: vault.reviewed ? "Reviewed" : "Unreviewed"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: vault.liveSpendEnabled ? "accent" : "demo",
									children: vault.liveSpendEnabled ? "Live spend" : "Attach-only / demo"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: vault.onChainRecipientEnforced ? "pass" : "fail",
									children: vault.onChainRecipientEnforced ? "Recipient enforced" : "Recipient not on-chain"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-4 grid gap-2 text-sm md:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-xs text-muted",
								children: "BCH value"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
								className: "font-mono tabular-nums",
								children: [
									formatBch(vault.state.valueSatoshis),
									" · ",
									formatSats(vault.state.valueSatoshis)
								]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-xs text-muted",
								children: "Token"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
								className: "font-mono text-xs",
								children: [
									"category ",
									vault.state.token.categoryHex ?? "none",
									" · amount",
									" ",
									vault.state.token.amount,
									" · NFT ",
									vault.state.token.nftCapability
								]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-xs text-muted",
								children: "Locking type"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: vault.state.lockingType })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-xs text-muted",
								children: "Artifact"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
								className: "font-mono text-xs",
								children: [vault.artifactHash.slice(0, 20), "…"]
							})] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-1.5",
						children: vault.evidence.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EvidenceChip, { level: item }, item))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 space-y-1 text-xs text-subtle",
						children: vault.notes.map((note) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: note }, note))
					})
				] }, vault.id)), vaultsQuery.data.vaults.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveSetupCallout, {
					title: "No covenant vault attached",
					description: "The discovered P2PKH and token UTXOs remain ordinary wallet outputs; they are not eligible vaults. After recipient enrollment, fund the reviewed BoundedRelease P2SH32 artifact externally and attach the exact provider-proven outpoint."
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Discovered UTXOs" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full min-w-[640px] text-left text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "text-xs text-muted",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-2",
										children: "Outpoint"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-2",
										children: "BCH"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-2",
										children: "Token"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-2",
										children: "Lock"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-2",
										children: "Confirmations"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-2",
										children: "Evidence"
									})
								] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: vaultsQuery.data.utxos.map((utxo) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t border-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2 font-mono text-xs",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
											href: NETWORK_CONFIG[config.network].explorerTx(utxo.outpoint.txid),
											target: "_blank",
											rel: "noreferrer",
											className: "inline-flex items-center gap-1 text-accent hover:underline",
											children: [
												utxo.outpoint.txid.slice(0, 10),
												"…:",
												utxo.outpoint.vout,
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, {
													className: "size-3",
													"aria-hidden": "true"
												})
											]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2 tabular-nums",
										children: formatBch(utxo.valueSatoshis)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2 font-mono text-xs",
										children: utxo.token.categoryHex ?? "none"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2",
										children: utxo.lockingType
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2 font-mono text-xs",
										children: utxo.confirmations
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2",
										children: utxo.chainEvidence
									})
								]
							}, `${utxo.outpoint.txid}:${utxo.outpoint.vout}`)) })]
						})
					}),
					vaultsQuery.data.utxos.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: sessionQuery.data?.session ? "The connected wallet has no provider-reported UTXOs, or the lookup could not be completed." : "Connect a wallet to load its UTXOs."
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Attach existing vault" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "The dashboard will not claim it deployed or funded a vault. Attachment requires a Chipnet provider proof that the outpoint is unspent, token-free, and matches the reviewed BoundedRelease P2SH32 lock. An indexer hit alone is not live spend."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid gap-3 md:grid-cols-[1fr_100px_auto]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "txid" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: txid,
								onChange: (e) => setTxid(e.target.value)
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "vout" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: vout,
								onChange: (e) => setVout(e.target.value)
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex items-end",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									onClick: () => attach.mutate(),
									disabled: !sessionQuery.data?.session,
									children: "Attach"
								})
							})
						]
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-fail",
						children: error
					}) : null
				]
			})
		]
	});
}
//#endregion
export { VaultsPage as component };
