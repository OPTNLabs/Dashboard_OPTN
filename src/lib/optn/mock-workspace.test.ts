import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyMockTransition,
  createMockWorkspace,
  issueMockCashToken,
  simulateMockTransition,
  withCandidateInstance,
} from "./mock-workspace.ts";

describe("mock workspace lifecycle", () => {
  it("keeps a funded instance immutable when a new constructor configuration is compiled", () => {
    const workspace = createMockWorkspace();
    const updated = withCandidateInstance(workspace, { maxPaymentSatoshis: "50000000" });

    assert.equal(workspace.fundedInstance.status, "funded");
    assert.equal(updated.fundedInstance.maxPaymentSatoshis, "100000000");
    assert.equal(updated.vault.instanceId, workspace.fundedInstance.id);
    assert.equal(updated.candidateInstance?.status, "unfunded");
    assert.equal(updated.candidateInstance?.maxPaymentSatoshis, "50000000");
    assert.notEqual(
      updated.candidateInstance?.lockingBytecodeHex,
      workspace.fundedInstance.lockingBytecodeHex,
    );
  });

  it("builds a valid ordered BoundedRelease transition and advances only the mock successor", () => {
    const workspace = createMockWorkspace();
    const simulation = simulateMockTransition(workspace, "happy");

    assert.equal(simulation.allowed, true);
    assert.equal(simulation.validations.find((rule) => rule.id === "outputs")?.pass, true);
    assert.equal(simulation.validations.find((rule) => rule.id === "successor")?.pass, true);
    const advanced = applyMockTransition(workspace, simulation);
    assert.equal(advanced.transitionCount, 1);
    assert.equal(advanced.vault.outpoint, "mock:transition-1:1");
    assert.equal(advanced.vault.instanceId, workspace.fundedInstance.id);
    assert.notEqual(advanced.vault.valueSatoshis, workspace.vault.valueSatoshis);
  });

  it("shows independently failing recipient, cap, fee, successor, and stale-input scenarios", () => {
    const workspace = createMockWorkspace();
    for (const scenario of [
      "wrong-recipient",
      "over-cap",
      "over-fee",
      "missing-successor",
      "stale-input",
    ] as const) {
      const result = simulateMockTransition(workspace, scenario);
      assert.equal(result.allowed, false, scenario);
    }
  });

  it("models a CashToken category as a genesis-output identity and keeps NFT authority separate from fungible supply", () => {
    const workspace = issueMockCashToken(createMockWorkspace(), {
      name: "Acme Credits",
      ticker: "ACME",
      supply: "10000000",
      mintingNft: true,
      mutableNft: true,
    });

    assert.equal(workspace.token?.genesisOutpoint, "mock:cashtoken-genesis:0");
    assert.equal(workspace.token?.supply, "10000000");
    assert.equal(workspace.token?.mintingNft, true);
    assert.equal(workspace.token?.mutableNft, true);
    assert.match(workspace.token?.category ?? "", /^[0-9a-f]{40}$/);
  });
});
