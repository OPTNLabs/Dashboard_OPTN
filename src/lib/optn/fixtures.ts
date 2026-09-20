import type { AuditEvent, ControlPlan, Proposal, UtxoState, VaultInstance } from "./types.ts";
import { IDENTITIES, authorizedApprovers } from "./identities.ts";
import {
  ARTIFACT_REGISTRY,
  MAX_FEE_SATS,
  PER_PAYMENT_SATS,
  SESSION_ALLOWANCE_SATS,
  VAULT_VALUE_SATS,
  boundedReleaseArtifact,
} from "./artifacts.ts";
import { BOUNDED_RELEASE_SHAPE_ID, defaultDirectPaymentRoute } from "./covenant.ts";
import { EMPTY_TOKEN, utf8Sha256Hex } from "./encoding.ts";
import { hashPolicy } from "./intent.ts";
import { canonicalJson } from "./canonicalize.ts";

export const DEMO_VAULT_ID = "vault-acme-treasury";
export const DEMO_PLAN_ID = "plan-acme-q3";
export const DEMO_FUNDING_TXID = utf8Sha256Hex("optn-demo-vault-funding-v1");

export function demoVaultUtxo(): UtxoState {
  return {
    network: "chipnet",
    outpoint: { txid: DEMO_FUNDING_TXID, vout: 0 },
    valueSatoshis: VAULT_VALUE_SATS,
    lockingBytecodeHex: boundedReleaseArtifact.lockingBytecodeHex,
    address: null,
    token: EMPTY_TOKEN,
    spent: false,
    spentEvidence: "fixture",
    tokenEvidence: "fixture",
    confirmations: 144,
    chainEvidence: "fixture",
    lockingType: "p2sh32",
  };
}

export function demoVault(): VaultInstance {
  const artifact = ARTIFACT_REGISTRY[0];
  const state = demoVaultUtxo();
  return {
    id: DEMO_VAULT_ID,
    network: "chipnet",
    name: "Acme Treasury (DEMO)",
    contractName: artifact.name,
    contractVersion: artifact.version,
    artifactHash: artifact.artifactHash,
    reviewedShapeId: artifact.id,
    covenantLockingBytecodeHex: artifact.lockingBytecodeHex,
    redeemBytecodeHex: artifact.redeemBytecodeHex,
    stateOutpoint: state.outpoint,
    state,
    reviewed: true,
    liveSpendEnabled: false,
    onChainRecipientEnforced: true,
    constructor: { ...artifact.constructor },
    evidence: ["FIXTURE", "DESIGNED"],
    notes: [
      "Attached as a preconfigured reviewed instance. The dashboard did not deploy or fund this vault.",
      "liveSpendEnabled is false until a Chipnet provider proves the outpoint is unspent.",
      ...artifact.notes,
    ],
  };
}

function canvasForPlan(): ControlPlan["canvas"] {
  return {
    nodes: [
      { id: "source", kind: "source", label: "Acme treasury UTXO", x: 40, y: 180, data: { vaultId: DEMO_VAULT_ID } },
      { id: "vault", kind: "vault", label: "BoundedRelease P2SH32", x: 280, y: 180, data: { shape: BOUNDED_RELEASE_SHAPE_ID } },
      { id: "asset", kind: "asset", label: "Native BCH", x: 280, y: 40, data: { asset: "native-bch" } },
      { id: "pay", kind: "route", label: "Vendor payout", x: 560, y: 80, data: { route: "DIRECT_PAYMENT" } },
      { id: "handoff", kind: "route", label: "Covenant successor", x: 560, y: 220, data: { route: "COVENANT" } },
      { id: "recovery", kind: "recovery", label: "Recovery", x: 560, y: 360, data: { route: "RECOVERY" } },
      { id: "cap", kind: "constraint", label: "0.05 BCH / 2.4 BCH session", x: 800, y: 80, data: { perPayment: PER_PAYMENT_SATS } },
      { id: "gov", kind: "governance", label: "Off-chain 2 of 3 approvers", x: 800, y: 220, data: { threshold: "2" } },
      { id: "evidence", kind: "evidence", label: "Reviewed artifact", x: 800, y: 360, data: { hash: ARTIFACT_REGISTRY[0].artifactHash.slice(0, 12) } },
    ],
    edges: [
      { id: "e1", source: "source", target: "vault", kind: "bch", label: "spend UTXO" },
      { id: "e2", source: "vault", target: "pay", kind: "bch", label: "output 0" },
      { id: "e3", source: "vault", target: "handoff", kind: "successor", label: "output 1" },
      { id: "e4", source: "vault", target: "recovery", kind: "recovery", label: "recovery path" },
      { id: "e5", source: "pay", target: "cap", kind: "bch", label: "cap" },
      { id: "e6", source: "handoff", target: "gov", kind: "approval", label: "quorum" },
      { id: "e7", source: "gov", target: "evidence", kind: "approval", label: "artifact" },
    ],
  };
}

export function demoPlan(): ControlPlan {
  const draft = {
    schemaVersion: 1 as const,
    id: DEMO_PLAN_ID,
    name: "Acme Q3 vendor allocation",
    description: "Bounded native-BCH payouts to the reviewed vendor lock, with a covenant successor.",
    network: "chipnet" as const,
    asset: { type: "native-bch" as const },
    sourceVaultId: DEMO_VAULT_ID,
    reviewedShapeId: BOUNDED_RELEASE_SHAPE_ID,
    artifactHash: ARTIFACT_REGISTRY[0].artifactHash,
    routes: [
      defaultDirectPaymentRoute({
        destinationAddress: IDENTITIES.vendor.account,
        destinationLockingBytecodeHex: IDENTITIES.vendor.lockingBytecodeHex,
        maxAmountSatoshis: PER_PAYMENT_SATS,
      }),
      {
        id: 1,
        type: "RECOVERY" as const,
        label: "Recovery",
        destinationAddress: IDENTITIES.recovery.account,
        destinationLockingBytecodeHex: IDENTITIES.recovery.lockingBytecodeHex,
        maxAmountSatoshis: VAULT_VALUE_SATS,
        successor: {
          required: false,
          outputIndex: 0,
          sameCovenantLock: false,
          description: "Fixed recovery destination; separate authority",
        },
        reviewedShapeId: BOUNDED_RELEASE_SHAPE_ID,
        enforcement: "not-implemented" as const,
        whyConstrained: "Recovery path is specified in the plan but not yet a live reviewed spend.",
      },
    ],
    governance: {
      threshold: 2,
      authorizedAccounts: authorizedApprovers(),
      proposerCannotBeSoleApprover: true,
      expirySeconds: 60 * 60,
      separationOfDuties: true,
    },
    recovery: {
      enabled: true,
      destinationAddress: IDENTITIES.recovery.account,
      destinationLockingBytecodeHex: IDENTITIES.recovery.lockingBytecodeHex,
      separateAuthority: true,
      enforcement: "not-implemented" as const,
    },
    limits: {
      perPaymentSatoshis: PER_PAYMENT_SATS,
      sessionAllowanceSatoshis: SESSION_ALLOWANCE_SATS,
      sessionConsumedSatoshis: "0",
      maxFeeSatoshis: MAX_FEE_SATS,
      windowKind: "daily" as const,
      windowCapSatoshis: "20000000",
    },
    pause: false,
    status: "active" as const,
    version: 1,
    parentPolicyId: null,
    canvas: canvasForPlan(),
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
    actor: IDENTITIES.alice.account,
  };
  return { ...draft, policyId: hashPolicy(draft) };
}

export function emptyAuditGenesis(network: "chipnet" | "mainnet" = "chipnet"): AuditEvent {
  const payload = {
    type: "system.seed",
    actor: "system",
    objectType: "system" as const,
    objectId: "optn",
    correlationId: "seed",
    summary: "Control plane store initialized",
    evidence: "FIXTURE" as const,
    at: "2026-09-01T00:00:00.000Z",
    detail: { mode: "demo" },
  };
  const eventHash = utf8Sha256Hex(canonicalJson({ prev: "0".repeat(64), ...payload }));
  return {
    id: "audit-genesis",
    network,
    seq: 1,
    prevHash: "0".repeat(64),
    eventHash,
    ...payload,
  };
}

export function demoOperatorUtxos(): UtxoState[] {
  return [
    demoVaultUtxo(),
    {
      network: "chipnet",
      outpoint: { txid: utf8Sha256Hex("optn-demo-alice-p2pkh"), vout: 1 },
      valueSatoshis: "12500000",
      lockingBytecodeHex: IDENTITIES.alice.lockingBytecodeHex,
      address: IDENTITIES.alice.account,
      token: EMPTY_TOKEN,
      spent: false,
      spentEvidence: "fixture",
      tokenEvidence: "fixture",
      confirmations: 12,
      chainEvidence: "fixture",
      lockingType: "p2pkh",
    },
  ];
}

export type ScenarioId =
  | "valid-spend"
  | "over-limit"
  | "wrong-recipient"
  | "wrong-category"
  | "altered-successor"
  | "stale-outpoint"
  | "duplicate-intent"
  | "insufficient-approvals";

export const SCENARIOS: Array<{ id: ScenarioId; label: string; detail: string }> = [
  { id: "valid-spend", label: "Valid spend", detail: "0.02 BCH to the reviewed vendor lock" },
  { id: "over-limit", label: "Over-limit spend", detail: "0.08 BCH exceeds the 0.05 BCH cap" },
  { id: "wrong-recipient", label: "Wrong recipient", detail: "Payment lock is not the reviewed vendor" },
  { id: "wrong-category", label: "Wrong token category", detail: "Native route rejects a token-bearing UTXO" },
  { id: "altered-successor", label: "Altered successor", detail: "Successor lock does not match the vault" },
  { id: "stale-outpoint", label: "Stale outpoint", detail: "Source UTXO is already spent" },
  { id: "duplicate-intent", label: "Duplicate intent", detail: "Same idempotency key returns the original proposal" },
  { id: "insufficient-approvals", label: "Insufficient approvals", detail: "One signature cannot meet a 2-of-3 threshold" },
];

export function isProposal(value: unknown): value is Proposal {
  return Boolean(value && typeof value === "object" && "intentHash" in value);
}
