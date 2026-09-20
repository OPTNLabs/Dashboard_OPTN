import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as UsersRound, j as Compass, x as Landmark } from "../_libs/lucide-react.mjs";
import { i as Card, o as CardTitle, r as Button } from "./api-Ch8UWRqP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/live-setup-callout-CZNqgy2x.js
var import_jsx_runtime = require_jsx_runtime();
function LiveSetupCallout({ title = "Complete the control-plane setup", description = "Live Chipnet records stay empty until the connected wallets establish an organization, enroll a payout recipient, and attach a provider-proven covenant outpoint." }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "border-dashed",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-start justify-between gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-2xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: title }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-6 text-muted",
						children: description
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
						className: "mt-4 grid gap-2 text-sm text-muted md:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsersRound, { className: "size-4 text-accent" }), "1. Create organization"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "size-4 text-accent" }), "2. Fund and attach vault"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Compass, { className: "size-4 text-accent" }), "3. Publish a plan"]
							})
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "secondary",
					size: "sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/organization",
						children: "Open setup"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "outline",
					size: "sm",
					onClick: () => window.dispatchEvent(new Event("optn:open-mocknet-walkthrough")),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Compass, { className: "size-4" }), "Run Mocknet demo"]
				})]
			})]
		})
	});
}
//#endregion
export { LiveSetupCallout as t };
