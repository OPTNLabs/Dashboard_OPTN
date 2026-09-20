import { s as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { A as Copy, F as Check, m as QrCode } from "../_libs/lucide-react.mjs";
import { B as verifyLogin, N as refreshOrganizationAccess, _ as getCurrentSession, b as listDemoIdentities, h as demoLogin, i as Card, k as logout, n as Badge, o as CardTitle, r as Button, t as AppShell, v as issueLoginChallenge } from "./api-Ch8UWRqP.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as require_lib } from "../_libs/qrcode.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/wallet-BZINknsJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_lib = /* @__PURE__ */ __toESM(require_lib());
function WalletPage() {
	const client = useQueryClient();
	const sessionQuery = useQuery({
		queryKey: ["session"],
		queryFn: () => getCurrentSession()
	});
	const identities = useQuery({
		queryKey: ["demo-ids"],
		queryFn: () => listDemoIdentities(),
		enabled: sessionQuery.data?.config.mode === "demo"
	});
	const [error, setError] = (0, import_react.useState)(null);
	const [pairingUri, setPairingUri] = (0, import_react.useState)(null);
	const [pairingQr, setPairingQr] = (0, import_react.useState)(null);
	const [pairingPending, setPairingPending] = (0, import_react.useState)(false);
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [accessMessage, setAccessMessage] = (0, import_react.useState)(null);
	const config = sessionQuery.data?.config;
	const session = sessionQuery.data?.session ?? null;
	(0, import_react.useEffect)(() => {
		if (!pairingUri) {
			setPairingQr(null);
			return;
		}
		let active = true;
		import_lib.toDataURL(pairingUri, {
			width: 208,
			margin: 2,
			errorCorrectionLevel: "M",
			color: {
				dark: "#080b10",
				light: "#ffffff"
			}
		}).then((dataUrl) => {
			if (active) setPairingQr(dataUrl);
		}).catch(() => {
			if (active) setError("Could not render the WalletConnect QR code. Copy the raw wc: URI instead.");
		});
		return () => {
			active = false;
		};
	}, [pairingUri]);
	const enter = useMutation({
		mutationFn: (account) => demoLogin({ data: { account } }),
		onSuccess: async () => {
			setError(null);
			await client.invalidateQueries();
		},
		onError: (err) => setError(err.message)
	});
	const refreshAccess = useMutation({
		mutationFn: () => refreshOrganizationAccess(),
		onSuccess: async ({ session: refreshed, organization }) => {
			setAccessMessage(refreshed.role === "viewer" ? organization ? "This wallet is not an owner, operator, or approver in the current organization. Re-pair the owner wallet or accept an owner-issued invitation." : "No organization exists on this network yet. Create one from Organization with this WalletConnect wallet." : `Organization access restored as ${refreshed.role}.`);
			await client.invalidateQueries();
		},
		onError: (err) => setAccessMessage(err.message)
	});
	async function startWalletConnect() {
		setError(null);
		setCopied(false);
		setPairingUri(null);
		if (!config?.walletConnectProjectId) {
			setError("WalletConnect is not configured. Demo login uses the same bch_signMessage verification path.");
			return;
		}
		setPairingPending(true);
		try {
			const { connectWalletConnectLogin } = await import("../_libs/_2.mjs");
			const handle = await connectWalletConnectLogin({
				projectId: config.walletConnectProjectId,
				network: config.network,
				metadataUrl: window.location.origin,
				onUri: setPairingUri
			});
			const challenge = await issueLoginChallenge({ data: {
				account: handle.account,
				network: config.network
			} });
			const signature = await handle.signMessage(challenge.message);
			await verifyLogin({ data: {
				account: handle.account,
				nonce: challenge.nonce,
				signature,
				network: config.network
			} });
			setPairingUri(null);
			await client.invalidateQueries();
		} catch (err) {
			setError(err instanceof Error ? err.message : "WalletConnect failed");
		} finally {
			setPairingPending(false);
		}
	}
	async function copyPairingUri() {
		if (!pairingUri) return;
		try {
			await navigator.clipboard.writeText(pairingUri);
			setCopied(true);
		} catch {
			setError("Could not copy the WalletConnect URI. Select the raw wc: URI below and copy it manually.");
		}
	}
	if (!config) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "p-8 text-muted",
		children: "Loading session…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		config,
		session,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-medium tracking-tight",
				children: "Wallet connection"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 max-w-2xl text-sm text-muted",
				children: [
					"Login requests ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-fg",
						children: "bch_signMessage"
					}),
					" only. Transaction signing uses a separate ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-fg",
						children: "bch_signTransaction"
					}),
					" ",
					"session after an approved proposal. The login session is never used to spend."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Current session" }),
					session ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-3 space-y-1.5 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted",
									children: "Account"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "font-mono text-xs",
									children: session.account
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted",
									children: "Role"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: session.role })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted",
									children: "Auth"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: session.authMethod })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted",
									children: "Network"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: session.network })]
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: "No authenticated operator."
					}),
					session ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: [session.authMethod === "walletconnect" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => refreshAccess.mutate(),
							disabled: refreshAccess.isPending,
							children: refreshAccess.isPending ? "Refreshing access…" : "Refresh organization access"
						}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: async () => {
								const { disconnectWalletConnectCaches } = await import("../_libs/_2.mjs");
								await disconnectWalletConnectCaches();
								await logout();
								await client.invalidateQueries();
							},
							children: "Sign out / change wallet"
						})]
					}) : null,
					accessMessage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: accessMessage
					}) : null,
					session?.authMethod === "walletconnect" && session.role === "viewer" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs leading-5 text-subtle",
						children: "A refresh only restores a role already bound to this exact WalletConnect account; it cannot promote an unrelated wallet. Sign out to pair the organization owner wallet, or redeem an owner-issued operator/approver invitation."
					}) : null
				] }), config.mode === "demo" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Demo operators" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-muted",
						children: "Synthetic Chipnet identities. The server signs a real BCH message with a test-vector key that never leaves the server."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 grid gap-2",
						children: (identities.data ?? []).map((identity) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => enter.mutate(identity.account),
							className: "flex items-center justify-between rounded-md border border-border bg-surface-2 px-3 py-2 text-left text-sm hover:border-accent/40",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [identity.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-0.5 block font-mono text-[11px] text-subtle",
								children: identity.account
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: identity.role })]
						}, identity.account))
					})
				] }) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-4",
				"data-tour": "wallet-connect",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "WalletConnect (Chipnet)" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-muted",
						children: [
							"Chain id ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono",
								children: config.walletConnectChainId
							}),
							". Login methods: bch_signMessage. Do not grant bch_signTransaction during login."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "secondary",
							onClick: () => void startWalletConnect(),
							disabled: pairingPending,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrCode, {
								className: "size-4",
								"aria-hidden": "true"
							}), pairingPending ? "Waiting for OPTN Wallet…" : "Generate pairing QR"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: config.walletConnectConfigured ? "pass" : "demo",
							children: config.walletConnectConfigured ? "Project id present" : "Project id missing"
						})]
					}),
					pairingUri ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-4 rounded-lg border border-border bg-surface-2 p-4 md:grid-cols-[auto_1fr]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex size-56 items-center justify-center rounded-md bg-white p-3",
							children: pairingQr ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: pairingQr,
								alt: "WalletConnect pairing QR code",
								className: "size-52 max-w-full"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-bg",
								children: "Preparing QR…"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: "warn",
									children: "Waiting for wallet approval"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-3 text-sm text-muted",
									children: [
										"In OPTN Wallet, open Connect and scan this QR code. On the same device, copy the URI and paste it into OPTN Wallet. The value must begin with",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-mono text-fg",
											children: "wc:"
										}),
										"."
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
									"data-testid": "walletconnect-uri",
									className: "mt-3 block max-h-24 overflow-auto break-all rounded-md border border-border bg-bg p-3 font-mono text-xs text-fg",
									children: pairingUri
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									variant: "outline",
									className: "mt-3",
									onClick: () => void copyPairingUri(),
									children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
										className: "size-4",
										"aria-hidden": "true"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {
										className: "size-4",
										"aria-hidden": "true"
									}), copied ? "Copied raw URI" : "Copy raw URI"]
								})
							]
						})]
					}) : null
				]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-fail",
				children: error
			}) : null
		]
	});
}
//#endregion
export { WalletPage as component };
