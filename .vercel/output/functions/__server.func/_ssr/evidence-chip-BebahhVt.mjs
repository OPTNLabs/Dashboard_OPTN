import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as Badge } from "./api-Ch8UWRqP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/evidence-chip-BebahhVt.js
var import_jsx_runtime = require_jsx_runtime();
var TONE = {
	DESIGNED: "neutral",
	FIXTURE: "demo",
	SIMULATED: "warn",
	LOCALLY_VM_VALIDATED: "accent",
	SIGNED_BUT_UNBROADCAST: "warn",
	PROVIDER_ACCEPTED: "accent",
	MEMPOOL_OBSERVED: "accent",
	CONFIRMED: "pass",
	SUCCESSOR_VERIFIED: "pass",
	FAILED: "fail",
	UNKNOWN: "neutral"
};
function EvidenceChip({ level }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		tone: TONE[level],
		children: level.replaceAll("_", " ")
	});
}
//#endregion
export { EvidenceChip as t };
