import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LiveSetupCallout } from "@/components/optn/live-setup-callout";
import { getCurrentSession, loadPlans } from "@/lib/optn/api";
import { formatBch } from "@/lib/optn/money";

export const Route = createFileRoute("/plans")({ component: PlansPage });

function PlansPage() {
  const sessionQuery = useQuery({ queryKey: ["session"], queryFn: () => getCurrentSession() });
  const plansQuery = useQuery({ queryKey: ["plans"], queryFn: () => loadPlans() });
  const config = sessionQuery.data?.config;
  if (!config || !plansQuery.data) return <p className="p-8 text-muted">Loading plans…</p>;
  return (
    <AppShell config={config} session={sessionQuery.data?.session ?? null}>
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Control Plans</h1>
          <p className="mt-1 text-sm text-muted">
            Published versions are immutable. Edits create a new policy id.
          </p>
        </div>
        <Link to="/studio" className="text-sm text-accent hover:underline">
          Open studio
        </Link>
      </div>
      <div className="grid gap-3">
        {plansQuery.data.plans.length === 0 ? (
          <LiveSetupCallout title="No live control plan yet" />
        ) : null}
        {plansQuery.data.plans.map((plan) => (
          <Card key={plan.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-medium">{plan.name}</h2>
                <p className="mt-1 max-w-xl text-sm text-muted">{plan.description}</p>
              </div>
              <Badge tone={plan.status === "active" ? "pass" : "warn"}>{plan.status}</Badge>
            </div>
            <dl className="mt-4 grid gap-2 text-xs text-muted md:grid-cols-3">
              <div>
                Policy id
                <p className="font-mono text-fg">{plan.policyId.slice(0, 16)}…</p>
              </div>
              <div>
                Per payment
                <p className="text-fg">{formatBch(plan.limits.perPaymentSatoshis)}</p>
              </div>
              <div>
                Quorum
                <p className="text-fg">
                  {plan.governance.threshold} of {plan.governance.authorizedAccounts.length}
                </p>
              </div>
            </dl>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
