import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  FLOWGUARD_REFERENCE_TEMPLATES,
  referenceTemplatePlan,
} from "./flowguard-reference-templates.ts";

describe("FlowGuard-guided reference template gallery", () => {
  it("keeps each displayed reference shape distinct and non-empty", () => {
    assert.deepEqual(
      FLOWGUARD_REFERENCE_TEMPLATES.map((template) => template.id),
      ["multisig-treasury", "recurring-payment", "linear-vesting", "tranche-vesting"],
    );
    for (const template of FLOWGUARD_REFERENCE_TEMPLATES) {
      assert.ok(template.canvas.nodes.length >= 6);
      assert.ok(template.canvas.edges.length >= 5);
      assert.ok(template.requiredImplementation.length >= 3);
    }
  });

  it("renders reference graphs without promoting them to live plans", () => {
    const template = FLOWGUARD_REFERENCE_TEMPLATES[0]!;
    const plan = referenceTemplatePlan(template);
    assert.match(plan.name, /reference preview/);
    assert.equal(plan.canvas, template.canvas);
    assert.equal(plan.reviewedShapeId, "reference-preview:multisig-treasury");
  });
});
