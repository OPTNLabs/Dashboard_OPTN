import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Compass, Copy, KeyRound, ShieldCheck, UserRoundPlus, WalletCards } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ContractBlueprintComposer } from "@/components/optn/contract-blueprint-composer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import {
  bootstrapOrganization,
  enrollSelfAsRecipient,
  issueOrganizationInvite,
  loadOrganization,
  redeemOrganizationInvite,
  saveCovenantBlueprint,
} from "@/lib/optn/api";
import { bchToSatoshis, satoshisToBch } from "@/lib/optn/money";
import type { OrganizationInviteKind } from "@/lib/optn/types";

export const Route = createFileRoute("/organization")({ component: OrganizationPage });

type InviteableKind = Exclude<OrganizationInviteKind, "owner">;

const inviteLabels: Record<InviteableKind, string> = {
  operator: "operator",
  approver: "approver",
  recipient: "payout recipient",
};

function OrganizationPage() {
  const client = useQueryClient();
  const organizationQuery = useQuery({
    queryKey: ["organization"],
    queryFn: () => loadOrganization(),
  });
  const [inviteCode, setInviteCode] = useState("");
  const [issuedCode, setIssuedCode] = useState<{
    code: string;
    kind: InviteableKind;
  } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [paymentCap, setPaymentCap] = useState<string | null>(null);
  const [feeCap, setFeeCap] = useState<string | null>(null);
  const bootstrap = useMutation({
    mutationFn: () => bootstrapOrganization(),
    onSuccess: async () => {
      setMessage("Organization created. This WalletConnect account is now the owner.");
      await client.invalidateQueries();
    },
    onError: (error: Error) => setMessage(error.message),
  });
  const issue = useMutation({
    mutationFn: (kind: InviteableKind) => issueOrganizationInvite({ data: { kind } }),
    onSuccess: (invite, kind) => {
      setIssuedCode({ code: invite.code, kind });
      setMessage(
        "Enrollment code created. It expires in one hour and is shown only in this session.",
      );
    },
    onError: (error: Error) => setMessage(error.message),
  });
  const selfRecipient = useMutation({
    mutationFn: () => enrollSelfAsRecipient(),
    onSuccess: async () => {
      setMessage(
        "Single-wallet pilot enabled. This wallet is both owner and payout recipient; separation of duties is not configured.",
      );
      await client.invalidateQueries();
    },
    onError: (error: Error) => setMessage(error.message),
  });
  const redeem = useMutation({
    mutationFn: () => redeemOrganizationInvite({ data: { code: inviteCode.trim() } }),
    onSuccess: async (result) => {
      setInviteCode("");
      setMessage(
        result.session.role === "viewer"
          ? "Payout recipient enrolled from this WalletConnect wallet."
          : `Organization role updated to ${result.session.role}.`,
      );
      await client.invalidateQueries();
    },
    onError: (error: Error) => setMessage(error.message),
  });
  const saveBlueprint = useMutation({
    mutationFn: () => {
      const current = organizationQuery.data?.covenant;
      if (!current) throw new Error("Enroll a recipient wallet before configuring the covenant");
      return saveCovenantBlueprint({
        data: {
          maxPaymentSatoshis: bchToSatoshis(
            paymentCap ?? satoshisToBch(current.maxPaymentSatoshis),
          ).toString(),
          maxFeeSatoshis: feeCap ?? current.maxFeeSatoshis,
        },
      });
    },
    onSuccess: async () => {
      setMessage(
        "Next-vault blueprint saved. Review the new CashAssembly and fund only the newly generated P2SH32 address.",
      );
      await client.invalidateQueries();
    },
    onError: (error: Error) => setMessage(error.message),
  });

  if (!organizationQuery.data) return <p className="p-8 text-muted">Loading organization…</p>;
  const { config, session, organization, covenant } = organizationQuery.data;
  const canBootstrap = Boolean(session && session.authMethod === "walletconnect" && !organization);
  const owner = session?.role === "owner" && organization?.ownerAccount === session.account;

  return (
    <AppShell config={config} session={session}>
      <div className="mb-5 max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Wallet authority</p>
        <h1 className="mt-1 text-2xl font-medium tracking-tight">Organization setup</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          WalletConnect supplies every organization and beneficiary account at runtime. The control
          plane stores no keys and uses no environment-provided member addresses.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Card>
          <WalletCards className="size-5 text-accent" aria-hidden="true" />
          <CardTitle className="mt-3">1. Authenticate wallet</CardTitle>
          <p className="mt-2 text-sm text-muted">
            {session ? `Connected as ${session.role}.` : "Connect a BCH wallet first."}
          </p>
        </Card>
        <Card>
          <UserRoundPlus className="size-5 text-accent" aria-hidden="true" />
          <CardTitle className="mt-3">2. Establish membership</CardTitle>
          <p className="mt-2 text-sm text-muted">
            {organization
              ? `${organization.members.length} verified member${organization.members.length === 1 ? "" : "s"}.`
              : "Create the Chipnet organization."}
          </p>
        </Card>
        <Card>
          <ShieldCheck className="size-5 text-accent" aria-hidden="true" />
          <CardTitle className="mt-3">3. Enroll recipient</CardTitle>
          <p className="mt-2 text-sm text-muted">
            {organization?.recipientAccount
              ? "Payout wallet verified."
              : "A payout wallet must accept an enrollment code."}
          </p>
        </Card>
      </div>

      {!organization ? (
        <Card className="mt-4 max-w-3xl" data-tour="organization-setup">
          <CardTitle>Create the Chipnet organization</CardTitle>
          <p className="mt-2 text-sm leading-6 text-muted">
            The first WalletConnect-authenticated account explicitly creates this organization and
            becomes its owner. This is local control-plane authority, not a blockchain transaction.
          </p>
          <Button
            className="mt-4"
            onClick={() => bootstrap.mutate()}
            disabled={!canBootstrap || bootstrap.isPending}
          >
            <KeyRound className="size-4" />
            Create organization from this wallet
          </Button>
          <Button
            className="mt-4 ml-2"
            type="button"
            variant="outline"
            onClick={() => window.dispatchEvent(new Event("optn:open-mocknet-walkthrough"))}
          >
            <Compass className="size-4" />
            Run Mocknet demo
          </Button>
          {!session ? (
            <p className="mt-3 text-xs text-subtle">
              Connect with WalletConnect to enable this step.
            </p>
          ) : null}
          {session?.authMethod !== "walletconnect" && session ? (
            <p className="mt-3 text-xs text-subtle">
              Demo sessions cannot create live organizations.
            </p>
          ) : null}
        </Card>
      ) : (
        <>
          <Card className="mt-4" data-tour="organization-setup">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Chipnet organization</CardTitle>
                <p className="mt-2 font-mono text-xs text-muted">
                  Owner {organization.ownerAccount}
                </p>
              </div>
              <Badge tone="pass">Wallet-derived</Badge>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-bg p-3">
                <p className="text-xs text-subtle">Members</p>
                <ul className="mt-2 space-y-2 text-sm">
                  {organization.members.map((member) => (
                    <li key={member.account} className="flex items-center justify-between gap-2">
                      <span className="truncate font-mono text-xs">{member.account}</span>
                      <Badge tone={member.role === "owner" ? "accent" : "pass"}>
                        {member.role}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-border bg-bg p-3">
                <p className="text-xs text-subtle">Payout recipient</p>
                <p className="mt-2 break-all font-mono text-xs text-fg">
                  {organization.recipientAccount ?? "Not enrolled"}
                </p>
                <p className="mt-2 text-xs leading-5 text-muted">
                  Recipient enrollment proves the destination wallet account before a covenant
                  artifact is prepared.
                </p>
              </div>
            </div>
          </Card>

          {covenant ? (
            <>
              {owner ? (
                <ContractBlueprintComposer
                  ownerAccount={organization.ownerAccount}
                  recipientAccount={organization.recipientAccount ?? ""}
                  blueprint={covenant}
                  paymentCap={paymentCap ?? satoshisToBch(covenant.maxPaymentSatoshis)}
                  feeCap={feeCap ?? covenant.maxFeeSatoshis}
                  onPaymentCapChange={setPaymentCap}
                  onFeeCapChange={setFeeCap}
                  onCompile={() => saveBlueprint.mutate()}
                  pending={saveBlueprint.isPending}
                />
              ) : null}
              <Card className="mt-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle>Reviewed funding artifact</CardTitle>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      Fund this exact Chipnet P2SH32 address from the owner-controlled wallet, then
                      return to Vaults and attach the resulting txid and output index. Funding is
                      not initiated by the dashboard.
                    </p>
                  </div>
                  <Badge tone="pass">P2SH32 · reviewed</Badge>
                </div>
                <dl className="mt-4 grid gap-3 text-xs md:grid-cols-2">
                  <div>
                    <dt className="text-subtle">Funding address</dt>
                    <dd className="mt-1 break-all font-mono text-fg">
                      {covenant.address ?? "Address encoding unavailable; use locking bytecode"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-subtle">Artifact hash</dt>
                    <dd className="mt-1 break-all font-mono text-fg">{covenant.artifactHash}</dd>
                  </div>
                  <div className="md:col-span-2">
                    <dt className="text-subtle">Expected locking bytecode</dt>
                    <dd className="mt-1 break-all font-mono text-fg">
                      {covenant.lockingBytecodeHex}
                    </dd>
                  </div>
                </dl>
                <details className="mt-4 rounded-lg border border-border bg-bg p-3">
                  <summary className="cursor-pointer text-sm font-medium">
                    Review generated CashAssembly
                  </summary>
                  <p className="mt-2 text-xs text-muted">
                    This source is compiled to the P2SH32 address above. It is the code-level
                    counterpart of the reviewed visual blueprint.
                  </p>
                  <pre className="mt-3 max-h-60 overflow-auto font-mono text-xs leading-5 text-subtle">
                    {covenant.sourceAssembly}
                  </pre>
                </details>
              </Card>
            </>
          ) : null}

          {owner ? (
            <Card className="mt-4">
              <CardTitle>Issue WalletConnect enrollment</CardTitle>
              <p className="mt-2 text-sm text-muted">
                Send one code to the person controlling the corresponding wallet. They connect, sign
                the normal login challenge, and redeem it themselves.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {!organization.recipientAccount ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => selfRecipient.mutate()}
                    disabled={selfRecipient.isPending}
                  >
                    Use this wallet for single-wallet pilot
                  </Button>
                ) : null}
                {(["operator", "approver", "recipient"] as const).map((kind) => (
                  <Button
                    key={kind}
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => issue.mutate(kind)}
                    disabled={issue.isPending}
                  >{`Invite ${inviteLabels[kind]}`}</Button>
                ))}
              </div>
              {issuedCode ? (
                <div className="mt-4 rounded-lg border border-accent/40 bg-accent/5 p-3">
                  <p className="text-xs text-muted">
                    {inviteLabels[issuedCode.kind]} enrollment code — expires in one hour
                  </p>
                  <p className="mt-2 break-all font-mono text-xs text-fg">{issuedCode.code}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => void navigator.clipboard?.writeText(issuedCode.code)}
                  >
                    <Copy className="size-4" />
                    Copy code
                  </Button>
                </div>
              ) : null}
            </Card>
          ) : null}

          <Card className="mt-4 max-w-3xl">
            <CardTitle>Accept enrollment</CardTitle>
            <p className="mt-2 text-sm text-muted">
              Use this from the invited wallet’s WalletConnect session. The code assigns this
              account; it does not reveal an owner key or authorize a spend.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <div className="min-w-[16rem] flex-1">
                <Label>Enrollment code</Label>
                <Input value={inviteCode} onChange={(event) => setInviteCode(event.target.value)} />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={() => redeem.mutate()}
                  disabled={!session || !inviteCode.trim() || redeem.isPending}
                >
                  Accept code
                </Button>
              </div>
            </div>
          </Card>
        </>
      )}
      {message ? (
        <p className="mt-4 text-sm text-muted" role="status">
          {message}
        </p>
      ) : null}
    </AppShell>
  );
}
