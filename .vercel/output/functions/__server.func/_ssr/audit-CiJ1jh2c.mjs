import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { _ as getCurrentSession, i as Card, t as AppShell, x as loadAudit } from "./api-Ch8UWRqP.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as EvidenceChip } from "./evidence-chip-BebahhVt.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/audit-CiJ1jh2c.js
var import_jsx_runtime = require_jsx_runtime();
function AuditPage() {
	const sessionQuery = useQuery({
		queryKey: ["session"],
		queryFn: () => getCurrentSession()
	});
	const auditQuery = useQuery({
		queryKey: ["audit"],
		queryFn: () => loadAudit()
	});
	const config = sessionQuery.data?.config;
	if (!config || !auditQuery.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "p-8 text-muted",
		children: "Loading audit…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		config,
		session: sessionQuery.data?.session ?? null,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-medium tracking-tight",
				children: "Audit lineage"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Hash-chained application evidence. Funding provenance is accounting metadata and does not authorize later spends."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 space-y-2",
				children: auditQuery.data.events.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "p-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm",
							children: event.summary
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 font-mono text-[11px] text-subtle",
							children: [
								"#",
								event.seq,
								" · ",
								event.eventHash.slice(0, 16),
								" · prev ",
								event.prevHash.slice(0, 10)
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EvidenceChip, { level: event.evidence })]
					})
				}, event.id))
			})
		]
	});
}
//#endregion
export { AuditPage as component };
