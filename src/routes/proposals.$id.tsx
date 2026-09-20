import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { EvidenceChip } from "@/components/optn/evidence-chip";
import { LifecycleStrip } from "@/components/optn/lifecycle-strip";
import {
  approvalPayload,
  approveProposal,
  broadcastProposal,
  buildProposalTx,
  getCurrentSession,
  loadProposal,
  reconcileBroadcast,
  refreshProposalStatus,
  signingPayload,
  simulateLocalSign,
  verifySignedTx,
} from "@/lib/optn/api";
import { formatBch, formatSats } from "@/lib/optn/money";

export const Route = createFileRoute("/proposals/$id")({ component: ProposalDetail });

function ProposalDetail() {
  const { id } = Route.useParams();
  const client = useQueryClient();
  const sessionQuery = useQuery({ queryKey: ["session"], queryFn: () => getCurrentSession() });
  const query = useQuery({ queryKey: ["proposal", id], queryFn: () => loadProposal({ data: { id } }) });
  const config = sessionQuery.data?.config;
  const session = sessionQuery.data?.session ?? null;
  const [pairingUri, setPairingUri] = useState<string | null>(null);
  const [explicitConfirm, setExplicitConfirm] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const refresh = () => client.invalidateQueries({ queryKey: ["proposal", id] });
  const demoMode = session?.authMethod === "demo" && config?.mode === "demo";

  const approveDemo = useMutation({
    mutationFn: () => approveProposal({ data: { id, demo: true } }),
    onSuccess: refresh,
  });
  const approveWallet = useMutation({
    mutationFn: async () => {
      if (!config?.walletConnectProjectId) throw new Error("WalletConnect is not configured");
      const payload = await approvalPayload({ data: { id } });
      const { cachedLoginHandle, connectWalletConnectLogin } = await import("@/lib/optn/wallet-connect");
      let handle = cachedLoginHandle();
      if (!handle || handle.account !== session?.account) {
        handle = await connectWalletConnectLogin({
          projectId: config.walletConnectProjectId,
          network: config.network,
          metadataUrl: window.location.origin,
          onUri: setPairingUri,
        });
      }
      setPairingUri(null);
      const signature = await handle.signMessage(payload.message);
      return approveProposal({ data: { id, signature } });
    },
    onSuccess: refresh,
  });
  const build = useMutation({
    mutationFn: () => buildProposalTx({ data: { id } }),
    onSuccess: refresh,
  });
  const simulate = useMutation({
    mutationFn: () => simulateLocalSign({ data: { id } }),
    onSuccess: refresh,
  });
  const signWallet = useMutation({
    mutationFn: async () => {
      if (!config?.walletConnectProjectId) throw new Error("WalletConnect is not configured");
      const payload = await signingPayload({ data: { id } });
      const { cachedSigningHandle, connectWalletConnectSigning } = await import("@/lib/optn/wallet-connect");
      let handle = cachedSigningHandle();
      if (!handle || handle.account !== session?.account) {
        handle = await connectWalletConnectSigning({
          projectId: config.walletConnectProjectId,
          network: config.network,
          metadataUrl: window.location.origin,
          onUri: setPairingUri,
        });
      }
      setPairingUri(null);
      const signedTxHex = await handle.signTransaction(payload.request);
      return verifySignedTx({ data: { id, signedTxHex } });
    },
    onSuccess: refresh,
  });
  const broadcast = useMutation({
    mutationFn: () => broadcastProposal({ data: { id, explicitConfirm: true } }),
    onSuccess: refresh,
  });
  const observe = useMutation({
    mutationFn: () => refreshProposalStatus({ data: { id } }),
    onSuccess: refresh,
  });
  const reconcile = useMutation({
    mutationFn: () => reconcileBroadcast({ data: { id } }),
    onSuccess: refresh,
  });

  if (!config || !query.data) return <p className="p-8 text-muted">Loading proposal…</p>;
  const { proposal, vault } = query.data;
  const err =
    localError ??
    (approveDemo.error instanceof Error ? approveDemo.error.message : null) ??
    (approveWallet.error instanceof Error ? approveWallet.error.message : null) ??
    (build.error instanceof Error ? build.error.message : null) ??
    (simulate.error instanceof Error ? simulate.error.message : null) ??
    (signWallet.error instanceof Error ? signWallet.error.message : null) ??
    (broadcast.error instanceof Error ? broadcast.error.message : null) ??
    (observe.error instanceof Error ? observe.error.message : null) ??
    (reconcile.error instanceof Error ? reconcile.error.message : null) ??
    proposal.failureReason;
  const canBroadcast = proposal.stage === "signed-vm-validated" && Boolean(proposal.signedTxHex);
  const canWalletSign =
    (proposal.stage === "unsigned-built" || proposal.stage === "signing-requested") && Boolean(proposal.unsignedTxHex);

  return (
    <AppShell config={config} session={session}>
      <Link to="/proposals" className="text-xs text-accent hover:underline">
        All proposals
      </Link>
      <p className="mt-3 font-mono text-xs text-subtle">{proposal.id}</p>
      <h1 className="mt-1 text-2xl font-medium tracking-tight">Proposal review</h1>
      <div className="mt-3">
        <LifecycleStrip stage={proposal.stage} />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {proposal.evidence.map((item) => (
          <EvidenceChip key={item} level={item} />
        ))}
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <Card>
          <CardTitle>Exact intent</CardTitle>
          <dl className="mt-3 space-y-1.5 text-sm">
            <Row label="Network" value={proposal.network} />
            <Row label="WalletConnect chain" value={proposal.walletConnectChainId} />
            <Row label="Source" value={`${proposal.sourceOutpoint.txid.slice(0, 16)}…:${proposal.sourceOutpoint.vout}`} />
            <Row label="Payment" value={`${formatBch(proposal.amountSatoshis)} · ${formatSats(proposal.amountSatoshis)}`} />
            <Row label="Fee" value={`${proposal.feeSatoshis} sats / cap ${proposal.feeCapSatoshis}`} />
            <Row label="Artifact" value={proposal.artifactHash.slice(0, 20)} />
            <Row label="Intent hash" value={proposal.intentHash} />
            <Row label="Policy id" value={proposal.policyId} />
          </dl>
        </Card>
        <Card>
          <CardTitle>Outputs in index order</CardTitle>
          <div className="mt-3 space-y-2">
            {proposal.preview.outputs.map((output) => (
              <div key={output.index} className="rounded-md border border-border bg-surface-2 p-3 text-sm">
                <div className="flex justify-between">
                  <span>
                    #{output.index} {output.role}
                  </span>
                  <span className="tabular-nums">{formatBch(output.valueSatoshis)}</span>
                </div>
                <p className="mt-1 font-mono text-[11px] text-subtle">{output.lockingBytecodeHex.slice(0, 40)}…</p>
              </div>
            ))}
          </div>
          <p className="mt-3 font-mono text-xs text-muted">{proposal.preview.conservationLine}</p>
        </Card>
      </div>

      <Card className="mt-3">
        <CardTitle>Policy and covenant checks</CardTitle>
        <ul className="mt-3 grid gap-2 md:grid-cols-2">
          {[...proposal.policyDecision.rules, ...proposal.covenantDecision.rules].map((rule) => (
            <li key={`${rule.id}-${rule.label}`} className="flex items-start justify-between gap-2 text-sm">
              <span>
                {rule.label}
                <span className="mt-0.5 block text-[11px] text-subtle">{rule.enforcement}</span>
              </span>
              <Badge tone={rule.pass ? "pass" : "fail"}>{rule.pass ? "pass" : "fail"}</Badge>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mt-3">
        <CardTitle>
          Off-chain approval policy {proposal.approvals.length}/{proposal.threshold}
        </CardTitle>
        <p className="mt-2 text-xs text-muted">
          2-of-3 is an off-chain control-plane gate. BoundedRelease enforces one operator CHECKSIG on-chain, not a
          quorum.
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          {proposal.approvals.map((item) => (
            <li key={item.account} className="flex justify-between gap-3">
              <span className="font-mono text-xs">{item.account}</span>
              <EvidenceChip level={item.evidence} />
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          {demoMode ? (
            <Button onClick={() => approveDemo.mutate()} disabled={!session}>
              Demo approve as {session?.role ?? "operator"}
            </Button>
          ) : (
            <Button
              onClick={() => {
                setLocalError(null);
                approveWallet.mutate();
              }}
              disabled={!session || !config.walletConnectConfigured}
            >
              WalletConnect approve
            </Button>
          )}
          <Button variant="secondary" onClick={() => build.mutate()} disabled={proposal.stage !== "approved"}>
            Build unsigned tx
          </Button>
          {demoMode ? (
            <Button variant="secondary" onClick={() => simulate.mutate()} disabled={!proposal.unsignedTxHex}>
              Local VM sign (DEMO)
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => {
                setLocalError(null);
                signWallet.mutate();
              }}
              disabled={!canWalletSign || !config.walletConnectConfigured}
            >
              WalletConnect sign tx
            </Button>
          )}
        </div>
        {pairingUri ? (
          <p className="mt-3 break-all font-mono text-[11px] text-muted">Pairing URI {pairingUri}</p>
        ) : null}
        <div className="mt-4 rounded-md border border-border bg-surface-2 p-3">
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={explicitConfirm}
              onChange={(e) => setExplicitConfirm(e.target.checked)}
            />
            <span>
              I confirm this exact signed transaction should be submitted to Chipnet. Broadcast stays blocked until the
              proposal is <span className="font-mono">signed-vm-validated</span>.
            </span>
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="danger"
              onClick={() => {
                if (!explicitConfirm) {
                  setLocalError("Broadcast requires the explicit confirmation checkbox.");
                  return;
                }
                setLocalError(null);
                broadcast.mutate();
              }}
              disabled={!canBroadcast || !explicitConfirm}
            >
              Broadcast
            </Button>
            <Button variant="ghost" onClick={() => observe.mutate()} disabled={!proposal.broadcastTxid}>
              Refresh mempool / confirmation
            </Button>
            {proposal.stage === "broadcast-uncertain" ? (
              <Button variant="ghost" onClick={() => reconcile.mutate()} disabled={!proposal.signedTxid}>
                Reconcile provider state
              </Button>
            ) : null}
          </div>
        </div>
        <p className="mt-3 text-xs text-subtle">
          Demo local VM never becomes broadcast-eligible. Live spend needs a WalletConnect <span className="font-mono">bch_signTransaction</span> session, CashVM, provider preflight, and a live-spend vault. Switch operators in Wallet to satisfy the off-chain 2-of-3 policy.
        </p>
        {vault ? (
          <p className="mt-2 text-xs text-muted">
            VM {proposal.covenantDecision.vmAttempted ? (proposal.covenantDecision.vmValid ? "valid" : "invalid") : "not run"}{" "}
            {proposal.covenantDecision.vmError ?? ""} · live spend {vault.liveSpendEnabled ? "enabled" : "disabled"}
          </p>
        ) : null}
        {proposal.signedTxid ? (
          <p className="mt-2 font-mono text-xs text-muted">
            signed txid {proposal.signedTxid} (
            {proposal.stage === "signed-vm-validated" ? "wallet-signed, unbroadcast" : "unbroadcast"})
          </p>
        ) : null}
        {proposal.broadcastTxid ? (
          <p className="mt-2 font-mono text-xs text-muted">broadcast txid {proposal.broadcastTxid}</p>
        ) : null}
        {err ? <p className="mt-2 text-sm text-fail">{err}</p> : null}
      </Card>
      <Card className="mt-3">
        <CardTitle>Canonical intent</CardTitle>
        <pre className="mt-3 max-h-80 overflow-auto font-mono text-[11px] text-muted">{proposal.canonicalIntent}</pre>
      </Card>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="max-w-[70%] truncate text-right font-mono text-xs">{value}</dd>
    </div>
  );
}
