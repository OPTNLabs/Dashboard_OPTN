import { useCallback, useEffect, useMemo } from "react";
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
} from "@xyflow/react";
import type { CanvasEdge, CanvasNode, CanvasNodeKind, ControlPlan } from "@/lib/optn/types";
import { cn } from "@/lib/utils";

export type PolicyCanvasSelection = { kind: "node" | "edge"; id: string };

export type PolicyCanvasRunState = {
  phase: "running" | "passed" | "blocked";
  label: string;
  activeNodeIds: string[];
  activeEdgeIds: string[];
  completedNodeIds: string[];
  completedEdgeIds: string[];
  blockedNodeIds?: string[];
  blockedEdgeIds?: string[];
};

const KIND_TONE: Record<CanvasNodeKind, string> = {
  source: "border-accent/50",
  vault: "border-pass/50",
  asset: "border-border-strong",
  route: "border-accent/40",
  constraint: "border-warn/40",
  governance: "border-fg/20",
  recovery: "border-fail/40",
  evidence: "border-muted/40",
};

function FlowNode({
  data,
}: {
  data: {
    label: string;
    kind: CanvasNodeKind;
    detail?: string;
    selected?: boolean;
    runStatus?: "active" | "passed" | "blocked";
  };
}) {
  return (
    <div
      className={cn(
        "min-w-40 rounded-lg border bg-surface-2 px-3 py-2 shadow-sm",
        KIND_TONE[data.kind],
        data.selected && "ring-1 ring-accent",
        data.runStatus === "active" &&
          "border-accent bg-accent/10 ring-1 ring-accent animate-pulse",
        data.runStatus === "passed" && "border-pass bg-pass/10",
        data.runStatus === "blocked" && "border-fail bg-fail/10",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="target"
        className="!size-2 !border-border !bg-accent"
      />
      <p className="font-mono text-[10px] uppercase tracking-wide text-subtle">{data.kind}</p>
      <p className="text-sm font-medium">{data.label}</p>
      {data.detail ? (
        <p className="mt-1 max-w-48 truncate text-[11px] text-muted">{data.detail}</p>
      ) : null}
      {data.runStatus ? (
        <p
          className={cn(
            "mt-1 font-mono text-[10px] uppercase tracking-wide",
            data.runStatus === "blocked"
              ? "text-fail"
              : data.runStatus === "passed"
                ? "text-pass"
                : "text-accent",
          )}
        >
          {data.runStatus}
        </p>
      ) : null}
      <Handle
        type="source"
        position={Position.Right}
        id="source"
        className="!size-2 !border-border !bg-accent"
      />
    </div>
  );
}

const nodeTypes: NodeTypes = { optn: FlowNode };

function edgeStroke(kind: CanvasEdge["kind"] | string | undefined): string {
  if (kind === "successor") return "#3ecf8e";
  if (kind === "recovery") return "#e15d5d";
  if (kind === "approval") return "#e0b044";
  return "#4aa3e8";
}

function runStatus(
  id: string,
  run: PolicyCanvasRunState | undefined,
): "active" | "passed" | "blocked" | undefined {
  if (!run) return undefined;
  if (run.blockedNodeIds?.includes(id) || run.blockedEdgeIds?.includes(id)) return "blocked";
  if (run.activeNodeIds.includes(id) || run.activeEdgeIds.includes(id)) return "active";
  if (run.completedNodeIds.includes(id) || run.completedEdgeIds.includes(id)) return "passed";
  return undefined;
}

function toFlow(plan: ControlPlan, run?: PolicyCanvasRunState): { nodes: Node[]; edges: Edge[] } {
  return {
    nodes: plan.canvas.nodes.map((node) => ({
      id: node.id,
      type: "optn",
      position: { x: node.x, y: node.y },
      data: {
        label: node.label,
        kind: node.kind,
        detail: Object.values(node.data)[0],
        runStatus: runStatus(node.id, run),
      },
    })),
    edges: plan.canvas.edges.map((edge) => {
      const status = runStatus(edge.id, run);
      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: "source",
        targetHandle: "target",
        label: edge.label,
        data: { kind: edge.kind },
        animated: status === "active",
        style: {
          stroke:
            status === "passed"
              ? "#3ecf8e"
              : status === "blocked"
                ? "#e15d5d"
                : edgeStroke(edge.kind),
          strokeWidth: status ? 2.5 : 1,
        },
      };
    }),
  };
}

function fromFlow(
  nodes: Node[],
  edges: Edge[],
  plan: ControlPlan,
): { nodes: CanvasNode[]; edges: CanvasEdge[] } {
  return {
    nodes: nodes.map((node) => {
      const original = plan.canvas.nodes.find((item) => item.id === node.id);
      return {
        id: node.id,
        kind: (node.data.kind as CanvasNodeKind) ?? original?.kind ?? "constraint",
        label: String(node.data.label ?? original?.label ?? node.id),
        x: node.position.x,
        y: node.position.y,
        data: original?.data ?? {},
      };
    }),
    edges: edges.map((edge) => {
      const original = plan.canvas.edges.find((item) => item.id === edge.id);
      const kind = (edge.data?.kind as CanvasEdge["kind"] | undefined) ?? original?.kind ?? "bch";
      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        kind,
        label: String(edge.label ?? original?.label ?? ""),
      };
    }),
  };
}

const PALETTE: Array<{ kind: CanvasNodeKind; label: string }> = [
  { kind: "source", label: "Existing vault UTXO" },
  { kind: "vault", label: "Reviewed vault" },
  { kind: "asset", label: "Native BCH" },
  { kind: "route", label: "Fixed recipient" },
  { kind: "constraint", label: "Per-payment cap" },
  { kind: "governance", label: "Approval quorum" },
  { kind: "recovery", label: "Recovery route" },
  { kind: "evidence", label: "Artifact hash" },
];

export function PolicyCanvas({
  plan,
  onChange,
  editableTopology = true,
  onSelect,
  reference = false,
  run,
}: {
  plan: ControlPlan;
  onChange?: (canvas: ControlPlan["canvas"]) => void;
  /** Live plans use the compiler-generated graph; only its layout may change. */
  editableTopology?: boolean;
  onSelect?: (selection: PolicyCanvasSelection) => void;
  /** Reference graphs describe a contract family but have no local artifact or builder. */
  reference?: boolean;
  /** Optional local execution state rendered directly on the compiled graph. */
  run?: PolicyCanvasRunState;
}) {
  const seed = useMemo(() => toFlow(plan, run), [plan, run]);
  const [nodes, setNodes, onNodesChange] = useNodesState(seed.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(seed.edges);

  // React Flow initializes state once. The executable compiler can replace
  // labels/data after a plan save, so synchronize the rendered graph with the
  // canonical plan rather than leaving stale fixture nodes on screen.
  useEffect(() => {
    const next = toFlow(plan, run);
    setNodes(next.nodes);
    setEdges(next.edges);
  }, [plan, run, setEdges, setNodes]);

  const persist = useCallback(
    (nextNodes: Node[], nextEdges: Edge[]) => {
      onChange?.(fromFlow(nextNodes, nextEdges, plan));
    },
    [onChange, plan],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((current) => {
        const next = addEdge(
          {
            ...connection,
            sourceHandle: connection.sourceHandle ?? "source",
            targetHandle: connection.targetHandle ?? "target",
            label: "bch",
            data: { kind: "bch" },
            style: { stroke: edgeStroke("bch") },
          },
          current,
        );
        persist(nodes, next);
        return next;
      });
    },
    [nodes, persist, setEdges],
  );

  function addNode(kind: CanvasNodeKind, label: string) {
    const id = `${kind}-${nodes.length + 1}`;
    const next = [
      ...nodes,
      {
        id,
        type: "optn",
        position: { x: 80 + nodes.length * 24, y: 80 + nodes.length * 18 },
        data: { label, kind },
      },
    ];
    setNodes(next);
    persist(next, edges);
  }

  function selectNode(id: string) {
    setNodes((current) =>
      current.map((node) => ({
        ...node,
        data: { ...node.data, selected: node.id === id },
      })),
    );
    onSelect?.({ kind: "node", id });
  }

  return (
    <div className="grid gap-3 lg:grid-cols-[220px_1fr]">
      <div className="rounded-xl border border-border bg-surface p-3">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
          {editableTopology
            ? "Reviewed palette"
            : reference
              ? "Reference mapping"
              : "Executable mapping"}
        </p>
        {editableTopology ? (
          <div className="grid gap-1.5">
            {PALETTE.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => addNode(item.kind, item.label)}
                className="rounded-md border border-border bg-surface-2 px-3 py-2 text-left text-xs hover:border-accent/40"
              >
                <span className="block font-mono text-[10px] uppercase text-subtle">
                  {item.kind}
                </span>
                {item.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-pass/30 bg-surface-2 p-3 text-xs leading-relaxed text-muted">
            {reference
              ? "This graph is a contract-family specification only. It has no dashboard artifact, state builder, signer, or broadcast path."
              : "This graph is compiled from the attached vault's redeem bytecode and plan record. Drag nodes to arrange the view; topology, locks, output order, and compiled limits are not editable here."}
          </div>
        )}
        {run ? (
          <div
            className={cn(
              "mt-3 rounded-md border p-3 text-xs leading-relaxed",
              run.phase === "blocked"
                ? "border-fail/40 bg-fail/5 text-fail"
                : run.phase === "passed"
                  ? "border-pass/40 bg-pass/5 text-pass"
                  : "border-accent/40 bg-accent/5 text-accent",
            )}
          >
            <p className="font-medium">
              {run.phase === "running"
                ? "Local build in progress"
                : run.phase === "passed"
                  ? "Local build passed"
                  : "Local build blocked"}
            </p>
            <p className="mt-1">{run.label}</p>
          </div>
        ) : null}
        <p className="mt-3 text-[11px] leading-relaxed text-subtle">
          {editableTopology
            ? "Only reviewed route templates can be placed. Operators configure limits; they cannot drop opcodes or CashScript onto the canvas."
            : reference
              ? "Click a node or edge to see its state-transition role and implementation gate. Reference controls cannot be edited or funded in this dashboard yet."
              : "Click a node or edge to inspect its transaction binding. Only reviewed, exposed controls can be edited; recipient, output order, and successor lock changes require a new covenant vault."}
        </p>
      </div>
      <div className="optn-grid h-[520px] overflow-hidden rounded-xl border border-border bg-bg">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={editableTopology ? onEdgesChange : undefined}
          onConnect={editableTopology ? onConnect : undefined}
          onNodeDragStop={() => persist(nodes, edges)}
          onNodeClick={(_, node) => selectNode(node.id)}
          onEdgeClick={(_, edge) => onSelect?.({ kind: "edge", id: edge.id })}
          nodesConnectable={editableTopology}
          deleteKeyCode={editableTopology ? "Backspace" : null}
          fitView
        >
          <Background color="#243041" gap={24} />
          <Controls />
          <MiniMap
            pannable
            zoomable
            maskColor="rgb(8 11 16 / 0.7)"
            nodeColor="#1c2531"
            className="!bg-surface !border-border"
          />
        </ReactFlow>
      </div>
    </div>
  );
}
