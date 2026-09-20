import type {
  ControlPlan,
  CovenantDecision,
  PolicyDecision,
  PolicyRuleResult,
  Proposal,
  UtxoState,
} from "./types.ts";
import { BOUNDED_RELEASE_SHAPE_ID, evaluateReviewedShape } from "./covenant.ts";
import { parseSatoshis } from "./money.ts";
import { isDustValue } from "./encoding.ts";

function rule(
  partial: Omit<PolicyRuleResult, "pass"> & { pass: boolean },
): PolicyRuleResult {
  return partial;
}

export type EvaluationInput = {
  plan: ControlPlan;
  vaultLockingBytecodeHex: string;
  utxo: UtxoState;
  routeId: number;
  amountSatoshis: string;
  feeSatoshis: string;
  destinationLockingBytecodeHex: string;
  successorLockingBytecodeHex: string;
  now?: number;
  approvals?: Array<{ account: string }>;
  proposerAccount?: string;
  liveBroadcast?: boolean;
};

export function evaluatePolicy(input: EvaluationInput): {
  policy: PolicyDecision;
  covenant: CovenantDecision;
} {
  const { plan, utxo } = input;
  const route = plan.routes.find((item) => item.id === input.routeId);
  const amount = parseSatoshis(input.amountSatoshis);
  const fee = parseSatoshis(input.feeSatoshis);
  const inputValue = parseSatoshis(utxo.valueSatoshis);
  const successorValue = inputValue - amount - fee;
  const remainingAllowance =
    parseSatoshis(plan.limits.sessionAllowanceSatoshis) -
    parseSatoshis(plan.limits.sessionConsumedSatoshis);

  const rules: PolicyRuleResult[] = [];

  rules.push(
    rule({
      id: "network.mismatch",
      label: "Proposal network matches the plan and UTXO",
      pass: plan.network === utxo.network,
      enforcement: "off-chain-policy",
      detail: `plan ${plan.network} / utxo ${utxo.network}`,
    }),
  );
  rules.push(
    rule({
      id: "plan.paused",
      label: "Plan is not paused",
      pass: !plan.pause && plan.status !== "paused",
      enforcement: "off-chain-policy",
      detail: `status ${plan.status}, pause=${String(plan.pause)}`,
    }),
  );
  rules.push(
    rule({
      id: "plan.not-active",
      label: "Plan is an active published version",
      pass: plan.status === "active",
      enforcement: "off-chain-policy",
      detail: `status ${plan.status} v${plan.version}`,
    }),
  );
  rules.push(
    rule({
      id: "asset.native-only",
      label: "Asset is native BCH",
      pass: plan.asset.type === "native-bch" && utxo.token.categoryHex === null,
      enforcement: "off-chain-policy",
      detail:
        plan.asset.type === "native-bch"
          ? "Native BCH route. Token presence is rejected by policy; this BoundedRelease script does not inspect token fields."
          : "Fungible CashToken payment is not a reviewed live route",
    }),
  );
  rules.push(
    rule({
      id: "asset.token-leak",
      label: "Native-BCH route carries no token state (off-chain policy)",
      pass: utxo.token.categoryHex === null && utxo.token.amount === "0",
      enforcement: "off-chain-policy",
      detail: utxo.token.categoryHex ? `token ${utxo.token.categoryHex}` : "no token",
    }),
  );

  rules.push(
    rule({
      id: "utxo.spent",
      label: "Source outpoint is unspent",
      pass: !utxo.spent,
      enforcement: "off-chain-policy",
      detail: utxo.spent ? "UTXO marked spent" : "unspent",
    }),
  );
  rules.push(
    rule({
      id: "utxo.missing",
      label: "Source UTXO locking bytecode matches the vault",
      pass: utxo.lockingBytecodeHex === input.vaultLockingBytecodeHex,
      enforcement: "on-chain",
      detail: "Vault instance lock must equal the observed UTXO lock",
    }),
  );
  rules.push(
    rule({
      id: "amount.non-positive",
      label: "Payment amount is positive",
      pass: amount > 0n,
      enforcement: "on-chain",
      detail: `${amount.toString()} sats`,
    }),
  );
  rules.push(
    rule({
      id: "amount.over-per-payment",
      label: "Payment is within the plan per-payment cap (covenant also has a compiled on-chain cap)",
      pass: amount <= parseSatoshis(plan.limits.perPaymentSatoshis),
      enforcement: "off-chain-policy",
      detail: `${amount.toString()} vs ${plan.limits.perPaymentSatoshis} sats`,
    }),
  );
  rules.push(
    rule({
      id: "amount.over-session",
      label: "Payment is within remaining session allowance (off-chain, not covenant-enforced, not atomically reserved)",
      pass: amount <= remainingAllowance,
      enforcement: "not-implemented",

      detail: `remaining ${remainingAllowance.toString()} sats`,
    }),
  );
  rules.push(
    rule({
      id: "amount.over-window",
      label: "Daily window cap (not implemented; not atomically reserved; not covenant-enforced)",
      pass: true,
      enforcement: "not-implemented",
      detail: `window ${plan.limits.windowKind} cap ${plan.limits.windowCapSatoshis} sats is display-only`,
    }),
  );
  rules.push(
    rule({
      id: "destination.not-allowlisted",
      label: "Destination is a reviewed route",
      pass: Boolean(route),
      enforcement: "off-chain-policy",
      detail: route ? route.label : `Unknown route ${input.routeId}`,
    }),
  );
  rules.push(
    rule({
      id: "destination.lock-mismatch",
      label: "Destination lock matches the reviewed route",
      pass: Boolean(
        route && route.destinationLockingBytecodeHex === input.destinationLockingBytecodeHex,
      ),
      enforcement: route?.enforcement ?? "off-chain-policy",
      detail: route?.whyConstrained ?? "No reviewed route",
    }),
  );
  rules.push(
    rule({
      id: "fee.over-cap",
      label: "Fee is within the plan fee cap",
      pass: fee <= parseSatoshis(plan.limits.maxFeeSatoshis) && fee >= 0n,
      enforcement: "off-chain-policy",
      detail: `${fee.toString()} vs ${plan.limits.maxFeeSatoshis} sats`,
    }),
  );
  rules.push(
    rule({
      id: "value.conservation",
      label: "Input value equals payment + successor + fee",
      pass: successorValue >= 0n && amount + fee + successorValue === inputValue,
      enforcement: "on-chain",
      detail: `${inputValue.toString()} in = ${amount.toString()} + ${successorValue.toString()} + ${fee.toString()} fee`,
    }),
  );
  rules.push(
    rule({
      id: "dust.output",
      label: "No dust outputs",
      pass: !isDustValue(amount) && !isDustValue(successorValue),
      enforcement: "on-chain",
      detail: `payment ${amount.toString()} / successor ${successorValue.toString()}`,
    }),
  );
  rules.push(
    rule({
      id: "successor.required",
      label: "Successor covenant output is required",
      pass: Boolean(route?.successor.required),
      enforcement: "on-chain",
      detail: "Output 1 must continue the vault",
    }),
  );
  rules.push(
    rule({
      id: "successor.lock-mismatch",
      label: "Successor lock equals the vault covenant",
      pass: input.successorLockingBytecodeHex === input.vaultLockingBytecodeHex,
      enforcement: "on-chain",
      detail: "Same P2SH32 covenant lock",
    }),
  );
  rules.push(
    rule({
      id: "shape.unreviewed",
      label: "Route uses a reviewed shape",
      pass: plan.reviewedShapeId === BOUNDED_RELEASE_SHAPE_ID,
      enforcement: "off-chain-policy",
      detail: plan.reviewedShapeId,
    }),
  );

  if (input.liveBroadcast) {
    rules.push(
      rule({
        id: "broadcast.blocked",
        label: "Live broadcast requires an on-chain recipient-enforcing shape",
        pass: plan.reviewedShapeId === BOUNDED_RELEASE_SHAPE_ID,
        enforcement: "on-chain",
        detail: "Simulation-only shapes cannot broadcast",
      }),
    );
  }

  if (input.approvals) {
    const unique = new Set(input.approvals.map((item) => item.account));
    rules.push(
      rule({
        id: "approval.threshold",
        label: `Off-chain approval policy: ${plan.governance.threshold} of ${plan.governance.authorizedAccounts.length} distinct accounts`,
        pass: unique.size >= plan.governance.threshold,
        enforcement: "off-chain-policy",
        detail: `${unique.size} distinct approvals`,
      }),
    );
    rules.push(
      rule({
        id: "approval.duplicate-account",
        label: "Approvals are from distinct accounts",
        pass: unique.size === input.approvals.length,
        enforcement: "off-chain-policy",
        detail: `${input.approvals.length} signatures, ${unique.size} accounts`,
      }),
    );
    if (plan.governance.proposerCannotBeSoleApprover && input.proposerAccount) {
      const others = [...unique].filter((account) => account !== input.proposerAccount);
      rules.push(
        rule({
          id: "approval.proposer-sole",
          label: "Proposer cannot be the sole approver",
          pass: others.length > 0 || plan.governance.threshold === 0,
          enforcement: "off-chain-policy",
          detail: "Separation of duties",
        }),
      );
    }
  }

  const blocking = rules.filter((item) => !item.pass);
  const covenant = evaluateReviewedShape({
    shapeId: plan.reviewedShapeId,
    inputCount: 1,
    outputCount: 2,
    activeInputIndex: 0,
    paymentLockingBytecodeHex: input.destinationLockingBytecodeHex,
    expectedPaymentLockingBytecodeHex:
      route?.destinationLockingBytecodeHex ?? input.destinationLockingBytecodeHex,
    successorLockingBytecodeHex: input.successorLockingBytecodeHex,
    expectedSuccessorLockingBytecodeHex: input.vaultLockingBytecodeHex,
    paymentSatoshis: input.amountSatoshis,
    maxPaymentSatoshis: plan.limits.perPaymentSatoshis,
    feeSatoshis: input.feeSatoshis,
    maxFeeSatoshis: plan.limits.maxFeeSatoshis,
    inputTokenCategory: utxo.token.categoryHex,
    outputTokenCategories: [null, null],
  });

  const covenantBlocking = covenant.rules.filter((item) => !item.pass);
  return {
    policy: {
      allowed: blocking.length === 0 && covenantBlocking.length === 0,
      rules,
      blocking: [...blocking, ...covenantBlocking],
    },
    covenant,
  };
}

export function explainDecision(decision: PolicyDecision): string {
  if (decision.allowed) return "All policy and covenant checks passed.";
  return decision.blocking.map((item) => `${item.label}: ${item.detail}`).join(" · ");
}

export function validateCanvas(plan: ControlPlan): PolicyRuleResult[] {
  const kinds = new Set(plan.canvas.nodes.map((node) => node.kind));
  const results: PolicyRuleResult[] = [];
  const required: Array<ControlPlan["canvas"]["nodes"][number]["kind"]> = [
    "source",
    "vault",
    "asset",
    "route",
    "governance",
    "evidence",
  ];
  for (const kind of required) {
    results.push({
      id: kind === "route" ? "destination.not-allowlisted" : "shape.unreviewed",
      label: `Canvas includes a ${kind} node`,
      pass: kinds.has(kind),
      enforcement: "off-chain-policy",
      detail: kinds.has(kind) ? "present" : "missing",
    });
  }
  results.push({
    id: "asset.native-only",
    label: "Native BCH asset node only",
    pass: plan.asset.type === "native-bch",
    enforcement: "off-chain-policy",
    detail: plan.asset.type,
  });
  return results;
}

export function planAllowsBroadcast(plan: ControlPlan, proposal: Proposal): boolean {
  return (
    plan.status === "active" &&
    !plan.pause &&
    plan.reviewedShapeId === BOUNDED_RELEASE_SHAPE_ID &&
    proposal.policyDecision.allowed &&
    proposal.covenantDecision.onChainRecipientEnforced
  );
}
