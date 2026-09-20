import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  createProposal,
  getCurrentSession,
  loadPlans,
  loadProposals,
  runScenario,
} from "@/lib/optn/api";
import { formatBch } from "@/lib/optn/money";
import { SCENARIOS } from "@/lib/optn/fixtures";
import { LiveSetupCallout } from "@/components/optn/live-setup-callout";

export const Route = createFileRoute("/proposals/")({ component: ProposalsPage });

function ProposalsPage() {
  const client = useQueryClient();
  const sessionQuery = useQuery({ queryKey: ["session"], queryFn: () => getCurrentSession() });
  const proposalsQuery = useQuery({ queryKey: ["proposals"], queryFn: () => loadProposals() });
  const plansQuery = useQuery({ queryKey: ["plans"], queryFn: () => loadPlans() });
  const config = sessionQuery.data?.config;

  const create = useMutation({
    mutationFn: async () => {
      const plan = plansQuery.data?.plans[0];
      if (!plan) throw new Error("No plan");
      return createProposal({
        data: { planId: plan.id, routeId: 0, amountSatoshis: "2000000", feeSatoshis: "1000" },
      });
    },
    onSuccess: async () => client.invalidateQueries({ queryKey: ["proposals"] }),
  });

  const scenario = useMutation({
    mutationFn: (id: string) => runScenario({ data: { scenario: id } }),
    onSuccess: async () => client.invalidateQueries({ queryKey: ["proposals"] }),
  });

  if (!config || !proposalsQuery.data) return <p className="p-8 text-muted">Loading proposals…</p>;

  return (
    <AppShell config={config} session={sessionQuery.data?.session ?? null}>
      <div
        data-tour="proposal-flow"
        className="mb-4 flex flex-wrap items-end justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Allocation proposals</h1>
          <p className="mt-1 text-sm text-muted">
            Each proposal binds exact inputs, outputs, and an intent hash.
          </p>
        </div>
        <Button onClick={() => create.mutate()} disabled={!sessionQuery.data?.session}>
          New 0.02 BCH proposal
        </Button>
      </div>
      {config.mode === "demo" ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {SCENARIOS.map((item) => (
            <Button
              key={item.id}
              size="sm"
              variant="secondary"
              onClick={() => scenario.mutate(item.id)}
              disabled={!sessionQuery.data?.session}
            >
              {item.label}
            </Button>
          ))}
        </div>
      ) : null}
      {scenario.data ? (
        <p className="mb-3 text-sm text-muted">
          Scenario {scenario.data.scenario}:{" "}
          {scenario.data.proposal.failureReason ?? scenario.data.proposal.stage}
        </p>
      ) : null}
      <div className="grid gap-3">
        {proposalsQuery.data.proposals.length === 0 ? (
          config.mode === "demo" ? (
            <Card className="text-sm text-muted">
              No proposals yet. Authenticate, then create one or run a labelled scenario.
            </Card>
          ) : (
            <LiveSetupCallout title="No live allocation proposals yet" />
          )
        ) : null}
        {proposalsQuery.data.proposals.map((proposal) => (
          <Link
            key={proposal.id}
            to="/proposals/$id"
            params={{ id: proposal.id }}
            className="block"
          >
            <Card className="hover:border-accent/40">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-subtle">{proposal.id}</p>
                  <p className="mt-1 text-sm">
                    {formatBch(proposal.amountSatoshis)} →{" "}
                    {proposal.destinationAddress.slice(0, 22)}…
                  </p>
                </div>
                <Badge
                  tone={
                    proposal.stage.includes("reject") || proposal.stage === "failed"
                      ? "fail"
                      : "accent"
                  }
                >
                  {proposal.stage}
                </Badge>
              </div>
              <p className="mt-2 font-mono text-[11px] text-muted">
                intent {proposal.intentHash.slice(0, 20)}…
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
