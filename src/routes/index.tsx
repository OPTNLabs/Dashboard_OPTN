import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EvidenceChip } from "@/components/optn/evidence-chip";
import { LifecycleStrip } from "@/components/optn/lifecycle-strip";
import { LiveSetupCallout } from "@/components/optn/live-setup-callout";
import { loadOverview } from "@/lib/optn/api";
import { isFailureStage, successIndex } from "@/lib/optn/lifecycle";
import { formatBch, parseSatoshis, percentConsumed } from "@/lib/optn/money";
import { Blocks, RefreshCw, Radio, WalletCards } from "lucide-react";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const query = useQuery({
    queryKey: ["overview"],
    queryFn: () => loadOverview(),
    refetchInterval: 30_000,
  });
  if (query.isLoading || !query.data) {
    return (
      <AppShell
        config={{
          appName: "OPTN",
          network: "chipnet",
          mode: "demo",
          mainnetEnabled: false,
          mainnetDisabledReason: null,
          walletConnectConfigured: false,
          walletConnectProjectId: null,
          walletConnectChainId: "bch:bchtest",
          indexerConfigured: false,
          broadcastConfigured: false,
          liveSpendAvailable: false,
          unavailable: [],
        }}
        session={null}
      >
        <p className="text-muted">Loading control plane…</p>
      </AppShell>
    );
  }
  const {
    config,
    session,
    chain,
    wallet,
    walletError,
    vaults,
    organization,
    plans,
    proposals,
    events,
    totals,
  } = query.data;
  const vault = vaults[0];
  const plan = plans[0];
  const lineage = proposals.reduce((best, item) => {
    if (!best) return item;
    if (isFailureStage(best.stage) && !isFailureStage(item.stage)) return item;
    if (!isFailureStage(item.stage) && successIndex(item.stage) > successIndex(best.stage))
      return item;
    return best;
  }, proposals[0]);
  const remaining =
    plan != null
      ? (
          parseSatoshis(plan.limits.sessionAllowanceSatoshis) -
          parseSatoshis(plan.limits.sessionConsumedSatoshis)
        ).toString()
      : "0";
  return (
    <AppShell config={config} session={session}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Command center</p>
          <h1 className="mt-1 text-2xl font-medium tracking-tight">Treasury posture</h1>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void query.refetch()}
            disabled={query.isFetching}
          >
            <RefreshCw className={query.isFetching ? "size-4 animate-spin" : "size-4"} />
            Refresh chain
          </Button>
          <Button asChild variant="secondary">
            <Link to="/studio">Open Policy Studio</Link>
          </Button>
          <Button asChild>
            <Link to="/wallet">{session ? "Switch operator" : "Enter as operator"}</Link>
          </Button>
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-muted">
        {config.mode === "demo"
          ? "DEMO mode uses deterministic fixtures and the same policy, intent, and CashVM paths. It will not present a fixture as a Chipnet confirmation."
          : "Live chain reads come from the configured Chipnet provider. Plans and approvals remain local control-plane records; each spend still requires policy, quorum, wallet signature, VM validation, and explicit broadcast."}
      </div>

      <div data-tour="overview-chain" className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Card className="relative overflow-hidden">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-muted">Chipnet tip</p>
              <p className="mt-1 font-mono text-xl tabular-nums">
                {chain.height == null ? "Unavailable" : chain.height.toLocaleString()}
              </p>
            </div>
            <Blocks className="size-5 text-accent" aria-hidden="true" />
          </div>
          <p className="mt-2 truncate font-mono text-[11px] text-subtle">
            {chain.provider} · {chain.source}
          </p>
        </Card>
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-muted">Connected wallet</p>
              <p className="mt-1 font-mono text-xl tabular-nums">
                {wallet
                  ? formatBch(wallet.balanceSatoshis)
                  : session
                    ? "Unavailable"
                    : "Not connected"}
              </p>
            </div>
            <WalletCards className="size-5 text-accent" aria-hidden="true" />
          </div>
          <p className="mt-2 text-[11px] text-subtle">
            {wallet
              ? `${wallet.confirmedUtxoCount} confirmed UTXOs`
              : session
                ? "No provider-verified wallet balance"
                : "WalletConnect supplies the address at runtime"}
          </p>
        </Card>
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-muted">Wallet UTXOs</p>
              <p className="mt-1 font-mono text-xl tabular-nums">{wallet?.utxoCount ?? "—"}</p>
            </div>
            <Radio className="size-5 text-accent" aria-hidden="true" />
          </div>
          <p className="mt-2 text-[11px] text-subtle">
            {wallet
              ? `${wallet.tokenUtxoCount} token-bearing; BCH and tokens kept separate`
              : session
                ? "Wallet script hash lookup unavailable"
                : "Connect to query the wallet script hash"}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-muted">Attached covenant vaults</p>
          <p className="mt-1 font-mono text-xl tabular-nums">{vaults.length}</p>
          <p className="mt-2 text-[11px] text-subtle">
            {vaults.length > 0
              ? `${formatBch(totals.protectedBchSatoshis)} provider-observed`
              : "No provider-proven vault attached"}
          </p>
        </Card>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <Badge tone={chain.reachable ? "pass" : "fail"}>
          {chain.reachable
            ? `Live · ${chain.serverVersion ?? chain.provider}`
            : "Chain provider unavailable"}
        </Badge>
        <Badge>Pending approvals {totals.pendingApprovals}</Badge>
        <Badge tone={totals.blocked > 0 ? "fail" : "pass"}>
          Blocked proposals {totals.blocked}
        </Badge>
        {chain.latencyMs != null ? <Badge>{chain.latencyMs} ms read</Badge> : null}
      </div>
      {chain.error ? (
        <p className="mt-3 text-sm text-fail">Chain read failed: {chain.error}</p>
      ) : null}
      {walletError ? (
        <p className="mt-3 text-sm text-fail">Wallet lookup failed: {walletError}</p>
      ) : null}

      {vault ? (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>{vault.name}</CardTitle>
            <Badge
              tone={
                vault.onChainRecipientEnforced && vault.liveSpendEnabled
                  ? "pass"
                  : vault.onChainRecipientEnforced
                    ? "accent"
                    : "fail"
              }
            >
              {vault.onChainRecipientEnforced
                ? vault.liveSpendEnabled
                  ? "Recipient on-chain (live artifact matched)"
                  : "Recipient on-chain (reviewed fixture; live spend disabled)"
                : "Allowlist only"}
            </Badge>
          </CardHeader>
          <p className="font-mono text-xs text-muted">
            {vault.state.outpoint.txid.slice(0, 18)}…:{vault.state.outpoint.vout} ·{" "}
            {formatBch(vault.state.valueSatoshis)}
          </p>
          {plan ? (
            <p className="mt-2 text-xs text-subtle">
              Session remaining {formatBch(remaining)} ·{" "}
              {percentConsumed(
                plan.limits.sessionConsumedSatoshis,
                plan.limits.sessionAllowanceSatoshis,
              )}
              % consumed
              <span className="mt-1 block">
                Off-chain accounting only — not covenant-enforced and not atomically reserved.
              </span>
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {vault.evidence.map((item) => (
              <EvidenceChip key={item} level={item} />
            ))}
          </div>
          <div className="mt-4">
            <p className="mb-2 text-xs text-muted">Selected vault lineage</p>
            <LifecycleStrip stage={lineage?.stage ?? "intent"} />
          </div>
        </Card>
      ) : (
        <div className="mt-4">
          <LiveSetupCallout
            title="Live control plane is not funded yet"
            description={
              organization
                ? "The organization is recorded, but none of this wallet's discovered UTXOs matches the reviewed BoundedRelease P2SH32 covenant. Fund that exact artifact externally, then attach its outpoint here."
                : "The wallet and network data are live. Create a WalletConnect organization before preparing a recipient-bound covenant artifact and funding its exact P2SH32 lock."
            }
          />
        </div>
      )}

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <Card>
          <CardTitle>Recent evidence</CardTitle>
          {events.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {events.map((event) => (
                <li key={event.id} className="flex items-start justify-between gap-3 text-sm">
                  <div>
                    <p>{event.summary}</p>
                    <p className="font-mono text-[11px] text-subtle">
                      {event.eventHash.slice(0, 16)}…
                    </p>
                  </div>
                  <EvidenceChip level={event.evidence} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">No live control-plane events yet.</p>
          )}
        </Card>
        <Card>
          <CardTitle>Unavailable live steps</CardTitle>
          <ul className="mt-3 space-y-1.5 text-sm text-muted">
            {config.unavailable.map((item) => (
              <li key={item}>— {item}</li>
            ))}
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}
