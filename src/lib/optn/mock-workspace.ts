import { boundedReleaseRedeemSource, compileBoundedRelease } from "./covenant.ts";
import { utf8Sha256Hex } from "./encoding.ts";
import { IDENTITIES } from "./identities.ts";
import { bchToSatoshis, parseSatoshis, satoshisToBch } from "./money.ts";

/**
 * Local-only model used by the product walkthrough. It intentionally records
 * mock identifiers rather than chain transaction ids: nothing in this file can
 * sign, fund, query a provider, or broadcast.
 */
export type MockEvidence = "mock-fixture" | "local-deterministic" | "permitted-future";
export type MockScenario =
  "happy" | "wrong-recipient" | "over-cap" | "over-fee" | "missing-successor" | "stale-input";

export type MockToken = {
  category: string;
  name: string;
  ticker: string;
  supply: string;
  decimals: number;
  genesisOutpoint: string;
  mintingNft: boolean;
  mutableNft: boolean;
};

export type MockContractInstance = {
  id: string;
  revision: number;
  status: "funded" | "unfunded";
  maxPaymentSatoshis: string;
  maxFeeSatoshis: string;
  recipientLock: string;
  lockingBytecodeHex: string;
  redeemSource: string;
  artifactFingerprint: string;
};

export type MockVaultUtxo = {
  outpoint: string;
  valueSatoshis: string;
  lockingBytecodeHex: string;
  instanceId: string;
  state: "active" | "spent";
  evidence: MockEvidence;
  transition: number;
};

export type MockProposal = {
  id: string;
  instanceId: string;
  amountSatoshis: string;
  feeSatoshis: string;
  recipientLock: string;
  revision: number;
  workflow: "draft" | "needs-review" | "invalidated";
};

export type MockValidation = {
  id: string;
  label: string;
  detail: string;
  kind: "on-chain" | "workflow" | "construction";
  pass: boolean;
};

export type MockSimulation = {
  scenario: MockScenario;
  input: MockVaultUtxo;
  paymentSatoshis: string;
  feeSatoshis: string;
  recipientLock: string;
  successorLock: string | null;
  validations: MockValidation[];
  successorSatoshis: string | null;
  allowed: boolean;
};

export type MockWorkspaceState = {
  template: { id: "bounded-release-v1"; status: "reviewed"; source: string };
  fundedInstance: MockContractInstance;
  candidateInstance: MockContractInstance | null;
  vault: MockVaultUtxo;
  proposal: MockProposal;
  token: MockToken | null;
  audit: Array<{ id: string; label: string; detail: string; evidence: MockEvidence }>;
  transitionCount: number;
};

const DEFAULT_PAYMENT = "75000000";
const DEFAULT_FEE = "1000";
const DEFAULT_VAULT_VALUE = "844000000";

function createInstance(args: {
  revision: number;
  maxPaymentSatoshis: string;
  maxFeeSatoshis: string;
  recipientLock: string;
  status: "funded" | "unfunded";
}): MockContractInstance {
  const compiled = compileBoundedRelease({
    operatorPkhHex: IDENTITIES.alice.pkhHex,
    recipientLockingBytecodeHex: args.recipientLock,
    maxPaymentSatoshis: args.maxPaymentSatoshis,
    maxFeeSatoshis: args.maxFeeSatoshis,
  });
  const redeemSource = boundedReleaseRedeemSource({
    operatorPkhHex: IDENTITIES.alice.pkhHex,
    recipientLockingBytecodeHex: args.recipientLock,
    maxPaymentSatoshis: args.maxPaymentSatoshis,
    maxFeeSatoshis: args.maxFeeSatoshis,
  });
  return {
    id: `mock-instance-v${args.revision}`,
    revision: args.revision,
    status: args.status,
    maxPaymentSatoshis: args.maxPaymentSatoshis,
    maxFeeSatoshis: args.maxFeeSatoshis,
    recipientLock: args.recipientLock,
    lockingBytecodeHex: compiled.lockingBytecodeHex,
    redeemSource,
    artifactFingerprint: utf8Sha256Hex(compiled.redeemHex).slice(0, 16),
  };
}

export function createMockWorkspace(): MockWorkspaceState {
  const fundedInstance = createInstance({
    revision: 1,
    maxPaymentSatoshis: "100000000",
    maxFeeSatoshis: "2000",
    recipientLock: IDENTITIES.vendor.lockingBytecodeHex,
    status: "funded",
  });
  const vault: MockVaultUtxo = {
    outpoint: "mock:funding:0",
    valueSatoshis: DEFAULT_VAULT_VALUE,
    lockingBytecodeHex: fundedInstance.lockingBytecodeHex,
    instanceId: fundedInstance.id,
    state: "active",
    evidence: "mock-fixture",
    transition: 0,
  };
  return {
    template: {
      id: "bounded-release-v1",
      status: "reviewed",
      source: "Reviewed BoundedRelease native-BCH family",
    },
    fundedInstance,
    candidateInstance: null,
    vault,
    proposal: {
      id: "mock-proposal-001",
      instanceId: fundedInstance.id,
      amountSatoshis: DEFAULT_PAYMENT,
      feeSatoshis: DEFAULT_FEE,
      recipientLock: fundedInstance.recipientLock,
      revision: 1,
      workflow: "draft",
    },
    token: null,
    transitionCount: 0,
    audit: [
      {
        id: "mock-audit-seed",
        label: "Mock workspace initialized",
        detail: "A fixture covenant UTXO is available only for local deterministic scenarios.",
        evidence: "mock-fixture",
      },
    ],
  };
}

export function withCandidateInstance(
  state: MockWorkspaceState,
  changes: Partial<
    Pick<MockContractInstance, "maxPaymentSatoshis" | "maxFeeSatoshis" | "recipientLock">
  >,
): MockWorkspaceState {
  const base = state.candidateInstance ?? state.fundedInstance;
  const candidate = createInstance({
    revision: state.fundedInstance.revision + 1,
    maxPaymentSatoshis: changes.maxPaymentSatoshis ?? base.maxPaymentSatoshis,
    maxFeeSatoshis: changes.maxFeeSatoshis ?? base.maxFeeSatoshis,
    recipientLock: changes.recipientLock ?? base.recipientLock,
    status: "unfunded",
  });
  return {
    ...state,
    candidateInstance: candidate,
    audit: [
      {
        id: `mock-audit-instance-${candidate.revision}`,
        label: `Plan configuration v${candidate.revision} compiled`,
        detail:
          "This is an unfunded candidate instance. The active vault and its constraints remain v1.",
        evidence: "local-deterministic",
      },
      ...state.audit,
    ],
  };
}

export function reviseMockProposal(
  state: MockWorkspaceState,
  changes: Partial<Pick<MockProposal, "amountSatoshis" | "feeSatoshis" | "recipientLock">>,
): MockWorkspaceState {
  const workflow: MockProposal["workflow"] =
    state.proposal.workflow === "needs-review" ? "invalidated" : "draft";
  const proposal: MockProposal = {
    ...state.proposal,
    ...changes,
    revision: state.proposal.revision + 1,
    workflow,
  };
  return {
    ...state,
    proposal,
    audit: [
      {
        id: `mock-audit-proposal-${proposal.revision}`,
        label: `Proposal intent revised to r${proposal.revision}`,
        detail:
          "The transaction intent changed. Any workflow review is invalidated; the funded covenant instance did not change.",
        evidence: "local-deterministic",
      },
      ...state.audit,
    ],
  };
}

export function requestMockWorkflowReview(state: MockWorkspaceState): MockWorkspaceState {
  return {
    ...state,
    proposal: { ...state.proposal, workflow: "needs-review" },
    audit: [
      {
        id: `mock-audit-review-${state.proposal.revision}`,
        label: "Mock workflow review requested",
        detail:
          "This records no signature and creates no approval authority. On-chain validation is independent.",
        evidence: "local-deterministic",
      },
      ...state.audit,
    ],
  };
}

export function simulateMockTransition(
  state: MockWorkspaceState,
  scenario: MockScenario = "happy",
): MockSimulation {
  const instance = state.fundedInstance;
  const input = state.vault;
  const payment = parseSatoshis(state.proposal.amountSatoshis);
  const fee = parseSatoshis(state.proposal.feeSatoshis);
  const inputValue = parseSatoshis(input.valueSatoshis);
  const recipientLock =
    scenario === "wrong-recipient"
      ? IDENTITIES.recovery.lockingBytecodeHex
      : state.proposal.recipientLock;
  const proposedPayment =
    scenario === "over-cap" ? parseSatoshis(instance.maxPaymentSatoshis) + 1n : payment;
  const proposedFee = scenario === "over-fee" ? parseSatoshis(instance.maxFeeSatoshis) + 1n : fee;
  const successorLock = scenario === "missing-successor" ? null : instance.lockingBytecodeHex;
  const simulatedSpent = scenario === "stale-input" || input.state === "spent";
  const successor = inputValue - proposedPayment - proposedFee;
  const validations: MockValidation[] = [
    {
      id: "input",
      label: "Input 0 is the active covenant UTXO",
      detail: `${input.outpoint} · ${satoshisToBch(input.valueSatoshis)} BCH`,
      kind: "construction",
      pass: !simulatedSpent,
    },
    {
      id: "outputs",
      label: "Exactly two ordered outputs",
      detail: "output 0 = payment; output 1 = covenant successor",
      kind: "on-chain",
      pass: successorLock !== null,
    },
    {
      id: "recipient",
      label: "Payment output 0 uses the enrolled recipient lock",
      detail: "Compared as locking bytecode, not as an account balance.",
      kind: "on-chain",
      pass: recipientLock === instance.recipientLock,
    },
    {
      id: "cap",
      label: "Payment is within the on-chain cap",
      detail: `${proposedPayment.toString()} sats ≤ ${instance.maxPaymentSatoshis} sats`,
      kind: "on-chain",
      pass: proposedPayment > 0n && proposedPayment <= parseSatoshis(instance.maxPaymentSatoshis),
    },
    {
      id: "fee",
      label: "Fee is within the on-chain cap",
      detail: `${proposedFee.toString()} sats ≤ ${instance.maxFeeSatoshis} sats`,
      kind: "on-chain",
      pass: proposedFee >= 0n && proposedFee <= parseSatoshis(instance.maxFeeSatoshis),
    },
    {
      id: "successor",
      label: "Output 1 retains the same covenant lock",
      detail: "The next controlled state must be locked by this same instance.",
      kind: "on-chain",
      pass: successorLock === instance.lockingBytecodeHex,
    },
    {
      id: "conservation",
      label: "BCH value is conserved",
      detail: `${inputValue.toString()} = ${proposedPayment.toString()} payment + ${successor.toString()} successor + ${proposedFee.toString()} fee`,
      kind: "construction",
      pass: successor > 546n,
    },
    {
      id: "token",
      label: "No CashToken state enters this native-BCH route",
      detail: "CashToken accounting is separate and this reviewed template has no token route.",
      kind: "on-chain",
      pass: true,
    },
  ];
  return {
    scenario,
    input,
    paymentSatoshis: proposedPayment.toString(),
    feeSatoshis: proposedFee.toString(),
    recipientLock,
    successorLock,
    successorSatoshis: successor > 546n ? successor.toString() : null,
    validations,
    allowed: validations.every((item) => item.pass),
  };
}

export function applyMockTransition(
  state: MockWorkspaceState,
  simulation: MockSimulation,
): MockWorkspaceState {
  if (!simulation.allowed || !simulation.successorSatoshis) return state;
  const transition = state.transitionCount + 1;
  const successor: MockVaultUtxo = {
    outpoint: `mock:transition-${transition}:1`,
    valueSatoshis: simulation.successorSatoshis,
    lockingBytecodeHex: state.fundedInstance.lockingBytecodeHex,
    instanceId: state.fundedInstance.id,
    state: "active",
    evidence: "local-deterministic",
    transition,
  };
  return {
    ...state,
    transitionCount: transition,
    vault: successor,
    proposal: {
      ...state.proposal,
      amountSatoshis: DEFAULT_PAYMENT,
      feeSatoshis: DEFAULT_FEE,
      recipientLock: state.fundedInstance.recipientLock,
      revision: state.proposal.revision + 1,
      workflow: "draft",
    },
    audit: [
      {
        id: `mock-audit-transition-${transition}`,
        label: `Local deterministic transition ${transition} applied`,
        detail: `The mock input was consumed in the model and output 1 is now the active mock covenant UTXO. Nothing was signed or broadcast.`,
        evidence: "local-deterministic",
      },
      ...state.audit,
    ],
  };
}

export function issueMockCashToken(
  state: MockWorkspaceState,
  values: {
    name: string;
    ticker: string;
    supply: string;
    mintingNft: boolean;
    mutableNft: boolean;
  },
): MockWorkspaceState {
  const supply = values.supply.trim();
  if (!/^\d+$/.test(supply) || BigInt(supply) <= 0n)
    throw new Error("Initial fungible supply must be a positive whole number");
  const category = utf8Sha256Hex(
    `mock-cashtoken-genesis-vout-0:${values.name}:${values.ticker}:${supply}`,
  ).slice(0, 40);
  const token: MockToken = {
    category,
    name: values.name.trim() || "Mock Credit",
    ticker: values.ticker.trim().toUpperCase() || "MOCK",
    supply,
    decimals: 0,
    genesisOutpoint: "mock:cashtoken-genesis:0",
    mintingNft: values.mintingNft,
    mutableNft: values.mutableNft,
  };
  return {
    ...state,
    token,
    audit: [
      {
        id: `mock-audit-token-${category.slice(0, 8)}`,
        label: `${token.ticker} mock CashToken issuance simulated`,
        detail: `Category derives from mock genesis output 0. ${token.supply} fungible units exist only in the mock ledger; metadata is not category identity.`,
        evidence: "local-deterministic",
      },
      ...state.audit,
    ],
  };
}

export function satsFromBch(value: string) {
  return bchToSatoshis(value).toString();
}
