# Grok handoff: OPTN Covenant Control Plane revamp

## Mission

Revamp `dashboard_OPTN` into an operator-facing control plane for constraining
money movement with reviewed BCH covenant shapes.

The product should let a business operator visually define, inspect, simulate,
approve, and monitor bounded fund-allocation plans. The visual language should
feel like a typed budget-flow canvas: drag reviewed components onto a canvas,
connect valid state transitions, and see exactly which assets, recipients,
limits, approvals, and successor outputs are enforced.

This is not a generic smart-contract IDE and not a browser wallet. The first
functional release is a Chipnet-capable policy and workflow control plane, with
Mainnet visible only behind explicit configuration and safety gates. AI agents
are a later consumer of the same constrained capabilities, not authors of
arbitrary transactions or covenant code.

## Current baseline

The dashboard began as a dependency-free, regtest/offline showcase with:

- an in-memory application service and simulated chain;
- immutable contract-version registration and approval;
- a token deployment fixture and covenant vault instance;
- a flat vault policy with environment, approval, BCH/token/fee limits, and an
  allowlist;
- deterministic vault-release transaction construction;
- separate BCH and CashToken invariant checks;
- UTXO reservation and idempotency handling;
- exact intent-hash approvals;
- mock signing and simulated mempool/confirmed/finalized lifecycle; and
- a hash-chained audit timeline.

The current console displays registry, assets, intents, and audit evidence, but
does not yet let an operator author a policy or understand the fund flow as a
graph. Preserve the current API/domain security boundary while replacing the
console experience.

## Product thesis

The primary object is a **Control Plan**, not a transaction and not a raw
CashScript file.

```text
funding source(s)
      |
      v
protected vault / budget pool
      |
      +--> approved payment route --> fixed recipient / payout vault
      |
      +--> approved covenant handoff --> next protected vault
      |
      +--> recovery route --> fixed recovery destination
```

Every spend is a UTXO state transition. The canvas must make clear:

- what UTXO state is consumed;
- which asset is protected: native BCH, an approved fungible CashToken, or an
  NFT state carrier;
- what output(s) are required, in what order;
- how BCH value, token amount, token category, NFT capability, commitment, and
  fee change independently;
- what remains in the covenant successor;
- which recipient locks are immutable or allowlisted;
- what allowance is consumed;
- what approvals are required; and
- what recovery path exists.

Do not present a dashboard approval rule as if it were on-chain enforcement.
The UI may explain organizational policy, but mandatory money-movement rules
must be represented by the reviewed covenant shape and checked again at the
transaction/signing boundary.

## Target operator experience

### 1. Overview / command center

Create a compact operator home screen with:

- environment badge: `REGTEST ONLY` / later `CHIPNET` / later `MAINNET`, never
  implying an enabled environment;
- total protected BCH and token balances, separated by asset;
- active vaults and their current outpoints/state versions;
- remaining budget and percentage consumed per vault or budget pool;
- pending approvals and their quorum state;
- blocked proposals grouped by reason;
- last chain observation and evidence level; and
- a visual lineage strip for the selected vault: `funded → active → proposed →
  approved → signed → broadcast → mempool → confirmed → finalized`.

Use explicit evidence labels. `simulated`, `local VM validated`, `regtest
observed`, `signed but unbroadcast`, `broadcast`, `confirmed`, and `finalized`
are different states and must never collapse into one “success” label.

### 2. Policy Studio / Control Plan canvas

The main screen should be a three-pane editor:

```text
component palette | typed flow canvas | selected node inspector
                  | verification / warnings drawer
```

Palette groups:

- **Sources**: treasury funding, sponsor funding, owner funding, existing
  vault/UTXO;
- **Vaults**: native-BCH authority, approved-token authority, NFT state baton;
- **Routes**: fixed-recipient payment, approved covenant handoff, recovery,
  timeout/expiry where the reviewed shape supports it;
- **Constraints**: per-transition cap, cumulative allowance, daily/window cap,
  max fee, exact asset/category, fixed recipient lock, approved template,
  required successor, time gate;
- **Governance**: approval quorum, role requirement, separation of duties,
  expiry, reason code; and
- **Evidence**: contract version, artifact hash, compiler/VM profile, review
  status, test fixture, deployment observation.

Canvas rules:

- Nodes represent typed UTXO states or reviewed transition templates.
- Edges represent transaction outputs/successors, not function calls.
- Ports are typed. A native-BCH payment cannot connect to a token-only route;
  an NFT state baton cannot be silently treated as fungible balance.
- A route may only be created from a reviewed template/shape. Operators can
  configure parameters and limits, but cannot drag arbitrary opcodes,
  callbacks, output scripts, or executable policy code into production plans.
- Output order and cardinality are visible on every transition card.
- The canvas shows the “money conservation” equation on each transition:
  input value = outputs + fee, and input token amount/category/capability/state
  must satisfy the selected route’s rules.
- Invalid connections should be blocked immediately and also returned by the
  server-side validator with machine-readable rule IDs.
- Drag/drop is an authoring aid, not an authorization bypass. The persisted
  plan is canonicalized, hashed, versioned, and revalidated on every proposal.

Suggested visual treatment:

- dark operator console with restrained green/blue status colors;
- large asset-flow cards rather than raw hashes as the primary representation;
- hashes, outpoints, bytecode, and commitments available in expandable detail;
- green edges for proven successor continuity;
- amber edges for pending review or unavailable evidence;
- red edges for a failed invariant; and
- a visible “why this is constrained” explanation on each route.

### 3. Inspector / policy form

When a node or edge is selected, show plain-language fields first and the
canonical technical fields second.

Examples:

- “Maximum per payment: 0.05 BCH” → satoshi value;
- “Session allowance remaining: 2.4 BCH” → exact integer accounting;
- “Recipient: Acme vendor payout vault” → immutable locking-bytecode identity;
- “Asset: native BCH” or “CashToken category …” → exact category, never ticker
  metadata alone;
- “State carrier: mutable NFT” → category, capability, commitment/version;
- “Successor: same covenant, state version + 1”;
- “Fee ceiling” and current estimated fee;
- “Requires 2 of 3 approvers; proposer cannot be sole approver”;
- “Recovery: fixed destination, separate recovery authority”; and
- “Evidence: local CashVM passed / live chain not verified”.

Add a “Policy diff” view for every revision. Approved plans are immutable;
changing a limit, recipient, route, contract version, constructor parameter, or
successor rule creates a new version and invalidates affected approvals.

### 4. Proposal review / approval room

Present one exact proposal, not a generic confirmation dialog:

- source outpoint(s) and current chain observation;
- input/output cards in exact index order;
- BCH value and fee delta;
- token category, amount, NFT capability, and commitment delta;
- recipient lock and route/template identity;
- policy rules and covenant invariants with pass/fail evidence;
- canonical intent hash and policy ID;
- approval quorum, identities, timestamps, and remaining approvals;
- stale UTXO / changed-output warnings; and
- lifecycle state through finalization.

Approvals bind to the exact canonical intent hash. A changed output, policy,
source outpoint, token state, or policy version must invalidate prior approvals.

### 5. Audit / lineage view

Provide both a chronological audit timeline and a selected-vault lineage graph.
Show funding provenance as accounting metadata only; never imply that a funding
source authorizes later spending. Show the hash-chain validity and exportable
evidence bundle without secrets.

## Canonical data model for the UI/API

Introduce a neutral dashboard model. Keep it compatible with the existing
fixture service, but do not make the UI assemble transaction objects directly.

```ts
type ControlPlan = {
  schemaVersion: 1;
  id: string;
  environment: 'regtest' | 'chipnet' | 'mainnet-disabled';
  asset: NativeBchAsset | ApprovedFungibleTokenAsset;
  source: VaultSource;
  routes: ReviewedRoute[];
  governance: GovernancePolicy;
  recovery: RecoveryPolicy;
  evidence: EvidenceProfile;
  status: 'draft' | 'review' | 'approved' | 'superseded' | 'blocked';
  policyId: string;
};

type ReviewedRoute = {
  id: number;
  type: 'DIRECT_PAYMENT' | 'COVENANT' | 'RECOVERY';
  destination: FixedDestination | ApprovedCovenantTarget;
  maxAmount: bigint;
  successor: SuccessorRule;
  accounting: AssetAccountingRules;
  reviewedShapeId: string;
};

type TransitionPreview = {
  input: ObservedUtxo;
  outputs: PlannedOutput[];
  assetDeltas: AssetDelta[];
  policyDecision: PolicyDecision;
  covenantDecision: CovenantDecision;
  intentHash: string;
  evidence: EvidenceRecord[];
};
```

The exact implementation language can follow the existing dashboard style, but
the semantic distinction matters: policy configuration, observed chain state,
transaction planning, approval evidence, and signer/broadcast state are
separate objects.

## Nova SDK relationship

Use Nova as the secondary design reference and future runtime adapter, not as a
source of arbitrary dashboard behavior.

Nova already provides useful concepts for this UI:

- canonical versioned policy specs with reviewed `DIRECT_PAYMENT` and
  `COVENANT` routes;
- policy IDs derived from canonical policy encoding;
- fixed-width state and successor serialization;
- explicit native-BCH versus fungible-CashToken asset types;
- customer-owned agent guardrails for allowed routes, assets, automatic amount,
  and intent lifetime;
- non-authorizing agent intents bound to policy, instance, outpoint, state
  version, asset, route, amount, expiry, and idempotency; and
- a lifecycle of plan → sign → verify → broadcast → follow.

The dashboard should expose these as understandable controls and projections.
It must not claim that Nova currently supports a general fungible CashToken
payment path: that work remains a reviewed-contract/evidence target. Likewise,
do not expose raw NFT state-baton implementation details as if they were a
fungible budget balance.

Recommended adapter boundary:

```text
dashboard ControlPlan
       ↓ validate/canonicalize
reviewed-shape adapter
       ↓
Nova PolicySpec / reviewed artifact or dashboard fixture
       ↓
TransitionPlan / ExecutionPackage
       ↓
customer-controlled signer + verifier + broadcaster
```

The dashboard may display Nova’s route/policy projections, but the customer
runtime remains the authority for signer, provider, chain observation, and
broadcast. An AI agent later receives a capability summary and submits a
constrained intent; it does not receive a transaction builder or policy-code
editor.

## Libauth and CashScript integration boundary

Use the references as verification and explanation infrastructure:

- CashScript compiler artifacts provide ABI, constructor inputs, bytecode,
  compiler metadata, source, and debug/source-map information;
- CashScript’s local debug path can show failing `require` statements and VM
  resource usage for supported transaction inputs;
- Libauth models BCH output value and CashToken category, fungible amount, NFT
  capability, and commitment as separate fields;
- Libauth VM evaluation/debugging can provide local verification evidence; and
- OPTNWallet’s existing Libauth transaction verification patterns can inform a
  future chain adapter.

Recommended UX output from these adapters:

```text
Policy rule                    PASS / FAIL
  output 0 locking bytecode    exact match
  token category               exact match
  fungible amount              conserved
  NFT capability/commitment    expected successor
  BCH value + fee              conserved / within cap
  VM execution                 valid at profile X
  evidence                     local-only / regtest-observed
```

Do not compile arbitrary operator-supplied CashScript in the browser, and do
not label a source-map/VM result as network or production evidence.

## What to build first

### Phase 1 — visual prototype over existing fixtures

1. Keep the current API and simulated chain.
2. Add a `Control Plan` projection to the existing demo state.
3. Replace the overview console with the command center and Policy Studio.
4. Make the canvas support the current `TreasuryVault` release flow:
   vault input → fixed recipient payout + covenant successor.
5. Add drag/drop or click-to-add controls for the existing policy fields.
6. Render live policy/invariant results using the existing API decision.
7. Preserve the current successful/rejection flows and audit timeline.

### Phase 2 — reviewed route catalog

1. Add neutral route metadata for fixed payment, covenant handoff, and recovery.
2. Add typed asset/state-carrier cards.
3. Add immutable plan versions, canonical policy IDs, and policy diffing.
4. Add a fixture export/import format with no secrets.
5. Add scenario simulation: valid spend, over-limit spend, wrong recipient,
   wrong category, altered successor, stale outpoint, duplicate intent, and
   insufficient approvals.

### Phase 3 — real compilation/VM adapter

1. Compile only approved templates in a controlled worker/service boundary.
2. Persist source/artifact/compiler/constructor hashes as immutable evidence.
3. Display source-map-linked failures and VM resource usage.
4. Add signed-but-unbroadcast and chain-observed states before any live
   capability is considered.

### Phase 4 — agent capabilities

1. Expose read-only `capabilities()` for an agent or automation client.
2. Accept a strict intent schema with idempotency, policy, instance, outpoint,
   state version, asset, route, amount, and expiry.
3. Revalidate the intent against current chain state and the canonical plan.
4. Require explicit supervised/autonomous approval mode and cumulative budget
   accounting.
5. Keep signer and broadcast capabilities customer-controlled and outside the
   dashboard browser.

## Acceptance criteria for Grok’s revamp

- An operator can create a draft control plan without reading CashScript.
- The plan is visually understandable as UTXO states and successor outputs.
- Only reviewed route templates can be placed on the production canvas.
- Native BCH, fungible tokens, NFT state, and fees are shown separately.
- A wrong recipient/category/amount/successor/output order is visibly blocked.
- The server-side policy/invariant decision remains authoritative.
- An approved plan is immutable and has a visible policy ID/version.
- Proposal approvals are bound to the exact intent hash.
- Existing duplicate, stale, changed-output, token-leakage, and role tests stay
  green.
- The UI distinguishes simulated, locally VM-validated, signed-but-unbroadcast,
  broadcast, confirmed, and finalized evidence.
- No private keys, mnemonics, wallet files, signer credentials, or production
  network paths enter the browser, fixtures, logs, or dashboard API.
- No mainnet signing/broadcasting is enabled by the visual redesign.
- The prototype remains runnable without installing new dependencies unless a
  dependency is explicitly justified and reviewed.

## Explicit anti-goals

Do not build:

- a free-form CashScript/bytecode drag-and-drop IDE;
- a browser-based wallet or private-key store;
- a generic “agent wallet” with runtime-chosen recipients;
- a policy editor that treats dashboard approvals as covenant enforcement;
- a balance/account model that hides UTXOs and successor state;
- an interface that combines BCH, fungible tokens, and NFT state into one
  undifferentiated balance;
- a one-click live broadcast path; or
- a production-readiness claim based only on mocked or local VM evidence.

## Source references

Dashboard primary references:

- `README.md`
- `docs/architecture.md`
- `docs/threat-model.md`
- `docs/ai-implementation-roadmap.md`
- `packages/policy-engine/src/evaluate.mjs`
- `packages/tx-builder/src/vault-release.mjs`
- `apps/api/src/application.mjs`
- `apps/console/index.html`
- `apps/console/app.js`

Nova secondary references:

- `README.md`
- `FOCUS.md`
- `ROADMAP.md`
- `policy/schema.ts`
- `policy/validate.ts`
- `policy/canonicalize.ts`
- `agent/guardrails.ts`
- `runtime/transition-plan.ts`
- `semantic/assets.ts`
- `semantic/projections.ts`

Optional references:

- `AIAgent/docs/architecture.md`
- `AIAgent/docs/telegram-two-agent-flow.md`
- `AIAgent/contracts/AgentSessionVault.cash`
- `AIAgent/src/domain/types.ts`
- `AIAgent/src/security/invariants.ts`
- `OPTNWallet/docs/cashscript-contract-systems.md`
- `OPTNWallet/docs/custody-vault-design-notes.md`
- `OPTNWallet/src/services/cauldron/tx.ts`
- `reference/cashscript/packages/utils/src/artifact.ts`
- `reference/cashscript/packages/utils/src/source-map.ts`
- `reference/cashscript/packages/cashscript/src/TransactionBuilder.ts`
- `reference/libauth/src/lib/message/transaction-types.ts`
- `reference/libauth/src/lib/vm/virtual-machine.ts`

## Reference repository map for the builder

These are the repositories used to prepare this brief. The Grok builder will
not receive these files, so do not depend on source access. The behavioral
context below is the important part.

- Dashboard primary: /home/lightswarm/projects/dashboard_OPTN
  - Existing scaffold is a dependency-light, in-memory, regtest/offline
    showcase with a policy engine, deterministic vault-release builder, mock
    signer, simulated chain lifecycle, and audit timeline.
  - Preserve the useful separation between policy evaluation, transaction
    building, signing, chain observation, and UI.
  - The target of this brief is to extend that baseline to a real Chipnet
    vertical slice, not to disguise the simulator as a live chain.
- Nova secondary: /home/lightswarm/projects/experiments/nova-sdk
  - Treat its policy schema, canonicalization, guardrails, lifecycle states,
    intent checks, and WalletConnect integration as architectural references.
  - It uses bch:bchtest for Chipnet and bch:bitcoincash for Mainnet, and
    distinguishes bch_signMessage login from bch_signTransaction spending.
  - Its native BCH routes and offline validation are useful references, but do
    not claim that a fungible CashToken payment route is already implemented.
- BCH transaction primitives: /home/lightswarm/projects/reference/libauth
  - Use the BCH transaction model, message-signature verification, token
    fields, and VM verification patterns as the source of truth.
- CashScript tooling: /home/lightswarm/projects/reference/cashscript
  - Use reviewed compiler artifacts, ABI, constructor inputs, bytecode,
    source maps, and transaction-builder/VM debugging concepts.
- Optional agent reference: /home/lightswarm/projects/AIAgent
  - Its AgentSessionVault demonstrates a fixed-provider payment plus exact
    successor state baton, bounded payment/session limits, fee limits, and
    recovery behavior.
  - Use it as a state-transition reference only; do not create autonomous
    custody or copy an unreviewed contract.
- Optional wallet reference: /home/lightswarm/projects/OPTNWallet
  - Its BCH WalletConnect configuration distinguishes Chipnet and Mainnet and
    supports BCH message signing plus BCH transaction signing with source
    outputs.
  - Its Libauth verification patterns reinforce that a returned signed
    transaction must be parsed and verified before broadcast.

## Handoff instruction

The authoritative deliverable is the complete working application described in
the master build directive below. Preserve the useful current fixtures and
security boundaries, but implement the requested Chipnet-capable vertical
slice rather than returning only a clickable prototype or an implementation
plan.

Do not claim signing, broadcast, confirmation, or production readiness without
the corresponding evidence. The master build directive below supersedes any
earlier regtest-only wording in this document.

---

# Master build directive for the Grok builder

## Mission

Build a complete, basic functional web application called the OPTN Dashboard.
The application is a control plane for covenant-based constraints on money
movement. It lets a business operator connect a BCH wallet, inspect discrete
UTXOs and covenant state, define a reviewed budget policy, visually compose
allocation routes, request approvals, sign a transaction with the operator's
wallet, and monitor the resulting Chipnet transaction through the full
transaction lifecycle.

This is an implementation request, not a request for a static mockup,
wireframe, product essay, or fake success demo. Make the core flow work on BCH
Chipnet when the required wallet and chain-provider configuration is present.
When live configuration is absent, retain a clearly labelled local/demo mode
that uses deterministic fixtures and the same domain interfaces. Never make a
fixture look like a live chain result.

The result should be a polished operator-facing dashboard that can later
expose the same constrained operations to AI agents. The operator must remain
the authority for wallet connection, approvals, and transaction signing.

You do not have access to the source repositories listed in the reference
section. Do not assume that you can inspect them. Everything in this section
is the context and boundary needed to implement the application.

## Non-negotiable product boundary

Build:

- a BCH UTXO-aware treasury and allocation control plane;
- a typed, constrained visual policy editor;
- an auditable proposal and approval workflow;
- WalletConnect authentication and wallet transaction signing;
- real Chipnet discovery, VM validation, signing, broadcast, and status
  monitoring behind explicit configuration;
- Mainnet support as an isolated, opt-in network mode;
- a deterministic demo mode for development and screenshots;
- an API and capability model that can later be used by AI agents.

Do not build:

- an Ethereum or EVM wallet;
- an account-balance ledger pretending that BCH is an account system;
- a generic arbitrary CashScript IDE;
- a browser-held private key or seed phrase;
- an autonomous agent that can spend without a human policy and approval;
- a one-click blind broadcast button;
- a fake Chipnet transaction or fake confirmation;
- a system that silently falls back from Mainnet to Chipnet or vice versa.

Use a normal modern web application stack suitable for the Grok builder. If
the existing scaffold is dependency-light, preserve its useful domain
separation and add only the dependencies needed for a working application.
Keep chain logic, wallet transport, policy evaluation, and UI components
separate. Do not put transaction correctness inside UI components or request
handlers.

## What basic functional means

The minimum live vertical slice is:

1. The operator opens the dashboard and sees the currently selected network.
2. The operator connects a BCH wallet through WalletConnect.
3. The dashboard requests a signed login challenge using bch_signMessage;
   login does not request transaction signing.
4. The server verifies the signed challenge, creates an authenticated session,
   and binds the session to the exact network and wallet account.
5. The dashboard discovers or imports a known Chipnet UTXO and displays its
   outpoint, BCH value, token state, locking type, and chain evidence.
6. The operator attaches an already deployed and reviewed vault contract, or
   selects a preconfigured reviewed vault instance. The app must not claim to
   have deployed or funded a vault if it did not.
7. The operator creates or edits a Control Plan using typed visual nodes and
   rules. The editor produces a canonical policy object, not arbitrary script.
8. The operator creates a bounded allocation proposal from a specific vault
   UTXO to a specific destination or reviewed route.
9. The policy engine evaluates the proposal against network, asset, amount,
   destination, expiry, UTXO freshness, fee, and covenant-successor rules.
10. The configured approval threshold is satisfied by distinct authenticated
    WalletConnect accounts. Approval signatures are over a canonical intent,
    not over mutable UI text.
11. The dashboard builds a deterministic BCH transaction and validates it
    with Libauth/CashVM or the equivalent BCH VM implementation before asking
    for a wallet signature.
12. The dashboard sends the transaction to the connected wallet through
    bch_signTransaction, receives the signed transaction, parses it, and
    verifies the exact signed transaction again.
13. Only after the operator explicitly confirms the final transaction preview
    does the app broadcast it through the configured Chipnet provider.
14. The dashboard records the txid, shows mempool status, polls or subscribes
    for confirmation, and verifies the expected successor output and state.
15. Every stage is visible in the evidence timeline. A failure leaves the
    proposal in an accurate failed or retryable state and never shows success.

If no real vault UTXO or provider is configured, implement steps 1, 3, 4, 7,
8, 9, 10, 11, and the local VM validation with fixtures, while clearly
labelling the remaining steps unavailable. Do not invent a live result.

## BCH and UTXO primer: follow this exactly

Grok may know Ethereum and account-based systems better than BCH. Treat the
following as hard implementation rules.

### BCH is UTXO-based

BCH does not have one mutable account balance for a wallet address. A wallet
owns a set of independent unspent transaction outputs, or UTXOs. Each UTXO is
identified by an outpoint:

    transaction id plus output index

A transaction consumes complete input UTXOs and creates complete output UTXOs.
An input cannot be partially spent. To send less than the value of an input,
the transaction must create a change output. A transaction fee is the
difference between total input value and total output value:

    fee = sum(input BCH values) - sum(output BCH values)

Do not use an account-model database update as a substitute for transaction
construction. An off-chain balance is a view derived from UTXOs and is never
the source of truth.

### Every input and output has separate state dimensions

For each input and output, track separately:

- BCH value in satoshis;
- locking bytecode, such as P2PKH or a covenant locking bytecode;
- token category, if present;
- fungible token amount, if present;
- NFT capability, if present: none, mutable, or minting;
- NFT commitment bytes, if present;
- source outpoint for inputs;
- sequence and other transaction fields where relevant.

Never combine BCH value and token amount into one balance. A transaction can
conserve BCH while leaking tokens, or conserve tokens while violating BCH
value/fee rules. The policy and transaction validators must check both.

### Transactions are state transitions

A covenant UTXO is a state object. Spending it must produce the required
successor output. Typical state-baton behavior is:

    input vault state -> payment output + successor vault state

The successor may preserve the same covenant locking bytecode and state NFT,
while changing a commitment such as cumulative spent amount or nonce. The
dashboard must display the exact input outpoint and exact successor output
index. Never describe a covenant as an account whose internal state can be
mutated without spending it.

### Fees and change are explicit

The transaction builder must:

- choose and lock the exact input UTXOs;
- calculate output values and the fee explicitly;
- create BCH change when needed;
- preserve token state and place token-bearing change on a valid output;
- reject dust or invalid output values;
- show all inputs, outputs, fee, and change in the review panel;
- enforce the policy fee cap;
- prevent accidental donation of the entire remaining value.

Do not rely on a wallet to repair a malformed transaction after the dashboard
has made policy decisions. If a wallet adds inputs or changes outputs, parse
the returned signed transaction and reject it unless it still matches the
approved intent and all invariants.

### Token byte order and serialization

CashToken category and commitment serialization have protocol-specific
details. Do not hand-roll category reversal, commitment padding, or token
serialization from memory. Use one tested BCH library consistently, preferably
Libauth/CashScript-compatible primitives, and add fixtures for every token
field. Treat byte order as an explicit boundary. Never compare a display
string to a raw serialized category without normalization.

### Covenant execution

A covenant is enforced by the BCH VM validating the spending transaction
against the covenant locking bytecode. An off-chain allowlist or dashboard
database rule is useful defense in depth, but it is not a substitute for an
on-chain covenant rule. The app must show which controls are:

- on-chain enforced;
- off-chain policy enforced;
- advisory accounting metadata;
- not yet implemented.

If the app cannot prove an invariant, it must block the action or mark the
route as simulation-only.

## Networks and isolation

Support exactly these network identities:

~~~ts
type Network = "chipnet" | "mainnet";

const NETWORK_CONFIG = {
  chipnet: {
    walletConnectChainId: "bch:bchtest",
    addressPrefix: "bchtest",
    enabledByDefault: true
  },
  mainnet: {
    walletConnectChainId: "bch:bitcoincash",
    addressPrefix: "bitcoincash",
    enabledByDefault: false
  }
};
~~~

Use the exact WalletConnect CAIP-2 chain identifier for the selected network.
Do not reuse a Chipnet session on Mainnet or a Mainnet session on Chipnet.
Network must be part of every authenticated session, cache key, UTXO record,
policy evaluation, approval intent, transaction proposal, and audit event.

Recommended configuration:

- APP_NETWORK=chipnet for normal development;
- ENABLE_MAINNET=false by default;
- WALLETCONNECT_PROJECT_ID supplied through a server/client-safe config
  mechanism, never committed as a secret;
- CHIPNET_INDEXER_URL or an equivalent BCH chain-provider configuration;
- CHIPNET_BROADCAST_URL or provider adapter;
- MAINNET_INDEXER_URL and broadcast configuration only when explicitly enabled;
- a server-side session secret supplied outside source control.

The UI should show a prominent network badge on every page. Mainnet should be
visible as a disabled or gated option when not enabled, with a reason. When
it is enabled, switching networks must:

1. stop or invalidate network-specific polling;
2. clear selected UTXOs and proposal state;
3. require an explicit operator confirmation;
4. require a new WalletConnect session or verified network switch;
5. require fresh authentication for the selected network;
6. require a new policy and approval intent;
7. never reuse a Chipnet signature or approval on Mainnet.

The Mainnet switch is an architectural option, not permission to enable
Mainnet by default or to make an unreviewed production claim.

## WalletConnect login and signing

Use WalletConnect for login and wallet interaction. Do not invent a seed phrase
login, private-key browser storage, or an EVM connector.

### WalletConnect capabilities

Request the smallest capability set needed for each operation:

- login and authentication: bch_signMessage;
- transaction signing, only after an approved proposal:
  bch_signTransaction;
- no transaction-signing permission in the initial login request;
- no EVM namespace;
- no silent request for methods not displayed to the operator.

Use the official WalletConnect session flow: propose or connect a session,
obtain approved namespaces, accounts, and methods, then issue a request through
that session. Configure the WalletConnect project origin allowlist for the
deployed dashboard. Handle session expiry, rejection, disconnection,
unsupported method, wrong chain, and wrong account as explicit states.

Useful official references:

- https://docs.walletconnect.network/wallet-sdk/android/usage
- https://docs.walletconnect.network/wallet-sdk/web/best-practices
- https://docs.walletconnect.network/wallet-sdk/web/verify

The Verify API or equivalent origin verification may be shown in the
connection UI, but it does not replace signature verification.

### Login challenge

The login challenge must bind all security-relevant context. Use a stable,
canonical plain-text or structured message with fields equivalent to:

~~~text
OPTN-CONTROL-LOGIN-V1
domain: <exact dashboard origin>
network: chipnet
account: bchtest:<wallet address>
nonce: <cryptographically random single-use nonce>
issuedAt: <UTC timestamp>
expiresAt: <short UTC expiry>
purpose: authenticate operator access to the OPTN Dashboard
~~~

Rules:

- generate the nonce on the server;
- store it server-side with a short expiry and mark it consumed exactly once;
- bind the challenge to the exact origin, network, and wallet account;
- request bch_signMessage through WalletConnect;
- verify the returned signature against the claimed BCH address using a BCH
  message-signature verifier;
- reject expired, reused, malformed, wrong-network, wrong-account, or
  unverifiable signatures;
- create a secure HttpOnly session cookie after verification;
- do not put a private key, seed, or long-lived signing secret in the browser;
- do not use a wallet address alone as proof of control.

Role mapping is application policy, not a property magically granted by the
blockchain. Start with explicit configuration for owner, operator, approver,
and viewer accounts. Never treat the first wallet to connect as a permanent
owner without an explicit setup flow.

### Approval signatures

An approval must be a signed authorization of a canonical proposal intent.
Never sign a mutable screen label, a shortened amount, or a JSON object whose
key ordering can change.

The canonical approval intent must include at least:

- protocol/version;
- exact network and chain identifier;
- Control Plan id and version;
- proposal id;
- source vault instance id;
- exact input outpoint(s);
- exact input BCH values and token states;
- exact output templates, including output indexes;
- destination locking bytecode or reviewed route id;
- payment amount and token amount;
- fee cap and expected fee;
- successor covenant locking bytecode and state commitment;
- approval threshold and current approval set;
- nonce, creation time, and expiry.

Serialize this intent deterministically and hash it using the selected BCH
library. Display the human-readable decoded intent before requesting the
signature. A signed approval is valid only for that exact intent and network.
Use distinct authenticated accounts for distinct approval slots.

### Transaction signing

Transaction signing is separate from login and approval:

1. build an unsigned transaction from the approved intent;
2. include every source output needed to verify covenant and P2PKH inputs;
3. validate the unsigned transaction locally;
4. show a final human-readable preview;
5. ask the operator to confirm;
6. request bch_signTransaction through WalletConnect;
7. parse the returned transaction;
8. verify that transaction matches the approved intent exactly;
9. run BCH VM verification again;
10. only then offer explicit broadcast.

Wallet response formats vary. Keep the WalletConnect adapter responsible for
normalizing the response to one internal signed-transaction type. Reject
unexpected inputs, outputs, source outputs, scripts, token fields, fee, or
network. Do not silently rebuild a transaction after a wallet changes it.

## Contract and vault rules

### Existing TreasuryVault warning

The original dashboard fixture has a contract shaped like this:

~~~cashscript
pragma cashscript ^0.13.0;
contract TreasuryVault(bytes20 treasuryPkh, bytes20 recipientPkh) {
  function release(pubkey operatorPk, sig operatorSig) {
    require(this.activeInputIndex == 0);
    require(tx.inputs.length == 1);
    require(tx.outputs.length == 2);
    require(checkSig(operatorSig, operatorPk));
    require(hash160(operatorPk) == treasuryPkh);
    require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode);
    require(tx.outputs[0].tokenCategory == tx.inputs[0].tokenCategory);
    require(tx.outputs[1].tokenCategory == tx.inputs[0].tokenCategory);
    require(tx.outputs[0].tokenAmount + tx.outputs[1].tokenAmount ==
      tx.inputs[0].tokenAmount);
    require(tx.outputs[0].value + tx.outputs[1].value <= tx.inputs[0].value);
  }
}
~~~

This fixture has a critical flaw: recipientPkh is declared but not used to
enforce the recipient output locking bytecode. Its allowlist is therefore
off-chain only. Do not deploy or use this exact fixture for live Chipnet
spending. Either:

- replace it with a reviewed contract that enforces the intended destination
  or route on-chain; or
- label the route simulation-only and block live broadcast.

Add a regression test proving that an unauthorized destination fails the VM.
The dashboard must not describe an off-chain allowlist as covenant-enforced.

### Required vault state shape

For the first live route, prefer a narrow, reviewed, native-BCH vault with an
explicit successor. A valid release should generally prove:

- the active input index is the intended vault input;
- the input count is exactly the reviewed count;
- the output count is exactly the reviewed count;
- the operator signature is valid and belongs to an authorized key;
- the payment output has the exact reviewed destination lock;
- the payment amount is positive and within policy;
- the successor output retains the exact covenant lock;
- BCH value and fee are within the approved bounds;
- token state is preserved or transformed exactly as specified;
- output ordering is deterministic.

If using a tokenized state baton, model it separately from BCH value. Preserve
the required token category, amount, NFT capability, and commitment. The
successor commitment must be parsed and displayed, not shown as an opaque
state updated label.

### AIAgent vault reference

An optional reference pattern is an AgentSessionVault with:

- an agent key and recovery key;
- fixed provider and recovery locking bytecode;
- a state NFT category;
- a per-payment limit;
- a session limit;
- a maximum fee;
- a mutable NFT commitment encoding cumulative spent amount and nonce.

Its payment transition is conceptually:

    one vault input -> fixed provider payment + exact vault successor

The successor keeps the mutable state NFT and increments the commitment
nonce/spent amount, while the payment output uses fixed provider locking
bytecode. Recovery spends to fixed recovery locking bytecode. This is a useful
state-baton reference, not permission to copy an unreviewed contract or to
turn the dashboard into an autonomous agent wallet.

## Product concepts and domain model

Use these concepts consistently in the UI, API, database, and audit log.

### Control Plan

A Control Plan is a versioned, human-readable policy for one treasury or vault.
It contains:

- id, name, description, owner;
- exact network;
- asset type: native BCH initially, approved CashToken later;
- source vault instance;
- reviewed contract version and artifact hash;
- allowed destinations or reviewed route definitions;
- limits and time windows;
- approval requirements;
- fee cap;
- successor requirements;
- status: draft, review, active, paused, retired;
- created/updated timestamps and actor;
- immutable published version.

### Budget map versus covenant graph

Show two coordinated visualizations:

1. Budget map: business-level allocations such as payroll, vendors, tax,
   operations, and reserves. It answers “where is money intended to go?”
2. Covenant graph: chain-level UTXO state transitions and required outputs. It
   answers “what transaction shape can actually spend this state?”

Do not imply that a budget allocation is on-chain merely because it appears in
the budget map. Each allocation must show one of:

- accounting-only;
- policy-enforced off-chain;
- covenant-enforced on-chain;
- not yet connected to a live route.

### UTXO and vault instance

Represent each live state object with:

~~~ts
type Outpoint = {
  txid: string;
  vout: number;
};

type TokenState = {
  categoryHex: string | null;
  amount: string;
  nftCapability: "none" | "mutable" | "minting";
  commitmentHex: string | null;
};

type UtxoState = {
  network: "chipnet" | "mainnet";
  outpoint: Outpoint;
  valueSatoshis: string;
  lockingBytecodeHex: string;
  address: string | null;
  token: TokenState;
  spent: boolean;
  confirmations: number;
  chainEvidence: "provider-observed" | "fixture" | "unknown";
};

type VaultInstance = {
  id: string;
  network: "chipnet" | "mainnet";
  contractName: string;
  contractVersion: string;
  artifactHash: string;
  covenantLockingBytecodeHex: string;
  stateOutpoint: Outpoint;
  state: UtxoState;
  reviewed: boolean;
  liveSpendEnabled: boolean;
  evidence: string[];
};
~~~

An outpoint is never an adequate cache key without network. Treat the chain
as authoritative and re-check that the outpoint is still unspent immediately
before building and again before broadcast when the provider supports it.

### Proposal

Every proposal must be immutable after approval or explicitly superseded.
Include:

- proposal id and Control Plan version;
- network and wallet account;
- source outpoint(s);
- destination route and locking bytecode;
- BCH/token amount;
- expected successor;
- fee and fee cap;
- canonical intent hash;
- policy evaluation result;
- approval threshold and approvals;
- signed transaction hash/hex if available;
- broadcast txid if available;
- lifecycle stage and failure reason;
- created, expiry, and updated timestamps.

## Policy language and visual editor

The visual editor is a typed policy builder, not arbitrary code generation.
Every node must map to a known schema and evaluator.

Minimum node categories:

- source: selected vault UTXO or reviewed vault instance;
- asset: native BCH;
- destination: fixed address lock or reviewed destination route;
- amount: fixed amount, percentage of available BCH, or bounded range;
- token constraint: disabled in the first live route unless fully validated;
- time: validity window and expiry;
- daily/period limit;
- per-transaction limit;
- fee cap;
- approval threshold;
- successor requirement;
- pause/kill switch;
- accounting label.

Node connections should produce a deterministic canonical policy. Reject
cycles, dangling nodes, unsupported combinations, ambiguous output ordering,
and any policy with no reviewed route. The editor should show inline proof
obligations such as:

- destination lock is covenant-enforced;
- this is only an off-chain allowlist;
- successor output required at index 1;
- token rule is unavailable for native-only route;
- fee cannot be proven below cap until inputs are selected.

Recommended editor layout:

- left palette of typed nodes;
- central canvas with drag-and-drop edges;
- right inspector for exact values and constraints;
- bottom validation drawer listing errors, warnings, and proof status;
- version/publish controls;
- a preview mode that explains the transaction shape the policy permits.

Do not let the operator type CashScript into the editor. Contract artifacts are
reviewed inputs selected from a registry. If advanced contract authoring is
eventually needed, it is a separate audited product.

## Operator screens

Implement a coherent navigation model:

### 1. Overview

Show:

- network and WalletConnect status;
- authenticated wallet account;
- total discovered BCH UTXOs, clearly labelled as a derived view;
- active vaults and their state outpoints;
- pending approvals;
- proposals by lifecycle stage;
- recent chain evidence;
- obvious demo/live mode label.

### 2. Wallet connection

Show:

- connect/disconnect;
- current network;
- BCH address/account;
- session expiry and reconnect action;
- verified origin status when available;
- requested capability explanation;
- last authentication time.

### 3. Vaults and UTXOs

Show a table/card view and a detail view:

- txid, vout, BCH value;
- token category/amount/NFT fields;
- locking type and script summary;
- confirmations and provider source;
- spent/stale state;
- contract version/artifact hash;
- attach existing vault flow;
- refresh and stale-state warnings.

### 4. Control Plans

Show draft, review, active, paused, and retired plans. Make version changes
explicit and preserve published versions.

### 5. Policy Studio

Use the typed visual editor above. Include a why blocked panel and policy
simulation against a selected UTXO.

### 6. Allocation proposals

Show a proposal builder with:

- source vault;
- destination route;
- amount;
- fee estimate/cap;
- required successor;
- policy result;
- approval status;
- expiry;
- exact transaction preview.

### 7. Approval queue

Show who approved, which wallet account was used, the intent hash, remaining
approvals, expiry, and whether an approval is invalidated by a proposal change.

### 8. Transaction review and evidence

Show side-by-side:

- source inputs;
- destination outputs;
- successor output;
- change;
- BCH totals;
- token totals;
- fee;
- covenant/VM result;
- signature result;
- broadcast result;
- mempool/confirmation status;
- successor verification.

### 9. Audit

Filter by network, actor, plan, vault, proposal, outpoint, txid, and lifecycle
stage. Every event needs an actor, timestamp, network, object id, and
correlation id. Never store secrets or raw private material.

## Backend boundaries and provider interfaces

Use explicit interfaces so demo mode and live Chipnet use the same domain
logic.

Recommended modules:

- network: immutable network configuration and isolation;
- auth: WalletConnect challenge, BCH signature verification, sessions, roles;
- walletconnect: session proposal and request adapter;
- chain: UTXO discovery, raw transaction lookup, broadcast, status;
- contracts: reviewed artifact registry, bytecode, source hash, VM adapter;
- policy: canonical policy model and fail-closed evaluator;
- vault: state parsing, successor requirements, stale-state checks;
- transactions: deterministic input selection, output construction, fee/change;
- approvals: canonical intent hashing and signature verification;
- lifecycle: idempotent state machine and retries;
- audit: append-only application evidence;
- ui: operator screens and visual editor.

Suggested provider contracts:

~~~ts
interface ChainProvider {
  getUtxos(network: Network, ownerOrLock: string): Promise<UtxoState[]>;
  getRawTransaction(network: Network, txid: string): Promise<string>;
  getOutpoint(network: Network, outpoint: Outpoint): Promise<UtxoState | null>;
  broadcast(network: Network, rawTxHex: string): Promise<{ txid: string }>;
  getStatus(network: Network, txid: string): Promise<{
    txid: string;
    mempool: boolean;
    confirmations: number;
    confirmed: boolean;
  }>;
}

interface WalletTransport {
  connect(network: Network): Promise<WalletSession>;
  signMessage(session: WalletSession, message: string): Promise<string>;
  signTransaction(
    session: WalletSession,
    request: BchTransactionSigningRequest
  ): Promise<string>;
  disconnect(session: WalletSession): Promise<void>;
}

interface VmVerifier {
  verifyTransaction(
    network: Network,
    rawTxHex: string,
    sourceOutputs: SourceOutput[]
  ): Promise<VmVerification>;
}
~~~

Do not put provider-specific response shapes in policy code. Normalize them at
the adapter boundary. Support a configurable Chipnet indexer/provider and
broadcast endpoint rather than embedding an undocumented endpoint.

The server should persist or otherwise durably retain proposal and lifecycle
state so a browser refresh cannot lose an approval or cause a duplicate
broadcast. If a full database is excessive for the first iteration, use a
small server-side store with clear replacement boundaries; never use browser
local storage as the authority for approvals or broadcast state.

## API contract

Implement or document endpoints with explicit network and authorization
checks:

- GET /api/config: public non-secret feature/network configuration;
- POST /api/auth/challenge: issue a single-use login challenge;
- POST /api/auth/verify: verify WalletConnect BCH message signature;
- POST /api/auth/logout: invalidate session;
- GET /api/session: current authenticated session and role;
- GET /api/utxos: discover UTXOs for the authenticated account or selected
  reviewed lock;
- POST /api/vaults/attach: attach an existing reviewed vault outpoint;
- GET /api/vaults: list vault instances;
- GET /api/control-plans: list plans;
- POST /api/control-plans: create draft plan;
- POST /api/control-plans/:id/validate: evaluate canonical policy;
- POST /api/control-plans/:id/publish: publish a version after authorization;
- POST /api/proposals: create a proposal from selected live state;
- POST /api/proposals/:id/approve: verify and record approval signature;
- POST /api/proposals/:id/build: build and VM-validate unsigned tx;
- POST /api/proposals/:id/verify-signed: verify returned wallet-signed tx;
- POST /api/proposals/:id/broadcast: explicit idempotent broadcast;
- GET /api/proposals/:id: proposal, evidence, and lifecycle state;
- GET /api/audit: filtered audit events.

Every mutating endpoint must verify the authenticated session, role, network,
object ownership/authorization, object version, and current state. Use
idempotency keys for proposal creation, approval recording, signing requests,
and broadcast. A repeated request must return the existing result or an
explicit conflict, not create a second side effect.

## Transaction lifecycle and evidence

Use these stages as distinct states:

    intent
      -> policy-valid
      -> approved
      -> unsigned-built
      -> locally-vm-validated
      -> signing-requested
      -> signed
      -> signed-vm-validated
      -> broadcast-requested
      -> provider-accepted
      -> mempool-observed
      -> confirmed
      -> successor-verified
      -> finalized

Errors and retryable states are first-class:

- rejected by policy;
- approval expired;
- stale input;
- wallet rejected;
- wallet returned mismatched transaction;
- VM invalid;
- provider rejected;
- broadcast uncertain;
- mempool dropped;
- reorg or confirmation lost;
- successor missing or malformed.

Use evidence labels exactly or equivalently:

- DESIGNED;
- FIXTURE;
- SIMULATED;
- LOCALLY_VM_VALIDATED;
- SIGNED_BUT_UNBROADCAST;
- PROVIDER_ACCEPTED;
- MEMPOOL_OBSERVED;
- CONFIRMED;
- SUCCESSOR_VERIFIED;
- FAILED;
- UNKNOWN.

Do not collapse provider accepted into confirmed. Do not collapse signed into
broadcast. Do not claim finalized merely because a txid exists. The UI should
explain what evidence exists and when it was last observed.

## Demo mode and live mode

The application must make its mode obvious:

- DEMO: deterministic fixtures, no live wallet or broadcast;
- CHIPNET_LIVE: WalletConnect and configured provider enabled;
- MAINNET_LIVE: unavailable unless explicit server and operator gates pass.

Demo fixtures may include an Acme Treasury, Alice, Bob, and Carol, but they
must use visibly synthetic labels. Demo mode should exercise the same policy
and transaction preview code where possible. Do not call a simulated chain
Chipnet.

For live Chipnet, support an attach-existing-vault flow because deployment and
funding may not be available to the dashboard during development. The flow
must require txid, vout, contract version, expected locking bytecode or
artifact, and provider proof that the outpoint exists and is unspent. If the
artifact or state cannot be matched exactly, block the attachment.

## AI-agent readiness without autonomous custody

Design the API so an AI agent can later:

- read plan and vault state;
- propose an allocation;
- explain why a proposal is allowed or blocked;
- request approval from human operators;
- prepare an unsigned transaction;
- return a structured verification report.

An agent must not:

- hold private keys;
- receive broad transaction-signing permission;
- choose arbitrary CashScript;
- bypass policy or approval;
- select hidden inputs;
- change outputs after approval;
- broadcast without the same explicit authorization as a human;
- treat a stale UTXO as spendable.

Use capability-scoped operations such as:

~~~text
plan.read
vault.read
proposal.create
proposal.explain
proposal.request_approval
transaction.build
transaction.verify
transaction.broadcast
~~~

Make transaction.broadcast a separate, highly restricted capability. Return
structured reasons for every denial so an agent can explain the constraint to
an operator.

## Security and privacy requirements

- Never request, accept, display, log, or store seed phrases or private keys.
- Never read wallet files, keystores, or browser extension internals.
- Keep WalletConnect project configuration and session secrets out of source.
- Redact signatures only if full signatures are not needed for audit; never
  expose sensitive session tokens.
- Use secure, HttpOnly, SameSite cookies for server sessions.
- Add CSRF protection or same-origin protections to mutating browser endpoints.
- Validate all server inputs with schemas.
- Escape or sanitize script/source display; never execute user-supplied script.
- Rate-limit challenge issuance, signature verification, and broadcast.
- Expire challenges, approvals, and proposals.
- Re-check UTXO freshness before build, sign, and broadcast.
- Make all side-effecting calls idempotent.
- Detect duplicate broadcast attempts and uncertain provider responses.
- Log object ids and correlation ids, not secrets.
- Fail closed on missing contract artifacts, source outputs, VM results, or
  network configuration.
- Treat off-chain policy as advisory unless its on-chain proof is explicit.

## Testing requirements

Write tests before calling the live route complete.

### BCH and serialization tests

- outpoint parsing and network-aware cache keys;
- BCH value conservation and fee calculation;
- explicit change output;
- dust rejection;
- token category/amount/capability/commitment preservation;
- malformed source output rejection;
- deterministic transaction serialization;
- exact output ordering;
- token and BCH balances checked independently.

### Covenant and VM tests

- authorized operator succeeds;
- wrong operator fails;
- unauthorized destination fails in the VM;
- missing successor fails;
- changed successor locking bytecode fails;
- changed state NFT/category/commitment fails;
- excess payment fails;
- excess fee fails;
- unexpected input or output count fails;
- stale or already-spent outpoint fails;
- the original unused recipientPkh bug has a regression test.

### WalletConnect/auth tests

- correct Chipnet message signature succeeds;
- Mainnet signature cannot authenticate a Chipnet session;
- wrong account fails;
- wrong origin/domain fails;
- expired challenge fails;
- nonce reuse fails;
- malformed signature fails;
- login requests only bch_signMessage;
- transaction request happens only after approval;
- wallet rejection leaves a retryable state;
- disconnect and session expiry are visible.

### Policy and approval tests

- amount, destination, window, and fee rules;
- canonical intent is deterministic;
- changing any approved field invalidates approval;
- two approvals require distinct authorized accounts;
- expired approval fails;
- duplicate approval is idempotent;
- plan version changes invalidate old proposals;
- simulation-only route cannot broadcast.

### Lifecycle and provider tests

- broadcast retries are idempotent;
- uncertain broadcast is not marked confirmed;
- mempool drop is represented;
- confirmation updates correctly;
- successor verification requires exact outpoint, lock, and token state;
- provider errors do not produce fake success.

### UI/e2e tests

- network badge and mode badge always visible;
- connect/login flow;
- UTXO/vault attach flow;
- drag/drop policy editor;
- blocked-policy explanation;
- approval queue;
- exact transaction review;
- WalletConnect rejection;
- live and demo labels remain distinct;
- refresh does not lose server-side proposal state.

## Acceptance criteria

The implementation is ready for this iteration only when:

1. A new operator can understand the current network and mode immediately.
2. WalletConnect login works with BCH Chipnet and verifies a signed challenge.
3. Login does not require transaction-signing permission.
4. UTXOs are displayed as outpoints with BCH/token fields separated.
5. A reviewed existing vault can be attached without pretending it was created.
6. A typed visual policy can be created, validated, versioned, and published.
7. A proposal references exact inputs and exact outputs.
8. A policy block explains every rejection.
9. Two-person approval is enforced by distinct authenticated wallets where
   configured.
10. An approved proposal builds a deterministic unsigned transaction.
11. The unsigned and wallet-signed transactions are VM-validated with source
    outputs before broadcast.
12. Wallet changes to the transaction are rejected.
13. Broadcast is explicit, idempotent, and only available after validation.
14. Chipnet status and successor state are observed separately.
15. Demo, Chipnet, and Mainnet states cannot be confused.
16. The original TreasuryVault recipient-enforcement flaw is not used for a
    live route.
17. No private key, seed, or wallet secret is handled by the dashboard.
18. The test suite covers the critical BCH, covenant, auth, approval, and
    lifecycle failure paths.

## Required final deliverables from the builder

Produce:

- the working dashboard application;
- a concise README with setup, environment variables, demo mode, Chipnet
  configuration, and Mainnet gates;
- a reviewed contract/artifact registry format;
- a network/provider adapter with clear configuration;
- WalletConnect connection, login, approval, and transaction-signing flows;
- a typed policy model and visual editor;
- a deterministic transaction preview and evidence timeline;
- tests listed above, with live-only tests clearly separated;
- a short security document or security section documenting prohibited
  secrets, network isolation, idempotency, and the live-transaction review gate;
- an explicit list of any live features that remain unavailable because a
  provider, wallet, contract artifact, or funded vault was not configured.

Report implementation status using evidence, not optimism. Distinguish:

- implemented and tested locally;
- implemented but requires external configuration;
- Chipnet signed but unbroadcast;
- Chipnet provider-accepted;
- Chipnet mempool-observed;
- Chipnet confirmed and successor-verified;
- not implemented.

The operator should be able to see exactly what the dashboard knows, what it
proved, what the wallet signed, and what the chain actually accepted.
