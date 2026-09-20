import type { PlannedOutput, TokenState, TransitionPreview, UtxoState } from "./types.ts";
import {
  EMPTY_TOKEN,
  SigningSerializationTypeBCH,
  addressFromLockingBytecode,
  binToHex,
  concatBins,
  decodeTransaction,
  encodeDataPush,
  encodeTransaction,
  generateSigningSerializationBCH,
  hash256,
  hexToBin,
  isDustValue,
  secp256k1,
  txidFromEncoded,
} from "./encoding.ts";
import { parseSatoshis } from "./money.ts";
import { evaluatePolicy, type EvaluationInput } from "./policy.ts";
import { hashIntent, buildCanonicalIntent } from "./intent.ts";

import { TX_VERSION, SEQUENCE_ENABLE_LOCKTIME } from "./tx-constants.ts";
export { TX_VERSION, SEQUENCE_ENABLE_LOCKTIME };


export type BuiltTransaction = {
  rawHex: string;
  txid: string;
  feeSatoshis: string;
  outputs: PlannedOutput[];
  conservationLine: string;
  sourceOutputs: Array<{
    lockingBytecodeHex: string;
    valueSatoshis: string;
  }>;
};

export function planOutputs(args: {
  network: UtxoState["network"];
  paymentLockingBytecodeHex: string;
  successorLockingBytecodeHex: string;
  paymentSatoshis: bigint;
  successorSatoshis: bigint;
}): PlannedOutput[] {
  return [
    {
      index: 0,
      role: "payment",
      valueSatoshis: args.paymentSatoshis.toString(),
      lockingBytecodeHex: args.paymentLockingBytecodeHex,
      address: addressFromLockingBytecode(args.network, args.paymentLockingBytecodeHex),
      token: EMPTY_TOKEN,
    },
    {
      index: 1,
      role: "successor",
      valueSatoshis: args.successorSatoshis.toString(),
      lockingBytecodeHex: args.successorLockingBytecodeHex,
      address: addressFromLockingBytecode(args.network, args.successorLockingBytecodeHex),
      token: EMPTY_TOKEN,
    },
  ];
}

export function buildUnsignedVaultRelease(args: {
  utxo: UtxoState;
  paymentLockingBytecodeHex: string;
  successorLockingBytecodeHex: string;
  amountSatoshis: string;
  feeSatoshis: string;
}): BuiltTransaction {
  if (args.utxo.spent) throw new Error("Source outpoint is spent");
  if (args.utxo.token.categoryHex) throw new Error("Native-BCH route rejects token-bearing inputs");
  const inputValue = parseSatoshis(args.utxo.valueSatoshis);
  const amount = parseSatoshis(args.amountSatoshis);
  const fee = parseSatoshis(args.feeSatoshis);
  if (amount <= 0n) throw new Error("Payment must be positive");
  if (fee < 0n) throw new Error("Fee cannot be negative");
  const successor = inputValue - amount - fee;

  if (successor < 0n) throw new Error("Outputs plus fee exceed input value");
  if (isDustValue(amount) || isDustValue(successor)) {
    throw new Error("Dust output rejected");
  }
  const outputs = planOutputs({
    network: args.utxo.network,
    paymentLockingBytecodeHex: args.paymentLockingBytecodeHex,
    successorLockingBytecodeHex: args.successorLockingBytecodeHex,
    paymentSatoshis: amount,
    successorSatoshis: successor,
  });
  const tx = {
    version: TX_VERSION,
    locktime: 0,
    inputs: [
      {
        outpointIndex: args.utxo.outpoint.vout,
        outpointTransactionHash: hexToBin(args.utxo.outpoint.txid),
        sequenceNumber: SEQUENCE_ENABLE_LOCKTIME,
        unlockingBytecode: new Uint8Array(),
      },
    ],
    outputs: outputs.map((output) => ({
      lockingBytecode: hexToBin(output.lockingBytecodeHex),
      valueSatoshis: parseSatoshis(output.valueSatoshis),
    })),
  };
  const raw = encodeTransaction(tx);
  return {
    rawHex: binToHex(raw),
    txid: txidFromEncoded(raw),
    feeSatoshis: fee.toString(),
    outputs,
    conservationLine: `${inputValue.toString()} in = ${amount.toString()} payment + ${successor.toString()} successor + ${fee.toString()} fee`,
    sourceOutputs: [
      {
        lockingBytecodeHex: args.utxo.lockingBytecodeHex,
        valueSatoshis: args.utxo.valueSatoshis,
      },
    ],
  };
}

export function signVaultRelease(args: {
  unsignedHex: string;
  redeemHex: string;
  privateKey: Uint8Array;
  publicKey: Uint8Array;
  sourceValueSatoshis: string;
  sourceLockingBytecodeHex: string;
}): { signedHex: string; txid: string } {
  const decoded = decodeTransaction(hexToBin(args.unsignedHex));
  if (typeof decoded === "string") throw new Error(decoded);
  const redeem = hexToBin(args.redeemHex);
  const sourceOutputs = [
    {
      lockingBytecode: hexToBin(args.sourceLockingBytecodeHex),
      valueSatoshis: parseSatoshis(args.sourceValueSatoshis),
    },
  ];
  const typeByte = SigningSerializationTypeBCH.allOutputsAllUtxos;
  const serialization = generateSigningSerializationBCH(
    { inputIndex: 0, sourceOutputs, transaction: decoded },
    { coveredBytecode: redeem, signingSerializationType: Uint8Array.of(typeByte) },
  );
  const sig = secp256k1.signMessageHashSchnorr(args.privateKey, hash256(serialization));
  if (typeof sig === "string") throw new Error(sig);
  const sigWithType = new Uint8Array(sig.length + 1);
  sigWithType.set(sig, 0);
  sigWithType[sig.length] = typeByte;
  decoded.inputs[0]!.unlockingBytecode = concatBins([
    encodeDataPush(sigWithType),
    encodeDataPush(args.publicKey),
    encodeDataPush(redeem),
  ]);
  const raw = encodeTransaction(decoded);
  return { signedHex: binToHex(raw), txid: txidFromEncoded(raw) };
}

export function parseSignedTransaction(hex: string) {
  const decoded = decodeTransaction(hexToBin(hex));
  if (typeof decoded === "string") throw new Error(decoded);
  return decoded;
}

export function signedMatchesIntent(args: {
  signedHex: string;
  expectedNetwork: UtxoState["network"];
  expectedVersion?: number;
  expectedLocktime?: number;
  expectedSequence?: number;
  expectedOutpoints: Array<{ txid: string; vout: number }>;
  expectedOutputs: PlannedOutput[];
  expectedFee: string;
  inputValueSatoshis: string;
}): { ok: boolean; reason: string | null } {
  const tx = parseSignedTransaction(args.signedHex);
  if ((args.expectedVersion ?? TX_VERSION) !== tx.version) {
    return { ok: false, reason: "Transaction version changed" };
  }
  if ((args.expectedLocktime ?? 0) !== tx.locktime) {
    return { ok: false, reason: "Locktime changed" };
  }
  if (tx.inputs.length !== args.expectedOutpoints.length) {
    return { ok: false, reason: "Input count changed by the wallet" };
  }
  for (const [index, input] of tx.inputs.entries()) {
    const expected = args.expectedOutpoints[index];
    if (!expected) return { ok: false, reason: "Missing expected outpoint" };
    if (binToHex(input.outpointTransactionHash) !== expected.txid.toLowerCase()) {
      return { ok: false, reason: "Wallet changed an input outpoint" };
    }
    if (input.outpointIndex !== expected.vout) {
      return { ok: false, reason: "Wallet changed an input index" };
    }
    if ((args.expectedSequence ?? SEQUENCE_ENABLE_LOCKTIME) !== input.sequenceNumber) {
      return { ok: false, reason: "Input sequence changed" };
    }
  }
  if (tx.outputs.length !== args.expectedOutputs.length) {
    return { ok: false, reason: "Output count changed by the wallet" };
  }
  for (const [index, output] of tx.outputs.entries()) {
    const expected = args.expectedOutputs[index];
    if (!expected) return { ok: false, reason: "Missing expected output" };
    if (binToHex(output.lockingBytecode) !== expected.lockingBytecodeHex) {
      return { ok: false, reason: `Output ${index} locking bytecode changed` };
    }
    if (output.valueSatoshis !== parseSatoshis(expected.valueSatoshis)) {
      return { ok: false, reason: `Output ${index} value changed` };
    }
    if (output.token) {
      return { ok: false, reason: `Output ${index} unexpectedly carries a token` };
    }
  }
  const outSum = tx.outputs.reduce((sum, output) => sum + output.valueSatoshis, 0n);
  const fee = parseSatoshis(args.inputValueSatoshis) - outSum;
  if (fee !== parseSatoshis(args.expectedFee)) {
    return { ok: false, reason: "Fee changed by the wallet" };
  }
  return { ok: true, reason: null };
}


export function previewTransition(
  input: EvaluationInput & { proposalId: string; nonce: string; createdAt: string; expiresAt: string },
): TransitionPreview {
  const amount = parseSatoshis(input.amountSatoshis);
  const fee = parseSatoshis(input.feeSatoshis);
  const inputValue = parseSatoshis(input.utxo.valueSatoshis);
  const successor = inputValue - amount - fee;
  const built = planOutputs({
    network: input.utxo.network,
    paymentLockingBytecodeHex: input.destinationLockingBytecodeHex,
    successorLockingBytecodeHex: input.successorLockingBytecodeHex,
    paymentSatoshis: amount,
    successorSatoshis: successor < 0n ? 0n : successor,
  });
  const { policy, covenant } = evaluatePolicy(input);
  const intent = buildCanonicalIntent({
    plan: input.plan,
    proposalId: input.proposalId,
    vaultId: input.plan.sourceVaultId,
    utxo: input.utxo,
    routeId: input.routeId,
    amountSatoshis: input.amountSatoshis,
    feeSatoshis: input.feeSatoshis,
    destinationLockingBytecodeHex: input.destinationLockingBytecodeHex,
    successorLockingBytecodeHex: input.successorLockingBytecodeHex,
    successorValueSatoshis: (successor < 0n ? 0n : successor).toString(),
    nonce: input.nonce,
    createdAt: input.createdAt,
    expiresAt: input.expiresAt,
  });
  const emptyToken = (token: TokenState) => token.categoryHex === null && token.amount === "0";
  return {
    input: input.utxo,
    outputs: built,
    feeSatoshis: input.feeSatoshis,
    assetDeltas: [
      {
        asset: "bch",
        inValue: input.utxo.valueSatoshis,
        outValue: (amount + (successor < 0n ? 0n : successor)).toString(),
        conserved: amount + fee + (successor < 0n ? 0n : successor) === inputValue,
        detail: "Native BCH conserved independently of tokens",
      },
      {
        asset: "fee",
        inValue: "0",
        outValue: input.feeSatoshis,
        conserved: true,
        detail: "Fee is input minus outputs",
      },
      {
        asset: "fungible-token",
        inValue: input.utxo.token.amount,
        outValue: "0",
        conserved: emptyToken(input.utxo.token),
        detail: "No fungible token on this native-BCH route",
      },
      {
        asset: "nft",
        inValue: input.utxo.token.nftCapability,
        outValue: "none",
        conserved: input.utxo.token.nftCapability === "none",
        detail: "NFT state is not a budget balance",
      },
    ],
    policyDecision: policy,
    covenantDecision: covenant,
    intentHash: hashIntent(intent),
    evidence: [input.utxo.chainEvidence === "fixture" ? "FIXTURE" : "DESIGNED"],
    conservationLine: `${inputValue.toString()} in = ${amount.toString()} payment + ${successor.toString()} successor + ${fee.toString()} fee`,
  };
}
