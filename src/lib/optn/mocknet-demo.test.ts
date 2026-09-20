import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MOCKNET_TRANSACTION,
  MOCKNET_WALKTHROUGH,
  mocknetCompletedActions,
  mocknetTransactionConservesValue,
} from "./mocknet-demo.ts";

describe("Mocknet walkthrough", () => {
  it("keeps its simulated transaction BCH-conserving", () => {
    assert.equal(mocknetTransactionConservesValue(), true);
    assert.equal(MOCKNET_TRANSACTION.feeSatoshis, "1000");
  });

  it("contains the complete user journey without a live-network stage", () => {
    assert.equal(MOCKNET_WALKTHROUGH.length, 8);
    assert.match(MOCKNET_WALKTHROUGH.at(-1)?.record.status ?? "", /mocknet-confirmed/);
    assert.equal(mocknetCompletedActions(-1), 0);
    assert.equal(mocknetCompletedActions(99), MOCKNET_WALKTHROUGH.length);
  });
});
