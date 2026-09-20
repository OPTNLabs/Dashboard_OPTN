import type { ControlPlan, GovernancePolicy, Network, Outpoint, UtxoState } from "./types.ts";
import { canonicalJson } from "./canonicalize.ts";
import { utf8Sha256Hex } from "./encoding.ts";
import { chainIdFor } from "./networks.ts";

export const INTENT_PROTOCOL = "OPTN-ALLOCATION-INTENT-V1";
export const LOGIN_PROTOCOL = "OPTN-CONTROL-LOGIN-V1";

export type CanonicalIntent = {
  protocol: typeof INTENT_PROTOCOL;
  network: Network;
  chainId: string;
  walletConnectChainId: string;
  planId: string;
  planVersion: number;
  policyId: string;
  artifactId: string;
  artifactHash: string;
  proposalId: string;
  vaultId: string;
  sourceOutpoints: Outpoint[];
  inputValueSatoshis: string;
  inputTokenCategory: string | null;
  inputTokenAmount: string;
  inputTokenCapability: string;
  txVersion: number;
  locktime: number;
  inputSequence: number;
  outputs: Array<{
    index: number;
    role: string;
    valueSatoshis: string;
    lockingBytecodeHex: string;
    tokenCategory: string | null;
    tokenAmount: string;
  }>;
  destinationLockingBytecodeHex: string;
  routeId: number;
  amountSatoshis: string;
  feeSatoshis: string;
  feeCapSatoshis: string;
  successorLockingBytecodeHex: string;
  threshold: number;
  nonce: string;
  createdAt: string;
  expiresAt: string;
};


import { TX_VERSION, SEQUENCE_ENABLE_LOCKTIME } from "./tx-constants.ts";


export function buildCanonicalIntent(args: {
  plan: ControlPlan;
  proposalId: string;
  vaultId: string;
  utxo: UtxoState;
  routeId: number;
  amountSatoshis: string;
  feeSatoshis: string;
  destinationLockingBytecodeHex: string;
  successorLockingBytecodeHex: string;
  successorValueSatoshis: string;
  nonce: string;
  createdAt: string;
  expiresAt: string;
  artifactId?: string;
  artifactHash?: string;
  txVersion?: number;
  locktime?: number;
  inputSequence?: number;
}): CanonicalIntent {
  const chainId = chainIdFor(args.plan.network);
  return {
    protocol: INTENT_PROTOCOL,
    network: args.plan.network,
    chainId,
    walletConnectChainId: chainId,
    planId: args.plan.id,
    planVersion: args.plan.version,
    policyId: args.plan.policyId,
    artifactId: args.artifactId ?? args.plan.reviewedShapeId,
    artifactHash: args.artifactHash ?? args.plan.artifactHash,
    proposalId: args.proposalId,
    vaultId: args.vaultId,
    sourceOutpoints: [args.utxo.outpoint],
    inputValueSatoshis: args.utxo.valueSatoshis,
    inputTokenCategory: args.utxo.token.categoryHex,
    inputTokenAmount: args.utxo.token.amount,
    inputTokenCapability: args.utxo.token.nftCapability,
    txVersion: args.txVersion ?? TX_VERSION,
    locktime: args.locktime ?? 0,
    inputSequence: args.inputSequence ?? SEQUENCE_ENABLE_LOCKTIME,
    outputs: [
      {
        index: 0,
        role: "payment",
        valueSatoshis: args.amountSatoshis,
        lockingBytecodeHex: args.destinationLockingBytecodeHex,
        tokenCategory: null,
        tokenAmount: "0",
      },
      {
        index: 1,
        role: "successor",
        valueSatoshis: args.successorValueSatoshis,
        lockingBytecodeHex: args.successorLockingBytecodeHex,
        tokenCategory: null,
        tokenAmount: "0",
      },
    ],
    destinationLockingBytecodeHex: args.destinationLockingBytecodeHex,
    routeId: args.routeId,
    amountSatoshis: args.amountSatoshis,
    feeSatoshis: args.feeSatoshis,
    feeCapSatoshis: args.plan.limits.maxFeeSatoshis,
    successorLockingBytecodeHex: args.successorLockingBytecodeHex,
    threshold: args.plan.governance.threshold,
    nonce: args.nonce,
    createdAt: args.createdAt,
    expiresAt: args.expiresAt,
  };
}


export function hashIntent(intent: CanonicalIntent): string {
  return utf8Sha256Hex(canonicalJson(intent));
}

export function hashPolicy(plan: Omit<ControlPlan, "policyId" | "updatedAt" | "canvas" | "status" | "actor"> & {
  canvas?: ControlPlan["canvas"];
  pause?: boolean;
}): string {
  // Canvas coordinates are visual layout only and are intentionally excluded.
  // sessionConsumedSatoshis is accounting state, not policy semantics.
  return utf8Sha256Hex(
    canonicalJson({
      schemaVersion: plan.schemaVersion,
      network: plan.network,
      asset: plan.asset,
      sourceVaultId: plan.sourceVaultId,
      reviewedShapeId: plan.reviewedShapeId,
      artifactHash: plan.artifactHash,
      routes: plan.routes,
      governance: plan.governance,
      recovery: plan.recovery,
      limits: {
        perPaymentSatoshis: plan.limits.perPaymentSatoshis,
        sessionAllowanceSatoshis: plan.limits.sessionAllowanceSatoshis,
        maxFeeSatoshis: plan.limits.maxFeeSatoshis,
        windowKind: plan.limits.windowKind,
        windowCapSatoshis: plan.limits.windowCapSatoshis,
      },
      pause: plan.pause ?? false,
      version: plan.version,
    }),
  );
}

export function loginMessage(args: {
  origin: string;
  network: Network;
  account: string;
  nonce: string;
  issuedAt: string;
  expiresAt: string;
}): string {
  return [
    LOGIN_PROTOCOL,
    `domain: ${args.origin}`,
    `network: ${args.network}`,
    `account: ${args.account}`,
    `nonce: ${args.nonce}`,
    `issuedAt: ${args.issuedAt}`,
    `expiresAt: ${args.expiresAt}`,
    "purpose: authenticate operator access to the OPTN Dashboard",
  ].join("\n");
}

export function approvalMessage(intentHash: string, network: Network, proposalId: string): string {
  return [
    "OPTN-APPROVAL-V1",
    `network: ${network}`,
    `chainId: ${chainIdFor(network)}`,
    `proposal: ${proposalId}`,
    `intentHash: ${intentHash}`,
    "purpose: authorize this exact allocation intent",
  ].join("\n");
}

export function governanceFingerprint(governance: GovernancePolicy): string {
  return utf8Sha256Hex(canonicalJson(governance));
}
