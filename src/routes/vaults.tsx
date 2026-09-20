import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { EvidenceChip } from "@/components/optn/evidence-chip";
import { LiveSetupCallout } from "@/components/optn/live-setup-callout";
import { attachVault, getCurrentSession, loadVaults } from "@/lib/optn/api";
import { formatBch, formatSats } from "@/lib/optn/money";
import { NETWORK_CONFIG } from "@/lib/optn/networks";
import { ExternalLink, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/vaults")({ component: VaultsPage });

function VaultsPage() {
  const client = useQueryClient();
  const sessionQuery = useQuery({ queryKey: ["session"], queryFn: () => getCurrentSession() });
  const vaultsQuery = useQuery({
    queryKey: ["vaults"],
    queryFn: () => loadVaults(),
    refetchInterval: 30_000,
  });
  const [txid, setTxid] = useState("");
  const [vout, setVout] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const attach = useMutation({
    mutationFn: () => attachVault({ data: { txid, vout: Number(vout) } }),
    onSuccess: async () => {
      setError(null);
      await client.invalidateQueries({ queryKey: ["vaults"] });
    },
    onError: (err: Error) => setError(err.message),
  });
  const config = sessionQuery.data?.config;
  if (!config || !vaultsQuery.data) {
    return <p className="p-8 text-muted">Loading vaults…</p>;
  }
  return (
    <AppShell config={config} session={sessionQuery.data?.session ?? null}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Vaults and UTXOs</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Each row is an outpoint, not an account balance. BCH value and token state are separate
            fields.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => void vaultsQuery.refetch()}
          disabled={vaultsQuery.isFetching}
        >
          <RefreshCw className={vaultsQuery.isFetching ? "size-4 animate-spin" : "size-4"} />
          Refresh UTXOs
        </Button>
      </div>

      <Card className="mt-5" data-tour="wallet-utxos">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Live Chipnet source</CardTitle>
            <p className="mt-2 font-mono text-xs text-muted">
              {vaultsQuery.data.chain.provider} · {vaultsQuery.data.chain.source}
            </p>
          </div>
          <Badge tone={vaultsQuery.data.chain.reachable ? "pass" : "fail"}>
            {vaultsQuery.data.chain.reachable
              ? `Height ${vaultsQuery.data.chain.height?.toLocaleString() ?? "unknown"}`
              : "Provider unavailable"}
          </Badge>
        </div>
        {vaultsQuery.data.wallet ? (
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-muted">Wallet balance</dt>
              <dd className="mt-1 font-mono text-lg">
                {formatBch(vaultsQuery.data.wallet.balanceSatoshis)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Unspent outputs</dt>
              <dd className="mt-1 font-mono text-lg">{vaultsQuery.data.wallet.utxoCount}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Token-bearing outputs</dt>
              <dd className="mt-1 font-mono text-lg">{vaultsQuery.data.wallet.tokenUtxoCount}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-4 text-sm text-muted">
            <Link to="/wallet" className="text-accent hover:underline">
              Connect OPTN Wallet
            </Link>{" "}
            to query this wallet’s real Chipnet script hash and UTXOs.
          </p>
        )}
        {vaultsQuery.data.chain.error ? (
          <p className="mt-3 text-sm text-fail">
            Chain read failed: {vaultsQuery.data.chain.error}
          </p>
        ) : null}
        {vaultsQuery.data.walletError ? (
          <p className="mt-3 text-sm text-fail">
            Wallet lookup failed: {vaultsQuery.data.walletError}
          </p>
        ) : null}
      </Card>
      <div className="mt-5 grid gap-3">
        {vaultsQuery.data.vaults.map((vault) => (
          <Card key={vault.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>{vault.name}</CardTitle>
                <p className="mt-1 font-mono text-xs text-muted">
                  {vault.state.outpoint.txid}:{vault.state.outpoint.vout}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge tone={vault.reviewed ? "pass" : "fail"}>
                  {vault.reviewed ? "Reviewed" : "Unreviewed"}
                </Badge>
                <Badge tone={vault.liveSpendEnabled ? "accent" : "demo"}>
                  {vault.liveSpendEnabled ? "Live spend" : "Attach-only / demo"}
                </Badge>
                <Badge tone={vault.onChainRecipientEnforced ? "pass" : "fail"}>
                  {vault.onChainRecipientEnforced ? "Recipient enforced" : "Recipient not on-chain"}
                </Badge>
              </div>
            </div>
            <dl className="mt-4 grid gap-2 text-sm md:grid-cols-2">
              <div>
                <dt className="text-xs text-muted">BCH value</dt>
                <dd className="font-mono tabular-nums">
                  {formatBch(vault.state.valueSatoshis)} · {formatSats(vault.state.valueSatoshis)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Token</dt>
                <dd className="font-mono text-xs">
                  category {vault.state.token.categoryHex ?? "none"} · amount{" "}
                  {vault.state.token.amount} · NFT {vault.state.token.nftCapability}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Locking type</dt>
                <dd>{vault.state.lockingType}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Artifact</dt>
                <dd className="font-mono text-xs">{vault.artifactHash.slice(0, 20)}…</dd>
              </div>
            </dl>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {vault.evidence.map((item) => (
                <EvidenceChip key={item} level={item} />
              ))}
            </div>
            <ul className="mt-3 space-y-1 text-xs text-subtle">
              {vault.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </Card>
        ))}
        {vaultsQuery.data.vaults.length === 0 ? (
          <LiveSetupCallout
            title="No covenant vault attached"
            description="The discovered P2PKH and token UTXOs remain ordinary wallet outputs; they are not eligible vaults. After recipient enrollment, fund the reviewed BoundedRelease P2SH32 artifact externally and attach the exact provider-proven outpoint."
          />
        ) : null}
      </div>

      <Card className="mt-4">
        <CardTitle>Discovered UTXOs</CardTitle>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs text-muted">
              <tr>
                <th className="pb-2">Outpoint</th>
                <th className="pb-2">BCH</th>
                <th className="pb-2">Token</th>
                <th className="pb-2">Lock</th>
                <th className="pb-2">Confirmations</th>
                <th className="pb-2">Evidence</th>
              </tr>
            </thead>
            <tbody>
              {vaultsQuery.data.utxos.map((utxo) => (
                <tr
                  key={`${utxo.outpoint.txid}:${utxo.outpoint.vout}`}
                  className="border-t border-border"
                >
                  <td className="py-2 font-mono text-xs">
                    <a
                      href={NETWORK_CONFIG[config.network].explorerTx(utxo.outpoint.txid)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-accent hover:underline"
                    >
                      {utxo.outpoint.txid.slice(0, 10)}…:{utxo.outpoint.vout}
                      <ExternalLink className="size-3" aria-hidden="true" />
                    </a>
                  </td>
                  <td className="py-2 tabular-nums">{formatBch(utxo.valueSatoshis)}</td>
                  <td className="py-2 font-mono text-xs">{utxo.token.categoryHex ?? "none"}</td>
                  <td className="py-2">{utxo.lockingType}</td>
                  <td className="py-2 font-mono text-xs">{utxo.confirmations}</td>
                  <td className="py-2">{utxo.chainEvidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {vaultsQuery.data.utxos.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            {sessionQuery.data?.session
              ? "The connected wallet has no provider-reported UTXOs, or the lookup could not be completed."
              : "Connect a wallet to load its UTXOs."}
          </p>
        ) : null}
      </Card>

      <Card className="mt-4">
        <CardTitle>Attach existing vault</CardTitle>
        <p className="mt-2 text-sm text-muted">
          The dashboard will not claim it deployed or funded a vault. Attachment requires a Chipnet
          provider proof that the outpoint is unspent, token-free, and matches the reviewed
          BoundedRelease P2SH32 lock. An indexer hit alone is not live spend.
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_100px_auto]">
          <div>
            <Label>txid</Label>
            <Input value={txid} onChange={(e) => setTxid(e.target.value)} />
          </div>
          <div>
            <Label>vout</Label>
            <Input value={vout} onChange={(e) => setVout(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              onClick={() => attach.mutate()}
              disabled={!sessionQuery.data?.session}
            >
              Attach
            </Button>
          </div>
        </div>
        {error ? <p className="mt-2 text-sm text-fail">{error}</p> : null}
      </Card>
    </AppShell>
  );
}
