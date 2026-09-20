import { IDENTITIES } from "./identities.ts";
import {
  BOUNDED_RELEASE_SHAPE_ID,
  LEGACY_TREASURY_SHAPE_ID,
  boundedReleaseRedeemSource,
  compileBoundedRelease,
  compileLegacyTreasury,
  type BoundedReleaseParams,
} from "./covenant.ts";
import { assertHex, detectLockingType, utf8Sha256Hex } from "./encoding.ts";
import { canonicalJson } from "./canonicalize.ts";
import { parseSatoshis } from "./money.ts";
import type { Network } from "./types.ts";

export const PER_PAYMENT_SATS = "5000000";
export const MAX_FEE_SATS = "2000";
export const SESSION_ALLOWANCE_SATS = "240000000";
export const VAULT_VALUE_SATS = "1250000000";
export const ARTIFACT_COMPILER = { library: "@bitauth/libauth", version: "3.0.0" } as const;

export type ReviewedArtifact = {
  id: string;
  protocol: "bch";
  network: Network;
  name: string;
  version: string;
  compiler: typeof ARTIFACT_COMPILER;
  sourceAssembly: string;
  redeemBytecodeHex: string;
  lockingBytecodeHex: string;
  operatorPkhHex: string;
  recipientLockingBytecodeHex: string;
  maxPaymentSatoshis: string;
  maxFeeSatoshis: string;
  artifactHash: string;
  reviewStatus: "reviewed" | "unreviewed";
  liveSpendEnabled: boolean;
  onChainRecipientEnforced: boolean;
  constructor: Record<string, string>;
  notes: string[];
};

export function validateBoundedReleaseParams(params: BoundedReleaseParams, network: Network = "chipnet"): BoundedReleaseParams {
  const operatorPkhHex = assertHex(params.operatorPkhHex, "operatorPkh", 20);
  const recipientLockingBytecodeHex = assertHex(
    params.recipientLockingBytecodeHex,
    "recipientLockingBytecode",
  );
  const lockType = detectLockingType(recipientLockingBytecodeHex);
  if (lockType === "unknown") throw new Error("Recipient locking bytecode is not a recognized lock");
  const maxPaymentSatoshis = parseSatoshis(params.maxPaymentSatoshis);
  const maxFeeSatoshis = parseSatoshis(params.maxFeeSatoshis);
  if (maxPaymentSatoshis <= 0n) throw new Error("Payment cap must be positive");
  if (maxFeeSatoshis <= 0n) throw new Error("Fee cap must be positive");
  if (network !== "chipnet" && network !== "mainnet") throw new Error("Unknown artifact network");
  return {
    operatorPkhHex,
    recipientLockingBytecodeHex,
    maxPaymentSatoshis: maxPaymentSatoshis.toString(),
    maxFeeSatoshis: maxFeeSatoshis.toString(),
  };
}

export function hashReviewedArtifact(input: {
  redeemBytecodeHex: string;
  lockingBytecodeHex: string;
  operatorPkhHex: string;
  recipientLockingBytecodeHex: string;
  maxPaymentSatoshis: string;
  maxFeeSatoshis: string;
  network: Network;
  sourceAssembly: string;
}): string {
  return utf8Sha256Hex(
    canonicalJson({
      redeemBytecodeHex: input.redeemBytecodeHex,
      lockingBytecodeHex: input.lockingBytecodeHex,
      operatorPkhHex: input.operatorPkhHex,
      recipientLockingBytecodeHex: input.recipientLockingBytecodeHex,
      maxPaymentSatoshis: input.maxPaymentSatoshis,
      maxFeeSatoshis: input.maxFeeSatoshis,
      network: input.network,
      sourceAssembly: input.sourceAssembly,
    }),
  );
}

export function buildBoundedReleaseArtifact(
  params: BoundedReleaseParams,
  network: Network = "chipnet",
): ReviewedArtifact {
  const valid = validateBoundedReleaseParams(params, network);
  const compiled = compileBoundedRelease(valid);
  const sourceAssembly = boundedReleaseRedeemSource(valid);
  const rec = compileBoundedRelease(valid);
  if (rec.redeemHex !== compiled.redeemHex || rec.lockingBytecodeHex !== compiled.lockingBytecodeHex) {
    throw new Error("Artifact compile is not deterministic");
  }
  if (detectLockingType(compiled.lockingBytecodeHex) !== "p2sh32") {
    throw new Error("BoundedRelease must wrap as P2SH32");
  }
  const record = {
    id: BOUNDED_RELEASE_SHAPE_ID,
    protocol: "bch" as const,
    network,
    name: "BoundedReleaseVault",
    version: "1.0.0",
    compiler: ARTIFACT_COMPILER,
    sourceAssembly,
    redeemBytecodeHex: compiled.redeemHex,
    lockingBytecodeHex: compiled.lockingBytecodeHex,
    operatorPkhHex: valid.operatorPkhHex,
    recipientLockingBytecodeHex: valid.recipientLockingBytecodeHex,
    maxPaymentSatoshis: valid.maxPaymentSatoshis,
    maxFeeSatoshis: valid.maxFeeSatoshis,
    reviewStatus: "reviewed" as const,
    liveSpendEnabled: true,
    onChainRecipientEnforced: true,
    constructor: {
      operatorPkh: valid.operatorPkhHex,
      recipientLock: valid.recipientLockingBytecodeHex,
      maxPaymentSatoshis: valid.maxPaymentSatoshis,
      maxFeeSatoshis: valid.maxFeeSatoshis,
    },
    notes: [
      "P2SH32 wrapper around a CashAssembly redeem script.",
      "On-chain: operator signature, 1-in/2-out, recipient lock, successor lock, payment cap, fee cap.",
      "Not on-chain: 2-of-3 approval, session/daily budgets, recovery, token state.",
    ],
  };
  return { ...record, artifactHash: hashReviewedArtifact(record) };
}

export const boundedReleaseArtifact = compileBoundedRelease({
  operatorPkhHex: IDENTITIES.alice.pkhHex,
  recipientLockingBytecodeHex: IDENTITIES.vendor.lockingBytecodeHex,
  maxPaymentSatoshis: PER_PAYMENT_SATS,
  maxFeeSatoshis: MAX_FEE_SATS,
});

export const reviewedBoundedRelease = buildBoundedReleaseArtifact({
  operatorPkhHex: IDENTITIES.alice.pkhHex,
  recipientLockingBytecodeHex: IDENTITIES.vendor.lockingBytecodeHex,
  maxPaymentSatoshis: PER_PAYMENT_SATS,
  maxFeeSatoshis: MAX_FEE_SATS,
});

export const legacyTreasuryArtifact = compileLegacyTreasury({
  operatorPkhHex: IDENTITIES.alice.pkhHex,
  unusedRecipientPkhHex: IDENTITIES.vendor.pkhHex,
});

export const ARTIFACT_REGISTRY: ReviewedArtifact[] = [
  reviewedBoundedRelease,
  {
    id: LEGACY_TREASURY_SHAPE_ID,
    protocol: "bch",
    network: "chipnet",
    name: "TreasuryVault (unreviewed fixture)",
    version: "0.0.0-unreviewed",
    compiler: ARTIFACT_COMPILER,
    sourceAssembly: "legacy unused recipientPkh",
    redeemBytecodeHex: legacyTreasuryArtifact.redeemHex,
    lockingBytecodeHex: legacyTreasuryArtifact.lockingBytecodeHex,
    operatorPkhHex: IDENTITIES.alice.pkhHex,
    recipientLockingBytecodeHex: IDENTITIES.vendor.lockingBytecodeHex,
    maxPaymentSatoshis: PER_PAYMENT_SATS,
    maxFeeSatoshis: MAX_FEE_SATS,
    artifactHash: utf8Sha256Hex(legacyTreasuryArtifact.redeemHex),
    reviewStatus: "unreviewed",
    liveSpendEnabled: false,
    onChainRecipientEnforced: false,
    constructor: {
      operatorPkh: IDENTITIES.alice.pkhHex,
      unusedRecipientPkh: IDENTITIES.vendor.pkhHex,
    },
    notes: [
      "Declared recipientPkh is not used to constrain output 0.",
      "Kept only as a regression fixture. Live broadcast is blocked.",
    ],
  },
];

export function artifactById(id: string) {
  return ARTIFACT_REGISTRY.find((item) => item.id === id);
}

export function assertArtifactMatchesLock(artifact: ReviewedArtifact, lockingBytecodeHex: string) {
  if (artifact.lockingBytecodeHex !== lockingBytecodeHex.toLowerCase() && artifact.lockingBytecodeHex !== lockingBytecodeHex) {
    throw new Error("Observed locking bytecode does not match the reviewed artifact");
  }
  const rebuilt = compileBoundedRelease({
    operatorPkhHex: artifact.operatorPkhHex,
    recipientLockingBytecodeHex: artifact.recipientLockingBytecodeHex,
    maxPaymentSatoshis: artifact.maxPaymentSatoshis,
    maxFeeSatoshis: artifact.maxFeeSatoshis,
  });
  if (rebuilt.lockingBytecodeHex !== artifact.lockingBytecodeHex) {
    throw new Error("Stored artifact bytecode does not match its constructor; fund a new vault");
  }
  const expectedHash = hashReviewedArtifact(artifact);
  if (expectedHash !== artifact.artifactHash) {
    throw new Error("Reviewed artifact hash does not match its canonical contents");
  }
}
