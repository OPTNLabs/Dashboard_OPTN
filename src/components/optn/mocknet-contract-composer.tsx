import { Braces, CircleCheck, CircleX, FileCode2, LockKeyhole, PencilLine, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import {
  PolicyCanvas,
  type PolicyCanvasRunState,
  type PolicyCanvasSelection,
} from "@/components/optn/policy-canvas";
import {
  buildMocknetContract,
  DEFAULT_MOCKNET_CONTRACT_INPUT,
  mocknetElementDetail,
  type MocknetElementDetail,
  type MocknetContractInput,
} from "@/lib/optn/mocknet-contract-studio";
import {
  FLOWGUARD_REFERENCE_TEMPLATES,
  referenceTemplatePlan,
  type ReferenceTemplateId,
} from "@/lib/optn/flowguard-reference-templates";
import { formatBch } from "@/lib/optn/money";

function referenceElementDetail(args: {
  id: string;
  plan: NonNullable<ReturnType<typeof referenceTemplatePlan>>;
  template: (typeof FLOWGUARD_REFERENCE_TEMPLATES)[number];
}): MocknetElementDetail {
  const node = args.plan.canvas.nodes.find((item) => item.id === args.id);
  const edge = args.plan.canvas.edges.find((item) => item.id === args.id);
  const label = node?.label ?? edge?.label ?? args.id;
  return {
    title: label,
    enforcement: "evidence",
    transactionBinding: node
      ? `Reference ${node.kind} element. It describes a future state-transition component, not a compiled dashboard artifact.`
      : `Reference transition from ${edge?.source ?? "unknown"} to ${edge?.target ?? "unknown"}. It is not an actual BCH transaction edge.`,
    description: `${args.template.description} This element can be used to discuss the required contract shape, but has no editable constructor, CashAssembly, UTXO builder, signing path, or funding action in this MVP.`,
    editable: "none",
    immutableReason:
      "This FlowGuard-guided template is a reference preview. It must be independently specified, compiled, adversarially tested, and approved before it can expose operator controls.",
  };
}

function GraphElementInspector({
  detail,
  draft,
  onClose,
  onUpdate,
}: {
  detail: MocknetElementDetail;
  draft: MocknetContractInput;
  onClose: () => void;
  onUpdate: <K extends keyof MocknetContractInput>(key: K, value: MocknetContractInput[K]) => void;
}) {
  const editable = detail.editable !== "none";
  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-bg/80" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center">
          <Card className="max-h-[calc(100vh-1.5rem)] w-full max-w-3xl overflow-y-auto shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-demo">
                  Graph element inspector
                </p>
                <Dialog.Title asChild>
                  <CardTitle className="mt-1 text-base">{detail.title}</CardTitle>
                </Dialog.Title>
                <Dialog.Description className="sr-only">
                  Inspect the selected contract graph element and its permitted controls.
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <Button aria-label="Close graph element inspector" size="icon" variant="ghost">
                  <X className="size-4" />
                </Button>
              </Dialog.Close>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone={detail.enforcement === "on-chain" ? "pass" : "accent"}>
                {detail.enforcement}
              </Badge>
              <Badge tone={editable ? "demo" : "neutral"}>
                {editable ? "operator editable" : "read-only invariant"}
              </Badge>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-surface-2 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  Transaction binding
                </p>
                <p className="mt-2 text-sm leading-6 text-fg">{detail.transactionBinding}</p>
              </div>
              <div className="rounded-lg border border-border bg-surface-2 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  What this enforces
                </p>
                <p className="mt-2 text-sm leading-6 text-fg">{detail.description}</p>
              </div>
            </div>

            {editable ? (
              <div className="mt-4 rounded-lg border border-demo/40 bg-demo/5 p-3">
                <div className="flex items-center gap-2">
                  <PencilLine className="size-4 text-demo" />
                  <p className="text-sm font-medium">Permitted operator controls</p>
                </div>
                <p className="mt-1 text-xs leading-5 text-muted">
                  Changes update the compiler-derived graph and local build together. They do not
                  sign, fund, attach, or broadcast anything.
                </p>
                {detail.editable === "limits" ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="inspector-payment-cap">Payment cap (BCH)</Label>
                      <Input
                        id="inspector-payment-cap"
                        value={draft.paymentCapBch}
                        onChange={(event) => onUpdate("paymentCapBch", event.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="inspector-fee-cap">Fee cap (sats)</Label>
                      <Input
                        id="inspector-fee-cap"
                        value={draft.feeCapSatoshis}
                        onChange={(event) => onUpdate("feeCapSatoshis", event.target.value)}
                      />
                    </div>
                  </div>
                ) : null}
                {detail.editable === "payment" ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="inspector-proposed-payment">Proposed payment (BCH)</Label>
                      <Input
                        id="inspector-proposed-payment"
                        value={draft.paymentBch}
                        onChange={(event) => onUpdate("paymentBch", event.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="inspector-proposed-fee">Proposed fee (sats)</Label>
                      <Input
                        id="inspector-proposed-fee"
                        value={draft.feeSatoshis}
                        onChange={(event) => onUpdate("feeSatoshis", event.target.value)}
                      />
                    </div>
                  </div>
                ) : null}
                {detail.editable === "approval" ? (
                  <div className="mt-3 max-w-sm">
                    <Label htmlFor="inspector-approval-threshold">Approval threshold</Label>
                    <Input
                      id="inspector-approval-threshold"
                      max={3}
                      min={1}
                      type="number"
                      value={draft.approvalThreshold}
                      onChange={(event) =>
                        onUpdate("approvalThreshold", Number(event.target.value))
                      }
                    />
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-4 rounded-lg border border-border bg-surface-2 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  Why this is not editable
                </p>
                <p className="mt-2 text-sm leading-6 text-fg">
                  {detail.immutableReason ??
                    "This element is derived from a reviewed contract artifact."}
                </p>
              </div>
            )}

            {detail.cashAssembly ? (
              <details className="mt-4 rounded-lg border border-border bg-surface-2 p-3">
                <summary className="cursor-pointer text-sm font-medium">
                  CashAssembly / implementation mapping
                </summary>
                <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-5 text-muted">
                  {detail.cashAssembly}
                </pre>
              </details>
            ) : null}
          </Card>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const BUILD_TRACE = [
  {
    label: "Bind the owner authorization and source covenant UTXO.",
    nodes: ["operator-signature", "vault-input"],
    edges: ["authorize", "input-0"],
  },
  {
    label: "Apply the BoundedRelease redeem checks to input 0.",
    nodes: ["bounded-release"],
    edges: [],
  },
  {
    label: "Construct and bind the reviewed payment at output 0.",
    nodes: ["payment-output-0", "compiled-limits"],
    edges: ["output-0", "caps"],
  },
  {
    label: "Construct the same-lock successor at output 1.",
    nodes: ["successor-output-1"],
    edges: ["output-1"],
  },
  {
    label: "Evaluate the off-chain approval gate and retain the reviewed artifact evidence.",
    nodes: ["approval-workflow", "artifact"],
    edges: ["approval", "artifact"],
  },
] as const;

function graphBlockingIds(blocking: Array<{ id: string }>) {
  const ids = new Set<string>();
  for (const rule of blocking) {
    if (rule.id.includes("approval")) {
      ids.add("approval-workflow");
      ids.add("approval");
    } else if (rule.id.includes("successor") || rule.id.includes("output.order")) {
      ids.add("successor-output-1");
      ids.add("output-1");
    } else if (rule.id.includes("destination") || rule.id.includes("output.cardinality")) {
      ids.add("payment-output-0");
      ids.add("output-0");
    } else if (rule.id.includes("amount") || rule.id.includes("fee") || rule.id.includes("dust")) {
      ids.add("compiled-limits");
      ids.add("caps");
    } else if (rule.id.includes("token") || rule.id.includes("utxo") || rule.id.includes("input")) {
      ids.add("vault-input");
      ids.add("input-0");
    } else {
      ids.add("bounded-release");
    }
  }
  return [...ids];
}

export function MocknetContractComposer() {
  const [draft, setDraft] = useState<MocknetContractInput>(DEFAULT_MOCKNET_CONTRACT_INPUT);
  const [inspected, setInspected] = useState<PolicyCanvasSelection | null>(null);
  const [templateId, setTemplateId] = useState<"bounded-release" | ReferenceTemplateId>(
    "bounded-release",
  );
  const [built, setBuilt] = useState(false);
  const [runStep, setRunStep] = useState<number | null>(null);
  const [runOutcome, setRunOutcome] = useState<"passed" | "blocked" | null>(null);
  const result = useMemo(() => {
    try {
      return { value: buildMocknetContract(draft), error: null };
    } catch (error) {
      return {
        value: null,
        error: error instanceof Error ? error.message : "Unable to construct mock contract",
      };
    }
  }, [draft]);
  const update = <K extends keyof MocknetContractInput>(key: K, value: MocknetContractInput[K]) => {
    setBuilt(false);
    setRunStep(null);
    setRunOutcome(null);
    setDraft((current) => ({ ...current, [key]: value }));
  };
  const referenceTemplate =
    templateId === "bounded-release"
      ? null
      : (FLOWGUARD_REFERENCE_TEMPLATES.find((template) => template.id === templateId) ?? null);
  const execution = result.value;
  const activePlan = referenceTemplate
    ? referenceTemplatePlan(referenceTemplate)
    : (execution?.plan ?? null);
  const inspectedDetail =
    inspected && activePlan
      ? referenceTemplate
        ? referenceElementDetail({
            id: inspected.id,
            plan: activePlan,
            template: referenceTemplate,
          })
        : execution
          ? mocknetElementDetail(inspected.id, execution)
          : null
      : null;
  const checks = execution
    ? [...execution.evaluation.policy.rules, ...execution.evaluation.covenant.rules]
    : [];
  useEffect(() => {
    if (runStep === null || !execution || runOutcome) return;
    const finalStep = BUILD_TRACE.length - 1;
    const timer = window.setTimeout(() => {
      if (runStep < finalStep) {
        setRunStep(runStep + 1);
        return;
      }
      setRunOutcome(execution.evaluation.policy.allowed ? "passed" : "blocked");
      setBuilt(true);
    }, 520);
    return () => window.clearTimeout(timer);
  }, [execution, runOutcome, runStep]);
  const graphRun: PolicyCanvasRunState | undefined = useMemo(() => {
    if (!execution || referenceTemplate || runStep === null) return undefined;
    const completedTrace = BUILD_TRACE.slice(0, runOutcome ? BUILD_TRACE.length : runStep);
    const current = BUILD_TRACE[Math.min(runStep, BUILD_TRACE.length - 1)]!;
    const completedNodeIds = completedTrace.flatMap((stage) => [...stage.nodes]);
    const completedEdgeIds = completedTrace.flatMap((stage) => [...stage.edges]);
    const blocking = [
      ...execution.evaluation.policy.blocking,
      ...execution.evaluation.covenant.rules.filter((rule) => !rule.pass),
    ];
    const phase = runOutcome ?? "running";
    const allNodeIds = execution.plan.canvas.nodes.map((node) => node.id);
    const allEdgeIds = execution.plan.canvas.edges.map((edge) => edge.id);
    const blockedIds = phase === "blocked" ? graphBlockingIds(blocking) : [];
    return {
      phase,
      label:
        phase === "passed"
          ? "Unsigned BCH transaction built locally; every configured policy and covenant check passed."
          : phase === "blocked"
            ? `${blocking.length} local check${blocking.length === 1 ? "" : "s"} blocked this transaction. Red nodes and edges identify the affected contract path.`
            : current.label,
      activeNodeIds: phase === "running" ? [...current.nodes] : [],
      activeEdgeIds: phase === "running" ? [...current.edges] : [],
      completedNodeIds: phase === "passed" ? allNodeIds : completedNodeIds,
      completedEdgeIds: phase === "passed" ? allEdgeIds : completedEdgeIds,
      blockedNodeIds: blockedIds.filter((id) => allNodeIds.includes(id)),
      blockedEdgeIds: blockedIds.filter((id) => allEdgeIds.includes(id)),
    };
  }, [execution, referenceTemplate, runOutcome, runStep]);
  const selectGraphElement = (selection: PolicyCanvasSelection) => {
    setInspected(selection);
  };
  const selectTemplate = (next: "bounded-release" | ReferenceTemplateId) => {
    setBuilt(false);
    setRunStep(null);
    setRunOutcome(null);
    setInspected(null);
    setTemplateId(next);
  };

  return (
    <div className="mt-4" data-tour="mocknet-contract-composer">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-demo">
              Contract workbench
            </p>
            <CardTitle className="mt-1">
              {referenceTemplate
                ? `${referenceTemplate.title} visualizer`
                : "Construct a mock Bounded Release contract"}
            </CardTitle>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              {referenceTemplate
                ? "Inspect a FlowGuard-guided state-transition shape and the implementation work required before it can become a dashboard contract."
                : "Choose the allowed controls, inspect the generated covenant, then build an unsigned mock transaction. Every change below recompiles the template; the graph is a view of the contract, not independent data."}
            </p>
          </div>
          <Badge tone="demo">mocknet only · no key access</Badge>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[260px_minmax(0,1fr)]">
          <div className="rounded-xl border border-border bg-surface-2 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              1. Template gallery
            </p>
            <button
              aria-pressed={templateId === "bounded-release"}
              className={`mt-2 w-full rounded-lg border p-3 text-left ${
                templateId === "bounded-release"
                  ? "border-accent bg-accent/10"
                  : "border-border bg-bg hover:border-accent/50"
              }`}
              onClick={() => selectTemplate("bounded-release")}
              type="button"
            >
              <p className="font-medium">Bounded Release</p>
              <p className="mt-1 text-xs leading-5 text-muted">
                Fixed recipient, per-payment ceiling, fee ceiling, and successor covenant.
              </p>
              <Badge className="mt-2" tone="pass">
                runnable mock
              </Badge>
            </button>
            {FLOWGUARD_REFERENCE_TEMPLATES.map((template) => (
              <button
                aria-pressed={templateId === template.id}
                className={`mt-2 w-full rounded-lg border p-3 text-left ${
                  templateId === template.id
                    ? "border-warn bg-warn/10"
                    : "border-border bg-bg hover:border-warn/50"
                }`}
                key={template.id}
                onClick={() => selectTemplate(template.id)}
                type="button"
              >
                <p className="font-medium">{template.title}</p>
                <p className="mt-1 text-xs leading-5 text-muted">{template.short}</p>
                <Badge className="mt-2" tone="warn">
                  reference preview
                </Badge>
              </button>
            ))}
            <p className="mt-4 text-xs leading-5 text-subtle">
              Reference previews follow FlowGuard&apos;s publicly documented covenant families. They
              are not imported artifacts, not executable in this dashboard, and cannot be funded or
              signed here.
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
              2. Contract graph
            </p>
            {activePlan ? (
              <PolicyCanvas
                plan={activePlan}
                editableTopology={false}
                onSelect={selectGraphElement}
                reference={Boolean(referenceTemplate)}
                run={graphRun}
              />
            ) : (
              <div className="rounded-xl border border-fail/40 bg-fail/5 p-4 text-sm text-fail">
                Fix the constructor values to generate an executable graph.
              </div>
            )}
            <div className="mt-3 rounded-lg border border-accent/30 bg-accent/5 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">Inspect the executable mapping</p>
                <Badge tone="accent">click a graph element</Badge>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted">
                Each node and edge opens a contract inspector showing its exact UTXO or output role,
                whether its enforcement is on-chain or off-chain, its CashAssembly mapping, and the
                reason it is editable or fixed.
              </p>
              <p className="mt-2 text-xs text-subtle">
                {referenceTemplate
                  ? "Click any node or edge for its state-transition role and its implementation gate. Select the runnable Bounded Release template to expose reviewed controls."
                  : "Click any node or edge to open its transaction binding, enforcement rule, CashAssembly mapping, and only the controls that are safe to change."}
              </p>
            </div>
          </div>
        </div>

        {referenceTemplate ? (
          <div className="mt-4 rounded-xl border border-warn/40 bg-warn/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">Reference template — implementation gate</p>
              <Badge tone="warn">cannot compile or fund</Badge>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted">
              Use this visualizer to decide whether the contract shape fits the business flow. It
              has no dashboard artifact, UTXO builder, signing path, or Chipnet funding action yet.
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  Operator controls to model
                </p>
                <ul className="mt-2 space-y-1 text-sm text-fg">
                  {referenceTemplate.controls.map((control) => (
                    <li key={control}>— {control}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  Required before enablement
                </p>
                <ul className="mt-2 space-y-1 text-sm text-fg">
                  {referenceTemplate.requiredImplementation.map((item) => (
                    <li key={item}>— {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-border bg-surface-2 p-4 text-sm leading-6 text-muted">
            Configure the contract on the graph: select{" "}
            <span className="text-fg">Compiled payment and fee caps</span> to edit covenant
            constructor values, <span className="text-fg">Payout — output 0</span> to construct the
            payment and fee, or <span className="text-fg">Workflow quorum</span> to set the
            off-chain approval threshold. Every other element explains the invariant it protects.
          </div>
        )}
      </Card>

      {inspectedDetail ? (
        <GraphElementInspector
          detail={inspectedDetail}
          draft={draft}
          onClose={() => setInspected(null)}
          onUpdate={update}
        />
      ) : null}

      {!referenceTemplate ? (
        <Card className="mt-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
                3. Compile and build
              </p>
              <CardTitle className="mt-1">Deterministic mock transaction</CardTitle>
              <p className="mt-2 text-sm leading-6 text-muted">
                This performs local template compilation and unsigned BCH transaction serialization.
                It remains a simulation until a separately signed transaction is verified by CashVM.
              </p>
            </div>
            <Button
              disabled={!execution || (runStep !== null && runOutcome === null)}
              onClick={() => {
                setBuilt(false);
                setRunOutcome(null);
                setRunStep(0);
              }}
              type="button"
            >
              <Braces className="size-4" /> Build unsigned mock transaction
            </Button>
          </div>
          {result.error ? (
            <p className="mt-3 text-sm text-fail">Cannot build: {result.error}</p>
          ) : null}
          {built && execution ? (
            <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="rounded-lg border border-border bg-surface-2 p-4">
                <div className="flex items-center gap-2">
                  {execution.evaluation.policy.allowed ? (
                    <CircleCheck className="size-5 text-pass" />
                  ) : (
                    <CircleX className="size-5 text-fail" />
                  )}
                  <p className="text-sm font-medium">
                    {execution.evaluation.policy.allowed
                      ? "Policy and covenant checks pass"
                      : "Build produced a transaction, but checks block it"}
                  </p>
                </div>
                <dl className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
                  <div>
                    <dt className="text-subtle">Mock covenant UTXO</dt>
                    <dd className="mt-1 break-all font-mono text-fg">
                      {execution.utxo.outpoint.txid}:{execution.utxo.outpoint.vout}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-subtle">New P2SH32 locking bytecode</dt>
                    <dd className="mt-1 break-all font-mono text-fg">
                      {execution.artifact.lockingBytecodeHex}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-subtle">Input value</dt>
                    <dd className="mt-1 font-mono text-fg">
                      {formatBch(execution.utxo.valueSatoshis)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-subtle">Value equation</dt>
                    <dd className="mt-1 font-mono text-fg">
                      {execution.transition.conservationLine}
                    </dd>
                  </div>
                </dl>
                <div className="mt-4 grid gap-2">
                  {execution.transition.outputs.map((output) => (
                    <div className="rounded-md border border-border bg-bg p-3" key={output.index}>
                      <p className="text-sm font-medium">
                        Output {output.index} · {output.role}
                      </p>
                      <p className="mt-1 font-mono text-xs text-fg">
                        {formatBch(output.valueSatoshis)}
                      </p>
                      <p className="mt-1 break-all font-mono text-[11px] text-muted">
                        {output.lockingBytecodeHex}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-surface-2 p-4">
                <p className="text-sm font-medium">Validation evidence</p>
                <ul className="mt-3 max-h-72 space-y-2 overflow-auto text-xs">
                  {checks.map((check, index) => (
                    <li
                      className="flex items-start justify-between gap-2"
                      key={`${check.id}-${index}`}
                    >
                      <span>
                        <span className="block text-fg">{check.label}</span>
                        <span className="block text-subtle">{check.detail}</span>
                      </span>
                      <Badge tone={check.pass ? "pass" : "fail"}>
                        {check.pass ? "pass" : "block"}
                      </Badge>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs leading-5 text-subtle">
                  This validation is local and deterministic. It is not a WalletConnect signature,
                  Chipnet provider preflight, broadcast, or confirmation.
                </p>
              </div>
            </div>
          ) : null}
        </Card>
      ) : null}

      {!referenceTemplate && execution ? (
        <Card className="mt-4">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            4. Inspect generated artifacts
          </p>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <details className="rounded-lg border border-border bg-surface-2 p-3">
              <summary className="cursor-pointer text-sm font-medium">
                <FileCode2 className="mr-2 inline size-4" />
                Generated CashAssembly redeem source
              </summary>
              <pre className="mt-3 max-h-64 overflow-auto font-mono text-xs leading-5 text-muted">
                {execution.sourceAssembly}
              </pre>
            </details>
            {built ? (
              <details className="rounded-lg border border-border bg-surface-2 p-3">
                <summary className="cursor-pointer text-sm font-medium">
                  <LockKeyhole className="mr-2 inline size-4" />
                  Serialized unsigned BCH transaction
                </summary>
                <pre className="mt-3 max-h-64 overflow-auto break-all font-mono text-xs leading-5 text-muted">
                  {execution.transition.rawHex}
                </pre>
              </details>
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-surface-2 p-3 text-sm text-subtle">
                Build the mock transaction to inspect its exact serialized bytes.
              </div>
            )}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
