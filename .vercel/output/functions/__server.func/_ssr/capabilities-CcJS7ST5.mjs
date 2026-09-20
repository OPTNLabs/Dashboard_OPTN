import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { S as loadCapabilities, _ as getCurrentSession, i as Card, n as Badge, o as CardTitle, t as AppShell } from "./api-Ch8UWRqP.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/capabilities-CcJS7ST5.js
var import_jsx_runtime = require_jsx_runtime();
function CapabilitiesPage() {
	const sessionQuery = useQuery({
		queryKey: ["session"],
		queryFn: () => getCurrentSession()
	});
	const caps = useQuery({
		queryKey: ["caps"],
		queryFn: () => loadCapabilities()
	});
	const config = sessionQuery.data?.config;
	if (!config || !caps.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "p-8 text-muted",
		children: "Loading capabilities…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		config,
		session: sessionQuery.data?.session ?? null,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-medium tracking-tight",
				children: "Agent capabilities"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-2xl text-sm text-muted",
				children: "An automation client may read state, propose, explain, and request approval. It does not receive keys, a transaction builder for arbitrary outputs, or broadcast permission by default."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Grants" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-2",
					children: caps.data.grants.map((grant) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-start justify-between gap-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono",
							children: grant.id
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-0.5 block text-xs text-subtle",
							children: grant.reason
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: grant.granted ? "pass" : "fail",
							children: grant.granted ? "granted" : "denied"
						})]
					}, grant.id))
				})]
			})
		]
	});
}
//#endregion
export { CapabilitiesPage as component };
