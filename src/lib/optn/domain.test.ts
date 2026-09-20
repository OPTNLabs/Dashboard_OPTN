import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { IDENTITIES } from "./identities.ts";
import {
  compileBoundedRelease,
  compileLegacyTreasury,
  BOUNDED_RELEASE_SHAPE_ID,
  LEGACY_TREASURY_SHAPE_ID,
  evaluateReviewedShape,
} from "./covenant.ts";
import { MAX_FEE_SATS, PER_PAYMENT_SATS, boundedReleaseArtifact } from "./artifacts.ts";
import { demoPlan, demoVault } from "./fixtures.ts";
import { evaluatePolicy } from "./policy.ts";
import {
  buildUnsignedVaultRelease,
  signVaultRelease,
  signedMatchesIntent,
} from "./tx-builder.ts";
import { verifyTransactionVm } from "./vm.ts";
import {
  hexToBin,
  signBchMessage,
  testVectorPrivateKey,
  verifyBchMessageAddress,
} from "./encoding.ts";
import { buildCanonicalIntent, hashIntent, hashPolicy, loginMessage } from "./intent.ts";
import { cacheKey } from "./networks.ts";
import { parseSatoshis } from "./money.ts";
import { canTransition } from "./lifecycle.ts";

const operatorKey = testVectorPrivateKey(1);
const operatorPub = hexToBin(IDENTITIES.alice.publicKeyHex);

function vaultEval(overrides: Partial<Parameters<typeof evaluatePolicy>[0]> = {}) {
  const plan = demoPlan();
  const vault = demoVault();
  return evaluatePolicy({
    plan,
    vaultLockingBytecodeHex: vault.covenantLockingBytecodeHex,
    utxo: vault.state,
    routeId: 0,
    amountSatoshis: "2000000",
    feeSatoshis: "1000",
    destinationLockingBytecodeHex: IDENTITIES.vendor.lockingBytecodeHex,
    successorLockingBytecodeHex: vault.covenantLockingBytecodeHex,
    ...overrides,
  });
}

describe("networks and outpoints", () => {
  it("includes network in cache keys", () => {
    assert.notEqual(cacheKey("chipnet", "ab", 0), cacheKey("mainnet", "ab", 0));
  });
});

describe("BCH conservation", () => {
  it("fee is input minus outputs and rejects dust", () => {
    const vault = demoVault();
    const built = buildUnsignedVaultRelease({
      utxo: vault.state,
      paymentLockingBytecodeHex: IDENTITIES.vendor.lockingBytecodeHex,
      successorLockingBytecodeHex: vault.covenantLockingBytecodeHex,
      amountSatoshis: "2000000",
      feeSatoshis: "1000",
    });
    const inValue = parseSatoshis(vault.state.valueSatoshis);
    const outValue = built.outputs.reduce((sum, output) => sum + parseSatoshis(output.valueSatoshis), 0n);
    assert.equal(inValue - outValue, 1000n);
    assert.equal(built.outputs[0]?.index, 0);
    assert.equal(built.outputs[1]?.role, "successor");
    assert.throws(() =>
      buildUnsignedVaultRelease({
        utxo: vault.state,
        paymentLockingBytecodeHex: IDENTITIES.vendor.lockingBytecodeHex,
        successorLockingBytecodeHex: vault.covenantLockingBytecodeHex,
        amountSatoshis: "200",
        feeSatoshis: "1000",
      }),
    );
  });
});

describe("policy engine", () => {
  it("allows a bounded vendor payment", () => {
    const { policy } = vaultEval();
    assert.equal(policy.allowed, true);
  });
  it("blocks over-limit payments", () => {
    const { policy } = vaultEval({ amountSatoshis: "8000000" });
    assert.equal(policy.allowed, false);
    assert.ok(policy.blocking.some((item) => item.id === "amount.over-per-payment"));
  });
  it("blocks a wrong recipient", () => {
    const { policy } = vaultEval({
      destinationLockingBytecodeHex: IDENTITIES.recovery.lockingBytecodeHex,
    });
    assert.equal(policy.allowed, false);
  });
  it("blocks a token-bearing input on the native route", () => {
    const vault = demoVault();
    const { policy } = vaultEval({
      utxo: { ...vault.state, token: { ...vault.state.token, categoryHex: "aa".repeat(32), amount: "5" } },
    });
    assert.equal(policy.allowed, false);
  });
  it("blocks a spent outpoint", () => {
    const vault = demoVault();
    const { policy } = vaultEval({ utxo: { ...vault.state, spent: true } });
    assert.equal(policy.allowed, false);
  });
  it("blocks an altered successor lock", () => {
    const { policy } = vaultEval({
      successorLockingBytecodeHex: IDENTITIES.alice.lockingBytecodeHex,
    });
    assert.equal(policy.allowed, false);
  });
});

describe("canonical intent", () => {
  it("is deterministic and changes when an output changes", () => {
    const plan = demoPlan();
    const vault = demoVault();
    const base = {
      plan,
      proposalId: "prop-1",
      vaultId: vault.id,
      utxo: vault.state,
      routeId: 0,
      amountSatoshis: "2000000",
      feeSatoshis: "1000",
      destinationLockingBytecodeHex: IDENTITIES.vendor.lockingBytecodeHex,
      successorLockingBytecodeHex: vault.covenantLockingBytecodeHex,
      successorValueSatoshis: "1247999000",
      nonce: "n1",
      createdAt: "2026-01-01T00:00:00.000Z",
      expiresAt: "2026-01-01T01:00:00.000Z",
    };
    const a = hashIntent(buildCanonicalIntent(base));
    const b = hashIntent(buildCanonicalIntent(base));
    const c = hashIntent(buildCanonicalIntent({ ...base, amountSatoshis: "2000001" }));
    assert.equal(a, b);
    assert.notEqual(a, c);
  });
  it("policy hash ignores canvas coordinates and changes with semantics", () => {
    const plan = demoPlan();
    const base = hashPolicy(plan);
    const moved = hashPolicy({
      ...plan,
      canvas: {
        nodes: plan.canvas.nodes.map((node) => ({ ...node, x: node.x + 8 })),
        edges: plan.canvas.edges,
      },
    });
    assert.equal(base, moved);
    assert.notEqual(base, hashPolicy({ ...plan, pause: true }));
  });
});

describe("BCH message signatures", () => {
  it("verifies a Chipnet login challenge and rejects the wrong account", () => {
    const message = loginMessage({
      origin: "optn-dashboard",
      network: "chipnet",
      account: IDENTITIES.alice.account,
      nonce: "abc",
      issuedAt: "2026-01-01T00:00:00.000Z",
      expiresAt: "2026-01-01T00:05:00.000Z",
    });
    const signature = signBchMessage(operatorKey, message);
    assert.equal(verifyBchMessageAddress("chipnet", IDENTITIES.alice.account, message, signature), true);
    assert.equal(verifyBchMessageAddress("chipnet", IDENTITIES.bob.account, message, signature), false);
  });
});

describe("reviewed BoundedRelease covenant", () => {
  it("VM-validates an authorized spend and rejects an unauthorized destination", () => {
    const compiled = compileBoundedRelease({
      operatorPkhHex: IDENTITIES.alice.pkhHex,
      recipientLockingBytecodeHex: IDENTITIES.vendor.lockingBytecodeHex,
      maxPaymentSatoshis: PER_PAYMENT_SATS,
      maxFeeSatoshis: MAX_FEE_SATS,
    });
    const vault = demoVault();
    const utxo = { ...vault.state, lockingBytecodeHex: compiled.lockingBytecodeHex };
    const unsigned = buildUnsignedVaultRelease({
      utxo,
      paymentLockingBytecodeHex: IDENTITIES.vendor.lockingBytecodeHex,
      successorLockingBytecodeHex: compiled.lockingBytecodeHex,
      amountSatoshis: "2000000",
      feeSatoshis: "1000",
    });
    const signed = signVaultRelease({
      unsignedHex: unsigned.rawHex,
      redeemHex: compiled.redeemHex,
      privateKey: operatorKey,
      publicKey: operatorPub,
      sourceValueSatoshis: utxo.valueSatoshis,
      sourceLockingBytecodeHex: compiled.lockingBytecodeHex,
    });
    const good = verifyTransactionVm({
      rawTxHex: signed.signedHex,
      sourceOutputs: [
        { lockingBytecodeHex: compiled.lockingBytecodeHex, valueSatoshis: utxo.valueSatoshis },
      ],
    });
    assert.equal(good.valid, true, good.error ?? "expected valid");

    const badUnsigned = buildUnsignedVaultRelease({
      utxo,
      paymentLockingBytecodeHex: IDENTITIES.recovery.lockingBytecodeHex,
      successorLockingBytecodeHex: compiled.lockingBytecodeHex,
      amountSatoshis: "2000000",
      feeSatoshis: "1000",
    });
    const badSigned = signVaultRelease({
      unsignedHex: badUnsigned.rawHex,
      redeemHex: compiled.redeemHex,
      privateKey: operatorKey,
      publicKey: operatorPub,
      sourceValueSatoshis: utxo.valueSatoshis,
      sourceLockingBytecodeHex: compiled.lockingBytecodeHex,
    });
    const bad = verifyTransactionVm({
      rawTxHex: badSigned.signedHex,
      sourceOutputs: [
        { lockingBytecodeHex: compiled.lockingBytecodeHex, valueSatoshis: utxo.valueSatoshis },
      ],
    });
    assert.equal(bad.valid, false);
  });

  it("rejects a wallet-changed output", () => {
    const vault = demoVault();
    const unsigned = buildUnsignedVaultRelease({
      utxo: vault.state,
      paymentLockingBytecodeHex: IDENTITIES.vendor.lockingBytecodeHex,
      successorLockingBytecodeHex: vault.covenantLockingBytecodeHex,
      amountSatoshis: "2000000",
      feeSatoshis: "1000",
    });
    const match = signedMatchesIntent({
      signedHex: unsigned.rawHex,
      expectedNetwork: "chipnet",
      expectedOutpoints: [vault.state.outpoint],
      expectedOutputs: unsigned.outputs.map((output) => ({
        ...output,
        lockingBytecodeHex: IDENTITIES.recovery.lockingBytecodeHex,
      })),
      expectedFee: "1000",
      inputValueSatoshis: vault.state.valueSatoshis,
    });
    assert.equal(match.ok, false);
  });
});

describe("legacy TreasuryVault regression", () => {
  it("does not treat unused recipientPkh as on-chain enforcement", () => {
    const compiled = compileLegacyTreasury({
      operatorPkhHex: IDENTITIES.alice.pkhHex,
      unusedRecipientPkhHex: IDENTITIES.vendor.pkhHex,
    });
    assert.ok(compiled.lockingBytecodeHex.startsWith("aa20"));
    const decision = evaluateReviewedShape({
      shapeId: LEGACY_TREASURY_SHAPE_ID,
      inputCount: 1,
      outputCount: 2,
      activeInputIndex: 0,
      paymentLockingBytecodeHex: IDENTITIES.recovery.lockingBytecodeHex,
      expectedPaymentLockingBytecodeHex: IDENTITIES.vendor.lockingBytecodeHex,
      successorLockingBytecodeHex: compiled.lockingBytecodeHex,
      expectedSuccessorLockingBytecodeHex: compiled.lockingBytecodeHex,
      paymentSatoshis: "2000000",
      maxPaymentSatoshis: PER_PAYMENT_SATS,
      feeSatoshis: "1000",
      maxFeeSatoshis: MAX_FEE_SATS,
      inputTokenCategory: null,
      outputTokenCategories: [null, null],
    });
    assert.equal(decision.onChainRecipientEnforced, false);
    assert.equal(
      decision.rules.find((item) => item.id === "shape.simulation-only")?.pass,
      false,
    );
    const live = evaluateReviewedShape({
      shapeId: BOUNDED_RELEASE_SHAPE_ID,
      inputCount: 1,
      outputCount: 2,
      activeInputIndex: 0,
      paymentLockingBytecodeHex: IDENTITIES.recovery.lockingBytecodeHex,
      expectedPaymentLockingBytecodeHex: IDENTITIES.vendor.lockingBytecodeHex,
      successorLockingBytecodeHex: boundedReleaseArtifact.lockingBytecodeHex,
      expectedSuccessorLockingBytecodeHex: boundedReleaseArtifact.lockingBytecodeHex,
      paymentSatoshis: "2000000",
      maxPaymentSatoshis: PER_PAYMENT_SATS,
      feeSatoshis: "1000",
      maxFeeSatoshis: MAX_FEE_SATS,
      inputTokenCategory: null,
      outputTokenCategories: [null, null],
    });
    assert.equal(live.onChainRecipientEnforced, true);
    assert.equal(
      live.rules.find((item) => item.id === "destination.lock-mismatch")?.pass,
      false,
    );
  });
});

describe("lifecycle", () => {
  it("does not collapse signed into broadcast", () => {
    assert.equal(canTransition("signed", "signed-vm-validated"), true);
    assert.equal(canTransition("signed", "finalized"), false);
    assert.equal(canTransition("locally-vm-validated", "broadcast-requested"), false);
    assert.equal(canTransition("locally-vm-validated", "signed-vm-validated"), false);
    assert.equal(canTransition("signed-vm-validated", "broadcast-requested"), true);
    assert.equal(canTransition("provider-accepted", "confirmed"), true);
  });
});
