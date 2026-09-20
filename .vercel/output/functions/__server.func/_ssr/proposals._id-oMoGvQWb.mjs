import { s as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { E as formatSats, T as formatBch } from "./artifacts-lsD7QsAY.mjs";
import { E as loadProposal, P as refreshProposalStatus, R as signingPayload, V as verifySignedTx, _ as getCurrentSession, c as approveProposal, d as broadcastProposal, f as buildProposalTx, i as Card, j as reconcileBroadcast, n as Badge, o as CardTitle, r as Button, s as approvalPayload, t as AppShell, z as simulateLocalSign } from "./api-Ch8UWRqP.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as EvidenceChip } from "./evidence-chip-BebahhVt.mjs";
import { t as Route } from "./router-CC2rjyFb.mjs";
import { t as LifecycleStrip } from "./lifecycle-strip-BArd95Av.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/proposals._id-oMoGvQWb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProposalDetail() {
	const { id } = Route.useParams();
	const client = useQueryClient();
	const sessionQuery = useQuery({
		queryKey: ["session"],
		queryFn: () => getCurrentSession()
	});
	const query = useQuery({
		queryKey: ["proposal", id],
		queryFn: () => loadProposal({ data: { id } })
	});
	const config = sessionQuery.data?.config;
	const session = sessionQuery.data?.session ?? null;
	const [pairingUri, setPairingUri] = (0, import_react.useState)(null);
	const [explicitConfirm, setExplicitConfirm] = (0, import_react.useState)(false);
	const [localError, setLocalError] = (0, import_react.useState)(null);
	const refresh = () => client.invalidateQueries({ queryKey: ["proposal", id] });
	const demoMode = session?.authMethod === "demo" && config?.mode === "demo";
	const approveDemo = useMutation({
		mutationFn: () => approveProposal({ data: {
			id,
			demo: true
		} }),
		onSuccess: refresh
	});
	const approveWallet = useMutation({
		mutationFn: async () => {
			if (!config?.walletConnectProjectId) throw new Error("WalletConnect is not configured");
			const payload = await approvalPayload({ data: { id } });
			const { cachedLoginHandle, connectWalletConnectLogin } = await import("../_libs/_2.mjs");
			let handle = cachedLoginHandle();
			if (!handle || handle.account !== session?.account) handle = await connectWalletConnectLogin({
				projectId: config.walletConnectProjectId,
				network: config.network,
				metadataUrl: window.location.origin,
				onUri: setPairingUri
			});
			setPairingUri(null);
			const signature = await handle.signMessage(payload.message);
			return approveProposal({ data: {
				id,
				signature
			} });
		},
		onSuccess: refresh
	});
	const build = useMutation({
		mutationFn: () => buildProposalTx({ data: { id } }),
		onSuccess: refresh
	});
	const simulate = useMutation({
		mutationFn: () => simulateLocalSign({ data: { id } }),
		onSuccess: refresh
	});
	const signWallet = useMutation({
		mutationFn: async () => {
			if (!config?.walletConnectProjectId) throw new Error("WalletConnect is not configured");
			const payload = await signingPayload({ data: { id } });
			const { cachedSigningHandle, connectWalletConnectSigning } = await import("../_libs/_2.mjs");
			let handle = cachedSigningHandle();
			if (!handle || handle.account !== session?.account) handle = await connectWalletConnectSigning({
				projectId: config.walletConnectProjectId,
				network: config.network,
				metadataUrl: window.location.origin,
				onUri: setPairingUri
			});
			setPairingUri(null);
			const signedTxHex = await handle.signTransaction(payload.request);
			return verifySignedTx({ data: {
				id,
				signedTxHex
			} });
		},
		onSuccess: refresh
	});
	const broadcast = useMutation({
		mutationFn: () => broadcastProposal({ data: {
			id,
			explicitConfirm: true
		} }),
		onSuccess: refresh
	});
	const observe = useMutation({
		mutationFn: () => refreshProposalStatus({ data: { id } }),
		onSuccess: refresh
	});
	const reconcile = useMutation({
		mutationFn: () => reconcileBroadcast({ data: { id } }),
		onSuccess: refresh
	});
	if (!config || !query.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "p-8 text-muted",
		children: "Loading proposal…"
	});
	const { proposal, vault } = query.data;
	const err = localError ?? (approveDemo.error instanceof Error ? approveDemo.error.message : null) ?? (approveWallet.error instanceof Error ? approveWallet.error.message : null) ?? (build.error instanceof Error ? build.error.message : null) ?? (simulate.error instanceof Error ? simulate.error.message : null) ?? (signWallet.error instanceof Error ? signWallet.error.message : null) ?? (broadcast.error instanceof Error ? broadcast.error.message : null) ?? (observe.error instanceof Error ? observe.error.message : null) ?? (reconcile.error instanceof Error ? reconcile.error.message : null) ?? proposal.failureReason;
	const canBroadcast = proposal.stage === "signed-vm-validated" && Boolean(proposal.signedTxHex);
	const canWalletSign = (proposal.stage === "unsigned-built" || proposal.stage === "signing-requested") && Boolean(proposal.unsignedTxHex);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		config,
		session,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/proposals",
				className: "text-xs text-accent hover:underline",
				children: "All proposals"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 font-mono text-xs text-subtle",
				children: proposal.id
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 text-2xl font-medium tracking-tight",
				children: "Proposal review"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LifecycleStrip, { stage: proposal.stage })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-wrap gap-1.5",
				children: proposal.evidence.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EvidenceChip, { level: item }, item))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid gap-3 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Exact intent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mt-3 space-y-1.5 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Network",
							value: proposal.network
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "WalletConnect chain",
							value: proposal.walletConnectChainId
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Source",
							value: `${proposal.sourceOutpoint.txid.slice(0, 16)}…:${proposal.sourceOutpoint.vout}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Payment",
							value: `${formatBch(proposal.amountSatoshis)} · ${formatSats(proposal.amountSatoshis)}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Fee",
							value: `${proposal.feeSatoshis} sats / cap ${proposal.feeCapSatoshis}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Artifact",
							value: proposal.artifactHash.slice(0, 20)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Intent hash",
							value: proposal.intentHash
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Policy id",
							value: proposal.policyId
						})
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Outputs in index order" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 space-y-2",
						children: proposal.preview.outputs.map((output) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-md border border-border bg-surface-2 p-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"#",
									output.index,
									" ",
									output.role
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular-nums",
									children: formatBch(output.valueSatoshis)
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 font-mono text-[11px] text-subtle",
								children: [output.lockingBytecodeHex.slice(0, 40), "…"]
							})]
						}, output.index))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-mono text-xs text-muted",
						children: proposal.preview.conservationLine
					})
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Policy and covenant checks" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 grid gap-2 md:grid-cols-2",
					children: [...proposal.policyDecision.rules, ...proposal.covenantDecision.rules].map((rule) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-start justify-between gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [rule.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-0.5 block text-[11px] text-subtle",
							children: rule.enforcement
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: rule.pass ? "pass" : "fail",
							children: rule.pass ? "pass" : "fail"
						})]
					}, `${rule.id}-${rule.label}`))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, { children: [
						"Off-chain approval policy ",
						proposal.approvals.length,
						"/",
						proposal.threshold
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-muted",
						children: "2-of-3 is an off-chain control-plane gate. BoundedRelease enforces one operator CHECKSIG on-chain, not a quorum."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 space-y-2 text-sm",
						children: proposal.approvals.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-xs",
								children: item.account
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EvidenceChip, { level: item.evidence })]
						}, item.account))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: [
							demoMode ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: () => approveDemo.mutate(),
								disabled: !session,
								children: ["Demo approve as ", session?.role ?? "operator"]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: () => {
									setLocalError(null);
									approveWallet.mutate();
								},
								disabled: !session || !config.walletConnectConfigured,
								children: "WalletConnect approve"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => build.mutate(),
								disabled: proposal.stage !== "approved",
								children: "Build unsigned tx"
							}),
							demoMode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => simulate.mutate(),
								disabled: !proposal.unsignedTxHex,
								children: "Local VM sign (DEMO)"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => {
									setLocalError(null);
									signWallet.mutate();
								},
								disabled: !canWalletSign || !config.walletConnectConfigured,
								children: "WalletConnect sign tx"
							})
						]
					}),
					pairingUri ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 break-all font-mono text-[11px] text-muted",
						children: ["Pairing URI ", pairingUri]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 rounded-md border border-border bg-surface-2 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-start gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								className: "mt-1",
								checked: explicitConfirm,
								onChange: (e) => setExplicitConfirm(e.target.checked)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								"I confirm this exact signed transaction should be submitted to Chipnet. Broadcast stays blocked until the proposal is ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono",
									children: "signed-vm-validated"
								}),
								"."
							] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "danger",
									onClick: () => {
										if (!explicitConfirm) {
											setLocalError("Broadcast requires the explicit confirmation checkbox.");
											return;
										}
										setLocalError(null);
										broadcast.mutate();
									},
									disabled: !canBroadcast || !explicitConfirm,
									children: "Broadcast"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									onClick: () => observe.mutate(),
									disabled: !proposal.broadcastTxid,
									children: "Refresh mempool / confirmation"
								}),
								proposal.stage === "broadcast-uncertain" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									onClick: () => reconcile.mutate(),
									disabled: !proposal.signedTxid,
									children: "Reconcile provider state"
								}) : null
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-xs text-subtle",
						children: [
							"Demo local VM never becomes broadcast-eligible. Live spend needs a WalletConnect ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono",
								children: "bch_signTransaction"
							}),
							" session, CashVM, provider preflight, and a live-spend vault. Switch operators in Wallet to satisfy the off-chain 2-of-3 policy."
						]
					}),
					vault ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs text-muted",
						children: [
							"VM ",
							proposal.covenantDecision.vmAttempted ? proposal.covenantDecision.vmValid ? "valid" : "invalid" : "not run",
							" ",
							proposal.covenantDecision.vmError ?? "",
							" · live spend ",
							vault.liveSpendEnabled ? "enabled" : "disabled"
						]
					}) : null,
					proposal.signedTxid ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 font-mono text-xs text-muted",
						children: [
							"signed txid ",
							proposal.signedTxid,
							" (",
							proposal.stage === "signed-vm-validated" ? "wallet-signed, unbroadcast" : "unbroadcast",
							")"
						]
					}) : null,
					proposal.broadcastTxid ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 font-mono text-xs text-muted",
						children: ["broadcast txid ", proposal.broadcastTxid]
					}) : null,
					err ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-fail",
						children: err
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Canonical intent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
					className: "mt-3 max-h-80 overflow-auto font-mono text-[11px] text-muted",
					children: proposal.canonicalIntent
				})]
			})
		]
	});
}
function Row({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "max-w-[70%] truncate text-right font-mono text-xs",
			children: value
		})]
	});
}
//#endregion
export { ProposalDetail as component };
