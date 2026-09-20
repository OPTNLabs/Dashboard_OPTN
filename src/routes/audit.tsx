import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { EvidenceChip } from "@/components/optn/evidence-chip";
import { getCurrentSession, loadAudit } from "@/lib/optn/api";

export const Route = createFileRoute("/audit")({ component: AuditPage });

function AuditPage() {
  const sessionQuery = useQuery({ queryKey: ["session"], queryFn: () => getCurrentSession() });
  const auditQuery = useQuery({ queryKey: ["audit"], queryFn: () => loadAudit() });
  const config = sessionQuery.data?.config;
  if (!config || !auditQuery.data) return <p className="p-8 text-muted">Loading audit…</p>;
  return (
    <AppShell config={config} session={sessionQuery.data?.session ?? null}>
      <h1 className="text-2xl font-medium tracking-tight">Audit lineage</h1>
      <p className="mt-1 text-sm text-muted">
        Hash-chained application evidence. Funding provenance is accounting metadata and does not authorize later
        spends.
      </p>
      <div className="mt-5 space-y-2">
        {auditQuery.data.events.map((event) => (
          <Card key={event.id} className="p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm">{event.summary}</p>
                <p className="mt-1 font-mono text-[11px] text-subtle">
                  #{event.seq} · {event.eventHash.slice(0, 16)} · prev {event.prevHash.slice(0, 10)}
                </p>
              </div>
              <EvidenceChip level={event.evidence} />
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
