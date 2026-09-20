import type { CapabilityGrant, PublicConfig, Role } from "./types.ts";

const ALL: CapabilityGrant["id"][] = [
  "plan.read",
  "vault.read",
  "proposal.create",
  "proposal.explain",
  "proposal.request_approval",
  "transaction.build",
  "transaction.verify",
  "transaction.broadcast",
];

export function capabilitiesFor(role: Role | null, config: PublicConfig): CapabilityGrant[] {
  const signedIn = Boolean(role);
  const canMutate = role === "owner" || role === "operator" || role === "approver";
  const canPropose = role === "owner" || role === "operator";
  return ALL.map((id) => {
    if (!signedIn) {
      return { id, granted: false, reason: "No authenticated operator session" };
    }
    if (id === "plan.read" || id === "vault.read" || id === "proposal.explain") {
      return { id, granted: true, reason: "Read access" };
    }
    if (id === "proposal.create" || id === "proposal.request_approval") {
      return {
        id,
        granted: canPropose,
        reason: canPropose ? "Operator may create bounded proposals" : "Role cannot create proposals",
      };
    }
    if (id === "transaction.build" || id === "transaction.verify") {
      return {
        id,
        granted: canMutate,
        reason: canMutate ? "Build and verify are available after approval" : "Role cannot build transactions",
      };
    }
    return {
      id,
      granted: canPropose && config.broadcastConfigured && config.liveSpendAvailable,
      reason: config.broadcastConfigured
        ? config.liveSpendAvailable
          ? "Broadcast is a separate restricted capability"
          : "No live vault outpoint is attached"
        : "Broadcast provider is not configured; demo mode will not fake a Chipnet result",
    };
  });
}
