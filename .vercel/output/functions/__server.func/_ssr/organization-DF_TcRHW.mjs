import { s as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { P as satoshisToBch, m as bchToSatoshis } from "./artifacts-lsD7QsAY.mjs";
import { A as Copy, B as ArrowRight, S as KeyRound, a as UserRoundPlus, c as ShieldCheck, j as Compass, r as WalletCards, v as LockKeyhole, z as BadgeCheck } from "../_libs/lucide-react.mjs";
import { C as loadOrganization, I as saveCovenantBlueprint, M as redeemOrganizationInvite, g as enrollSelfAsRecipient, i as Card, n as Badge, o as CardTitle, r as Button, t as AppShell, u as bootstrapOrganization, y as issueOrganizationInvite } from "./api-Ch8UWRqP.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as Label, t as Input } from "./input-D-klI4jJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/organization-DF_TcRHW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var descriptions = {
	authorization: {
		title: "Operator authorization",
		enforcement: "on-chain",
		body: "The covenant verifies one signature from the WalletConnect organization owner before the UTXO can move.",
		editable: "The signing public-key hash is fixed when this next vault is compiled and funded."
	},
	input: {
		title: "Covenant input",
		enforcement: "on-chain",
		body: "This template accepts exactly one native-BCH P2SH32 covenant UTXO as transaction input 0. Extra fee inputs and CashTokens are not part of this template.",
		editable: "A different source means a different funded vault; it cannot be added to an existing one."
	},
	payment: {
		title: "Payment output 0",
		enforcement: "on-chain",
		body: "Transaction output 0 must pay the recipient wallet enrolled by WalletConnect. The amount must be positive and may not exceed the compiled payment cap.",
		editable: "The recipient is set by recipient enrollment. The cap can be changed only before funding the next vault."
	},
	successor: {
		title: "Successor output 1",
		enforcement: "on-chain",
		body: "The remainder must return to the exact same P2SH32 covenant lock at output 1. This preserves the control for the BCH that remains.",
		editable: "This is deliberately fixed. A missing or differently locked successor causes covenant validation to fail."
	},
	limits: {
		title: "Payment and fee controls",
		enforcement: "on-chain",
		body: "The script checks the payment cap and computes the transaction fee as input value minus both required outputs. The fee may not exceed the configured ceiling.",
		editable: "These are the two safe parameters the owner may tune in this v1 template before it is funded."
	}
};
function ComposerBlock({ element, label, detail, selected, onSelect }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		"aria-pressed": selected,
		className: `min-w-40 rounded-lg border p-3 text-left transition-colors ${selected ? "border-accent bg-accent/10 ring-1 ring-accent/40" : "border-border bg-surface-2 hover:border-accent/50"}`,
		onClick: onSelect,
		type: "button",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[10px] uppercase tracking-wide text-subtle",
				children: element
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm font-medium",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-[11px] leading-4 text-muted",
				children: detail
			})
		]
	});
}
function ContractBlueprintComposer({ ownerAccount, recipientAccount, blueprint, paymentCap, feeCap, onPaymentCapChange, onFeeCapChange, onCompile, pending }) {
	const [selected, setSelected] = (0, import_react.useState)("payment");
	const detail = descriptions[selected];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "mt-4",
		"data-tour": "contract-composer",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs uppercase tracking-[0.18em] text-muted",
						children: "Contract composer"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "mt-1",
						children: "Bounded Release — next vault"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-3xl text-sm leading-6 text-muted",
						children: "Assemble a reviewed spending contract without writing code. This is the visual equivalent of choosing a contract template and its constructor arguments; it compiles a new, reviewable CashAssembly artifact rather than interpreting the diagram at spend time."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "pass",
					children: "1 reviewed template"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 rounded-xl border border-border bg-bg p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2 overflow-x-auto pb-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComposerBlock, {
							element: "authorization",
							label: "Owner signature",
							detail: "Wallet-derived operator",
							selected: selected === "authorization",
							onSelect: () => setSelected("authorization")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
							className: "size-4 shrink-0 text-accent",
							"aria-hidden": "true"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComposerBlock, {
							element: "input",
							label: "One vault UTXO",
							detail: "input 0 · native BCH",
							selected: selected === "input",
							onSelect: () => setSelected("input")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
							className: "size-4 shrink-0 text-accent",
							"aria-hidden": "true"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComposerBlock, {
							element: "payment",
							label: "Payout",
							detail: "output 0 · enrolled recipient",
							selected: selected === "payment",
							onSelect: () => setSelected("payment")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
							className: "size-4 shrink-0 text-pass",
							"aria-hidden": "true"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComposerBlock, {
							element: "successor",
							label: "Controlled remainder",
							detail: "output 1 · same covenant",
							selected: selected === "successor",
							onSelect: () => setSelected("successor")
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: `mt-3 w-full rounded-lg border p-3 text-left transition-colors ${selected === "limits" ? "border-accent bg-accent/10 ring-1 ring-accent/40" : "border-border bg-surface-2 hover:border-accent/50"}`,
					onClick: () => setSelected("limits"),
					type: "button",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-[10px] uppercase tracking-wide text-subtle",
							children: "constraints"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm font-medium",
							children: "Payment cap and fee ceiling"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-[11px] leading-4 text-muted",
							children: "These values become literal numeric checks in the generated covenant."
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-border bg-surface-2 p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: detail.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: detail.enforcement === "on-chain" ? "pass" : "warn",
								children: detail.enforcement
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-6 text-muted",
							children: detail.body
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 text-xs leading-5 text-subtle",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium text-fg",
								children: "What an admin can change: "
							}), detail.editable]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-border bg-surface-2 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: "Wallet-derived contract arguments"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid gap-3 text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockKeyhole, {
									className: "mt-0.5 size-4 shrink-0 text-pass",
									"aria-hidden": "true"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-subtle",
										children: "operator key hash"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block truncate font-mono text-fg",
										children: ownerAccount
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WalletCards, {
									className: "mt-0.5 size-4 shrink-0 text-accent",
									"aria-hidden": "true"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-subtle",
										children: "recipient lock"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block truncate font-mono text-fg",
										children: recipientAccount
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, {
									className: "mt-0.5 size-4 shrink-0 text-pass",
									"aria-hidden": "true"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-muted",
									children: "Wallet values are derived from the active WalletConnect session and recipient enrollment. They are not editable text fields or environment configuration."
								})]
							})
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid gap-3 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Payment cap (BCH)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: paymentCap,
						onChange: (event) => onPaymentCapChange(event.target.value)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Fee cap (sats)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: feeCap,
						onChange: (event) => onFeeCapChange(event.target.value)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "w-full",
							disabled: pending,
							onClick: onCompile,
							type: "button",
							children: "Compile next-vault artifact"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs leading-5 text-subtle",
				children: "Compiling updates only the next funding artifact. It never mutates an attached UTXO, an existing P2SH32 lock, or a previously published plan."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "mt-4 rounded-lg border border-border bg-bg p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
						className: "cursor-pointer text-sm font-medium",
						children: "Inspect generated CashAssembly"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-muted",
						children: "Read-only source generated from this visual template. The compiled hash and P2SH32 address are shown in the funding-artifact card below."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
						className: "mt-3 max-h-60 overflow-auto font-mono text-xs leading-5 text-subtle",
						children: blueprint.sourceAssembly
					})
				]
			})
		]
	});
}
var inviteLabels = {
	operator: "operator",
	approver: "approver",
	recipient: "payout recipient"
};
function OrganizationPage() {
	const client = useQueryClient();
	const organizationQuery = useQuery({
		queryKey: ["organization"],
		queryFn: () => loadOrganization()
	});
	const [inviteCode, setInviteCode] = (0, import_react.useState)("");
	const [issuedCode, setIssuedCode] = (0, import_react.useState)(null);
	const [message, setMessage] = (0, import_react.useState)(null);
	const [paymentCap, setPaymentCap] = (0, import_react.useState)(null);
	const [feeCap, setFeeCap] = (0, import_react.useState)(null);
	const bootstrap = useMutation({
		mutationFn: () => bootstrapOrganization(),
		onSuccess: async () => {
			setMessage("Organization created. This WalletConnect account is now the owner.");
			await client.invalidateQueries();
		},
		onError: (error) => setMessage(error.message)
	});
	const issue = useMutation({
		mutationFn: (kind) => issueOrganizationInvite({ data: { kind } }),
		onSuccess: (invite, kind) => {
			setIssuedCode({
				code: invite.code,
				kind
			});
			setMessage("Enrollment code created. It expires in one hour and is shown only in this session.");
		},
		onError: (error) => setMessage(error.message)
	});
	const selfRecipient = useMutation({
		mutationFn: () => enrollSelfAsRecipient(),
		onSuccess: async () => {
			setMessage("Single-wallet pilot enabled. This wallet is both owner and payout recipient; separation of duties is not configured.");
			await client.invalidateQueries();
		},
		onError: (error) => setMessage(error.message)
	});
	const redeem = useMutation({
		mutationFn: () => redeemOrganizationInvite({ data: { code: inviteCode.trim() } }),
		onSuccess: async (result) => {
			setInviteCode("");
			setMessage(result.session.role === "viewer" ? "Payout recipient enrolled from this WalletConnect wallet." : `Organization role updated to ${result.session.role}.`);
			await client.invalidateQueries();
		},
		onError: (error) => setMessage(error.message)
	});
	const saveBlueprint = useMutation({
		mutationFn: () => {
			const current = organizationQuery.data?.covenant;
			if (!current) throw new Error("Enroll a recipient wallet before configuring the covenant");
			return saveCovenantBlueprint({ data: {
				maxPaymentSatoshis: bchToSatoshis(paymentCap ?? satoshisToBch(current.maxPaymentSatoshis)).toString(),
				maxFeeSatoshis: feeCap ?? current.maxFeeSatoshis
			} });
		},
		onSuccess: async () => {
			setMessage("Next-vault blueprint saved. Review the new CashAssembly and fund only the newly generated P2SH32 address.");
			await client.invalidateQueries();
		},
		onError: (error) => setMessage(error.message)
	});
	if (!organizationQuery.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "p-8 text-muted",
		children: "Loading organization…"
	});
	const { config, session, organization, covenant } = organizationQuery.data;
	const canBootstrap = Boolean(session && session.authMethod === "walletconnect" && !organization);
	const owner = session?.role === "owner" && organization?.ownerAccount === session.account;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		config,
		session,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-5 max-w-3xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs uppercase tracking-[0.18em] text-muted",
						children: "Wallet authority"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-1 text-2xl font-medium tracking-tight",
						children: "Organization setup"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-6 text-muted",
						children: "WalletConnect supplies every organization and beneficiary account at runtime. The control plane stores no keys and uses no environment-provided member addresses."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 lg:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WalletCards, {
							className: "size-5 text-accent",
							"aria-hidden": "true"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "mt-3",
							children: "1. Authenticate wallet"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: session ? `Connected as ${session.role}.` : "Connect a BCH wallet first."
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRoundPlus, {
							className: "size-5 text-accent",
							"aria-hidden": "true"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "mt-3",
							children: "2. Establish membership"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: organization ? `${organization.members.length} verified member${organization.members.length === 1 ? "" : "s"}.` : "Create the Chipnet organization."
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
							className: "size-5 text-accent",
							"aria-hidden": "true"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "mt-3",
							children: "3. Enroll recipient"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: organization?.recipientAccount ? "Payout wallet verified." : "A payout wallet must accept an enrollment code."
						})
					] })
				]
			}),
			!organization ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-4 max-w-3xl",
				"data-tour": "organization-setup",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Create the Chipnet organization" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-6 text-muted",
						children: "The first WalletConnect-authenticated account explicitly creates this organization and becomes its owner. This is local control-plane authority, not a blockchain transaction."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "mt-4",
						onClick: () => bootstrap.mutate(),
						disabled: !canBootstrap || bootstrap.isPending,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "size-4" }), "Create organization from this wallet"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "mt-4 ml-2",
						type: "button",
						variant: "outline",
						onClick: () => window.dispatchEvent(new Event("optn:open-mocknet-walkthrough")),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Compass, { className: "size-4" }), "Run Mocknet demo"]
					}),
					!session ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs text-subtle",
						children: "Connect with WalletConnect to enable this step."
					}) : null,
					session?.authMethod !== "walletconnect" && session ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs text-subtle",
						children: "Demo sessions cannot create live organizations."
					}) : null
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "mt-4",
					"data-tour": "organization-setup",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Chipnet organization" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 font-mono text-xs text-muted",
							children: ["Owner ", organization.ownerAccount]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "pass",
							children: "Wallet-derived"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-3 md:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-border bg-bg p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-subtle",
								children: "Members"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-2 space-y-2 text-sm",
								children: organization.members.map((member) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate font-mono text-xs",
										children: member.account
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: member.role === "owner" ? "accent" : "pass",
										children: member.role
									})]
								}, member.account))
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-border bg-bg p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-subtle",
									children: "Payout recipient"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 break-all font-mono text-xs text-fg",
									children: organization.recipientAccount ?? "Not enrolled"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-xs leading-5 text-muted",
									children: "Recipient enrollment proves the destination wallet account before a covenant artifact is prepared."
								})
							]
						})]
					})]
				}),
				covenant ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [owner ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContractBlueprintComposer, {
					ownerAccount: organization.ownerAccount,
					recipientAccount: organization.recipientAccount ?? "",
					blueprint: covenant,
					paymentCap: paymentCap ?? satoshisToBch(covenant.maxPaymentSatoshis),
					feeCap: feeCap ?? covenant.maxFeeSatoshis,
					onPaymentCapChange: setPaymentCap,
					onFeeCapChange: setFeeCap,
					onCompile: () => saveBlueprint.mutate(),
					pending: saveBlueprint.isPending
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "mt-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Reviewed funding artifact" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm leading-6 text-muted",
								children: "Fund this exact Chipnet P2SH32 address from the owner-controlled wallet, then return to Vaults and attach the resulting txid and output index. Funding is not initiated by the dashboard."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: "pass",
								children: "P2SH32 · reviewed"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "mt-4 grid gap-3 text-xs md:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-subtle",
									children: "Funding address"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "mt-1 break-all font-mono text-fg",
									children: covenant.address ?? "Address encoding unavailable; use locking bytecode"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-subtle",
									children: "Artifact hash"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "mt-1 break-all font-mono text-fg",
									children: covenant.artifactHash
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "md:col-span-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-subtle",
										children: "Expected locking bytecode"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "mt-1 break-all font-mono text-fg",
										children: covenant.lockingBytecodeHex
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
							className: "mt-4 rounded-lg border border-border bg-bg p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
									className: "cursor-pointer text-sm font-medium",
									children: "Review generated CashAssembly"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-xs text-muted",
									children: "This source is compiled to the P2SH32 address above. It is the code-level counterpart of the reviewed visual blueprint."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
									className: "mt-3 max-h-60 overflow-auto font-mono text-xs leading-5 text-subtle",
									children: covenant.sourceAssembly
								})
							]
						})
					]
				})] }) : null,
				owner ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "mt-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Issue WalletConnect enrollment" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: "Send one code to the person controlling the corresponding wallet. They connect, sign the normal login challenge, and redeem it themselves."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap gap-2",
							children: [!organization.recipientAccount ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								size: "sm",
								onClick: () => selfRecipient.mutate(),
								disabled: selfRecipient.isPending,
								children: "Use this wallet for single-wallet pilot"
							}) : null, [
								"operator",
								"approver",
								"recipient"
							].map((kind) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "secondary",
								size: "sm",
								onClick: () => issue.mutate(kind),
								disabled: issue.isPending,
								children: `Invite ${inviteLabels[kind]}`
							}, kind))]
						}),
						issuedCode ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 rounded-lg border border-accent/40 bg-accent/5 p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted",
									children: [inviteLabels[issuedCode.kind], " enrollment code — expires in one hour"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 break-all font-mono text-xs text-fg",
									children: issuedCode.code
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									variant: "outline",
									size: "sm",
									className: "mt-3",
									onClick: () => void navigator.clipboard?.writeText(issuedCode.code),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), "Copy code"]
								})
							]
						}) : null
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "mt-4 max-w-3xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Accept enrollment" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: "Use this from the invited wallet’s WalletConnect session. The code assigns this account; it does not reveal an owner key or authorize a spend."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-[16rem] flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Enrollment code" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: inviteCode,
									onChange: (event) => setInviteCode(event.target.value)
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex items-end",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									onClick: () => redeem.mutate(),
									disabled: !session || !inviteCode.trim() || redeem.isPending,
									children: "Accept code"
								})
							})]
						})
					]
				})
			] }),
			message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-muted",
				role: "status",
				children: message
			}) : null
		]
	});
}
//#endregion
export { OrganizationPage as component };
