import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getCurrentSession, loadProposals } from "@/lib/optn/api";

export const Route = createFileRoute("/approvals")({ component: ApprovalsPage });

function ApprovalsPage() {
  const sessionQuery = useQuery({ queryKey: ["session"], queryFn: () => getCurrentSession() });
  const proposalsQuery = useQuery({ queryKey: ["proposals"], queryFn: () => loadProposals() });
  const config = sessionQuery.data?.config;
  if (!config || !proposalsQuery.data) return <p className="p-8 text-muted">Loading approvals…</p>;
  const queue = proposalsQuery.data.proposals.filter(
    (item) => item.stage === "policy-valid" || item.stage === "approved" || item.approvals.length > 0,
  );
  return (
    <AppShell config={config} session={sessionQuery.data?.session ?? null}>
      <h1 className="text-2xl font-medium tracking-tight">Approval queue</h1>
      <p className="mt-1 text-sm text-muted">
        Approvals bind the exact intent hash (off-chain 2-of-3 policy, not an on-chain multisig). A changed output,
        policy, or outpoint invalidates them.
      </p>
      <div className="mt-5 grid gap-3">
        {queue.length === 0 ? <Card className="text-sm text-muted">Nothing waiting on a signature.</Card> : null}
        {queue.map((proposal) => (
          <Link key={proposal.id} to="/proposals/$id" params={{ id: proposal.id }}>
            <Card className="hover:border-accent/40">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-xs">{proposal.intentHash.slice(0, 24)}…</p>
                <Badge>
                  {proposal.approvals.length}/{proposal.threshold}
                </Badge>
              </div>
              <ul className="mt-2 text-xs text-muted">
                {proposal.approvals.map((item) => (
                  <li key={item.account}>
                    {item.account} · {item.at}
                  </li>
                ))}
              </ul>
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
