import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { p as cn } from "./api-Ch8UWRqP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/input-D-klI4jJ.js
var import_jsx_runtime = require_jsx_runtime();
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("h-10 w-full rounded-md border border-border bg-bg px-3 text-sm text-fg placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40", className),
		...props
	});
}
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("mb-1.5 block text-xs font-medium text-muted", className),
		...props
	});
}
//#endregion
export { Label as n, Input as t };
