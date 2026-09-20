import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Compass, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { PolicyCanvas, type PolicyCanvasSelection } from "@/components/optn/policy-canvas";
import { MocknetContractComposer } from "@/components/optn/mocknet-contract-composer";
import { LiveSetupCallout } from "@/components/optn/live-setup-callout";
import {
  createProposal,
  getCurrentSession,
  loadOrganization,
  loadPlans,
  publishPlan,
  savePlanDraft,
} from "@/lib/optn/api";
import { formatBch, satoshisToBch, bchToSatoshis } from "@/lib/optn/money";
import { validateCanvas } from "@/lib/optn/policy";
import {
  compileExecutableStudio,
  executableElementDetail,
  executableStudioRules,
} from "@/lib/optn/studio-compiler";
import type { ControlPlan } from "@/lib/optn/types";

export const Route = createFileRoute("/studio")({ component: StudioPage });

function StudioPage() {
  const client = useQueryClient();
  const sessionQuery = useQuery({ queryKey: ["session"], queryFn: () => getCurrentSession() });
  const plansQuery = useQuery({ queryKey: ["plans"], queryFn: () => loadPlans() });
  const organizationQuery = useQuery({
    queryKey: ["organization"],
    queryFn: () => loadOrganization(),
  });
  const plan = plansQuery.data?.plans[0];
  const [name, setName] = useState<string>();
  const [sessionAllowance, setSessionAllowance] = useState<string>();
  const [threshold, setThreshold] = useState<number>();
  const [pause, setPause] = useState<boolean>();
  const [canvas, setCanvas] = useState<ControlPlan["canvas"]>();
  const [selection, setSelection] = useState<PolicyCanvasSelection | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [mocknetOpen, setMocknetOpen] = useState(false);

  const working = useMemo(() => {
    if (!plan) return null;
    return {
      ...plan,
      name: name ?? plan.name,
      limits: {
        ...plan.limits,
        sessionAllowanceSatoshis: sessionAllowance ?? plan.limits.sessionAllowanceSatoshis,
      },
      governance: { ...plan.governance, threshold: threshold ?? plan.governance.threshold },
      canvas: canvas ?? plan.canvas,
      pause: pause ?? plan.pause,
    };
  }, [plan, name, sessionAllowance, threshold, pause, canvas]);

  const save = useMutation({
    mutationFn: async () => {
      if (!working) throw new Error("No plan");
      return savePlanDraft({
        data: {
          id: working.id,
          name: working.name,
          description: working.description,
          perPaymentSatoshis: working.limits.perPaymentSatoshis,
          sessionAllowanceSatoshis: working.limits.sessionAllowanceSatoshis,
          maxFeeSatoshis: working.limits.maxFeeSatoshis,
          threshold: working.governance.threshold,
          pause: working.pause,
          canvas: working.canvas,
        },
      });
    },
    onSuccess: async (saved) => {
      setMessage(`Saved draft. Policy id ${saved.policyId.slice(0, 12)}…`);
      await client.invalidateQueries({ queryKey: ["plans"] });
    },
    onError: (err: Error) => setMessage(err.message),
  });

  const createInitialPlan = useMutation({
    mutationFn: async () => {
      const memberCount = organizationQuery.data?.organization?.members.length ?? 1;
      const sourceVault = plansQuery.data?.vaults[0];
      const perPaymentSatoshis = sourceVault?.constructor.maxPaymentSatoshis;
      const maxFeeSatoshis = sourceVault?.constructor.maxFeeSatoshis;
      if (!sourceVault || !perPaymentSatoshis || !maxFeeSatoshis) {
        throw new Error("The attached vault is missing immutable BoundedRelease limits");
      }
      return savePlanDraft({
        data: {
          name: "Initial bounded allocation",
          description:
            "Start with the attached BoundedRelease vault, then model and review the allowed payment path.",
          perPaymentSatoshis,
          sessionAllowanceSatoshis: "20000000",
          maxFeeSatoshis,
          threshold: Math.min(2, Math.max(1, memberCount)),
          pause: false,
          canvas: { nodes: [], edges: [] },
        },
      });
    },
    onSuccess: async () => {
      setMessage(
        "Initial draft created. Add the policy path in the visual editor before publishing.",
      );
      await client.invalidateQueries({ queryKey: ["plans"] });
    },
    onError: (err: Error) => setMessage(err.message),
  });

  const publish = useMutation({
    mutationFn: async () => {
      if (!plan) throw new Error("No plan");
      return publishPlan({ data: { id: plan.id } });
    },
    onSuccess: async (saved) => {
      setMessage(`Published v${saved.version}. Approvals on the previous policy id are invalid.`);
      await client.invalidateQueries({ queryKey: ["plans"] });
    },
    onError: (err: Error) => setMessage(err.message),
  });

  const propose = useMutation({
    mutationFn: async () => {
      if (!plan) throw new Error("No plan");
      return createProposal({
        data: {
          planId: plan.id,
          routeId: 0,
          amountSatoshis: "2000000",
          feeSatoshis: "1000",
        },
      });
    },
    onSuccess: async () => {
      setMessage("Created a 0.02 BCH vendor proposal.");
      await client.invalidateQueries();
    },
    onError: (err: Error) => setMessage(err.message),
  });

  const config = sessionQuery.data?.config;
  if (!config || !plansQuery.data) return <p className="p-8 text-muted">Loading studio…</p>;
  if (!working) {
    if (mocknetOpen) {
      return (
        <MocknetStudio
          config={config}
          session={sessionQuery.data?.session ?? null}
          onExit={() => setMocknetOpen(false)}
        />
      );
    }
    return (
      <AppShell config={config} session={sessionQuery.data?.session ?? null}>
        <h1 className="text-2xl font-medium tracking-tight">Policy Studio</h1>
        <div className="mt-5 max-w-3xl" data-tour="policy-studio">
          <LiveSetupCallout
            title={
              sessionQuery.data?.session
                ? "Policy Studio is waiting for a live source vault"
                : "Connect a wallet to begin"
            }
            description={
              sessionQuery.data?.session
                ? "The visual editor opens after a WalletConnect organization has a recipient-bound BoundedRelease vault attached from provider evidence."
                : "WalletConnect login is required before the control-plane setup and policy editor are available."
            }
          />
          {plansQuery.data.vaults.length > 0 &&
          (sessionQuery.data?.session?.role === "owner" ||
            sessionQuery.data?.session?.role === "operator") ? (
            <div className="mt-3 rounded-lg border border-border bg-surface-1 p-4">
              <p className="text-sm font-medium">Attached vault detected</p>
              <p className="mt-1 text-sm leading-6 text-muted">
                Create an empty local draft for this verified vault, then use the canvas to model
                the payment and successor outputs. Publishing remains blocked until the visual
                policy passes validation.
              </p>
              <Button
                className="mt-3"
                type="button"
                onClick={() => createInitialPlan.mutate()}
                disabled={createInitialPlan.isPending}
              >
                Create first plan
              </Button>
            </div>
          ) : null}
          <Button
            className="mt-3"
            type="button"
            variant="outline"
            onClick={() => setMocknetOpen(true)}
          >
            <Compass className="size-4" />
            Explore Mocknet Studio
          </Button>
          <Button className="mt-3 ml-2" type="button" variant="secondary" asChild>
            <Link to="/mock">Open full Mock workspace</Link>
          </Button>
          {message ? <p className="mt-3 text-sm text-accent">{message}</p> : null}
        </div>
      </AppShell>
    );
  }
  const vault = plansQuery.data.vaults.find((item) => item.id === working.sourceVaultId);
  let executable: ReturnType<typeof compileExecutableStudio> | null = null;
  let issues = validateCanvas(working);
  if (vault) {
    try {
      executable = compileExecutableStudio(working, vault);
      issues = executableStudioRules(working, vault);
    } catch (error) {
      issues = [
        {
          id: "shape.unreviewed" as const,
          label: "Executable Studio mapping matches the funded vault",
          pass: false,
          enforcement: "on-chain" as const,
          detail: error instanceof Error ? error.message : "Executable mapping is unavailable",
        },
      ];
    }
  }
  const selectedDetail =
    executable && selection ? executableElementDetail(selection.id, executable) : null;

  return (
    <AppShell config={config} session={sessionQuery.data?.session ?? null}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Policy Studio</p>
          <h1 className="text-2xl font-medium tracking-tight">{working.name}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => save.mutate()}
            disabled={!sessionQuery.data?.session}
          >
            Save draft
          </Button>
          <Button
            variant="secondary"
            onClick={() => publish.mutate()}
            disabled={!sessionQuery.data?.session}
          >
            Publish version
          </Button>
          <Button onClick={() => propose.mutate()} disabled={!sessionQuery.data?.session}>
            Propose 0.02 BCH
          </Button>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2 text-xs">
        <Badge>policy {working.policyId.slice(0, 10)}</Badge>
        <Badge tone="accent">{working.reviewedShapeId}</Badge>
        <Badge tone={working.status === "active" ? "pass" : "warn"}>{working.status}</Badge>
      </div>

      <div data-tour="policy-studio">
        <PolicyCanvas
          plan={executable ? { ...working, canvas: executable.canvas } : working}
          onChange={setCanvas}
          editableTopology={false}
          onSelect={setSelection}
        />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardTitle>Inspector</CardTitle>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <Label>Plan name</Label>
              <Input value={working.name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Maximum per payment (BCH)</Label>
              <Input value={satoshisToBch(working.limits.perPaymentSatoshis)} readOnly disabled />
              <p className="mt-1 font-mono text-[11px] text-subtle">
                {working.limits.perPaymentSatoshis} sats · compiled into the funded vault
              </p>
            </div>
            <div>
              <Label>Fee ceiling (sats)</Label>
              <Input value={working.limits.maxFeeSatoshis} readOnly disabled />
              <p className="mt-1 font-mono text-[11px] text-subtle">
                Immutable after funding the covenant
              </p>
            </div>
            <div>
              <Label>Approval threshold</Label>
              <Input
                type="number"
                min={1}
                max={3}
                value={working.governance.threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
              />
              <p className="mt-1 text-[11px] text-subtle">Off-chain approval control</p>
            </div>
            <div>
              <Label>Session allowance (BCH)</Label>
              <Input
                value={satoshisToBch(working.limits.sessionAllowanceSatoshis)}
                onChange={(e) => {
                  try {
                    setSessionAllowance(bchToSatoshis(e.target.value).toString());
                  } catch {
                    /* retain the last valid policy value */
                  }
                }}
              />
              <p className="mt-1 text-[11px] text-subtle">
                Off-chain accounting; proposal evaluation enforces it before signing.
              </p>
            </div>
            <div>
              <Label>Emergency pause</Label>
              <Button
                className="mt-1 w-full"
                type="button"
                variant={working.pause ? "danger" : "outline"}
                onClick={() => setPause(!working.pause)}
              >
                {working.pause ? "Paused — click to resume" : "Active — click to pause"}
              </Button>
              <p className="mt-1 text-[11px] text-subtle">Off-chain policy control</p>
            </div>
          </div>
          <div className="mt-4 grid gap-2 text-sm">
            {working.routes.map((route) => (
              <div key={route.id} className="rounded-md border border-border bg-surface-2 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{route.label}</p>
                  <Badge tone={route.enforcement === "on-chain" ? "pass" : "warn"}>
                    {route.enforcement}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted">{route.whyConstrained}</p>
                <p className="mt-1 font-mono text-[11px] text-subtle">
                  dest {route.destinationAddress} · cap {formatBch(route.maxAmountSatoshis)}
                </p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardTitle>Verification</CardTitle>
          <ul className="mt-3 space-y-2 text-sm">
            {issues.map((issue) => (
              <li key={issue.label} className="flex items-start justify-between gap-2">
                <span>{issue.label}</span>
                <Badge tone={issue.pass ? "pass" : "fail"}>{issue.pass ? "pass" : "block"}</Badge>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-subtle">
            Drag/drop is visual layout only and is excluded from the policy hash. 2-of-3 is an
            off-chain approval policy; BoundedRelease enforces one operator CHECKSIG. The persisted
            canonical plan is re-hashed and revalidated on every proposal.
          </p>
          {message ? <p className="mt-3 text-sm text-accent">{message}</p> : null}
          <Link to="/proposals" className="mt-3 inline-block text-sm text-accent hover:underline">
            Review proposals
          </Link>
        </Card>
      </div>
      <Card className="mt-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Selected graph element</CardTitle>
            <p className="mt-1 text-sm text-muted">
              Click a node or edge to inspect the rule that the transaction builder and covenant
              enforce.
            </p>
          </div>
          {selectedDetail ? <Badge tone="pass">{selectedDetail.enforcement}</Badge> : null}
        </div>
        {selectedDetail ? (
          <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div>
              <p className="text-sm font-medium">{selectedDetail.title}</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                {selectedDetail.transactionBinding}
              </p>
              <p className="mt-3 text-xs leading-5 text-subtle">
                <span className="font-medium text-fg">Editability: </span>
                {selectedDetail.editable}
              </p>
            </div>
            {selectedDetail.assembly ? (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                  CashAssembly rule
                </p>
                <pre className="max-h-52 overflow-auto rounded-md border border-border bg-bg p-3 font-mono text-xs leading-5 text-muted">
                  {selectedDetail.assembly}
                </pre>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="mt-3 text-sm text-subtle">
            The live graph is compiler-derived. Select an element to see its exact UTXO and
            CashAssembly binding.
          </p>
        )}
      </Card>
      {executable ? (
        <Card className="mt-4">
          <CardTitle>Executable BCH transaction mapping</CardTitle>
          <p className="mt-2 text-sm leading-6 text-muted">
            This is the exact template passed to the BCH transaction builder. The chart is a view of
            this mapping; it is not an independent policy language.
          </p>
          <div className="mt-3 grid gap-3 text-sm lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-surface-2 p-3">
              <p className="font-medium">Input 0</p>
              <p className="mt-1 font-mono text-xs text-muted break-all">
                {executable.transaction.input.outpoint}
              </p>
              <p className="mt-2 text-xs text-subtle">
                The only input must use the attached vault lock.
              </p>
            </div>
            {executable.transaction.outputs.map((output) => (
              <div key={output.index} className="rounded-lg border border-border bg-surface-2 p-3">
                <p className="font-medium">
                  Output {output.index} · {output.role}
                </p>
                <p className="mt-1 font-mono text-xs text-muted break-all">
                  {output.lockingBytecodeHex}
                </p>
                <p className="mt-2 text-xs text-subtle">{output.constraint}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 grid gap-2 text-xs text-subtle md:grid-cols-2">
            <p>
              On-chain: operator signature, exact 1-input/2-output shape, recipient lock, successor
              lock, payment cap, and fee cap.
            </p>
            <p>
              Off-chain only: organization approvals, session/daily accounting, and recovery. Those
              are never presented as covenant guarantees.
            </p>
          </div>
        </Card>
      ) : null}
    </AppShell>
  );
}

function MocknetStudio({
  config,
  session,
  onExit,
}: {
  config: Parameters<typeof AppShell>[0]["config"];
  session: Parameters<typeof AppShell>[0]["session"];
  onExit: () => void;
}) {
  const [resetKey, setResetKey] = useState(0);
  return (
    <AppShell config={config} session={session}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-demo">
            Mocknet workspace
          </p>
          <h1 className="mt-1 text-2xl font-medium tracking-tight">Policy Studio sandbox</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Construct a reviewed contract template and inspect the transaction it would build. This
            workspace is local to the browser and cannot sign, fund, attach, or broadcast Chipnet
            records.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setResetKey((current) => current + 1)}
          >
            <RotateCcw className="size-4" />
            Reset mock contract
          </Button>
          <Button type="button" variant="secondary" onClick={onExit}>
            Return to live setup
          </Button>
        </div>
      </div>
      <MocknetContractComposer key={resetKey} />
    </AppShell>
  );
}
