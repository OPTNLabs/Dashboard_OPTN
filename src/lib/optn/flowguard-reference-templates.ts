import { demoPlan } from "./fixtures.ts";
import type { CanvasEdge, CanvasNode, ControlPlan } from "./types.ts";

/**
 * Behavioral reference only for the MIT-licensed FlowGuard project.
 * These entries are intentionally not CashScript ports: this dashboard has no
 * matching artifact compiler, CashToken state builder, or VM vectors for them.
 */
export type ReferenceTemplateId =
  "multisig-treasury" | "recurring-payment" | "linear-vesting" | "tranche-vesting";

export type ReferenceTemplate = {
  id: ReferenceTemplateId;
  title: string;
  short: string;
  description: string;
  controls: string[];
  requiredImplementation: string[];
  canvas: ControlPlan["canvas"];
};

function graph(nodes: CanvasNode[], edges: CanvasEdge[]): ControlPlan["canvas"] {
  return { nodes, edges };
}

export const FLOWGUARD_REFERENCE_TEMPLATES: ReferenceTemplate[] = [
  {
    id: "multisig-treasury",
    title: "Multi-member treasury",
    short: "M-of-N spend with period caps and pause controls",
    description:
      "A stateful treasury UTXO carries CashToken NFT commitment fields for status and period spending. A spend pays an allowlisted recipient and recreates the same covenant with updated state.",
    controls: [
      "three signer identities",
      "M-of-N threshold",
      "period duration and cap",
      "recipient allowlist",
      "pause / resume / emergency lock",
    ],
    requiredImplementation: [
      "CashToken NFT commitment encoder",
      "three-signature CashScript artifact",
      "state-transition transaction builder",
      "CashToken-aware VM vectors",
    ],
    canvas: graph(
      [
        {
          id: "treasury-state",
          kind: "source",
          label: "Treasury UTXO + state NFT",
          x: 30,
          y: 190,
          data: { state: "active · period spend" },
        },
        {
          id: "treasury-signers",
          kind: "governance",
          label: "2 of 3 signer quorum",
          x: 30,
          y: 40,
          data: { mode: "M-of-N" },
        },
        {
          id: "treasury-covenant",
          kind: "vault",
          label: "Stateful treasury covenant",
          x: 330,
          y: 180,
          data: { state: "CashToken NFT commitment" },
        },
        {
          id: "treasury-payout",
          kind: "route",
          label: "Allowlisted payment — output 0",
          x: 620,
          y: 75,
          data: { check: "recipient + period cap" },
        },
        {
          id: "treasury-successor",
          kind: "route",
          label: "Updated vault state — output 1",
          x: 620,
          y: 280,
          data: { check: "same lock + updated NFT" },
        },
        {
          id: "treasury-controls",
          kind: "constraint",
          label: "Period cap / recipient cap",
          x: 900,
          y: 75,
          data: { enforcement: "on-chain" },
        },
        {
          id: "treasury-pause",
          kind: "recovery",
          label: "Pause or emergency lock",
          x: 900,
          y: 280,
          data: { enforcement: "on-chain state transition" },
        },
      ],
      [
        {
          id: "treasury-auth",
          source: "treasury-signers",
          target: "treasury-covenant",
          kind: "approval",
          label: "distinct signatures",
        },
        {
          id: "treasury-input",
          source: "treasury-state",
          target: "treasury-covenant",
          kind: "bch",
          label: "state input",
        },
        {
          id: "treasury-payment",
          source: "treasury-covenant",
          target: "treasury-payout",
          kind: "bch",
          label: "output 0",
        },
        {
          id: "treasury-successor-edge",
          source: "treasury-covenant",
          target: "treasury-successor",
          kind: "successor",
          label: "output 1",
        },
        {
          id: "treasury-cap",
          source: "treasury-payout",
          target: "treasury-controls",
          kind: "bch",
          label: "cap checks",
        },
        {
          id: "treasury-pause-edge",
          source: "treasury-successor",
          target: "treasury-pause",
          kind: "recovery",
          label: "state path",
        },
      ],
    ),
  },
  {
    id: "recurring-payment",
    title: "Recurring payment",
    short: "Fixed cadence payroll, retainer, or subscription",
    description:
      "A schedule state UTXO tracks the next payable timestamp, payment count, and total paid. When the time gate is reached, a payment goes to the fixed recipient and a successor recreates the schedule state.",
    controls: [
      "recipient",
      "amount per interval",
      "cadence",
      "start and end time",
      "total runway",
      "cancel / pause / refill flags",
    ],
    requiredImplementation: [
      "locktime-aware CashScript artifact",
      "schedule NFT commitment encoder",
      "recurring successor builder",
      "time-bound CashVM vectors",
    ],
    canvas: graph(
      [
        {
          id: "recurring-state",
          kind: "source",
          label: "Schedule UTXO + state NFT",
          x: 30,
          y: 190,
          data: { state: "next payment time" },
        },
        {
          id: "recurring-time",
          kind: "constraint",
          label: "Cadence / locktime gate",
          x: 30,
          y: 40,
          data: { check: "tx.locktime >= next payment" },
        },
        {
          id: "recurring-covenant",
          kind: "vault",
          label: "Recurring payment covenant",
          x: 330,
          y: 180,
          data: { state: "payment count + total paid" },
        },
        {
          id: "recurring-payout",
          kind: "route",
          label: "Fixed payment — output 0",
          x: 620,
          y: 75,
          data: { check: "fixed recipient + amount" },
        },
        {
          id: "recurring-successor",
          kind: "route",
          label: "Advanced schedule — output 1",
          x: 620,
          y: 280,
          data: { check: "next time + interval" },
        },
        {
          id: "recurring-runway",
          kind: "constraint",
          label: "Total runway / end date",
          x: 900,
          y: 75,
          data: { check: "completion state" },
        },
        {
          id: "recurring-admin",
          kind: "recovery",
          label: "Pause / resume / cancel / refill",
          x: 900,
          y: 280,
          data: { check: "sender authority" },
        },
      ],
      [
        {
          id: "recurring-time-edge",
          source: "recurring-time",
          target: "recurring-covenant",
          kind: "approval",
          label: "time eligible",
        },
        {
          id: "recurring-input",
          source: "recurring-state",
          target: "recurring-covenant",
          kind: "bch",
          label: "state input",
        },
        {
          id: "recurring-payment",
          source: "recurring-covenant",
          target: "recurring-payout",
          kind: "bch",
          label: "output 0",
        },
        {
          id: "recurring-successor-edge",
          source: "recurring-covenant",
          target: "recurring-successor",
          kind: "successor",
          label: "output 1",
        },
        {
          id: "recurring-runway-edge",
          source: "recurring-payout",
          target: "recurring-runway",
          kind: "bch",
          label: "schedule checks",
        },
        {
          id: "recurring-admin-edge",
          source: "recurring-successor",
          target: "recurring-admin",
          kind: "recovery",
          label: "admin paths",
        },
      ],
    ),
  },
  {
    id: "linear-vesting",
    title: "Linear vesting with optional cliff",
    short: "Time-proportional releases to a beneficiary",
    description:
      "A beneficiary claims only the amount vested at the transaction locktime. The successor preserves remaining BCH or tokens and state tracks already released value, pause time, and recipient.",
    controls: [
      "beneficiary",
      "total allocation",
      "start / end time",
      "cliff",
      "cancelable / transferable",
      "BCH or CashToken asset",
    ],
    requiredImplementation: [
      "vesting math artifact",
      "BCH and CashToken transition builders",
      "state NFT encoder",
      "claim, pause, resume, and cancellation VM vectors",
    ],
    canvas: graph(
      [
        {
          id: "vesting-state",
          kind: "source",
          label: "Vesting UTXO + release state",
          x: 30,
          y: 190,
          data: { state: "released + effective time" },
        },
        {
          id: "vesting-clock",
          kind: "constraint",
          label: "Start / cliff / end clock",
          x: 30,
          y: 40,
          data: { check: "claimable at locktime" },
        },
        {
          id: "vesting-covenant",
          kind: "vault",
          label: "Linear vesting covenant",
          x: 330,
          y: 180,
          data: { state: "vested - released" },
        },
        {
          id: "vesting-claim",
          kind: "route",
          label: "Beneficiary claim — output 0",
          x: 620,
          y: 75,
          data: { check: "claimable amount" },
        },
        {
          id: "vesting-successor",
          kind: "route",
          label: "Remaining vesting state — output 1",
          x: 620,
          y: 280,
          data: { check: "updated released amount" },
        },
        {
          id: "vesting-schedule",
          kind: "constraint",
          label: "Linear vesting calculation",
          x: 900,
          y: 75,
          data: { check: "time proportion" },
        },
        {
          id: "vesting-admin",
          kind: "recovery",
          label: "Pause / resume / cancel",
          x: 900,
          y: 280,
          data: { check: "sender authorization" },
        },
      ],
      [
        {
          id: "vesting-time-edge",
          source: "vesting-clock",
          target: "vesting-covenant",
          kind: "approval",
          label: "time gate",
        },
        {
          id: "vesting-input",
          source: "vesting-state",
          target: "vesting-covenant",
          kind: "bch",
          label: "state input",
        },
        {
          id: "vesting-claim-edge",
          source: "vesting-covenant",
          target: "vesting-claim",
          kind: "bch",
          label: "output 0",
        },
        {
          id: "vesting-successor-edge",
          source: "vesting-covenant",
          target: "vesting-successor",
          kind: "successor",
          label: "output 1",
        },
        {
          id: "vesting-schedule-edge",
          source: "vesting-claim",
          target: "vesting-schedule",
          kind: "bch",
          label: "claimable check",
        },
        {
          id: "vesting-admin-edge",
          source: "vesting-successor",
          target: "vesting-admin",
          kind: "recovery",
          label: "admin paths",
        },
      ],
    ),
  },
  {
    id: "tranche-vesting",
    title: "Custom tranche release",
    short: "Up to eight scheduled milestone unlocks",
    description:
      "A bounded schedule stores immutable cumulative unlock checkpoints. At each eligible timestamp, the beneficiary can claim the newly unlocked difference while the successor retains the updated state.",
    controls: [
      "beneficiary",
      "total allocation",
      "two to eight checkpoint dates",
      "cumulative unlock amounts",
      "pause / cancel policy",
      "BCH or CashToken asset",
    ],
    requiredImplementation: [
      "bounded tranche compiler",
      "checkpoint monotonicity validation",
      "CashToken-aware state builder",
      "all checkpoint and cancellation VM vectors",
    ],
    canvas: graph(
      [
        {
          id: "tranche-state",
          kind: "source",
          label: "Tranche UTXO + release state",
          x: 30,
          y: 190,
          data: { state: "released amount" },
        },
        {
          id: "tranche-clock",
          kind: "constraint",
          label: "Checkpoint schedule",
          x: 30,
          y: 40,
          data: { check: "current tranche eligible" },
        },
        {
          id: "tranche-covenant",
          kind: "vault",
          label: "Tranche vesting covenant",
          x: 330,
          y: 180,
          data: { state: "bounded schedule" },
        },
        {
          id: "tranche-claim",
          kind: "route",
          label: "Milestone claim — output 0",
          x: 620,
          y: 75,
          data: { check: "new cumulative unlock" },
        },
        {
          id: "tranche-successor",
          kind: "route",
          label: "Remaining schedule — output 1",
          x: 620,
          y: 280,
          data: { check: "same lock + updated state" },
        },
        {
          id: "tranche-controls",
          kind: "constraint",
          label: "Up to eight immutable tranches",
          x: 900,
          y: 75,
          data: { check: "monotonic schedule" },
        },
        {
          id: "tranche-admin",
          kind: "recovery",
          label: "Pause / resume / cancel",
          x: 900,
          y: 280,
          data: { check: "sender authorization" },
        },
      ],
      [
        {
          id: "tranche-time-edge",
          source: "tranche-clock",
          target: "tranche-covenant",
          kind: "approval",
          label: "checkpoint gate",
        },
        {
          id: "tranche-input",
          source: "tranche-state",
          target: "tranche-covenant",
          kind: "bch",
          label: "state input",
        },
        {
          id: "tranche-claim-edge",
          source: "tranche-covenant",
          target: "tranche-claim",
          kind: "bch",
          label: "output 0",
        },
        {
          id: "tranche-successor-edge",
          source: "tranche-covenant",
          target: "tranche-successor",
          kind: "successor",
          label: "output 1",
        },
        {
          id: "tranche-controls-edge",
          source: "tranche-claim",
          target: "tranche-controls",
          kind: "bch",
          label: "tranche checks",
        },
        {
          id: "tranche-admin-edge",
          source: "tranche-successor",
          target: "tranche-admin",
          kind: "recovery",
          label: "admin paths",
        },
      ],
    ),
  },
];

export function referenceTemplatePlan(template: ReferenceTemplate): ControlPlan {
  return {
    ...demoPlan(),
    name: `${template.title} — reference preview`,
    description: template.description,
    reviewedShapeId: `reference-preview:${template.id}`,
    canvas: template.canvas,
  };
}
