export type ReservationStatus = "reserved" | "spent";

export type ReservationRecord = {
  proposalId: string;
  status: ReservationStatus;
};

export function reservationConflict(
  existing: ReservationRecord | null | undefined,
  proposalId: string,
): { ok: true } | { ok: false; holder: string } {
  if (!existing) return { ok: true };
  if (existing.status === "spent") return { ok: false, holder: existing.proposalId };
  if (existing.status === "reserved" && existing.proposalId !== proposalId) {
    return { ok: false, holder: existing.proposalId };
  }
  return { ok: true };
}

export type BroadcastLockRecord = {
  proposalId: string;
  txid: string | null;
};

export function broadcastLockDecision(
  existing: BroadcastLockRecord | null | undefined,
): "acquire" | "duplicate" | "in-flight" {
  if (!existing) return "acquire";
  if (existing.txid) return "duplicate";
  return "in-flight";
}
