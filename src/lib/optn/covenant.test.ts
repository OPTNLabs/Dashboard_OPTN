import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { IDENTITIES } from "./identities.ts";
import { compileBoundedRelease, evaluateReviewedShape, BOUNDED_RELEASE_SHAPE_ID } from "./covenant.ts";
import {
  MAX_FEE_SATS,
  PER_PAYMENT_SATS,
  hashReviewedArtifact,
  validateBoundedReleaseParams,
  reviewedBoundedRelease,
  buildBoundedReleaseArtifact,
} from "./artifacts.ts";
import { demoVault } from "./fixtures.ts";
import {
  buildUnsignedVaultRelease,
  signVaultRelease,
  signedMatchesIntent,
} from "./tx-builder.ts";
import { verifyTransactionVm } from "./vm.ts";
import {
  binToHex,
  decodeTransaction,
  encodeTransaction,
  hexToBin,
  testVectorPrivateKey,
} from "./encoding.ts";
import { TX_VERSION, SEQUENCE_ENABLE_LOCKTIME } from "./tx-constants.ts";

const operatorKey = testVectorPrivateKey(1);
const operatorPub = hexToBin(IDENTITIES.alice.publicKeyHex);
const bobKey = testVectorPrivateKey(2);
const bobPub = hexToBin(IDENTITIES.bob.publicKeyHex);

function compiled() {
  return compileBoundedRelease({
    operatorPkhHex: IDENTITIES.alice.pkhHex,
    recipientLockingBytecodeHex: IDENTITIES.vendor.lockingBytecodeHex,
    maxPaymentSatoshis: PER_PAYMENT_SATS,
    maxFeeSatoshis: MAX_FEE_SATS,
  });
}

function vaultUtxo(lockingBytecodeHex: string) {
  const vault = demoVault();
  return { ...vault.state, lockingBytecodeHex };
}

function signPayment(args: {
  amount?: string;
  fee?: string;
  paymentLock?: string;
  successorLock?: string;
  privateKey?: Uint8Array;
  publicKey?: Uint8Array;
  redeemHex?: string;
  sourceLock?: string;
}) {
  const artifact = compiled();
  const utxo = vaultUtxo(args.sourceLock ?? artifact.lockingBytecodeHex);
  const unsigned = buildUnsignedVaultRelease({
    utxo,
    paymentLockingBytecodeHex: args.paymentLock ?? IDENTITIES.vendor.lockingBytecodeHex,
    successorLockingBytecodeHex: args.successorLock ?? artifact.lockingBytecodeHex,
    amountSatoshis: args.amount ?? "2000000",
    feeSatoshis: args.fee ?? "1000",
  });
  const signed = signVaultRelease({
    unsignedHex: unsigned.rawHex,
    redeemHex: args.redeemHex ?? artifact.redeemHex,
    privateKey: args.privateKey ?? operatorKey,
    publicKey: args.publicKey ?? operatorPub,
    sourceValueSatoshis: utxo.valueSatoshis,
    sourceLockingBytecodeHex: utxo.lockingBytecodeHex,
  });
  const vm = verifyTransactionVm({
    rawTxHex: signed.signedHex,
    sourceOutputs: [{ lockingBytecodeHex: utxo.lockingBytecodeHex, valueSatoshis: utxo.valueSatoshis }],
  });
  return { artifact, utxo, unsigned, signed, vm };
}

function resignDecoded(
  decoded: ReturnType<typeof decodeTransaction> extends infer T ? Exclude<T, string> : never,
  redeemHex: string,
  sourceLock: string,
  sourceValue: string,
  key = operatorKey,
  pub = operatorPub,
) {
  decoded.inputs[0]!.unlockingBytecode = new Uint8Array();
  const unsignedHex = binToHex(encodeTransaction(decoded));
  return signVaultRelease({
    unsignedHex,
    redeemHex,
    privateKey: key,
    publicKey: pub,
    sourceValueSatoshis: sourceValue,
    sourceLockingBytecodeHex: sourceLock,
  });
}

describe("artifact registry", () => {
  it("hashes bytecode and constructor together", () => {
    const a = reviewedBoundedRelease.artifactHash;
    const b = hashReviewedArtifact(reviewedBoundedRelease);
    assert.equal(a, b);
    const other = buildBoundedReleaseArtifact({
      operatorPkhHex: IDENTITIES.alice.pkhHex,
      recipientLockingBytecodeHex: IDENTITIES.vendor.lockingBytecodeHex,
      maxPaymentSatoshis: "4000000",
      maxFeeSatoshis: MAX_FEE_SATS,
    });
    assert.notEqual(a, other.artifactHash);
  });

  it("rejects invalid constructor params", () => {
    assert.throws(() => validateBoundedReleaseParams({ ...reviewedBoundedRelease, operatorPkhHex: "aa" }));
    assert.throws(() =>
      validateBoundedReleaseParams({
        operatorPkhHex: IDENTITIES.alice.pkhHex,
        recipientLockingBytecodeHex: IDENTITIES.vendor.lockingBytecodeHex,
        maxPaymentSatoshis: "0",
        maxFeeSatoshis: MAX_FEE_SATS,
      }),
    );
  });
});

describe("BoundedRelease CashVM", () => {
  it("valid authorized spend", () => {
    const { vm } = signPayment({});
    assert.equal(vm.valid, true, vm.error ?? "expected valid");
  });

  it("wrong operator", () => {
    const { vm } = signPayment({ privateKey: bobKey, publicKey: bobPub });
    assert.equal(vm.valid, false);
  });

  it("wrong recipient", () => {
    const { vm } = signPayment({ paymentLock: IDENTITIES.recovery.lockingBytecodeHex });
    assert.equal(vm.valid, false);
  });

  it("wrong successor lock", () => {
    const { vm } = signPayment({ successorLock: IDENTITIES.alice.lockingBytecodeHex });
    assert.equal(vm.valid, false);
  });

  it("extra input", () => {
    const { unsigned, artifact, utxo } = signPayment({});
    const decoded = decodeTransaction(hexToBin(unsigned.rawHex));
    if (typeof decoded === "string") throw new Error(decoded);
    decoded.inputs.push({
      outpointIndex: 1,
      outpointTransactionHash: hexToBin("11".repeat(32)),
      sequenceNumber: SEQUENCE_ENABLE_LOCKTIME,
      unlockingBytecode: new Uint8Array(),
    });
    const resigned = resignDecoded(decoded, artifact.redeemHex, artifact.lockingBytecodeHex, utxo.valueSatoshis);
    const vm = verifyTransactionVm({
      rawTxHex: resigned.signedHex,
      sourceOutputs: [
        { lockingBytecodeHex: artifact.lockingBytecodeHex, valueSatoshis: utxo.valueSatoshis },
        { lockingBytecodeHex: "51", valueSatoshis: "1000" },
      ],
    });
    assert.equal(vm.valid, false);
  });

  it("missing input", () => {
    const { unsigned, utxo, artifact } = signPayment({});
    const decoded = decodeTransaction(hexToBin(unsigned.rawHex));
    if (typeof decoded === "string") throw new Error(decoded);
    decoded.inputs = [];
    const vm = verifyTransactionVm({
      rawTxHex: binToHex(encodeTransaction(decoded)),
      sourceOutputs: [{ lockingBytecodeHex: artifact.lockingBytecodeHex, valueSatoshis: utxo.valueSatoshis }],
    });
    assert.equal(vm.valid, false);
  });

  it("extra output", () => {
    const { unsigned, artifact, utxo } = signPayment({});
    const decoded = decodeTransaction(hexToBin(unsigned.rawHex));
    if (typeof decoded === "string") throw new Error(decoded);
    decoded.outputs.push({
      lockingBytecode: hexToBin(IDENTITIES.alice.lockingBytecodeHex),
      valueSatoshis: 1000n,
    });
    decoded.outputs[1]!.valueSatoshis -= 1000n;
    const resigned = resignDecoded(decoded, artifact.redeemHex, artifact.lockingBytecodeHex, utxo.valueSatoshis);
    const vm = verifyTransactionVm({
      rawTxHex: resigned.signedHex,
      sourceOutputs: [{ lockingBytecodeHex: artifact.lockingBytecodeHex, valueSatoshis: utxo.valueSatoshis }],
    });
    assert.equal(vm.valid, false);
  });

  it("missing successor", () => {
    const { unsigned, artifact, utxo } = signPayment({});
    const decoded = decodeTransaction(hexToBin(unsigned.rawHex));
    if (typeof decoded === "string") throw new Error(decoded);
    decoded.outputs = [decoded.outputs[0]!];
    const resigned = resignDecoded(decoded, artifact.redeemHex, artifact.lockingBytecodeHex, utxo.valueSatoshis);
    const vm = verifyTransactionVm({
      rawTxHex: resigned.signedHex,
      sourceOutputs: [{ lockingBytecodeHex: artifact.lockingBytecodeHex, valueSatoshis: utxo.valueSatoshis }],
    });
    assert.equal(vm.valid, false);
  });

  it("payment over cap", () => {
    const { vm } = signPayment({ amount: "5000001" });
    assert.equal(vm.valid, false);
  });

  it("fee over cap", () => {
    const { vm } = signPayment({ fee: "2001" });
    assert.equal(vm.valid, false);
  });

  it("zero-value successor", () => {
    const artifact = compiled();
    const utxo = vaultUtxo(artifact.lockingBytecodeHex);
    const inputValue = BigInt(utxo.valueSatoshis);
    const decoded = decodeTransaction(
      hexToBin(
        buildUnsignedVaultRelease({
          utxo,
          paymentLockingBytecodeHex: IDENTITIES.vendor.lockingBytecodeHex,
          successorLockingBytecodeHex: artifact.lockingBytecodeHex,
          amountSatoshis: "2000000",
          feeSatoshis: "1000",
        }).rawHex,
      ),
    );
    if (typeof decoded === "string") throw new Error(decoded);
    decoded.outputs[0]!.valueSatoshis = inputValue - 1000n;
    decoded.outputs[1]!.valueSatoshis = 0n;
    const resigned = resignDecoded(decoded, artifact.redeemHex, artifact.lockingBytecodeHex, utxo.valueSatoshis);
    const vm = verifyTransactionVm({
      rawTxHex: resigned.signedHex,
      sourceOutputs: [{ lockingBytecodeHex: artifact.lockingBytecodeHex, valueSatoshis: utxo.valueSatoshis }],
    });
    assert.equal(vm.valid, false);
  });

  it("dust payment rejected by builder", () => {
    const artifact = compiled();
    const utxo = vaultUtxo(artifact.lockingBytecodeHex);
    assert.throws(() =>
      buildUnsignedVaultRelease({
        utxo,
        paymentLockingBytecodeHex: IDENTITIES.vendor.lockingBytecodeHex,
        successorLockingBytecodeHex: artifact.lockingBytecodeHex,
        amountSatoshis: "200",
        feeSatoshis: "1000",
      }),
    );
  });

  it("dust successor rejected by builder", () => {
    const artifact = compiled();
    const utxo = vaultUtxo(artifact.lockingBytecodeHex);
    const almostAll = (BigInt(utxo.valueSatoshis) - 1000n - 200n).toString();
    assert.throws(() =>
      buildUnsignedVaultRelease({
        utxo,
        paymentLockingBytecodeHex: IDENTITIES.vendor.lockingBytecodeHex,
        successorLockingBytecodeHex: artifact.lockingBytecodeHex,
        amountSatoshis: almostAll,
        feeSatoshis: "1000",
      }),
    );
  });

  it("negative/invalid amounts rejected by builder", () => {
    const artifact = compiled();
    const utxo = vaultUtxo(artifact.lockingBytecodeHex);
    assert.throws(() =>
      buildUnsignedVaultRelease({
        utxo,
        paymentLockingBytecodeHex: IDENTITIES.vendor.lockingBytecodeHex,
        successorLockingBytecodeHex: artifact.lockingBytecodeHex,
        amountSatoshis: "-1",
        feeSatoshis: "1000",
      }),
    );
  });

  it("malformed redeem script", () => {
    const { vm } = signPayment({ redeemHex: "00" });
    assert.equal(vm.valid, false);
  });

  it("wrong P2SH32 lock", () => {
    const artifact = compiled();
    const { vm } = signPayment({
      sourceLock: IDENTITIES.alice.lockingBytecodeHex,
      successorLock: artifact.lockingBytecodeHex,
      redeemHex: artifact.redeemHex,
    });
    assert.equal(vm.valid, false);
  });

  it("token-bearing input rejected by native builder", () => {
    const artifact = compiled();
    const utxo = vaultUtxo(artifact.lockingBytecodeHex);
    utxo.token = { ...utxo.token, categoryHex: "aa".repeat(32), amount: "1" };
    assert.throws(() =>
      buildUnsignedVaultRelease({
        utxo,
        paymentLockingBytecodeHex: IDENTITIES.vendor.lockingBytecodeHex,
        successorLockingBytecodeHex: artifact.lockingBytecodeHex,
        amountSatoshis: "2000000",
        feeSatoshis: "1000",
      }),
    );
    const decision = evaluateReviewedShape({
      shapeId: BOUNDED_RELEASE_SHAPE_ID,
      inputCount: 1,
      outputCount: 2,
      activeInputIndex: 0,
      paymentLockingBytecodeHex: IDENTITIES.vendor.lockingBytecodeHex,
      expectedPaymentLockingBytecodeHex: IDENTITIES.vendor.lockingBytecodeHex,
      successorLockingBytecodeHex: artifact.lockingBytecodeHex,
      expectedSuccessorLockingBytecodeHex: artifact.lockingBytecodeHex,
      paymentSatoshis: "2000000",
      maxPaymentSatoshis: PER_PAYMENT_SATS,
      feeSatoshis: "1000",
      maxFeeSatoshis: MAX_FEE_SATS,
      inputTokenCategory: "aa".repeat(32),
      outputTokenCategories: [null, null],
    });
    assert.equal(decision.rules.find((item) => item.id === "asset.token-leak")?.enforcement, "off-chain-policy");
    assert.equal(decision.rules.find((item) => item.id === "asset.token-leak")?.pass, false);
  });

  it("token-bearing output rejected by matcher", () => {
    const { unsigned, utxo } = signPayment({});
    const decoded = decodeTransaction(hexToBin(unsigned.rawHex));
    if (typeof decoded === "string") throw new Error(decoded);
    decoded.outputs[0] = {
      ...decoded.outputs[0]!,
      token: { category: hexToBin("aa".repeat(32)), amount: 1n },
    };
    const match = signedMatchesIntent({
      signedHex: binToHex(encodeTransaction(decoded)),
      expectedNetwork: "chipnet",
      expectedOutpoints: [utxo.outpoint],
      expectedOutputs: unsigned.outputs,
      expectedFee: "1000",
      inputValueSatoshis: utxo.valueSatoshis,
    });
    assert.equal(match.ok, false);
  });

  it("altered version/sequence/locktime rejected by matcher, not claimed as covenant rules", () => {
    const { unsigned, signed, utxo, artifact } = signPayment({});
    const decoded = decodeTransaction(hexToBin(unsigned.rawHex));
    if (typeof decoded === "string") throw new Error(decoded);
    decoded.version = TX_VERSION + 1;
    const versioned = resignDecoded(decoded, artifact.redeemHex, artifact.lockingBytecodeHex, utxo.valueSatoshis);
    const versionMatch = signedMatchesIntent({
      signedHex: versioned.signedHex,
      expectedNetwork: "chipnet",
      expectedVersion: TX_VERSION,
      expectedOutpoints: [utxo.outpoint],
      expectedOutputs: unsigned.outputs,
      expectedFee: "1000",
      inputValueSatoshis: utxo.valueSatoshis,
    });
    assert.equal(versionMatch.ok, false);
    const seqDecoded = decodeTransaction(hexToBin(unsigned.rawHex));
    if (typeof seqDecoded === "string") throw new Error(seqDecoded);
    seqDecoded.inputs[0]!.sequenceNumber = 1;
    const sequenced = resignDecoded(seqDecoded, artifact.redeemHex, artifact.lockingBytecodeHex, utxo.valueSatoshis);
    assert.equal(
      signedMatchesIntent({
        signedHex: sequenced.signedHex,
        expectedNetwork: "chipnet",
        expectedSequence: SEQUENCE_ENABLE_LOCKTIME,
        expectedOutpoints: [utxo.outpoint],
        expectedOutputs: unsigned.outputs,
        expectedFee: "1000",
        inputValueSatoshis: utxo.valueSatoshis,
      }).ok,
      false,
    );
    const lockDecoded = decodeTransaction(hexToBin(unsigned.rawHex));
    if (typeof lockDecoded === "string") throw new Error(lockDecoded);
    lockDecoded.locktime = 500_000_000;
    const locked = resignDecoded(lockDecoded, artifact.redeemHex, artifact.lockingBytecodeHex, utxo.valueSatoshis);
    assert.equal(
      signedMatchesIntent({
        signedHex: locked.signedHex,
        expectedNetwork: "chipnet",
        expectedLocktime: 0,
        expectedOutpoints: [utxo.outpoint],
        expectedOutputs: unsigned.outputs,
        expectedFee: "1000",
        inputValueSatoshis: utxo.valueSatoshis,
      }).ok,
      false,
    );
    assert.equal(signed.signedHex.length > 0, true);
  });

  it("changed output ordering rejected by matcher", () => {
    const { unsigned, utxo } = signPayment({});
    const swapped = [unsigned.outputs[1]!, unsigned.outputs[0]!].map((output, index) => ({
      ...output,
      index,
    }));
    const match = signedMatchesIntent({
      signedHex: unsigned.rawHex,
      expectedNetwork: "chipnet",
      expectedOutpoints: [utxo.outpoint],
      expectedOutputs: swapped,
      expectedFee: "1000",
      inputValueSatoshis: utxo.valueSatoshis,
    });
    assert.equal(match.ok, false);
  });
});
