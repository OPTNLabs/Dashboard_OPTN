//#region node_modules/.nitro/vite/services/ssr/assets/lifecycle-DdjHZIfU.js
var SUCCESS_FLOW = [
	"intent",
	"policy-valid",
	"approved",
	"unsigned-built",
	"locally-vm-validated",
	"signing-requested",
	"signed",
	"signed-vm-validated",
	"broadcast-requested",
	"provider-accepted",
	"mempool-observed",
	"confirmed",
	"successor-verified",
	"finalized"
];
var FAILURE_STAGES = [
	"rejected-by-policy",
	"approval-expired",
	"stale-input",
	"wallet-rejected",
	"wallet-mismatched",
	"vm-invalid",
	"provider-rejected",
	"broadcast-uncertain",
	"mempool-dropped",
	"reorg",
	"failed"
];
var LIFECYCLE_LABELS = {
	intent: "Intent",
	"policy-valid": "Policy valid",
	approved: "Approved",
	"unsigned-built": "Unsigned built",
	"locally-vm-validated": "Locally VM validated",
	"signing-requested": "Signing requested",
	signed: "Signed",
	"signed-vm-validated": "Signed VM validated",
	"broadcast-requested": "Broadcast requested",
	"provider-accepted": "Provider accepted",
	"mempool-observed": "Mempool observed",
	confirmed: "Confirmed",
	"successor-verified": "Successor verified",
	finalized: "Finalized",
	"rejected-by-policy": "Rejected by policy",
	"approval-expired": "Approval expired",
	"stale-input": "Stale input",
	"wallet-rejected": "Wallet rejected",
	"wallet-mismatched": "Wallet mismatched",
	"vm-invalid": "VM invalid",
	"provider-rejected": "Provider rejected",
	"broadcast-uncertain": "Broadcast uncertain",
	"mempool-dropped": "Mempool dropped",
	reorg: "Reorg",
	failed: "Failed"
};
function successIndex(stage) {
	return SUCCESS_FLOW.indexOf(stage);
}
function isFailureStage(stage) {
	return FAILURE_STAGES.includes(stage);
}
function canTransition(from, to) {
	if (from === to) return true;
	if (isFailureStage(to)) return true;
	const fromIndex = SUCCESS_FLOW.indexOf(from);
	const toIndex = SUCCESS_FLOW.indexOf(to);
	if (fromIndex < 0 || toIndex < 0) return false;
	if (from === "unsigned-built" && to === "locally-vm-validated") return true;
	if (from === "unsigned-built" && to === "signing-requested") return true;
	if (from === "locally-vm-validated" && to === "signing-requested") return true;
	if (from === "provider-accepted" && to === "confirmed") return true;
	if (from === "mempool-observed" && to === "successor-verified") return false;
	return toIndex === fromIndex + 1 || from === "policy-valid" && to === "approved";
}
function assertTransition(from, to) {
	if (!canTransition(from, to)) throw new Error(`Illegal lifecycle transition: ${from} → ${to}`);
}
var SUCCESS_FLOW_STAGES = SUCCESS_FLOW;
//#endregion
export { successIndex as a, isFailureStage as i, SUCCESS_FLOW_STAGES as n, assertTransition as r, LIFECYCLE_LABELS as t };
