import type { EvidenceLevel } from "@/lib/optn/types";
import { Badge } from "@/components/ui/badge";

const TONE: Record<EvidenceLevel, "neutral" | "accent" | "pass" | "warn" | "fail" | "demo"> = {
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
  UNKNOWN: "neutral",
};

export function EvidenceChip({ level }: { level: EvidenceLevel }) {
  return <Badge tone={TONE[level]}>{level.replaceAll("_", " ")}</Badge>;
}
