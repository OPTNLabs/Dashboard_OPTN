import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { T as formatBch } from "./artifacts-lsD7QsAY.mjs";
import { T as loadPlans, _ as getCurrentSession, i as Card, n as Badge, t as AppShell } from "./api-Ch8UWRqP.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as LiveSetupCallout } from "./live-setup-callout-CZNqgy2x.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/plans-Cx6uH2db.js
var import_jsx_runtime = require_jsx_runtime();
function PlansPage() {
	const sessionQuery = useQuery({
		queryKey: ["session"],
		queryFn: () => getCurrentSession()
	});
	const plansQuery = useQuery({
		queryKey: ["plans"],
		queryFn: () => loadPlans()
	});
	const config = sessionQuery.data?.config;
	if (!config || !plansQuery.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "p-8 text-muted",
		children: "Loading plans…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		config,
		session: sessionQuery.data?.session ?? null,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-5 flex items-end justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-medium tracking-tight",
				children: "Control Plans"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Published versions are immutable. Edits create a new policy id."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/studio",
				className: "text-sm text-accent hover:underline",
				children: "Open studio"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-3",
			children: [plansQuery.data.plans.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveSetupCallout, { title: "No live control plan yet" }) : null, plansQuery.data.plans.map((plan) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-base font-medium",
					children: plan.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-xl text-sm text-muted",
					children: plan.description
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: plan.status === "active" ? "pass" : "warn",
					children: plan.status
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-4 grid gap-2 text-xs text-muted md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Policy id", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-fg",
						children: [plan.policyId.slice(0, 16), "…"]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Per payment", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-fg",
						children: formatBch(plan.limits.perPaymentSatoshis)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Quorum", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-fg",
						children: [
							plan.governance.threshold,
							" of ",
							plan.governance.authorizedAccounts.length
						]
					})] })
				]
			})] }, plan.id))]
		})]
	});
}
//#endregion
export { PlansPage as component };
