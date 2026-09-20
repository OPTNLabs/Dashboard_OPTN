import type { CovenantDecision, Enforcement, PolicyRuleResult, ReviewedRoute } from "./types.ts";
import {
  binToHex,
  compileAsm,
  encodeLockingBytecodeP2pkh,
  hexToBin,
  p2sh32LockFromRedeem,
} from "./encoding.ts";
import { parseSatoshis } from "./money.ts";

export const BOUNDED_RELEASE_SHAPE_ID = "bounded-release-v1";
export const LEGACY_TREASURY_SHAPE_ID = "treasury-vault-unreviewed-v0";

export type BoundedReleaseParams = {
  operatorPkhHex: string;
  recipientLockingBytecodeHex: string;
  maxPaymentSatoshis: string;
  maxFeeSatoshis: string;
};

export function boundedReleaseRedeemSource(params: BoundedReleaseParams): string {
  return [
    `OP_DUP OP_HASH160 <0x${params.operatorPkhHex}> OP_EQUALVERIFY OP_CHECKSIGVERIFY`,
    "OP_TXINPUTCOUNT <1> OP_NUMEQUALVERIFY",
    "OP_TXOUTPUTCOUNT <2> OP_NUMEQUALVERIFY",
    "OP_INPUTINDEX <0> OP_NUMEQUALVERIFY",
    "<0> OP_UTXOBYTECODE <1> OP_OUTPUTBYTECODE OP_EQUALVERIFY",
    `<0> OP_OUTPUTBYTECODE <0x${params.recipientLockingBytecodeHex}> OP_EQUALVERIFY`,
    `<0> OP_OUTPUTVALUE <${params.maxPaymentSatoshis}> OP_LESSTHANOREQUAL OP_VERIFY`,
    `<0> OP_UTXOVALUE <0> OP_OUTPUTVALUE OP_SUB <1> OP_OUTPUTVALUE OP_SUB <${params.maxFeeSatoshis}> OP_LESSTHANOREQUAL`,
  ].join(" ");
}

export function compileBoundedRelease(params: BoundedReleaseParams): {
  redeem: Uint8Array;
  lockingBytecode: Uint8Array;
  redeemHex: string;
  lockingBytecodeHex: string;
} {
  const redeem = compileAsm(boundedReleaseRedeemSource(params));
  const lockingBytecode = p2sh32LockFromRedeem(redeem);
  return {
    redeem,
    lockingBytecode,
    redeemHex: binToHex(redeem),
    lockingBytecodeHex: binToHex(lockingBytecode),
  };
}

/** Legacy fixture that declares a recipient but does not check output 0. */
export function legacyTreasuryRedeemSource(params: {
  operatorPkhHex: string;
  unusedRecipientPkhHex: string;
}): string {
  return [
    `OP_DUP OP_HASH160 <0x${params.operatorPkhHex}> OP_EQUALVERIFY OP_CHECKSIGVERIFY`,
    "OP_TXINPUTCOUNT <1> OP_NUMEQUALVERIFY",
    "OP_TXOUTPUTCOUNT <2> OP_NUMEQUALVERIFY",
    "OP_INPUTINDEX <0> OP_NUMEQUALVERIFY",
    "<0> OP_UTXOBYTECODE <1> OP_OUTPUTBYTECODE OP_EQUALVERIFY",
    // recipientPkh is intentionally unused — regression target
    `<0x${params.unusedRecipientPkhHex}> OP_DROP`,
    "<0> OP_OUTPUTVALUE <0> OP_UTXOVALUE OP_LESSTHANOREQUAL",
  ].join(" ");
}

export function compileLegacyTreasury(params: {
  operatorPkhHex: string;
  unusedRecipientPkhHex: string;
}): { redeem: Uint8Array; lockingBytecode: Uint8Array; redeemHex: string; lockingBytecodeHex: string } {
  const redeem = compileAsm(legacyTreasuryRedeemSource(params));
  const lockingBytecode = p2sh32LockFromRedeem(redeem);
  return {
    redeem,
    lockingBytecode,
    redeemHex: binToHex(redeem),
    lockingBytecodeHex: binToHex(lockingBytecode),
  };
}

export type ShapeCheckInput = {
  shapeId: string;
  inputCount: number;
  outputCount: number;
  activeInputIndex: number;
  paymentLockingBytecodeHex: string;
  expectedPaymentLockingBytecodeHex: string;
  successorLockingBytecodeHex: string;
  expectedSuccessorLockingBytecodeHex: string;
  paymentSatoshis: string;
  maxPaymentSatoshis: string;
  feeSatoshis: string;
  maxFeeSatoshis: string;
  inputTokenCategory: string | null;
  outputTokenCategories: Array<string | null>;
};

function rule(
  id: PolicyRuleResult["id"],
  label: string,
  pass: boolean,
  enforcement: Enforcement,
  detail: string,
): PolicyRuleResult {
  return { id, label, pass, enforcement, detail };
}

export function evaluateReviewedShape(input: ShapeCheckInput): CovenantDecision {
  const onChain = input.shapeId === BOUNDED_RELEASE_SHAPE_ID;
  const enforcement: Enforcement = onChain ? "on-chain" : "simulation-only";
  const rules: PolicyRuleResult[] = [
    rule(
      "input.cardinality",
      "Exactly one vault input",
      input.inputCount === 1 && input.activeInputIndex === 0,
      enforcement,
      `${input.inputCount} input(s), active index ${input.activeInputIndex}`,
    ),
    rule(
      "output.cardinality",
      "Exactly two outputs (payment + successor)",
      input.outputCount === 2,
      enforcement,
      `${input.outputCount} output(s)`,
    ),
    rule(
      "output.order",
      "Output 0 is payment, output 1 is successor",
      true,
      enforcement,
      "Reviewed shape requires payment at index 0, successor at index 1",
    ),
    rule(
      "destination.lock-mismatch",
      "Payment locking bytecode matches reviewed destination",
      input.paymentLockingBytecodeHex === input.expectedPaymentLockingBytecodeHex,
      onChain ? "on-chain" : "off-chain-policy",
      onChain
        ? "BoundedRelease enforces the recipient lock in the redeem script"
        : "Legacy TreasuryVault declared recipientPkh but never checked output 0",
    ),
    rule(
      "successor.lock-mismatch",
      "Successor retains the covenant lock",
      input.successorLockingBytecodeHex === input.expectedSuccessorLockingBytecodeHex,
      enforcement,
      "Successor output must use the same P2SH32 covenant lock",
    ),
    rule(
      "amount.over-per-payment",
      "Payment is within the on-chain per-payment cap",
      parseSatoshis(input.paymentSatoshis) > 0n &&
        parseSatoshis(input.paymentSatoshis) <= parseSatoshis(input.maxPaymentSatoshis),
      enforcement,
      `${input.paymentSatoshis} sats vs cap ${input.maxPaymentSatoshis}`,
    ),
    rule(
      "fee.over-cap",
      "Fee is within the on-chain fee cap",
      parseSatoshis(input.feeSatoshis) <= parseSatoshis(input.maxFeeSatoshis),
      enforcement,
      `${input.feeSatoshis} sats vs cap ${input.maxFeeSatoshis}`,
    ),
    rule(
      "asset.token-leak",
      "Native-BCH policy rejects token-bearing inputs/outputs (not inspected by this redeem script)",
      input.inputTokenCategory === null && input.outputTokenCategories.every((c) => c === null),
      "off-chain-policy",
      "Fungible CashToken payment is not implemented for this reviewed route",

    ),
  ];

  if (!onChain) {
    rules.push(
      rule(
        "shape.simulation-only",
        "Legacy shape cannot broadcast",
        false,
        "simulation-only",
        "treasury-vault-unreviewed-v0 does not enforce the recipient on-chain",
      ),
    );
  }

  return {
    shapeId: input.shapeId,
    onChainRecipientEnforced: onChain,
    vmAttempted: false,
    vmValid: null,
    vmError: null,
    rules,
  };
}

export function defaultDirectPaymentRoute(args: {
  destinationAddress: string;
  destinationLockingBytecodeHex: string;
  maxAmountSatoshis: string;
}): ReviewedRoute {
  return {
    id: 0,
    type: "DIRECT_PAYMENT",
    label: "Vendor payout",
    destinationAddress: args.destinationAddress,
    destinationLockingBytecodeHex: args.destinationLockingBytecodeHex,
    maxAmountSatoshis: args.maxAmountSatoshis,
    successor: {
      required: true,
      outputIndex: 1,
      sameCovenantLock: true,
      description: "Same covenant, remaining BCH minus fee",
    },
    reviewedShapeId: BOUNDED_RELEASE_SHAPE_ID,
    enforcement: "on-chain",
    whyConstrained:
      "P2SH32 BoundedRelease redeem script requires output 0 to equal the reviewed recipient lock, output 1 to retain the covenant lock, payment ≤ cap, and fee ≤ cap.",
  };
}

export function p2pkhLockHexFromPkh(pkhHex: string): string {
  return binToHex(encodeLockingBytecodeP2pkh(hexToBin(pkhHex)));
}
