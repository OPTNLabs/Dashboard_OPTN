import * as Dialog from "@radix-ui/react-dialog";
import {
  CheckCircle2,
  ChevronRight,
  GitBranch,
  PackagePlus,
  Play,
  RefreshCcw,
  ShieldCheck,
  X,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  applyMockTransition,
  createMockWorkspace,
  issueMockCashToken,
  requestMockWorkflowReview,
  reviseMockProposal,
  satsFromBch,
  simulateMockTransition,
  type MockContractInstance,
  type MockEvidence,
  type MockScenario,
  type MockSimulation,
  type MockWorkspaceState,
  withCandidateInstance,
} from "@/lib/optn/mock-workspace";
import { formatBch, formatSats, satoshisToBch } from "@/lib/optn/money";
import { IDENTITIES } from "@/lib/optn/identities";

type WorkspaceView =
  "command" | "assets" | "issuance" | "studio" | "proposals" | "lineage" | "audit";
type InspectorKey =
  "source" | "template" | "cap" | "recipient" | "fee" | "payment" | "successor" | null;

const NAV: Array<{ id: WorkspaceView; label: string }> = [
  { id: "command", label: "Command Center" },
  { id: "assets", label: "Assets" },
  { id: "issuance", label: "Issuance Lab" },
  { id: "studio", label: "Control Studio" },
  { id: "proposals", label: "Proposals" },
  { id: "lineage", label: "Lineage" },
  { id: "audit", label: "Audit" },
];

function evidenceTone(evidence: MockEvidence) {
  return evidence === "mock-fixture"
    ? "demo"
    : evidence === "local-deterministic"
      ? "pass"
      : "warn";
}

function EvidenceBadge({ evidence }: { evidence: MockEvidence }) {
  return <Badge tone={evidenceTone(evidence)}>{evidence.replace("-", " ")}</Badge>;
}

function short(value: string, size = 16) {
  return value.length <= size ? value : `${value.slice(0, size)}…`;
}

export function MockWorkspace() {
  const [view, setView] = useState<WorkspaceView>("command");
  const [workspace, setWorkspace] = useState<MockWorkspaceState>(() => createMockWorkspace());
  const [simulation, setSimulation] = useState<MockSimulation | null>(null);
  const [inspector, setInspector] = useState<InspectorKey>(null);

  const go = (next: WorkspaceView) => {
    setView(next);
    setSimulation(null);
  };
  const reset = () => {
    setWorkspace(createMockWorkspace());
    setSimulation(null);
    setView("command");
  };
  const render = () => {
    const props = { workspace, setWorkspace, go, simulation, setSimulation, setInspector };
    switch (view) {
      case "assets":
        return <AssetsView {...props} />;
      case "issuance":
        return <IssuanceView {...props} />;
      case "studio":
        return <StudioView {...props} />;
      case "proposals":
        return <ProposalsView {...props} />;
      case "lineage":
        return <LineageView {...props} />;
      case "audit":
        return <AuditView {...props} />;
      default:
        return <CommandView {...props} />;
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="demo">Mock / local</Badge>
            <Badge tone="accent">Chipnet-shaped</Badge>
            <Badge tone="warn">No wallet or network writes</Badge>
          </div>
          <h1 className="mt-2 text-2xl font-medium tracking-tight">OPTN Control Plane workspace</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
            A local teaching model: review a template, configure a contract instance, inspect the
            mock vault UTXO, then construct and validate a permitted transaction transition.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={reset}>
          <RefreshCcw className="size-4" /> Reset mock workspace
        </Button>
      </div>
      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-border pb-2">
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => go(item.id)}
            className={cn(
              "shrink-0 rounded-md px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-fg",
              view === item.id && "bg-surface-2 text-fg ring-1 ring-accent/40",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      {render()}
      <NodeInspector
        inspector={inspector}
        onClose={() => setInspector(null)}
        workspace={workspace}
      />
    </div>
  );
}

type ViewProps = {
  workspace: MockWorkspaceState;
  setWorkspace: (next: MockWorkspaceState) => void;
  go: (view: WorkspaceView) => void;
  simulation: MockSimulation | null;
  setSimulation: (next: MockSimulation | null) => void;
  setInspector: (next: InspectorKey) => void;
};

function CommandView({ workspace, go, setInspector }: ViewProps) {
  const protectedValue = workspace.vault.valueSatoshis;
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="grid gap-4">
        <section>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            Current mock state
          </p>
          <h2 className="mt-1 text-xl font-medium">Control an explicit UTXO transition</h2>
        </section>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Metric
            title="Protected BCH"
            value={formatBch(protectedValue)}
            detail="1 active mock covenant UTXO"
            onClick={() => setInspector("source")}
          />
          <Metric
            title="Contract instance"
            value={`v${workspace.fundedInstance.revision}`}
            detail="Funded BoundedRelease instance"
            onClick={() => setInspector("template")}
          />
          <Metric
            title="CashTokens"
            value={workspace.token ? workspace.token.ticker : "None"}
            detail={workspace.token ? "Mock genesis output 0" : "Issue a mock category"}
            onClick={() => go("issuance")}
          />
          <Metric
            title="Proposal"
            value={`r${workspace.proposal.revision}`}
            detail={`${workspace.proposal.workflow.replace("-", " ")} · no signature`}
            onClick={() => go("proposals")}
          />
        </div>
        <Card>
          <CardTitle>Use the workspace in this order</CardTitle>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <FlowStep
              number="1"
              title="Issue / inspect assets"
              detail="Create a mock CashToken category from genesis output 0, or inspect the protected BCH UTXO."
              action="Open Assets"
              onClick={() => go("assets")}
            />
            <FlowStep
              number="2"
              title="Configure a reviewed instance"
              detail="Change only supported BoundedRelease constructor values; a change produces an unfunded v2."
              action="Open Studio"
              onClick={() => go("studio")}
            />
            <FlowStep
              number="3"
              title="Simulate exact outputs"
              detail="See input 0, payment output 0, successor output 1, fee, and each invariant."
              action="Build transition"
              onClick={() => go("studio")}
            />
          </div>
        </Card>
        <Card>
          <CardTitle>What is and is not real here</CardTitle>
          <div className="mt-3 grid gap-3 text-sm md:grid-cols-3">
            <Boundary
              title="Mock fixture"
              detail="The starting vault and ordinary UTXOs are local data, not provider-observed chain state."
              tone="demo"
            />
            <Boundary
              title="Local deterministic"
              detail="The BoundedRelease redeem source and the transition checks are recomputed in this browser."
              tone="pass"
            />
            <Boundary
              title="Not included"
              detail="No keys, WalletConnect signing, funding, broadcast, mempool, confirmation, or explorer transaction IDs."
              tone="warn"
            />
          </div>
        </Card>
      </div>
      <Card>
        <CardTitle>Control lifecycle</CardTitle>
        <div className="mt-4 space-y-3 text-sm">
          <LifecycleItem
            title="Reviewed template"
            value="BoundedRelease v1"
            detail="Native BCH only · fixed 1-input / 2-output shape"
          />
          <LifecycleItem
            title="Funded instance"
            value={`v${workspace.fundedInstance.revision}`}
            detail={`lock ${short(workspace.fundedInstance.lockingBytecodeHex)}`}
          />
          <LifecycleItem
            title="Active mock vault UTXO"
            value={workspace.vault.outpoint}
            detail={formatBch(workspace.vault.valueSatoshis)}
          />
          <LifecycleItem
            title="Proposal intent"
            value={`r${workspace.proposal.revision}`}
            detail="Separately versioned workflow record"
          />
        </div>
        {workspace.candidateInstance ? (
          <div className="mt-4 rounded-lg border border-warn/40 bg-surface-2 p-3 text-sm">
            <p className="font-medium text-warn">
              Candidate v{workspace.candidateInstance.revision} is unfunded
            </p>
            <p className="mt-1 text-xs leading-5 text-muted">
              Changing constructor values never retargets the existing vault. Funding is
              intentionally outside this mock.
            </p>
          </div>
        ) : null}
      </Card>
    </div>
  );
}

function AssetsView({ workspace, go, setInspector }: ViewProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
          Mock UTXO inventory
        </p>
        <h2 className="mt-1 text-xl font-medium">Assets are outputs, not an account balance</h2>
        <p className="mt-1 text-sm text-muted">
          Each row names its state, lock, and evidence. BCH and CashToken state are accounted for
          separately.
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="grid grid-cols-[minmax(170px,1.2fr)_110px_minmax(130px,1fr)_110px] gap-3 border-b border-border px-4 py-3 font-mono text-[11px] uppercase tracking-wide text-subtle">
            <span>Outpoint</span>
            <span>BCH</span>
            <span>Lock / token state</span>
            <span>Evidence</span>
          </div>
          <AssetRow
            outpoint="mock:ordinary-source:0"
            amount="12.00000000 BCH"
            detail="P2PKH ordinary BCH · eligible mock source"
            evidence="mock-fixture"
          />
          <AssetRow
            outpoint={workspace.vault.outpoint}
            amount={formatBch(workspace.vault.valueSatoshis)}
            detail={`P2SH32 · funded instance v${workspace.fundedInstance.revision}`}
            evidence={workspace.vault.evidence}
            onClick={() => setInspector("source")}
          />
          {workspace.token ? (
            <AssetRow
              outpoint={workspace.token.genesisOutpoint}
              amount="546 sats"
              detail={`${workspace.token.ticker} category ${short(workspace.token.category)} · ${workspace.token.supply} FTs`}
              evidence="local-deterministic"
              onClick={() => go("issuance")}
            />
          ) : null}
        </Card>
      </div>
      <Card>
        <CardTitle>Safe next action</CardTitle>
        <p className="mt-2 text-sm leading-6 text-muted">
          The funded BoundedRelease instance is native BCH only. A mock CashToken category is shown
          beside it, never silently placed in this covenant route.
        </p>
        <Button className="mt-4 w-full" onClick={() => go("issuance")}>
          <PackagePlus className="size-4" /> Issue mock CashToken
        </Button>
        <Button className="mt-2 w-full" variant="secondary" onClick={() => go("studio")}>
          <ShieldCheck className="size-4" /> Inspect protected BCH
        </Button>
      </Card>
    </div>
  );
}

function IssuanceView({ workspace, setWorkspace, go }: ViewProps) {
  const [name, setName] = useState("Acme Credits");
  const [ticker, setTicker] = useState("ACME");
  const [supply, setSupply] = useState("10000000");
  const [mintingNft, setMintingNft] = useState(true);
  const [mutableNft, setMutableNft] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const issue = () => {
    try {
      setWorkspace(issueMockCashToken(workspace, { name, ticker, supply, mintingNft, mutableNft }));
      setError(null);
    } catch (next) {
      setError(next instanceof Error ? next.message : "Unable to create mock token");
    }
  };
  const token = workspace.token;
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
        CashToken issuance lab
      </p>
      <h2 className="mt-1 text-xl font-medium">Construct a mock genesis transaction</h2>
      <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
        The category is derived from the mock genesis output at index 0. Display metadata does not
        define category identity; the initial fungible supply is fixed at genesis.
      </p>
      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card>
          <CardTitle>1. Token details and authority</CardTitle>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="mock-token-name">Name</Label>
              <Input
                id="mock-token-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="mock-token-ticker">Ticker</Label>
              <Input
                id="mock-token-ticker"
                value={ticker}
                onChange={(event) => setTicker(event.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="mock-token-supply">Initial fungible supply</Label>
              <Input
                id="mock-token-supply"
                inputMode="numeric"
                value={supply}
                onChange={(event) => setSupply(event.target.value)}
              />
              <p className="mt-1 text-xs text-subtle">
                Whole units in this mock. No later fungible supply increase is modelled.
              </p>
            </div>
          </div>
          <label className="mt-4 flex items-start gap-2 rounded-md border border-border bg-surface-2 p-3 text-sm">
            <input
              type="checkbox"
              checked={mintingNft}
              onChange={(event) => setMintingNft(event.target.checked)}
            />
            <span>
              <strong>NFT minting capability</strong>
              <br />
              <span className="text-xs text-muted">
                Can create additional NFTs in this category; it cannot increase fungible supply.
              </span>
            </span>
          </label>
          <label className="mt-2 flex items-start gap-2 rounded-md border border-border bg-surface-2 p-3 text-sm">
            <input
              type="checkbox"
              checked={mutableNft}
              onChange={(event) => setMutableNft(event.target.checked)}
            />
            <span>
              <strong>Mutable NFT capability</strong>
              <br />
              <span className="text-xs text-muted">
                Allows NFT commitment state changes; it does not mutate fungible units.
              </span>
            </span>
          </label>
          {error ? <p className="mt-3 text-sm text-fail">{error}</p> : null}
          <Button className="mt-4" onClick={issue}>
            <Play className="size-4" /> Simulate genesis issuance
          </Button>
        </Card>
        <Card>
          <CardTitle>2. Ordered mock outputs</CardTitle>
          <p className="mt-2 text-sm text-muted">
            Output ordering is displayed because the genesis category and future covenant
            transaction shape both depend on exact outputs.
          </p>
          <div className="mt-4 space-y-2 text-sm">
            <OutputRow
              index="0"
              title="Genesis / Treasury fungible output"
              detail={
                token
                  ? `${token.supply} ${token.ticker} · category ${short(token.category)}`
                  : "Will derive the category from this mock output"
              }
              tone="pass"
            />
            <OutputRow
              index="1"
              title="Operations allocation"
              detail={
                token
                  ? `${Math.floor(Number(token.supply) * 0.3).toLocaleString()} ${token.ticker} (mock allocation)`
                  : "Optional allocation preview"
              }
              tone="accent"
            />
            {mintingNft || mutableNft ? (
              <OutputRow
                index="2"
                title="Authority NFT"
                detail={`${mintingNft ? "minting" : ""}${mintingNft && mutableNft ? " + " : ""}${mutableNft ? "mutable" : ""} NFT capability · separate token output`}
                tone="warn"
              />
            ) : null}
          </div>
          {token ? (
            <div className="mt-4 rounded-lg border border-pass/40 bg-surface-2 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-pass">Mock issuance ready to inspect</p>
                <EvidenceBadge evidence="local-deterministic" />
              </div>
              <p className="mt-2 font-mono text-xs text-muted">category {token.category}</p>
              <p className="mt-2 text-xs leading-5 text-muted">
                This is a local token ledger entry, not a signed or broadcast transaction.
              </p>
              <Button className="mt-3" variant="secondary" size="sm" onClick={() => go("assets")}>
                View mock assets <ChevronRight className="size-3" />
              </Button>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}

function StudioView({
  workspace,
  setWorkspace,
  go,
  simulation,
  setSimulation,
  setInspector,
}: ViewProps) {
  const [tab, setTab] = useState<"design" | "transaction" | "simulate" | "evidence">("design");
  const funded = workspace.fundedInstance;
  const candidate = workspace.candidateInstance;
  const run = (scenario: MockScenario) => {
    const next = simulateMockTransition(workspace, scenario);
    setSimulation(next);
    setTab("simulate");
  };
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Control Studio</p>
          <h2 className="mt-1 text-xl font-medium">
            One graph, one contract instance, one transaction shape
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-muted">
            The graph is a projection of BoundedRelease. Click a node to see its business meaning,
            exact transaction binding, editability, and enforcement.
          </p>
        </div>
        <Badge tone="pass">Reviewed native-BCH template</Badge>
      </div>
      <div className="mt-4 flex flex-wrap gap-1 border-b border-border pb-2">
        {(["design", "transaction", "simulate", "evidence"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={cn(
              "rounded-md px-3 py-2 text-sm capitalize text-muted hover:bg-surface-2",
              tab === item && "bg-surface-2 text-fg ring-1 ring-accent/40",
            )}
          >
            {item === "transaction" ? "Transaction shape" : item}
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[250px_minmax(0,1fr)_300px]">
        <ControlLibrary candidate={candidate} onEdit={(key) => setInspector(key)} />
        <div>
          <TransactionGraph
            workspace={workspace}
            simulation={simulation}
            onInspect={setInspector}
          />
          <div className="mt-3 rounded-xl border border-border bg-surface p-4">
            {tab === "design" ? (
              <DesignTab workspace={workspace} setWorkspace={setWorkspace} />
            ) : null}
            {tab === "transaction" ? (
              <TransactionTab
                workspace={workspace}
                setWorkspace={setWorkspace}
                onRun={() => run("happy")}
              />
            ) : null}
            {tab === "simulate" ? (
              <SimulationTab
                simulation={simulation}
                onRun={run}
                onApply={() =>
                  simulation && setWorkspace(applyMockTransition(workspace, simulation))
                }
              />
            ) : null}
            {tab === "evidence" ? <EvidenceTab instance={funded} candidate={candidate} /> : null}
          </div>
        </div>
        <InstancePanel workspace={workspace} go={go} />
      </div>
    </div>
  );
}

function ControlLibrary({
  candidate,
  onEdit,
}: {
  candidate: MockContractInstance | null;
  onEdit: (key: InspectorKey) => void;
}) {
  return (
    <Card className="h-fit">
      <CardTitle>Template-aware control library</CardTitle>
      <p className="mt-2 text-xs leading-5 text-muted">
        Only controls reviewed for this template can become constructor values.
      </p>
      <div className="mt-3 grid gap-2">
        <LibraryButton
          title="Max payment"
          detail="outputs[0].value"
          onClick={() => onEdit("cap")}
        />
        <LibraryButton
          title="Fixed recipient"
          detail="outputs[0].locking bytecode"
          onClick={() => onEdit("recipient")}
        />
        <LibraryButton title="Fee ceiling" detail="input − outputs" onClick={() => onEdit("fee")} />
        <LibraryButton
          title="Required successor"
          detail="output 1, same lock"
          onClick={() => onEdit("successor")}
        />
      </div>
      <div className="mt-3 border-t border-border pt-3">
        <p className="text-xs font-medium text-subtle">Requires a different reviewed family</p>
        <p className="mt-1 text-xs text-muted">
          Time schedule, recovery branch, token controls, arbitrary extra outputs, and multi-input
          routing are not composable into BoundedRelease.
        </p>
      </div>
      {candidate ? (
        <div className="mt-3 rounded-md border border-warn/40 p-2 text-xs text-warn">
          Candidate v{candidate.revision} is compiled but unfunded.
        </div>
      ) : null}
    </Card>
  );
}

function DesignTab({ workspace, setWorkspace }: Pick<ViewProps, "workspace" | "setWorkspace">) {
  const instance = workspace.candidateInstance ?? workspace.fundedInstance;
  const updateSats = (key: "maxPaymentSatoshis" | "maxFeeSatoshis", value: string, bch = false) => {
    try {
      setWorkspace(withCandidateInstance(workspace, { [key]: bch ? satsFromBch(value) : value }));
    } catch {
      /* retain current candidate until valid */
    }
  };
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">Configure a new contract instance</p>
          <p className="mt-1 text-sm text-muted">
            Changing a constructor value creates an unfunded candidate. It cannot change the lock on
            the current mock vault UTXO.
          </p>
        </div>
        <Badge tone={workspace.candidateInstance ? "warn" : "pass"}>
          {workspace.candidateInstance
            ? `candidate v${workspace.candidateInstance.revision}`
            : "funded v1"}
        </Badge>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div>
          <Label htmlFor="mock-instance-max-payment">Maximum payment (BCH)</Label>
          <Input
            id="mock-instance-max-payment"
            value={satoshisToBch(instance.maxPaymentSatoshis)}
            onChange={(event) => updateSats("maxPaymentSatoshis", event.target.value, true)}
          />
          <p className="mt-1 text-xs text-subtle">On-chain: output 0 value</p>
        </div>
        <div>
          <Label htmlFor="mock-instance-max-fee">Maximum fee (sats)</Label>
          <Input
            id="mock-instance-max-fee"
            inputMode="numeric"
            value={instance.maxFeeSatoshis}
            onChange={(event) => updateSats("maxFeeSatoshis", event.target.value)}
          />
          <p className="mt-1 text-xs text-subtle">On-chain: input minus outputs</p>
        </div>
        <div>
          <Label htmlFor="mock-instance-recipient">Recipient lock</Label>
          <select
            id="mock-instance-recipient"
            className="h-10 w-full rounded-md border border-border bg-bg px-3 text-sm"
            value={instance.recipientLock}
            onChange={(event) =>
              setWorkspace(withCandidateInstance(workspace, { recipientLock: event.target.value }))
            }
          >
            <option value={IDENTITIES.vendor.lockingBytecodeHex}>Approved vendor lock</option>
            <option value={IDENTITIES.recovery.lockingBytecodeHex}>
              Recovery lock (new instance)
            </option>
          </select>
          <p className="mt-1 text-xs text-subtle">On-chain: output 0 bytecode</p>
        </div>
      </div>
      <div className="mt-4 rounded-md border border-border bg-surface-2 p-3 text-sm">
        <p className="font-medium">Versioning boundary</p>
        <p className="mt-1 text-muted">
          Template source/compiler changes make a new artifact. These constructor fields make a new
          plan + contract instance. A payment proposal changes only intent revision and is
          revalidated against the funded instance.
        </p>
      </div>
    </div>
  );
}

function TransactionTab({
  workspace,
  setWorkspace,
  onRun,
}: Pick<ViewProps, "workspace" | "setWorkspace"> & { onRun: () => void }) {
  const proposal = workspace.proposal;
  const changeBch = (key: "amountSatoshis" | "feeSatoshis", value: string, bch: boolean) => {
    try {
      setWorkspace(reviseMockProposal(workspace, { [key]: bch ? satsFromBch(value) : value }));
    } catch {
      /* wait for a valid number */
    }
  };
  return (
    <div>
      <p className="font-medium">Exact transaction construction</p>
      <p className="mt-1 text-sm text-muted">
        Inputs and outputs have a fixed order. There is no arbitrary transaction builder for this
        reviewed shape.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div>
          <Label htmlFor="mock-proposal-payment">Payment (BCH)</Label>
          <Input
            id="mock-proposal-payment"
            value={satoshisToBch(proposal.amountSatoshis)}
            onChange={(event) => changeBch("amountSatoshis", event.target.value, true)}
          />
        </div>
        <div>
          <Label htmlFor="mock-proposal-fee">Fee (sats)</Label>
          <Input
            id="mock-proposal-fee"
            value={proposal.feeSatoshis}
            onChange={(event) => changeBch("feeSatoshis", event.target.value, false)}
          />
        </div>
        <div>
          <Label htmlFor="mock-proposal-recipient">Recipient</Label>
          <select
            id="mock-proposal-recipient"
            className="h-10 w-full rounded-md border border-border bg-bg px-3 text-sm"
            value={proposal.recipientLock}
            onChange={(event) =>
              setWorkspace(reviseMockProposal(workspace, { recipientLock: event.target.value }))
            }
          >
            <option value={workspace.fundedInstance.recipientLock}>Enrolled recipient</option>
            <option value={IDENTITIES.recovery.lockingBytecodeHex}>
              Deliberately wrong recipient
            </option>
          </select>
        </div>
      </div>
      <TransactionLedger workspace={workspace} />
      <Button className="mt-4" onClick={onRun}>
        <Play className="size-4" /> Validate local transition
      </Button>
    </div>
  );
}

function SimulationTab({
  simulation,
  onRun,
  onApply,
}: {
  simulation: MockSimulation | null;
  onRun: (scenario: MockScenario) => void;
  onApply: () => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium">Scenario simulator</p>
          <p className="mt-1 text-sm text-muted">
            Deliberately break one field and see the violated constraint. This is deterministic
            local validation, not CashVM signing or broadcasting.
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {(
            [
              "happy",
              "wrong-recipient",
              "over-cap",
              "over-fee",
              "missing-successor",
              "stale-input",
            ] as MockScenario[]
          ).map((scenario) => (
            <Button
              key={scenario}
              size="sm"
              variant={scenario === "happy" ? "secondary" : "outline"}
              onClick={() => onRun(scenario)}
            >
              {scenario.replaceAll("-", " ")}
            </Button>
          ))}
        </div>
      </div>
      {simulation ? (
        <div className="mt-4">
          <div
            className={cn(
              "rounded-lg border p-3",
              simulation.allowed ? "border-pass/40 bg-surface-2" : "border-fail/40 bg-surface-2",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <p className={cn("font-medium", simulation.allowed ? "text-pass" : "text-fail")}>
                {simulation.allowed ? "Permitted mock transition" : "Blocked locally"}
              </p>
              <Badge tone={simulation.allowed ? "pass" : "fail"}>
                {simulation.scenario.replaceAll("-", " ")}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted">
              Input {simulation.input.outpoint} → output 0 payment{" "}
              {formatBch(simulation.paymentSatoshis)} → output 1{" "}
              {simulation.successorSatoshis
                ? formatBch(simulation.successorSatoshis)
                : "not constructible"}{" "}
              → fee {formatSats(simulation.feeSatoshis)}
            </p>
          </div>
          <div className="mt-3 grid gap-2">
            {simulation.validations.map((rule) => (
              <div
                key={rule.id}
                className="flex items-start justify-between gap-3 rounded-md border border-border bg-surface-2 px-3 py-2 text-sm"
              >
                <div>
                  <p>{rule.label}</p>
                  <p className="mt-0.5 text-xs text-muted">{rule.detail}</p>
                </div>
                <Badge tone={rule.pass ? "pass" : "fail"}>{rule.pass ? rule.kind : "block"}</Badge>
              </div>
            ))}
          </div>
          {simulation.allowed ? (
            <Button className="mt-4" onClick={onApply}>
              <CheckCircle2 className="size-4" /> Apply local successor state
            </Button>
          ) : (
            <p className="mt-4 text-sm text-warn">
              No override exists for an on-chain invariant. Adjust the proposal or create and later
              fund a new contract instance.
            </p>
          )}
        </div>
      ) : (
        <p className="mt-4 rounded-md border border-border bg-surface-2 p-3 text-sm text-muted">
          Run the happy path or a failure scenario to render a validation trace.
        </p>
      )}
    </div>
  );
}

function EvidenceTab({
  instance,
  candidate,
}: {
  instance: MockContractInstance;
  candidate: MockContractInstance | null;
}) {
  return (
    <div>
      <p className="font-medium">Artifact and instance evidence</p>
      <p className="mt-1 text-sm text-muted">
        The source below is the exact reviewed shape configured by the funded instance. It is
        inspectable, but this mock workspace does not claim a deployed or funded contract beyond its
        fixture state.
      </p>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-md border border-border bg-surface-2 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Funded instance v{instance.revision}
          </p>
          <p className="mt-2 font-mono text-xs break-all text-subtle">
            artifact {instance.artifactFingerprint}
          </p>
          <p className="mt-2 font-mono text-xs break-all text-subtle">
            lock {instance.lockingBytecodeHex}
          </p>
        </div>
        {candidate ? (
          <div className="rounded-md border border-warn/40 bg-surface-2 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-warn">
              Unfunded candidate v{candidate.revision}
            </p>
            <p className="mt-2 font-mono text-xs break-all text-subtle">
              artifact {candidate.artifactFingerprint}
            </p>
            <p className="mt-2 text-xs text-muted">It has no vault UTXO attached.</p>
          </div>
        ) : null}
      </div>
      <pre className="mt-4 max-h-80 overflow-auto rounded-md border border-border bg-bg p-3 font-mono text-xs leading-5 text-muted">
        {instance.redeemSource}
      </pre>
    </div>
  );
}

function ProposalsView({ workspace, setWorkspace, go, setSimulation }: ViewProps) {
  const simulation = simulateMockTransition(workspace, "happy");
  const proposal = workspace.proposal;
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
          Proposal / intent record
        </p>
        <h2 className="mt-1 text-xl font-medium">
          Bind a proposed transaction to the funded instance
        </h2>
        <Card className="mt-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>
                Proposal {proposal.id} · revision {proposal.revision}
              </CardTitle>
              <p className="mt-1 text-sm text-muted">
                Changing amount, fee, or recipient is an intent revision. It never alters the funded
                covenant or creates a signature.
              </p>
            </div>
            <Badge
              tone={
                proposal.workflow === "invalidated"
                  ? "fail"
                  : proposal.workflow === "needs-review"
                    ? "warn"
                    : "neutral"
              }
            >
              {proposal.workflow.replace("-", " ")}
            </Badge>
          </div>
          <TransactionLedger workspace={workspace} />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              onClick={() => {
                setSimulation(simulation);
                go("studio");
              }}
            >
              <Play className="size-4" /> Inspect validation
            </Button>
            <Button
              variant="secondary"
              onClick={() => setWorkspace(requestMockWorkflowReview(workspace))}
            >
              Request mock workflow review
            </Button>
          </div>
        </Card>
      </div>
      <Card>
        <CardTitle>Workflow boundary</CardTitle>
        <p className="mt-2 text-sm leading-6 text-muted">
          Workflow review is an off-chain record only. This iteration does not create a signature,
          co-sign, or approval authority. The covenant validates the exact transaction shape
          independently.
        </p>
        <div className="mt-4 space-y-2">
          <LifecycleItem
            title="Funded instance"
            value={`v${workspace.fundedInstance.revision}`}
            detail="on-chain constraints"
          />
          <LifecycleItem
            title="Intent revision"
            value={`r${proposal.revision}`}
            detail="revalidate on change"
          />
          <LifecycleItem
            title="Workflow"
            value={proposal.workflow.replace("-", " ")}
            detail="no signatures in mock mode"
          />
        </div>
      </Card>
    </div>
  );
}

function LineageView({ workspace, setInspector }: Pick<ViewProps, "workspace" | "setInspector">) {
  const planned =
    parseInt(workspace.vault.valueSatoshis, 10) -
    parseInt(workspace.proposal.amountSatoshis, 10) -
    parseInt(workspace.proposal.feeSatoshis, 10);
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">UTXO lineage</p>
      <h2 className="mt-1 text-xl font-medium">Current state is not an account balance</h2>
      <p className="mt-1 text-sm text-muted">
        Solid nodes are current mock state. Dashed nodes are only permitted future outputs until a
        local scenario is applied.
      </p>
      <Card className="mt-4 overflow-x-auto">
        <div className="flex min-w-[820px] items-center gap-3 py-8">
          <LineageNode
            label="Active mock UTXO"
            value={formatBch(workspace.vault.valueSatoshis)}
            detail={workspace.vault.outpoint}
            evidence={workspace.vault.evidence}
            onClick={() => setInspector("source")}
          />
          <Arrow label="input 0" />
          <LineageNode
            label={`BoundedRelease v${workspace.fundedInstance.revision}`}
            value="P2SH32 covenant"
            detail="reviewed transaction family"
            evidence="local-deterministic"
            onClick={() => setInspector("template")}
          />
          <Arrow label="two ordered outputs" />
          <div className="grid gap-3">
            <LineageNode
              label="Payment output 0"
              value={formatBch(workspace.proposal.amountSatoshis)}
              detail="fixed recipient lock"
              evidence="permitted-future"
              dashed
              onClick={() => setInspector("payment")}
            />
            <LineageNode
              label="Successor output 1"
              value={formatBch(String(Math.max(0, planned)))}
              detail="same covenant lock · NOT YET A UTXO"
              evidence="permitted-future"
              dashed
              onClick={() => setInspector("successor")}
            />
          </div>
        </div>
      </Card>
      <Card className="mt-4">
        <CardTitle>State table</CardTitle>
        <div className="mt-3 grid gap-2 text-sm">
          <div className="grid grid-cols-[90px_1fr_120px_150px] gap-3 border-b border-border pb-2 font-mono text-[11px] uppercase tracking-wide text-subtle">
            <span>State</span>
            <span>Outpoint</span>
            <span>BCH</span>
            <span>Evidence</span>
          </div>
          <div className="grid grid-cols-[90px_1fr_120px_150px] gap-3">
            <span>Current</span>
            <span className="font-mono text-xs">{workspace.vault.outpoint}</span>
            <span>{formatBch(workspace.vault.valueSatoshis)}</span>
            <EvidenceBadge evidence={workspace.vault.evidence} />
          </div>
          <div className="grid grid-cols-[90px_1fr_120px_150px] gap-3 text-muted">
            <span>Future</span>
            <span className="font-mono text-xs">output 1 of next permitted transition</span>
            <span>{formatBch(String(Math.max(0, planned)))}</span>
            <EvidenceBadge evidence="permitted-future" />
          </div>
        </div>
      </Card>
    </div>
  );
}

function AuditView({ workspace }: Pick<ViewProps, "workspace">) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Local audit trail</p>
      <h2 className="mt-1 text-xl font-medium">Every mock mutation explains its boundary</h2>
      <div className="mt-4 grid gap-2">
        {workspace.audit.map((entry) => (
          <Card key={entry.id} className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium">{entry.label}</p>
              <p className="mt-1 text-sm text-muted">{entry.detail}</p>
            </div>
            <EvidenceBadge evidence={entry.evidence} />
          </Card>
        ))}
      </div>
    </div>
  );
}

function TransactionGraph({
  workspace,
  simulation,
  onInspect,
}: {
  workspace: MockWorkspaceState;
  simulation: MockSimulation | null;
  onInspect: (next: InspectorKey) => void;
}) {
  const active = simulation ?? simulateMockTransition(workspace, "happy");
  return (
    <Card className="overflow-x-auto">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <CardTitle>Compiled control graph</CardTitle>
          <p className="mt-1 text-xs text-muted">
            Node positions are visual only. The source, constraints, and output ordering come from
            the selected reviewed template.
          </p>
        </div>
        <Badge tone={active.allowed ? "pass" : "fail"}>
          {active.allowed ? "current shape passes" : "scenario blocked"}
        </Badge>
      </div>
      <div className="flex min-w-[760px] items-center gap-3 py-6">
        <GraphNode
          title="Input 0"
          value={formatBch(workspace.vault.valueSatoshis)}
          detail={workspace.vault.outpoint}
          tone="accent"
          onClick={() => onInspect("source")}
        />
        <Arrow label="spend" />
        <GraphNode
          title="BoundedRelease"
          value={`instance v${workspace.fundedInstance.revision}`}
          detail="P2SH32 · reviewed"
          tone="pass"
          onClick={() => onInspect("template")}
        />
        <div className="grid gap-3">
          <GraphNode
            title="Spend cap"
            value={`≤ ${formatBch(workspace.fundedInstance.maxPaymentSatoshis)}`}
            detail="outputs[0].value"
            tone="warn"
            onClick={() => onInspect("cap")}
          />
          <GraphNode
            title="Recipient lock"
            value="fixed output 0"
            detail={short(workspace.fundedInstance.recipientLock)}
            tone="warn"
            onClick={() => onInspect("recipient")}
          />
          <GraphNode
            title="Fee ceiling"
            value={`≤ ${formatSats(workspace.fundedInstance.maxFeeSatoshis)}`}
            detail="input - outputs"
            tone="warn"
            onClick={() => onInspect("fee")}
          />
        </div>
        <Arrow label="enforced" />
        <div className="grid gap-3">
          <GraphNode
            title="Payment · output 0"
            value={formatBch(active.paymentSatoshis)}
            detail="recipient lock"
            tone={
              active.validations.find((rule) => rule.id === "recipient")?.pass ? "pass" : "fail"
            }
            onClick={() => onInspect("payment")}
          />
          <GraphNode
            title="Successor · output 1"
            value={active.successorSatoshis ? formatBch(active.successorSatoshis) : "blocked"}
            detail="same covenant lock"
            tone={
              active.validations.find((rule) => rule.id === "successor")?.pass ? "accent" : "fail"
            }
            onClick={() => onInspect("successor")}
          />
        </div>
      </div>
    </Card>
  );
}

function InstancePanel({ workspace, go }: Pick<ViewProps, "workspace" | "go">) {
  return (
    <Card className="h-fit">
      <CardTitle>Selected contract state</CardTitle>
      <div className="mt-3 space-y-3 text-sm">
        <LifecycleItem
          title="Template"
          value="BoundedRelease v1"
          detail="reviewed native-BCH only"
        />
        <LifecycleItem
          title="Funded instance"
          value={`v${workspace.fundedInstance.revision}`}
          detail={`artifact ${workspace.fundedInstance.artifactFingerprint}`}
        />
        <LifecycleItem
          title="Vault UTXO"
          value={short(workspace.vault.outpoint)}
          detail={`${formatBch(workspace.vault.valueSatoshis)} · active`}
        />
      </div>
      {workspace.candidateInstance ? (
        <div className="mt-3 rounded-md border border-warn/40 bg-surface-2 p-3 text-sm">
          <p className="font-medium text-warn">
            v{workspace.candidateInstance.revision} needs funding
          </p>
          <p className="mt-1 text-xs text-muted">
            The mock does not provide a funding action; this keeps the current vault truthful.
          </p>
        </div>
      ) : null}
      <Button className="mt-4 w-full" size="sm" variant="secondary" onClick={() => go("lineage")}>
        <GitBranch className="size-4" /> View lineage
      </Button>
    </Card>
  );
}

function TransactionLedger({ workspace }: { workspace: MockWorkspaceState }) {
  const successor =
    parseSatoshisSafe(workspace.vault.valueSatoshis) -
    parseSatoshisSafe(workspace.proposal.amountSatoshis) -
    parseSatoshisSafe(workspace.proposal.feeSatoshis);
  return (
    <div className="mt-4 overflow-hidden rounded-md border border-border">
      <div className="grid grid-cols-[80px_1fr_140px] gap-3 border-b border-border bg-surface-2 px-3 py-2 font-mono text-[11px] uppercase tracking-wide text-subtle">
        <span>Field</span>
        <span>Exact binding</span>
        <span>Value</span>
      </div>
      <LedgerRow
        label="Input 0"
        detail={`${workspace.vault.outpoint} · P2SH32 ${short(workspace.vault.lockingBytecodeHex)}`}
        value={formatBch(workspace.vault.valueSatoshis)}
      />
      <LedgerRow
        label="Output 0"
        detail={`payment · recipient ${short(workspace.proposal.recipientLock)}`}
        value={formatBch(workspace.proposal.amountSatoshis)}
      />
      <LedgerRow
        label="Output 1"
        detail="successor · same covenant locking bytecode"
        value={successor > 0n ? formatBch(successor.toString()) : "invalid"}
      />
      <LedgerRow
        label="Fee"
        detail="input value − output values"
        value={formatSats(workspace.proposal.feeSatoshis)}
      />
    </div>
  );
}

function NodeInspector({
  inspector,
  onClose,
  workspace,
}: {
  inspector: InspectorKey;
  onClose: () => void;
  workspace: MockWorkspaceState;
}) {
  const details: Record<
    Exclude<InspectorKey, null>,
    { title: string; meaning: string; binding: string; enforcement: string; editable: string }
  > = {
    source: {
      title: "Active mock covenant UTXO",
      meaning: "The discrete state being consumed. It is not an account balance.",
      binding: `input 0 = ${workspace.vault.outpoint}; value = ${workspace.vault.valueSatoshis} sats`,
      enforcement: "Transaction construction",
      editable:
        "No — select a different real UTXO only after provider evidence in a future live flow.",
    },
    template: {
      title: "Reviewed BoundedRelease template",
      meaning: "A native-BCH covenant family with a fixed single-input, two-output release shape.",
      binding:
        "Redeem source checks input count, output count/order, recipient lock, payment cap, successor lock, and fee cap.",
      enforcement: "On-chain once funded and spent with the reviewed artifact",
      editable: "No arbitrary opcodes or edges. Change only supported constructor values.",
    },
    cap: {
      title: "Maximum payment",
      meaning: "No one payment output may exceed this value.",
      binding: "outputs[0].value ≤ maxPaymentSatoshis",
      enforcement: "On-chain",
      editable:
        "Yes — creates a new contract instance and lock; the funded vault remains unchanged.",
    },
    recipient: {
      title: "Fixed recipient lock",
      meaning:
        "The payment must use the reviewed locking bytecode, not merely a displayed address label.",
      binding: "outputs[0].lockingBytecode = recipientLockingBytecode",
      enforcement: "On-chain",
      editable: "Yes — creates a new contract instance and lock.",
    },
    fee: {
      title: "Fee ceiling",
      meaning:
        "The amount not assigned to output 0 or output 1 cannot exceed the reviewed fee cap.",
      binding: "input[0].value − outputs[0].value − outputs[1].value ≤ maxFeeSatoshis",
      enforcement: "On-chain",
      editable: "Yes — creates a new contract instance and lock.",
    },
    payment: {
      title: "Payment output 0",
      meaning: "The first output is the only permitted external payment in this template.",
      binding: `output 0 amount = proposal amount; lock = ${short(workspace.proposal.recipientLock)}`,
      enforcement: "On-chain recipient and cap checks",
      editable: "Amount is an intent field. Recipient must match the enrolled lock.",
    },
    successor: {
      title: "Successor output 1",
      meaning:
        "The protected remainder becomes the next state only if it remains under the same covenant lock.",
      binding: `outputs[1].lockingBytecode = ${short(workspace.fundedInstance.lockingBytecodeHex)}`,
      enforcement: "On-chain",
      editable: "No — output index and successor lock are safety invariants.",
    },
  };
  const detail = inspector ? details[inspector] : null;
  return (
    <Dialog.Root open={Boolean(detail)} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-bg/80 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,620px)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="text-lg font-medium">{detail?.title}</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted">
                Clicking this graph element exposes the control it represents; it does not make the
                graph an independent programming language.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button size="icon" variant="ghost" aria-label="Close control inspector">
                <X className="size-4" />
              </Button>
            </Dialog.Close>
          </div>
          {detail ? (
            <div className="mt-4 grid gap-3 text-sm">
              <InspectorRow title="Business meaning" detail={detail.meaning} />
              <InspectorRow title="Transaction field bound" detail={detail.binding} mono />
              <InspectorRow title="Where enforced" detail={detail.enforcement} />
              <InspectorRow title="Can an operator change it?" detail={detail.editable} />
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Metric({
  title,
  value,
  detail,
  onClick,
}: {
  title: string;
  value: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-border bg-surface p-4 text-left transition hover:border-accent/50 hover:bg-surface-2"
    >
      <p className="text-xs text-muted">{title}</p>
      <p className="mt-2 text-xl font-medium tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-subtle">{detail}</p>
    </button>
  );
}
function FlowStep({
  number,
  title,
  detail,
  action,
  onClick,
}: {
  number: string;
  title: string;
  detail: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-2 p-3">
      <p className="font-mono text-xs text-accent">{number}</p>
      <p className="mt-1 text-sm font-medium">{title}</p>
      <p className="mt-1 min-h-10 text-xs leading-5 text-muted">{detail}</p>
      <Button className="mt-3" size="sm" variant="secondary" onClick={onClick}>
        {action}
        <ChevronRight className="size-3" />
      </Button>
    </div>
  );
}
function Boundary({
  title,
  detail,
  tone,
}: {
  title: string;
  detail: string;
  tone: "demo" | "pass" | "warn";
}) {
  return (
    <div className="rounded-md border border-border bg-surface-2 p-3">
      <Badge tone={tone}>{title}</Badge>
      <p className="mt-2 leading-5 text-muted">{detail}</p>
    </div>
  );
}
function LifecycleItem({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <div className="border-l-2 border-accent/50 pl-3">
      <p className="text-xs text-muted">{title}</p>
      <p className="mt-0.5 font-medium">{value}</p>
      <p className="mt-0.5 text-xs text-subtle">{detail}</p>
    </div>
  );
}
function AssetRow({
  outpoint,
  amount,
  detail,
  evidence,
  onClick,
}: {
  outpoint: string;
  amount: string;
  detail: string;
  evidence: MockEvidence;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "grid w-full grid-cols-[minmax(170px,1.2fr)_110px_minmax(130px,1fr)_110px] gap-3 border-b border-border px-4 py-3 text-left text-sm last:border-b-0",
        onClick && "hover:bg-surface-2",
      )}
    >
      <span className="font-mono text-xs text-accent">{outpoint}</span>
      <span>{amount}</span>
      <span className="text-xs text-muted">{detail}</span>
      <span>
        <EvidenceBadge evidence={evidence} />
      </span>
    </button>
  );
}
function OutputRow({
  index,
  title,
  detail,
  tone,
}: {
  index: string;
  title: string;
  detail: string;
  tone: "pass" | "accent" | "warn";
}) {
  return (
    <div className="flex gap-3 rounded-md border border-border bg-surface-2 p-3">
      <Badge tone={tone}>#{index}</Badge>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-xs text-muted">{detail}</p>
      </div>
    </div>
  );
}
function LibraryButton({
  title,
  detail,
  onClick,
}: {
  title: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-border bg-surface-2 p-3 text-left hover:border-accent/50"
    >
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 font-mono text-[11px] text-subtle">{detail}</p>
    </button>
  );
}
function GraphNode({
  title,
  value,
  detail,
  tone,
  onClick,
}: {
  title: string;
  value: string;
  detail: string;
  tone: "accent" | "pass" | "warn" | "fail";
  onClick: () => void;
}) {
  const colors = {
    accent: "border-accent/60",
    pass: "border-pass/60",
    warn: "border-warn/60",
    fail: "border-fail/60",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-40 rounded-xl border bg-surface-2 p-3 text-left hover:bg-surface-3",
        colors[tone],
      )}
    >
      <p className="text-[11px] uppercase tracking-wide text-muted">{title}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
      <p className="mt-1 font-mono text-[10px] text-subtle">{detail}</p>
    </button>
  );
}
function LineageNode({
  label,
  value,
  detail,
  evidence,
  dashed,
  onClick,
}: {
  label: string;
  value: string;
  detail: string;
  evidence: MockEvidence;
  dashed?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-48 rounded-xl border border-accent/60 bg-surface-2 p-3 text-left hover:bg-surface-3",
        dashed && "border-dashed opacity-80",
      )}
    >
      <p className="text-[11px] uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-base font-medium">{value}</p>
      <p className="mt-1 font-mono text-[10px] text-subtle">{detail}</p>
      <span className="mt-2 inline-block">
        <EvidenceBadge evidence={evidence} />
      </span>
    </button>
  );
}
function Arrow({ label }: { label: string }) {
  return (
    <div className="flex min-w-14 flex-col items-center gap-1 text-accent">
      <ChevronRight className="size-6" />
      <span className="font-mono text-[10px] text-subtle">{label}</span>
    </div>
  );
}
function LedgerRow({ label, detail, value }: { label: string; detail: string; value: string }) {
  return (
    <div className="grid grid-cols-[80px_1fr_140px] gap-3 border-b border-border px-3 py-2 text-sm last:border-b-0">
      <span>{label}</span>
      <span className="font-mono text-[11px] text-muted">{detail}</span>
      <span>{value}</span>
    </div>
  );
}
function InspectorRow({ title, detail, mono }: { title: string; detail: string; mono?: boolean }) {
  return (
    <div className="rounded-md border border-border bg-surface-2 p-3">
      <p className="text-xs font-medium text-muted">{title}</p>
      <p className={cn("mt-1 leading-6", mono && "font-mono text-xs break-all")}>{detail}</p>
    </div>
  );
}
function parseSatoshisSafe(value: string) {
  try {
    return BigInt(value);
  } catch {
    return 0n;
  }
}
