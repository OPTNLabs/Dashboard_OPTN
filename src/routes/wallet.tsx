import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import {
  demoLogin,
  getCurrentSession,
  issueLoginChallenge,
  listDemoIdentities,
  logout,
  refreshOrganizationAccess,
  verifyLogin,
} from "@/lib/optn/api";
import { Check, Copy, QrCode } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/wallet")({ component: WalletPage });

function WalletPage() {
  const client = useQueryClient();
  const sessionQuery = useQuery({ queryKey: ["session"], queryFn: () => getCurrentSession() });
  const identities = useQuery({
    queryKey: ["demo-ids"],
    queryFn: () => listDemoIdentities(),
    enabled: sessionQuery.data?.config.mode === "demo",
  });
  const [error, setError] = useState<string | null>(null);
  const [pairingUri, setPairingUri] = useState<string | null>(null);
  const [pairingQr, setPairingQr] = useState<string | null>(null);
  const [pairingPending, setPairingPending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [accessMessage, setAccessMessage] = useState<string | null>(null);
  const config = sessionQuery.data?.config;
  const session = sessionQuery.data?.session ?? null;

  useEffect(() => {
    if (!pairingUri) {
      setPairingQr(null);
      return;
    }
    let active = true;
    void QRCode.toDataURL(pairingUri, {
      width: 208,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#080b10", light: "#ffffff" },
    })
      .then((dataUrl) => {
        if (active) setPairingQr(dataUrl);
      })
      .catch(() => {
        if (active)
          setError("Could not render the WalletConnect QR code. Copy the raw wc: URI instead.");
      });
    return () => {
      active = false;
    };
  }, [pairingUri]);

  const enter = useMutation({
    mutationFn: (account: string) => demoLogin({ data: { account } }),
    onSuccess: async () => {
      setError(null);
      await client.invalidateQueries();
    },
    onError: (err: Error) => setError(err.message),
  });

  const refreshAccess = useMutation({
    mutationFn: () => refreshOrganizationAccess(),
    onSuccess: async ({ session: refreshed, organization }) => {
      setAccessMessage(
        refreshed.role === "viewer"
          ? organization
            ? "This wallet is not an owner, operator, or approver in the current organization. Re-pair the owner wallet or accept an owner-issued invitation."
            : "No organization exists on this network yet. Create one from Organization with this WalletConnect wallet."
          : `Organization access restored as ${refreshed.role}.`,
      );
      await client.invalidateQueries();
    },
    onError: (err: Error) => setAccessMessage(err.message),
  });

  async function startWalletConnect() {
    setError(null);
    setCopied(false);
    setPairingUri(null);
    if (!config?.walletConnectProjectId) {
      setError(
        "WalletConnect is not configured. Demo login uses the same bch_signMessage verification path.",
      );
      return;
    }
    setPairingPending(true);
    try {
      const { connectWalletConnectLogin } = await import("@/lib/optn/wallet-connect");
      const handle = await connectWalletConnectLogin({
        projectId: config.walletConnectProjectId,
        network: config.network,
        metadataUrl: window.location.origin,
        onUri: setPairingUri,
      });
      const challenge = await issueLoginChallenge({
        data: { account: handle.account, network: config.network },
      });
      const signature = await handle.signMessage(challenge.message);
      await verifyLogin({
        data: {
          account: handle.account,
          nonce: challenge.nonce,
          signature,
          network: config.network,
        },
      });
      setPairingUri(null);
      await client.invalidateQueries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "WalletConnect failed");
    } finally {
      setPairingPending(false);
    }
  }

  async function copyPairingUri() {
    if (!pairingUri) return;
    try {
      await navigator.clipboard.writeText(pairingUri);
      setCopied(true);
    } catch {
      setError(
        "Could not copy the WalletConnect URI. Select the raw wc: URI below and copy it manually.",
      );
    }
  }

  if (!config) {
    return <p className="p-8 text-muted">Loading session…</p>;
  }

  return (
    <AppShell config={config} session={session}>
      <h1 className="text-2xl font-medium tracking-tight">Wallet connection</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        Login requests <span className="font-mono text-fg">bch_signMessage</span> only. Transaction
        signing uses a separate <span className="font-mono text-fg">bch_signTransaction</span>{" "}
        session after an approved proposal. The login session is never used to spend.
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>Current session</CardTitle>
          {session ? (
            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Account</dt>
                <dd className="font-mono text-xs">{session.account}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Role</dt>
                <dd>{session.role}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Auth</dt>
                <dd>{session.authMethod}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Network</dt>
                <dd>{session.network}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-3 text-sm text-muted">No authenticated operator.</p>
          )}
          {session ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {session.authMethod === "walletconnect" ? (
                <Button
                  variant="outline"
                  onClick={() => refreshAccess.mutate()}
                  disabled={refreshAccess.isPending}
                >
                  {refreshAccess.isPending ? "Refreshing access…" : "Refresh organization access"}
                </Button>
              ) : null}
              <Button
                variant="secondary"
                onClick={async () => {
                  const { disconnectWalletConnectCaches } =
                    await import("@/lib/optn/wallet-connect");
                  await disconnectWalletConnectCaches();
                  await logout();
                  await client.invalidateQueries();
                }}
              >
                Sign out / change wallet
              </Button>
            </div>
          ) : null}
          {accessMessage ? <p className="mt-3 text-sm text-muted">{accessMessage}</p> : null}
          {session?.authMethod === "walletconnect" && session.role === "viewer" ? (
            <p className="mt-3 text-xs leading-5 text-subtle">
              A refresh only restores a role already bound to this exact WalletConnect account; it
              cannot promote an unrelated wallet. Sign out to pair the organization owner wallet, or
              redeem an owner-issued operator/approver invitation.
            </p>
          ) : null}
        </Card>
        {config.mode === "demo" ? (
          <Card>
            <CardTitle>Demo operators</CardTitle>
            <p className="mt-2 text-xs text-muted">
              Synthetic Chipnet identities. The server signs a real BCH message with a test-vector
              key that never leaves the server.
            </p>
            <div className="mt-3 grid gap-2">
              {(identities.data ?? []).map((identity) => (
                <button
                  key={identity.account}
                  type="button"
                  onClick={() => enter.mutate(identity.account)}
                  className="flex items-center justify-between rounded-md border border-border bg-surface-2 px-3 py-2 text-left text-sm hover:border-accent/40"
                >
                  <span>
                    {identity.label}
                    <span className="mt-0.5 block font-mono text-[11px] text-subtle">
                      {identity.account}
                    </span>
                  </span>
                  <Badge>{identity.role}</Badge>
                </button>
              ))}
            </div>
          </Card>
        ) : null}
      </div>

      <Card className="mt-4" data-tour="wallet-connect">
        <CardTitle>WalletConnect (Chipnet)</CardTitle>
        <p className="mt-2 text-sm text-muted">
          Chain id <span className="font-mono">{config.walletConnectChainId}</span>. Login methods:
          bch_signMessage. Do not grant bch_signTransaction during login.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => void startWalletConnect()}
            disabled={pairingPending}
          >
            <QrCode className="size-4" aria-hidden="true" />
            {pairingPending ? "Waiting for OPTN Wallet…" : "Generate pairing QR"}
          </Button>
          <Badge tone={config.walletConnectConfigured ? "pass" : "demo"}>
            {config.walletConnectConfigured ? "Project id present" : "Project id missing"}
          </Badge>
        </div>
        {pairingUri ? (
          <div className="mt-4 grid gap-4 rounded-lg border border-border bg-surface-2 p-4 md:grid-cols-[auto_1fr]">
            <div className="flex size-56 items-center justify-center rounded-md bg-white p-3">
              {pairingQr ? (
                <img
                  src={pairingQr}
                  alt="WalletConnect pairing QR code"
                  className="size-52 max-w-full"
                />
              ) : (
                <p className="text-sm text-bg">Preparing QR…</p>
              )}
            </div>
            <div className="min-w-0">
              <Badge tone="warn">Waiting for wallet approval</Badge>
              <p className="mt-3 text-sm text-muted">
                In OPTN Wallet, open Connect and scan this QR code. On the same device, copy the URI
                and paste it into OPTN Wallet. The value must begin with{" "}
                <span className="font-mono text-fg">wc:</span>.
              </p>
              <code
                data-testid="walletconnect-uri"
                className="mt-3 block max-h-24 overflow-auto break-all rounded-md border border-border bg-bg p-3 font-mono text-xs text-fg"
              >
                {pairingUri}
              </code>
              <Button
                type="button"
                variant="outline"
                className="mt-3"
                onClick={() => void copyPairingUri()}
              >
                {copied ? (
                  <Check className="size-4" aria-hidden="true" />
                ) : (
                  <Copy className="size-4" aria-hidden="true" />
                )}
                {copied ? "Copied raw URI" : "Copy raw URI"}
              </Button>
            </div>
          </div>
        ) : null}
      </Card>
      {error ? <p className="mt-3 text-sm text-fail">{error}</p> : null}
    </AppShell>
  );
}
