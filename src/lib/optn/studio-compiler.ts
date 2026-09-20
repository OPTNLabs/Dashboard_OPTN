import type {
  CanvasEdge,
  CanvasNode,
  ControlPlan,
  PolicyRuleResult,
  VaultInstance,
} from "./types.ts";
import { BOUNDED_RELEASE_SHAPE_ID, boundedReleaseRedeemSource } from "./covenant.ts";
import { formatBch } from "./money.ts";

/**
 * The Studio is an executable-policy view, not a general-purpose diagrammer.
 * This compiler is the single mapping from a funded BoundedRelease vault and a
 * plan to the graph shown to an operator. Positions may be changed for
 * readability; node roles, output indices, locks, and limits may not.
 */
export type ExecutableStudio = {
  canvas: ControlPlan["canvas"];
  transaction: {
    input: { index: 0; outpoint: string; lockingBytecodeHex: string };
    outputs: Array<{
      index: 0 | 1;
      role: "payment" | "successor";
      lockingBytecodeHex: string;
      constraint: string;
    }>;
  };
  covenant: {
    operatorPkhHex: string;
    recipientLockingBytecodeHex: string;
    maxPaymentSatoshis: string;
    maxFeeSatoshis: string;
  };
  sourceAssembly: string;
};

export type ExecutableElementDetail = {
  title: string;
  transactionBinding: string;
  enforcement: "on-chain" | "off-chain-policy" | "provider-evidence";
  editable: string;
  assembly?: string;
};

function constructorValue(vault: VaultInstance, key: string): string {
  const value = vault.constructor[key];
  if (!value) throw new Error(`Attached vault is missing immutable constructor field ${key}`);
  return value;
}

function directRoute(plan: ControlPlan) {
  const route = plan.routes.find((item) => item.id === 0 && item.type === "DIRECT_PAYMENT");
  if (!route) throw new Error("Plan has no executable direct-payment route at output 0");
  return route;
}

function positionMap(canvas: ControlPlan["canvas"]) {
  return new Map(canvas.nodes.map((node) => [node.id, { x: node.x, y: node.y }]));
}

function node(
  positions: ReturnType<typeof positionMap>,
  id: string,
  kind: CanvasNode["kind"],
  label: string,
  fallback: { x: number; y: number },
  data: Record<string, string>,
): CanvasNode {
  const position = positions.get(id) ?? fallback;
  return { id, kind, label, x: position.x, y: position.y, data };
}

/** Fail closed when a plan claims a different execution surface than its UTXO covenant. */
export function assertPlanMatchesVaultArtifact(plan: ControlPlan, vault: VaultInstance): void {
  if (plan.sourceVaultId !== vault.id)
    throw new Error("Plan source vault does not match the attached vault");
  if (
    plan.reviewedShapeId !== BOUNDED_RELEASE_SHAPE_ID ||
    vault.reviewedShapeId !== BOUNDED_RELEASE_SHAPE_ID
  ) {
    throw new Error("Only the reviewed BoundedRelease shape has an executable Studio mapping");
  }
  if (!vault.reviewed || !vault.onChainRecipientEnforced) {
    throw new Error("Attached vault is not a reviewed recipient-enforcing covenant");
  }
  if (plan.artifactHash !== vault.artifactHash) {
    throw new Error("Plan artifact hash does not match the funded vault artifact");
  }
  const route = directRoute(plan);
  const recipientLock = constructorValue(vault, "recipientLock");
  const maxPaymentSatoshis = constructorValue(vault, "maxPaymentSatoshis");
  const maxFeeSatoshis = constructorValue(vault, "maxFeeSatoshis");
  constructorValue(vault, "operatorPkh");
  if (route.destinationLockingBytecodeHex !== recipientLock) {
    throw new Error("Plan payment destination differs from the funded covenant recipient lock");
  }
  if (route.maxAmountSatoshis !== maxPaymentSatoshis) {
    throw new Error("Plan route cap differs from the funded covenant payment cap");
  }
  if (plan.limits.perPaymentSatoshis !== maxPaymentSatoshis) {
    throw new Error("Plan payment cap differs from the funded covenant payment cap");
  }
  if (plan.limits.maxFeeSatoshis !== maxFeeSatoshis) {
    throw new Error("Plan fee cap differs from the funded covenant fee cap");
  }
}

export function compileExecutableStudio(plan: ControlPlan, vault: VaultInstance): ExecutableStudio {
  assertPlanMatchesVaultArtifact(plan, vault);
  const route = directRoute(plan);
  const operatorPkhHex = constructorValue(vault, "operatorPkh");
  const recipientLockingBytecodeHex = constructorValue(vault, "recipientLock");
  const maxPaymentSatoshis = constructorValue(vault, "maxPaymentSatoshis");
  const maxFeeSatoshis = constructorValue(vault, "maxFeeSatoshis");
  const positions = positionMap(plan.canvas);
  const nodes: CanvasNode[] = [
    node(
      positions,
      "source-utxo",
      "source",
      "Attached vault UTXO",
      { x: 40, y: 200 },
      {
        outpoint: `${vault.stateOutpoint.txid}:${vault.stateOutpoint.vout}`,
        valueSatoshis: vault.state.valueSatoshis,
      },
    ),
    node(
      positions,
      "bounded-release",
      "vault",
      "BoundedRelease P2SH32",
      { x: 290, y: 200 },
      {
        artifactHash: vault.artifactHash,
        lockingBytecodeHex: vault.covenantLockingBytecodeHex,
      },
    ),
    node(
      positions,
      "native-bch",
      "asset",
      "Native BCH only",
      { x: 290, y: 50 },
      {
        asset: "native-bch",
        tokenPolicy: "reject-token-bearing-input",
      },
    ),
    node(
      positions,
      "payment-output-0",
      "route",
      "Payment — output 0",
      { x: 560, y: 90 },
      {
        outputIndex: "0",
        routeId: String(route.id),
        lockingBytecodeHex: recipientLockingBytecodeHex,
      },
    ),
    node(
      positions,
      "successor-output-1",
      "route",
      "Successor covenant — output 1",
      { x: 560, y: 260 },
      {
        outputIndex: "1",
        lockingBytecodeHex: vault.covenantLockingBytecodeHex,
      },
    ),
    node(
      positions,
      "compiled-limits",
      "constraint",
      "Compiled payment and fee caps",
      { x: 830, y: 90 },
      {
        maxPaymentSatoshis,
        maxFeeSatoshis,
        display: `${formatBch(maxPaymentSatoshis)} / ${maxFeeSatoshis} sats fee`,
      },
    ),
    node(
      positions,
      "approval-policy",
      "governance",
      "Off-chain approval policy",
      { x: 830, y: 260 },
      {
        threshold: String(plan.governance.threshold),
        authorizedAccounts: String(plan.governance.authorizedAccounts.length),
        enforcement: "off-chain-policy",
      },
    ),
    node(
      positions,
      "reviewed-artifact",
      "evidence",
      "Reviewed covenant artifact",
      { x: 830, y: 410 },
      {
        artifactHash: vault.artifactHash,
        redeemBytecodeHex: vault.redeemBytecodeHex,
      },
    ),
  ];
  const edges: CanvasEdge[] = [
    {
      id: "input-0",
      source: "source-utxo",
      target: "bounded-release",
      kind: "bch",
      label: "input 0",
    },
    {
      id: "native-asset",
      source: "native-bch",
      target: "bounded-release",
      kind: "bch",
      label: "native BCH",
    },
    {
      id: "output-0",
      source: "bounded-release",
      target: "payment-output-0",
      kind: "bch",
      label: "output 0",
    },
    {
      id: "output-1",
      source: "bounded-release",
      target: "successor-output-1",
      kind: "successor",
      label: "output 1",
    },
    {
      id: "caps",
      source: "payment-output-0",
      target: "compiled-limits",
      kind: "bch",
      label: "on-chain caps",
    },
    {
      id: "approval",
      source: "successor-output-1",
      target: "approval-policy",
      kind: "approval",
      label: "workflow approval",
    },
    {
      id: "artifact",
      source: "approval-policy",
      target: "reviewed-artifact",
      kind: "approval",
      label: "bound artifact",
    },
  ];
  return {
    canvas: { nodes, edges },
    transaction: {
      input: {
        index: 0,
        outpoint: `${vault.stateOutpoint.txid}:${vault.stateOutpoint.vout}`,
        lockingBytecodeHex: vault.covenantLockingBytecodeHex,
      },
      outputs: [
        {
          index: 0,
          role: "payment",
          lockingBytecodeHex: recipientLockingBytecodeHex,
          constraint: `value > 0 and value <= ${maxPaymentSatoshis} sats`,
        },
        {
          index: 1,
          role: "successor",
          lockingBytecodeHex: vault.covenantLockingBytecodeHex,
          constraint: "same P2SH32 lock; value = input - payment - fee",
        },
      ],
    },
    covenant: { operatorPkhHex, recipientLockingBytecodeHex, maxPaymentSatoshis, maxFeeSatoshis },
    sourceAssembly: boundedReleaseRedeemSource({
      operatorPkhHex,
      recipientLockingBytecodeHex,
      maxPaymentSatoshis,
      maxFeeSatoshis,
    }),
  };
}

/** Human-readable binding for a selected graph element, sourced from the same compiler inputs. */
export function executableElementDetail(
  id: string,
  execution: ExecutableStudio,
): ExecutableElementDetail | null {
  const payment = execution.transaction.outputs[0]!;
  const successor = execution.transaction.outputs[1]!;
  const details: Record<string, ExecutableElementDetail> = {
    "source-utxo": {
      title: "Provider-proven covenant UTXO",
      transactionBinding: `Transaction input 0 spends ${execution.transaction.input.outpoint}.`,
      enforcement: "provider-evidence",
      editable: "Select a different vault only by attaching a separately provider-proven UTXO.",
    },
    "bounded-release": {
      title: "P2SH32 covenant lock",
      transactionBinding:
        "Input 0 must reveal this vault's redeem bytecode and satisfy its signature and output checks.",
      enforcement: "on-chain",
      editable:
        "Not editable. Altering it creates a different P2SH32 address and requires new funding.",
      assembly: execution.sourceAssembly,
    },
    "native-bch": {
      title: "Native BCH input policy",
      transactionBinding:
        "The builder rejects a token-bearing source UTXO and constructs token-free outputs.",
      enforcement: "off-chain-policy",
      editable: "CashToken routes require a separately reviewed covenant and transaction builder.",
    },
    "payment-output-0": {
      title: "Payment output 0",
      transactionBinding: `Output 0 is locked to ${payment.lockingBytecodeHex}.`,
      enforcement: "on-chain",
      editable:
        "Recipient is immutable for this funded vault. Enroll a new recipient and fund a new covenant to change it.",
      assembly: `<0> OP_OUTPUTBYTECODE <0x${payment.lockingBytecodeHex}> OP_EQUALVERIFY`,
    },
    "successor-output-1": {
      title: "Successor covenant output 1",
      transactionBinding: `Output 1 is locked to ${successor.lockingBytecodeHex} with value = input - payment - fee.`,
      enforcement: "on-chain",
      editable: "Not editable. It preserves the covenant for the remaining BCH.",
      assembly: "<0> OP_UTXOBYTECODE <1> OP_OUTPUTBYTECODE OP_EQUALVERIFY",
    },
    "compiled-limits": {
      title: "Compiled payment and fee limits",
      transactionBinding: `Payment <= ${execution.covenant.maxPaymentSatoshis} sats; fee <= ${execution.covenant.maxFeeSatoshis} sats.`,
      enforcement: "on-chain",
      editable:
        "These limits are constructor values. A changed limit requires a newly compiled and funded vault.",
      assembly: `<0> OP_OUTPUTVALUE <${execution.covenant.maxPaymentSatoshis}> OP_LESSTHANOREQUAL OP_VERIFY\n<0> OP_UTXOVALUE <0> OP_OUTPUTVALUE OP_SUB <1> OP_OUTPUTVALUE OP_SUB <${execution.covenant.maxFeeSatoshis}> OP_LESSTHANOREQUAL`,
    },
    "approval-policy": {
      title: "Organization approval policy",
      transactionBinding:
        "Approval signatures bind the canonical intent before the transaction can be built.",
      enforcement: "off-chain-policy",
      editable:
        "Threshold is editable within the configured organization. It is not a BoundedRelease opcode.",
    },
    "reviewed-artifact": {
      title: "Reviewed artifact binding",
      transactionBinding:
        "The plan and attached UTXO both bind this artifact hash before proposal and transaction stages proceed.",
      enforcement: "on-chain",
      editable:
        "A different artifact is a different covenant. It must be reviewed, funded, and attached separately.",
      assembly: execution.sourceAssembly,
    },
    "input-0": {
      title: "Input binding",
      transactionBinding:
        "The redeem script requires exactly one input and the active covenant input at index 0.",
      enforcement: "on-chain",
      editable: "The input set is fixed by the covenant; adding fee inputs is rejected.",
      assembly: "OP_TXINPUTCOUNT <1> OP_NUMEQUALVERIFY OP_INPUTINDEX <0> OP_NUMEQUALVERIFY",
    },
    "output-0": {
      title: "Payment-output binding",
      transactionBinding:
        "The redeem script requires the reviewed recipient payment at transaction output 0.",
      enforcement: "on-chain",
      editable: "Output ordering is not editable for this covenant shape.",
      assembly: `<0> OP_OUTPUTBYTECODE <0x${payment.lockingBytecodeHex}> OP_EQUALVERIFY`,
    },
    "output-1": {
      title: "Successor-output binding",
      transactionBinding:
        "The remaining BCH must be placed in the same covenant at transaction output 1.",
      enforcement: "on-chain",
      editable: "Output ordering and successor lock are fixed after funding.",
      assembly: "<0> OP_UTXOBYTECODE <1> OP_OUTPUTBYTECODE OP_EQUALVERIFY",
    },
    caps: {
      title: "Value and fee controls",
      transactionBinding:
        "The contract checks the payment cap and derives the fee from input minus both outputs.",
      enforcement: "on-chain",
      editable: "Use a replacement-vault design to alter these constructor values.",
      assembly: `<0> OP_OUTPUTVALUE <${execution.covenant.maxPaymentSatoshis}> OP_LESSTHANOREQUAL OP_VERIFY`,
    },
    approval: {
      title: "Approval workflow binding",
      transactionBinding:
        "The visual edge represents an off-chain gate before signing; it does not add an opcode to the covenant.",
      enforcement: "off-chain-policy",
      editable: "Edit the organization threshold and publish a new policy version.",
    },
    artifact: {
      title: "Artifact-review binding",
      transactionBinding:
        "The policy ID and artifact hash are included in proposal validation and signing review.",
      enforcement: "off-chain-policy",
      editable: "Review and fund a new artifact to change code-level behavior.",
    },
  };
  return details[id] ?? null;
}

export function executableStudioRules(plan: ControlPlan, vault: VaultInstance): PolicyRuleResult[] {
  const checks: Array<{
    id: PolicyRuleResult["id"];
    label: string;
    detail: string;
    test: () => void;
  }> = [
    {
      id: "input.cardinality",
      label: "Exactly one covenant input at index 0",
      detail: "The transaction builder and redeem script both require one input.",
      test: () => assertPlanMatchesVaultArtifact(plan, vault),
    },
    {
      id: "output.cardinality",
      label: "Exactly two outputs",
      detail: "Output 0 is the payment; output 1 is the covenant successor.",
      test: () => assertPlanMatchesVaultArtifact(plan, vault),
    },
    {
      id: "destination.lock-mismatch",
      label: "Payment lock is the funded covenant recipient lock",
      detail: "The recipient bytecode is immutable after funding.",
      test: () => assertPlanMatchesVaultArtifact(plan, vault),
    },
    {
      id: "successor.lock-mismatch",
      label: "Successor keeps the exact P2SH32 vault lock",
      detail: "Remaining BCH cannot become ordinary change.",
      test: () => assertPlanMatchesVaultArtifact(plan, vault),
    },
    {
      id: "amount.over-per-payment",
      label: "Payment cap is the compiled covenant cap",
      detail: "The Studio cannot raise the cap after the vault is funded.",
      test: () => assertPlanMatchesVaultArtifact(plan, vault),
    },
    {
      id: "fee.over-cap",
      label: "Fee cap is the compiled covenant cap",
      detail: "The Studio cannot raise the fee ceiling after the vault is funded.",
      test: () => assertPlanMatchesVaultArtifact(plan, vault),
    },
  ];
  return checks.map((check) => {
    try {
      check.test();
      return {
        id: check.id,
        label: check.label,
        pass: true,
        enforcement: "on-chain",
        detail: check.detail,
      };
    } catch (error) {
      return {
        id: check.id,
        label: check.label,
        pass: false,
        enforcement: "on-chain",
        detail: error instanceof Error ? error.message : "Executable mapping is unavailable",
      };
    }
  });
}
