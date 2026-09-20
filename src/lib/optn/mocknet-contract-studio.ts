import {
  boundedReleaseRedeemSource,
  compileBoundedRelease,
  type BoundedReleaseParams,
} from "./covenant.ts";
import { EMPTY_TOKEN, utf8Sha256Hex } from "./encoding.ts";
import { demoPlan } from "./fixtures.ts";
import { IDENTITIES } from "./identities.ts";
import { bchToSatoshis, parseSatoshis } from "./money.ts";
import { evaluatePolicy } from "./policy.ts";
import { buildUnsignedVaultRelease } from "./tx-builder.ts";
import type { CanvasEdge, CanvasNode, ControlPlan, UtxoState } from "./types.ts";

/**
 * A browser-only, deterministic contract workbench. It constructs the same
 * redeem bytecode and unsigned transaction shape that the live flow uses, but
 * deliberately has no signer, provider, or broadcast capability.
 */
export type MocknetContractInput = {
  paymentCapBch: string;
  feeCapSatoshis: string;
  approvalThreshold: number;
  paymentBch: string;
  feeSatoshis: string;
};

/**
 * The graph is intentionally not a general-purpose programming surface. Each
 * selectable item maps to one reviewed part of the BoundedRelease transition.
 * This descriptor makes that mapping inspectable and says precisely which
 * fields (if any) a business operator may change.
 */
export type MocknetElementDetail = {
  title: string;
  enforcement: "on-chain" | "off-chain policy" | "transaction construction" | "evidence";
  transactionBinding: string;
  description: string;
  editable: "none" | "limits" | "payment" | "approval";
  immutableReason?: string;
  cashAssembly?: string;
};

export const DEFAULT_MOCKNET_CONTRACT_INPUT: MocknetContractInput = {
  paymentCapBch: "0.05",
  feeCapSatoshis: "2000",
  approvalThreshold: 2,
  paymentBch: "0.02",
  feeSatoshis: "1000",
};

const MOCK_VAULT_VALUE_SATOSHIS = "100000000";

function draftPlan(args: {
  artifactHash: string;
  paymentCapSatoshis: string;
  feeCapSatoshis: string;
  approvalThreshold: number;
}): ControlPlan {
  const plan = demoPlan();
  const route = plan.routes[0]!;
  return {
    ...plan,
    artifactHash: args.artifactHash,
    routes: [{ ...route, maxAmountSatoshis: args.paymentCapSatoshis }],
    governance: { ...plan.governance, threshold: args.approvalThreshold },
    recovery: { ...plan.recovery, enabled: false },
    limits: {
      ...plan.limits,
      perPaymentSatoshis: args.paymentCapSatoshis,
      maxFeeSatoshis: args.feeCapSatoshis,
    },
  };
}

function mockVault(lockingBytecodeHex: string): UtxoState {
  return {
    network: "chipnet",
    outpoint: { txid: utf8Sha256Hex("optn-mocknet-contract-composer-v1"), vout: 0 },
    valueSatoshis: MOCK_VAULT_VALUE_SATOSHIS,
    lockingBytecodeHex,
    address: null,
    token: EMPTY_TOKEN,
    spent: false,
    spentEvidence: "fixture",
    tokenEvidence: "fixture",
    confirmations: 0,
    chainEvidence: "fixture",
    lockingType: "p2sh32",
  };
}

function executableCanvas(args: {
  utxo: UtxoState;
  lockingBytecodeHex: string;
  artifactHash: string;
  paymentCapSatoshis: string;
  feeCapSatoshis: string;
  approvalThreshold: number;
}): ControlPlan["canvas"] {
  const nodes: CanvasNode[] = [
    {
      id: "operator-signature",
      kind: "governance",
      label: "Owner signature",
      x: 30,
      y: 50,
      data: { operatorPkh: IDENTITIES.alice.pkhHex },
    },
    {
      id: "vault-input",
      kind: "source",
      label: "Mock covenant UTXO — input 0",
      x: 30,
      y: 230,
      data: {
        outpoint: `${args.utxo.outpoint.txid}:${args.utxo.outpoint.vout}`,
        value: args.utxo.valueSatoshis,
      },
    },
    {
      id: "bounded-release",
      kind: "vault",
      label: "BoundedRelease P2SH32",
      x: 330,
      y: 180,
      data: { lockingBytecode: args.lockingBytecodeHex },
    },
    {
      id: "payment-output-0",
      kind: "route",
      label: "Payout — output 0",
      x: 620,
      y: 75,
      data: { recipientLock: IDENTITIES.vendor.lockingBytecodeHex, cap: args.paymentCapSatoshis },
    },
    {
      id: "successor-output-1",
      kind: "route",
      label: "Controlled remainder — output 1",
      x: 620,
      y: 280,
      data: { successorLock: args.lockingBytecodeHex },
    },
    {
      id: "compiled-limits",
      kind: "constraint",
      label: `Cap ${args.paymentCapSatoshis} sats · fee ${args.feeCapSatoshis} sats`,
      x: 900,
      y: 75,
      data: { paymentCap: args.paymentCapSatoshis, feeCap: args.feeCapSatoshis },
    },
    {
      id: "approval-workflow",
      kind: "governance",
      label: `Workflow quorum ${args.approvalThreshold} of 3`,
      x: 900,
      y: 280,
      data: { threshold: String(args.approvalThreshold), enforcement: "off-chain-policy" },
    },
    {
      id: "artifact",
      kind: "evidence",
      label: "Generated artifact",
      x: 900,
      y: 420,
      data: { artifactHash: args.artifactHash },
    },
  ];
  const edges: CanvasEdge[] = [
    {
      id: "authorize",
      source: "operator-signature",
      target: "bounded-release",
      kind: "approval",
      label: "CHECKSIG",
    },
    {
      id: "input-0",
      source: "vault-input",
      target: "bounded-release",
      kind: "bch",
      label: "input 0",
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
      label: "compiled caps",
    },
    {
      id: "approval",
      source: "successor-output-1",
      target: "approval-workflow",
      kind: "approval",
      label: "approval gate",
    },
    {
      id: "artifact",
      source: "approval-workflow",
      target: "artifact",
      kind: "approval",
      label: "review evidence",
    },
  ];
  return { nodes, edges };
}

export function buildMocknetContract(input: MocknetContractInput) {
  const paymentCapSatoshis = bchToSatoshis(input.paymentCapBch).toString();
  const feeCapSatoshis = parseSatoshis(input.feeCapSatoshis).toString();
  const paymentSatoshis = bchToSatoshis(input.paymentBch).toString();
  const feeSatoshis = parseSatoshis(input.feeSatoshis).toString();
  if (
    !Number.isInteger(input.approvalThreshold) ||
    input.approvalThreshold < 1 ||
    input.approvalThreshold > 3
  ) {
    throw new Error("Approval threshold must be between 1 and 3 for the mock organization");
  }
  if (parseSatoshis(paymentCapSatoshis) <= 0n || parseSatoshis(feeCapSatoshis) <= 0n) {
    throw new Error("Payment and fee caps must be positive");
  }

  const parameters: BoundedReleaseParams = {
    operatorPkhHex: IDENTITIES.alice.pkhHex,
    recipientLockingBytecodeHex: IDENTITIES.vendor.lockingBytecodeHex,
    maxPaymentSatoshis: paymentCapSatoshis,
    maxFeeSatoshis: feeCapSatoshis,
  };
  const artifact = compileBoundedRelease(parameters);
  const draftPlanRecord = draftPlan({
    artifactHash: utf8Sha256Hex(artifact.redeemHex),
    paymentCapSatoshis,
    feeCapSatoshis,
    approvalThreshold: input.approvalThreshold,
  });
  const utxo = mockVault(artifact.lockingBytecodeHex);
  const transition = buildUnsignedVaultRelease({
    utxo,
    paymentLockingBytecodeHex: IDENTITIES.vendor.lockingBytecodeHex,
    successorLockingBytecodeHex: artifact.lockingBytecodeHex,
    amountSatoshis: paymentSatoshis,
    feeSatoshis,
  });
  const evaluation = evaluatePolicy({
    plan: draftPlanRecord,
    vaultLockingBytecodeHex: artifact.lockingBytecodeHex,
    utxo,
    routeId: 0,
    amountSatoshis: paymentSatoshis,
    feeSatoshis,
    destinationLockingBytecodeHex: IDENTITIES.vendor.lockingBytecodeHex,
    successorLockingBytecodeHex: artifact.lockingBytecodeHex,
    approvals: [
      { account: IDENTITIES.bob.account },
      { account: IDENTITIES.alice.account },
      { account: IDENTITIES.carol.account },
    ].slice(0, input.approvalThreshold),
    proposerAccount: IDENTITIES.alice.account,
  });
  const canvas = executableCanvas({
    utxo,
    lockingBytecodeHex: artifact.lockingBytecodeHex,
    artifactHash: utf8Sha256Hex(artifact.redeemHex),
    paymentCapSatoshis,
    feeCapSatoshis,
    approvalThreshold: input.approvalThreshold,
  });
  return {
    input,
    parameters,
    artifact,
    plan: { ...draftPlanRecord, canvas },
    utxo,
    transition,
    evaluation,
    sourceAssembly: boundedReleaseRedeemSource(parameters),
  };
}

/**
 * Return the contract/transaction explanation for a graph node or edge. The
 * text deliberately comes from the same compiled execution object rendered in
 * the workbench, rather than from a second decorative graph model.
 */
export function mocknetElementDetail(
  id: string,
  execution: ReturnType<typeof buildMocknetContract>,
): MocknetElementDetail {
  const payment = execution.transition.outputs[0]!;
  const successor = execution.transition.outputs[1]!;
  const capRules = [
    `<${execution.parameters.maxPaymentSatoshis}> OP_LESSTHANOREQUAL`,
    `<${execution.parameters.maxFeeSatoshis}> OP_LESSTHANOREQUAL`,
  ].join("\n");
  const paymentLockRule = `<0> OP_OUTPUTBYTECODE <0x${execution.parameters.recipientLockingBytecodeHex}> OP_EQUALVERIFY`;
  const successorLockRule = `<0> OP_UTXOBYTECODE <1> OP_OUTPUTBYTECODE OP_EQUALVERIFY`;

  switch (id) {
    case "operator-signature":
    case "authorize":
      return {
        title: "Owner authorization",
        enforcement: "on-chain",
        transactionBinding:
          "The unlocking script supplies the owner public key and a signature for input 0.",
        description:
          "The redeem script hashes that public key and compares it with the enrolled owner hash before OP_CHECKSIG verifies the transaction signature.",
        editable: "none",
        immutableReason:
          "The owner identity is a covenant constructor value. Changing it creates a different P2SH32 lock and requires a newly funded vault.",
        cashAssembly: `<0> OP_UTXOVALUE OP_DROP\nOP_DUP OP_HASH160 <0x${execution.parameters.operatorPkhHex}> OP_EQUALVERIFY\nOP_CHECKSIG`,
      };
    case "vault-input":
    case "input-0":
      return {
        title: "Covenant UTXO at transaction input 0",
        enforcement: "on-chain",
        transactionBinding: `${execution.utxo.outpoint.txid}:${execution.utxo.outpoint.vout} is the single mock input; value ${execution.utxo.valueSatoshis} sats; token state is native BCH only.`,
        description:
          "BoundedRelease accepts exactly one input and requires the covenant UTXO to be input index 0. This prevents an unreviewed input set from changing the intended transition shape.",
        editable: "none",
        immutableReason:
          "A spend consumes a specific funded UTXO. Select or fund a different vault only through the dedicated vault lifecycle, never by editing a transaction diagram.",
        cashAssembly: `OP_TXINPUTCOUNT <1> OP_NUMEQUALVERIFY\nOP_INPUTINDEX <0> OP_NUMEQUALVERIFY\nOP_UTXOTOKENCATEGORY OP_SIZE <0> OP_NUMEQUALVERIFY`,
      };
    case "bounded-release":
      return {
        title: "BoundedRelease P2SH32 covenant",
        enforcement: "on-chain",
        transactionBinding: `The active input is locked by P2SH32 bytecode ${execution.artifact.lockingBytecodeHex}.`,
        description:
          "This reviewed template is the executable contract. It binds owner authorization, one native-BCH input, output count and ordering, the payment destination, caps, and a same-lock successor.",
        editable: "none",
        immutableReason:
          "Template shape and its opcode sequence are reviewed code. Operators configure exposed constructor values; they do not modify CashAssembly directly in this MVP.",
        cashAssembly: execution.sourceAssembly,
      };
    case "payment-output-0":
    case "output-0":
      return {
        title: "Payment at transaction output 0",
        enforcement: "on-chain",
        transactionBinding: `Output 0 pays ${payment.valueSatoshis} sats to the enrolled recipient lock. It must remain output index 0.`,
        description:
          "Change the proposed payment to construct a different unsigned transaction. The output lock remains fixed by the covenant; the amount must be positive and no greater than the compiled per-payment cap.",
        editable: "payment",
        cashAssembly: `${paymentLockRule}\n<0> OP_OUTPUTVALUE OP_DUP OP_0NOTEQUALVERIFY\n<${execution.parameters.maxPaymentSatoshis}> OP_LESSTHANOREQUALVERIFY`,
      };
    case "compiled-limits":
    case "caps":
      return {
        title: "Compiled payment and fee caps",
        enforcement: "on-chain",
        transactionBinding: `Payment ≤ ${execution.parameters.maxPaymentSatoshis} sats and fee ≤ ${execution.parameters.maxFeeSatoshis} sats are embedded in this covenant instance.`,
        description:
          "These controls are constructor values. Editing either recompiles the redeem script, changes the P2SH32 locking bytecode, and produces a different vault that must be separately funded before any real spend.",
        editable: "limits",
        cashAssembly: capRules,
      };
    case "successor-output-1":
    case "output-1":
      return {
        title: "Controlled successor at transaction output 1",
        enforcement: "on-chain",
        transactionBinding: `Output 1 retains ${successor.valueSatoshis} sats and exactly reuses the active covenant's P2SH32 lock.`,
        description:
          "The remaining BCH stays constrained for the next state transition. The covenant fixes both output count and output order, so there is no unbounded change output or alternate recipient path.",
        editable: "none",
        immutableReason:
          "The successor locking bytecode and output position are safety invariants, not dashboard preferences. Changing either would bypass this covenant's preservation rule.",
        cashAssembly: `OP_TXOUTPUTCOUNT <2> OP_NUMEQUALVERIFY\n${successorLockRule}`,
      };
    case "approval-workflow":
    case "approval":
      return {
        title: "Off-chain approval workflow",
        enforcement: "off-chain policy",
        transactionBinding: `${execution.input.approvalThreshold} of 3 recorded approvers must approve the same intent before an operator may request a wallet signature.`,
        description:
          "This workflow is advisory to the covenant: it protects the dashboard's authorization process, but it is not an opcode in BoundedRelease and cannot override the on-chain recipient, caps, or successor rules.",
        editable: "approval",
        cashAssembly:
          "No CashAssembly: this is an off-chain workflow gate evaluated before signing.",
      };
    case "artifact":
      return {
        title: "Generated contract artifact",
        enforcement: "evidence",
        transactionBinding: `Artifact hash ${execution.plan.artifactHash} identifies the reviewed redeem source and its P2SH32 lock.`,
        description:
          "Use this evidence to compare the reviewed contract source, constructor values, and funded vault locking bytecode before attaching a real UTXO.",
        editable: "none",
        immutableReason:
          "Evidence is derived from the compiled contract. Edit a permitted control instead; the artifact will be regenerated deterministically.",
        cashAssembly: execution.sourceAssembly,
      };
    default:
      return {
        title: "Reviewed graph element",
        enforcement: "evidence",
        transactionBinding:
          "This element is part of the compiler-generated BoundedRelease transition.",
        description:
          "The graph is derived from the contract and transaction builder, so unknown elements are read-only until a reviewed template explicitly exposes them.",
        editable: "none",
      };
  }
}
