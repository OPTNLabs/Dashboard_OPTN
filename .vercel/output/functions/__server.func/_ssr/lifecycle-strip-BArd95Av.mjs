import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as successIndex, i as isFailureStage, n as SUCCESS_FLOW_STAGES, t as LIFECYCLE_LABELS } from "./lifecycle-DdjHZIfU.mjs";
import { p as cn } from "./api-Ch8UWRqP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/lifecycle-strip-BArd95Av.js
var import_jsx_runtime = require_jsx_runtime();
function LifecycleStrip({ stage }) {
	if (isFailureStage(stage)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-lg border border-fail/40 bg-fail/10 px-3 py-2 text-xs text-fail",
		children: LIFECYCLE_LABELS[stage]
	});
	const current = successIndex(stage);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
		className: "flex flex-wrap gap-1",
		children: SUCCESS_FLOW_STAGES.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
			className: cn("rounded-full border px-2 py-1 text-[10px] uppercase tracking-wide", index < current && "border-pass/30 text-pass", index === current && "border-accent text-accent", index > current && "border-border text-subtle"),
			children: LIFECYCLE_LABELS[item]
		}, item))
	});
}
//#endregion
export { LifecycleStrip as t };
