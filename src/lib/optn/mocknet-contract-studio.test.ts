import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildMocknetContract,
  DEFAULT_MOCKNET_CONTRACT_INPUT,
  mocknetElementDetail,
} from "./mocknet-contract-studio.ts";

describe("Mocknet contract workbench", () => {
  it("compiles the selected caps into a deterministic P2SH32 contract and transaction", () => {
    const built = buildMocknetContract(DEFAULT_MOCKNET_CONTRACT_INPUT);
    assert.match(built.sourceAssembly, /<5000000> OP_LESSTHANOREQUAL/);
    assert.match(built.sourceAssembly, /<2000> OP_LESSTHANOREQUAL/);
    assert.equal(built.transition.outputs.length, 2);
    assert.equal(built.transition.outputs[0]?.valueSatoshis, "2000000");
    assert.equal(built.transition.outputs[1]?.valueSatoshis, "97999000");
    assert.equal(built.evaluation.policy.allowed, true);
    assert.ok(built.transition.rawHex.length > 100);
  });

  it("shows a constructed but blocked transaction when the proposed payment exceeds the cap", () => {
    const built = buildMocknetContract({
      ...DEFAULT_MOCKNET_CONTRACT_INPUT,
      paymentBch: "0.06",
    });
    assert.equal(built.transition.outputs[0]?.valueSatoshis, "6000000");
    assert.equal(built.evaluation.policy.allowed, false);
    assert.ok(
      built.evaluation.policy.blocking.some((rule) => rule.id === "amount.over-per-payment"),
    );
  });

  it("keeps the off-chain workflow distinct while allowing a one-approver configuration", () => {
    const built = buildMocknetContract({
      ...DEFAULT_MOCKNET_CONTRACT_INPUT,
      approvalThreshold: 1,
    });
    assert.equal(built.evaluation.policy.allowed, true);
    assert.match(
      built.plan.canvas.nodes.find((node) => node.id === "approval-workflow")?.label ?? "",
      /1 of 3/,
    );
  });

  it("maps graph elements to the reviewed transaction and covenant controls", () => {
    const built = buildMocknetContract(DEFAULT_MOCKNET_CONTRACT_INPUT);
    const limits = mocknetElementDetail("compiled-limits", built);
    const payment = mocknetElementDetail("payment-output-0", built);
    const successor = mocknetElementDetail("successor-output-1", built);
    const approval = mocknetElementDetail("approval-workflow", built);

    assert.equal(limits.editable, "limits");
    assert.match(limits.cashAssembly ?? "", /<5000000> OP_LESSTHANOREQUAL/);
    assert.equal(payment.editable, "payment");
    assert.match(payment.transactionBinding, /2000000 sats/);
    assert.equal(successor.editable, "none");
    assert.match(successor.cashAssembly ?? "", /OP_TXOUTPUTCOUNT <2> OP_NUMEQUALVERIFY/);
    assert.equal(approval.editable, "approval");
    assert.match(approval.cashAssembly ?? "", /No CashAssembly/);
  });
});
