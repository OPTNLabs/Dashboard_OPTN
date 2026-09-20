import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { D as loadProposals, _ as getCurrentSession, i as Card, n as Badge, t as AppShell } from "./api-Ch8UWRqP.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/approvals-n3XTFL2I.js
var import_jsx_runtime = require_jsx_runtime();
function ApprovalsPage() {
	const sessionQuery = useQuery({
		queryKey: ["session"],
		queryFn: () => getCurrentSession()
	});
	const proposalsQuery = useQuery({
		queryKey: ["proposals"],
		queryFn: () => loadProposals()
	});
	const config = sessionQuery.data?.config;
	if (!config || !proposalsQuery.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "p-8 text-muted",
		children: "Loading approvals…"
	});
	const queue = proposalsQuery.data.proposals.filter((item) => item.stage === "policy-valid" || item.stage === "approved" || item.approvals.length > 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		config,
		session: sessionQuery.data?.session ?? null,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-medium tracking-tight",
				children: "Approval queue"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Approvals bind the exact intent hash (off-chain 2-of-3 policy, not an on-chain multisig). A changed output, policy, or outpoint invalidates them."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid gap-3",
				children: [queue.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "text-sm text-muted",
					children: "Nothing waiting on a signature."
				}) : null, queue.map((proposal) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/proposals/$id",
					params: { id: proposal.id },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "hover:border-accent/40",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-mono text-xs",
								children: [proposal.intentHash.slice(0, 24), "…"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: [
								proposal.approvals.length,
								"/",
								proposal.threshold
							] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 text-xs text-muted",
							children: proposal.approvals.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
								item.account,
								" · ",
								item.at
							] }, item.account))
						})]
					})
				}, proposal.id))]
			})
		]
	});
}
//#endregion
export { ApprovalsPage as component };
