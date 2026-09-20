import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { T as formatBch } from "./artifacts-lsD7QsAY.mjs";
import { t as SCENARIOS } from "./fixtures-CzelxbGa.mjs";
import { D as loadProposals, F as runScenario, T as loadPlans, _ as getCurrentSession, i as Card, m as createProposal, n as Badge, r as Button, t as AppShell } from "./api-Ch8UWRqP.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as LiveSetupCallout } from "./live-setup-callout-CZNqgy2x.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/proposals.index-4uclByf8.js
var import_jsx_runtime = require_jsx_runtime();
function ProposalsPage() {
	const client = useQueryClient();
	const sessionQuery = useQuery({
		queryKey: ["session"],
		queryFn: () => getCurrentSession()
	});
	const proposalsQuery = useQuery({
		queryKey: ["proposals"],
		queryFn: () => loadProposals()
	});
	const plansQuery = useQuery({
		queryKey: ["plans"],
		queryFn: () => loadPlans()
	});
	const config = sessionQuery.data?.config;
	const create = useMutation({
		mutationFn: async () => {
			const plan = plansQuery.data?.plans[0];
			if (!plan) throw new Error("No plan");
			return createProposal({ data: {
				planId: plan.id,
				routeId: 0,
				amountSatoshis: "2000000",
				feeSatoshis: "1000"
			} });
		},
		onSuccess: async () => client.invalidateQueries({ queryKey: ["proposals"] })
	});
	const scenario = useMutation({
		mutationFn: (id) => runScenario({ data: { scenario: id } }),
		onSuccess: async () => client.invalidateQueries({ queryKey: ["proposals"] })
	});
	if (!config || !proposalsQuery.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "p-8 text-muted",
		children: "Loading proposals…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		config,
		session: sessionQuery.data?.session ?? null,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-tour": "proposal-flow",
				className: "mb-4 flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-medium tracking-tight",
					children: "Allocation proposals"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Each proposal binds exact inputs, outputs, and an intent hash."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => create.mutate(),
					disabled: !sessionQuery.data?.session,
					children: "New 0.02 BCH proposal"
				})]
			}),
			config.mode === "demo" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-4 flex flex-wrap gap-2",
				children: SCENARIOS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "secondary",
					onClick: () => scenario.mutate(item.id),
					disabled: !sessionQuery.data?.session,
					children: item.label
				}, item.id))
			}) : null,
			scenario.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mb-3 text-sm text-muted",
				children: [
					"Scenario ",
					scenario.data.scenario,
					":",
					" ",
					scenario.data.proposal.failureReason ?? scenario.data.proposal.stage
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3",
				children: [proposalsQuery.data.proposals.length === 0 ? config.mode === "demo" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "text-sm text-muted",
					children: "No proposals yet. Authenticate, then create one or run a labelled scenario."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveSetupCallout, { title: "No live allocation proposals yet" }) : null, proposalsQuery.data.proposals.map((proposal) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/proposals/$id",
					params: { id: proposal.id },
					className: "block",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "hover:border-accent/40",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-xs text-subtle",
								children: proposal.id
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-sm",
								children: [
									formatBch(proposal.amountSatoshis),
									" →",
									" ",
									proposal.destinationAddress.slice(0, 22),
									"…"
								]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: proposal.stage.includes("reject") || proposal.stage === "failed" ? "fail" : "accent",
								children: proposal.stage
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 font-mono text-[11px] text-muted",
							children: [
								"intent ",
								proposal.intentHash.slice(0, 20),
								"…"
							]
						})]
					})
				}, proposal.id))]
			})
		]
	});
}
//#endregion
export { ProposalsPage as component };
