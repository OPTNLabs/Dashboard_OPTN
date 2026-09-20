export type MocknetRecordKind = "utxo" | "policy" | "proposal" | "transaction";

export type MocknetRecord = {
  kind: MocknetRecordKind;
  label: string;
  id: string;
  status: string;
  fields: Array<{ label: string; value: string }>;
};

export type MocknetWalkthroughStep = {
  route: "/" | "/wallet" | "/vaults" | "/studio" | "/proposals";
  target: string;
  eyebrow: string;
  title: string;
  description: string;
  action: string;
  productionAction: string;
  checks: string[];
  record: MocknetRecord;
};

export const MOCKNET_UTXOS = {
  funding: {
    outpoint: "mock-funding-6cf2…:0",
    valueSatoshis: "100001000",
    lockingType: "P2PKH",
    state: "wallet-controlled",
  },
  vault: {
    outpoint: "mock-vault-91a7…:0",
    valueSatoshis: "100000000",
    lockingType: "P2SH32 · BoundedRelease",
    state: "provider-proven unspent",
  },
} as const;

export const MOCKNET_TRANSACTION = {
  txid: "mock-release-47bd…",
  inputValueSatoshis: "100000000",
  paymentValueSatoshis: "2000000",
  successorValueSatoshis: "97999000",
  feeSatoshis: "1000",
  status: "mocknet-confirmed",
} as const;

export const MOCKNET_WALKTHROUGH: MocknetWalkthroughStep[] = [
  {
    route: "/",
    target: "overview-chain",
    eyebrow: "1 · Observe",
    title: "Inspect a mock funding UTXO",
    description:
      "Start with a discrete output, not an account balance. This mock funding output is the only money available to place under a policy.",
    action: "Open the Mocknet funding record",
    productionAction:
      "Refresh chain data and inspect the wallet's UTXOs before proposing any movement.",
    checks: [
      "The UTXO is unspent and belongs to the selected network.",
      "BCH value and CashToken state are evaluated independently.",
    ],
    record: {
      kind: "utxo",
      label: "Mocknet funding UTXO",
      id: MOCKNET_UTXOS.funding.outpoint,
      status: MOCKNET_UTXOS.funding.state,
      fields: [
        { label: "Value", value: "1.00001000 BCH" },
        { label: "Lock", value: MOCKNET_UTXOS.funding.lockingType },
        { label: "Token state", value: "none" },
      ],
    },
  },
  {
    route: "/wallet",
    target: "wallet-connect",
    eyebrow: "2 · Authenticate",
    title: "Pair the operator identity",
    description:
      "The mock operator approves a BCH message challenge. It proves account control for login only; it does not authorize a spend or reveal a key.",
    action: "Accept mock bch_signMessage login",
    productionAction:
      "Generate a WalletConnect QR, verify the BCH message signature, and confirm the selected Chipnet account.",
    checks: [
      "The signed challenge binds origin, network, account, nonce, and expiry.",
      "Login has no bch_signTransaction permission and cannot spend by itself.",
    ],
    record: {
      kind: "utxo",
      label: "Mock operator",
      id: "bchmock:qoperator7k4…",
      status: "login verified · owner role",
      fields: [
        { label: "Requested method", value: "bch_signMessage" },
        { label: "Spend permission", value: "not granted" },
        { label: "Network", value: "Mocknet" },
      ],
    },
  },
  {
    route: "/vaults",
    target: "wallet-utxos",
    eyebrow: "3 · Constrain",
    title: "Attach the covenant vault",
    description:
      "The mock funding output is now represented by a BoundedRelease P2SH32 vault. Attaching records the outpoint only after the locking bytecode matches the reviewed artifact.",
    action: "Attach mock vault outpoint",
    productionAction:
      "Fund the reviewed covenant, then attach its exact txid and output index after provider verification.",
    checks: [
      "The output is still unspent, native BCH only, and on the expected network.",
      "The P2SH32 lock must equal the reviewed covenant artifact byte-for-byte.",
    ],
    record: {
      kind: "utxo",
      label: "Mocknet covenant vault",
      id: MOCKNET_UTXOS.vault.outpoint,
      status: MOCKNET_UTXOS.vault.state,
      fields: [
        { label: "Value", value: "1.00000000 BCH" },
        { label: "Lock", value: MOCKNET_UTXOS.vault.lockingType },
        { label: "Evidence", value: "artifact matched · token-free" },
      ],
    },
  },
  {
    route: "/studio",
    target: "policy-studio",
    eyebrow: "4 · Define",
    title: "Publish a bounded payment route",
    description:
      "The policy controls the intended business flow: one reviewed vendor, a 0.05 BCH per-payment cap, a 2-of-3 off-chain approval gate, and a required successor vault output.",
    action: "Publish mock vendor policy",
    productionAction:
      "Use Policy Studio to define routes and limits, then review and publish the version before proposals use it.",
    checks: [
      "Destination, amount, fee cap, and successor-output shape are bound to the intent.",
      "The 2-of-3 rule is an off-chain workflow control; the covenant enforces its own on-chain conditions.",
    ],
    record: {
      kind: "policy",
      label: "Mocknet policy v1",
      id: "policy:mock-vendor-cap-05",
      status: "published · reviewed",
      fields: [
        { label: "Vendor cap", value: "0.05000000 BCH" },
        { label: "Approvals", value: "2 of 3 off-chain" },
        { label: "Successor", value: "required at output 1" },
      ],
    },
  },
  {
    route: "/proposals",
    target: "proposal-flow",
    eyebrow: "5 · Propose",
    title: "Bind an exact transaction intent",
    description:
      "The mock operator asks to pay 0.02 BCH. The proposal commits to the selected vault input, reviewed recipient, successor amount, and a 1,000-satoshi fee cap.",
    action: "Create mock 0.02 BCH proposal",
    productionAction:
      "Create a proposal from an active policy; inspect its exact source UTXO, outputs, intent hash, and expiry.",
    checks: [
      "The payment is below the route cap and the remaining allowance.",
      "The request has one covenant input and the exact reviewed output ordering.",
    ],
    record: {
      kind: "proposal",
      label: "Mocknet allocation proposal",
      id: "proposal:mock-2026-09-18-01",
      status: "policy-valid · awaiting approvals",
      fields: [
        { label: "Payment", value: "0.02000000 BCH → reviewed vendor" },
        { label: "Successor", value: "0.97999000 BCH → same covenant" },
        { label: "Fee", value: "1,000 sats" },
      ],
    },
  },
  {
    route: "/proposals",
    target: "proposal-flow",
    eyebrow: "6 · Approve",
    title: "Collect quorum on the same intent",
    description:
      "Two mock approvers sign the proposal's intent hash. A changed recipient, value, outpoint, or policy version would require new approvals.",
    action: "Record two mock approvals",
    productionAction:
      "Request independent approver signatures and verify every approval refers to the same non-expired intent hash.",
    checks: [
      "Duplicate accounts and a proposer-only quorum are rejected.",
      "Approvals bind the intent hash; they do not sign a mutable draft.",
    ],
    record: {
      kind: "proposal",
      label: "Mocknet approval evidence",
      id: "intent:mock-4d21…",
      status: "2 of 2 approvals · ready to build",
      fields: [
        { label: "Owner", value: "mock approval accepted" },
        { label: "Approver", value: "mock approval accepted" },
        { label: "Expiry", value: "still valid" },
      ],
    },
  },
  {
    route: "/proposals",
    target: "proposal-flow",
    eyebrow: "7 · Sign and validate",
    title: "Validate the signed successor transaction",
    description:
      "A separate mock signing session signs the already-approved transaction. CashVM then validates the covenant path before any network submission is considered.",
    action: "Mock-sign and run CashVM",
    productionAction:
      "Request bch_signTransaction only after quorum, then verify the signed bytes, fee, covenant path, and provider preflight result.",
    checks: [
      "The wallet cannot alter the agreed outputs, fee, locktime, or input sequence.",
      "CashVM accepts the vendor output and exact same-lock successor output.",
    ],
    record: {
      kind: "transaction",
      label: "Mocknet signed transaction",
      id: MOCKNET_TRANSACTION.txid,
      status: "signed · CashVM valid · preflight accepted",
      fields: [
        { label: "Input", value: MOCKNET_UTXOS.vault.outpoint },
        { label: "Outputs", value: "vendor + successor" },
        { label: "Transaction fee", value: "1,000 sats" },
      ],
    },
  },
  {
    route: "/proposals",
    target: "proposal-flow",
    eyebrow: "8 · Observe outcome",
    title: "Confirm the Mocknet transition",
    description:
      "Mocknet now marks the original covenant outpoint spent and exposes the successor as the next controlled state. The platform records mempool and confirmation as separate evidence stages.",
    action: "Confirm mock transaction",
    productionAction:
      "Explicitly broadcast only after all gates pass, then reconcile provider mempool and confirmation evidence before treating the allocation as final.",
    checks: [
      "The broadcast lock prevents sending the same signed transaction twice.",
      "The successor vault is the new UTXO to inspect for the next allocation.",
    ],
    record: {
      kind: "transaction",
      label: "Mocknet confirmed transition",
      id: MOCKNET_TRANSACTION.txid,
      status: MOCKNET_TRANSACTION.status,
      fields: [
        { label: "Vendor output", value: "0.02000000 BCH" },
        { label: "Successor output", value: "0.97999000 BCH" },
        { label: "Prior vault", value: "spent in mock ledger" },
      ],
    },
  },
];

export function mocknetCompletedActions(stepIndex: number): number {
  return Math.max(0, Math.min(stepIndex, MOCKNET_WALKTHROUGH.length));
}

export function mocknetTransactionConservesValue(): boolean {
  return (
    BigInt(MOCKNET_TRANSACTION.inputValueSatoshis) ===
    BigInt(MOCKNET_TRANSACTION.paymentValueSatoshis) +
      BigInt(MOCKNET_TRANSACTION.successorValueSatoshis) +
      BigInt(MOCKNET_TRANSACTION.feeSatoshis)
  );
}
