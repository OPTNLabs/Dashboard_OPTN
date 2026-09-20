import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { getCurrentSession, loadCapabilities } from "@/lib/optn/api";

export const Route = createFileRoute("/capabilities")({ component: CapabilitiesPage });

function CapabilitiesPage() {
  const sessionQuery = useQuery({ queryKey: ["session"], queryFn: () => getCurrentSession() });
  const caps = useQuery({ queryKey: ["caps"], queryFn: () => loadCapabilities() });
  const config = sessionQuery.data?.config;
  if (!config || !caps.data) return <p className="p-8 text-muted">Loading capabilities…</p>;
  return (
    <AppShell config={config} session={sessionQuery.data?.session ?? null}>
      <h1 className="text-2xl font-medium tracking-tight">Agent capabilities</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        An automation client may read state, propose, explain, and request approval. It does not receive keys, a
        transaction builder for arbitrary outputs, or broadcast permission by default.
      </p>
      <Card className="mt-5">
        <CardTitle>Grants</CardTitle>
        <ul className="mt-3 space-y-2">
          {caps.data.grants.map((grant) => (
            <li key={grant.id} className="flex items-start justify-between gap-3 text-sm">
              <span>
                <span className="font-mono">{grant.id}</span>
                <span className="mt-0.5 block text-xs text-subtle">{grant.reason}</span>
              </span>
              <Badge tone={grant.granted ? "pass" : "fail"}>{grant.granted ? "granted" : "denied"}</Badge>
            </li>
          ))}
        </ul>
      </Card>
    </AppShell>
  );
}
