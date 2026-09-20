import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { demoPlan, demoVault } from "./fixtures.ts";
import { assertPlanMatchesVaultArtifact, compileExecutableStudio } from "./studio-compiler.ts";

describe("executable Studio compiler", () => {
  it("derives the flow graph from the exact vault and transaction template", () => {
    const plan = demoPlan();
    const vault = demoVault();
    const compiled = compileExecutableStudio(plan, vault);

    assert.equal(compiled.transaction.input.index, 0);
    assert.equal(compiled.transaction.input.lockingBytecodeHex, vault.covenantLockingBytecodeHex);
    assert.deepEqual(
      compiled.transaction.outputs.map((output) => [output.index, output.lockingBytecodeHex]),
      [
        [0, vault.constructor.recipientLock],
        [1, vault.covenantLockingBytecodeHex],
      ],
    );
    assert.equal(
      compiled.canvas.nodes.find((node) => node.id === "payment-output-0")?.data.outputIndex,
      "0",
    );
    assert.equal(
      compiled.canvas.nodes.find((node) => node.id === "successor-output-1")?.data.outputIndex,
      "1",
    );
  });

  it("rejects a UI policy cap that diverges from the funded covenant", () => {
    const plan = demoPlan();
    plan.limits.perPaymentSatoshis = "5000001";
    assert.throws(() => assertPlanMatchesVaultArtifact(plan, demoVault()), /payment cap differs/);
  });

  it("rejects a route recipient that diverges from the funded covenant", () => {
    const plan = demoPlan();
    plan.routes[0]!.destinationLockingBytecodeHex = "76a914" + "00".repeat(20) + "88ac";
    assert.throws(() => assertPlanMatchesVaultArtifact(plan, demoVault()), /recipient lock/);
  });

  it("preserves layout only, while regenerating executable node data", () => {
    const plan = demoPlan();
    plan.canvas.nodes.push({
      id: "payment-output-0",
      kind: "route",
      label: "misleading label",
      x: 999,
      y: 777,
      data: { outputIndex: "9" },
    });
    const compiled = compileExecutableStudio(plan, demoVault());
    const payment = compiled.canvas.nodes.find((node) => node.id === "payment-output-0");
    assert.deepEqual({ x: payment?.x, y: payment?.y }, { x: 999, y: 777 });
    assert.equal(payment?.label, "Payment — output 0");
    assert.equal(payment?.data.outputIndex, "0");
  });
});
