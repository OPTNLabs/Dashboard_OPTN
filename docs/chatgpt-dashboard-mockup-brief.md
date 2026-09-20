# OPTN Control Plane — ChatGPT design brief

## Request

Act as a product designer and systems architect. Help us brainstorm **visual mockups, information architecture, and user behavior only** for the next version of the OPTN Control Plane.

Do **not** provide code, schemas, API designs, database migrations, smart-contract source, or implementation steps. Everything in the proposed experience is a **high-fidelity mock**: buttons may update believable local state and show deterministic simulated results, but nothing signs, broadcasts, mints, funds, or connects to a real wallet in this exercise.

We want the control plane to feel as capable and coherent as OPTN Wallet from a user's perspective, while remaining a business/organization dashboard rather than trying to replace a self-custody wallet. The two most important feature areas to design deeply are:

1. **CashToken issuance and authority management** — creating a token category, issuing an initial supply, understanding fungible tokens and NFT capabilities, and managing the corresponding UTXOs.
2. **CashScript-backed controls** — selecting a reviewed contract family, configuring its exposed parameters visually, understanding the exact BCH transaction transition it permits, and simulating a proposal through validation.

Our long-term goal is a visual operator environment for organizations, and later AI agents, to allocate funds under enforceable BCH covenant constraints. The visualizer must retain the current flow-chart graph, but make it genuinely useful: a non-technical operator should be able to understand what they are constructing, what it constrains, which parts are editable, and how an individual BCH transaction will move UTXO state.

---

## Product position

**OPTN Control Plane** is an operator-facing companion to OPTN Wallet.

- OPTN Wallet remains the self-custodial wallet and signing authority.
- The Control Plane is the place where an organization models budgets, assets, token authorities, contracts, proposals, approvals, audit evidence, and the lifecycle of protected UTXOs.
- The Control Plane must never imply that it holds private keys or can spend by itself.
- A WalletConnect-connected wallet supplies the user identity, addresses/locks, and eventually a separate transaction-signing authority. The dashboard should never ask for a seed phrase, private key, manually configured address, PKH, or locking bytecode.

The primary object is a **Control Plan**: a reviewed, versioned description of permitted UTXO state transitions. It is not a generic account balance, a raw transaction form, an EVM smart-contract editor, or an arbitrary CashScript IDE.

---

## The BCH mental model that every mockup must preserve

This is Bitcoin Cash, not Ethereum.

### UTXOs, not accounts

Funds are discrete unspent transaction outputs (UTXOs). A spend consumes specific input UTXOs and creates a new ordered set of output UTXOs. The user should always be able to answer:

- Which exact UTXO is being consumed?
- What BCH value and token state does it carry?
- What outputs are created, in what order?
- Which output is an external payment, which is a change output, and which is the required successor covenant state?
- What is the fee, and where did the value go?

Do not model this as a mutable account balance that a contract can freely debit. A “vault balance” is a useful aggregate view, but its detail must resolve into real UTXO state.

### Covenants are transaction-shape constraints

A BCH covenant validates the transaction that spends its UTXO. It typically enforces facts such as:

- the number and order of inputs and outputs;
- an output's locking bytecode or recipient;
- BCH payment and fee bounds;
- a token category, amount, NFT capability, or commitment;
- a same-lock or state-mutated successor output; and
- signature or timelock conditions.

Contracts do not remotely call each other. Multiple contracts are composed by appearing in the same transaction, with explicit inputs and outputs. Different constructor values create different deterministic contract instances and locking bytecode; changing a constructor parameter means a new contract artifact and usually a newly funded vault.

### BCH and CashToken state are separate

Each UTXO may have BCH value and optional token data. The mockups must display and validate these separately:

- BCH value in satoshis/BCH;
- CashToken category;
- fungible token amount;
- NFT capability: none, mutable, or minting;
- NFT commitment/state bytes; and
- locking bytecode / address type.

Never use a ticker or token name alone as token identity. The category is the identity; metadata is secondary.

### Evidence labels matter

Do not collapse these states into a generic success message:

`draft → reviewed → simulated → locally validated → signing requested → signed → broadcast → mempool → confirmed → finalized`

For this mock-only design exercise, use explicit labels such as **Mock data**, **Simulated**, **Local deterministic validation**, and **Not connected to a wallet or network**. Do not use fake transaction IDs, fake confirmations, or fake “live” success states without clearly labeling them as a scenario simulation.

---

## Current dashboard baseline and boundaries

The current Dashboard_OPTN app is a Chipnet-first control-plane MVP with a dark operator-console visual language and a React Flow-style graph.

### Current real/implemented direction

- WalletConnect login uses `bch_signMessage`; transaction signing is a separate `bch_signTransaction` session after approval.
- Chipnet has a real provider-read path when configured. Wallet identity, addresses, approval membership, recipient identities, and locks must be discovered from a connected wallet, not hard-coded in environment variables.
- The reviewed live covenant is currently narrow: **BoundedRelease P2SH32** for native BCH.
- Its enforced shape is one covenant input and two outputs:
  - output 0: payment to an enrolled fixed recipient lock;
  - output 1: successor using the same covenant lock;
  - bounded payment and fee;
  - operator signature.
- A local Mocknet studio already simulates the same kind of deterministic compilation, transaction construction, policy evaluation, and graph execution. It has no key access, funding, signing, or broadcast action.
- FlowGuard-inspired treasury, recurring-payment, vesting, and tranche diagrams are currently **reference-only visual templates**. They are not compiled artifacts or executable CashToken routes.

### Important current limitations to represent honestly

- The current reviewed live route is **native BCH only**; fungible CashToken payments and token-aware covenant routes are future work.
- Dashboard quorum, session budgets, daily limits, recovery, and separation-of-duty controls may be valuable workflow policy, but they are not automatically on-chain enforcement unless a reviewed covenant explicitly enforces them.
- Mainnet must remain visually present as a future environment but unavailable by default.
- A mock design may show the intended future experience, but every screen must distinguish **available now**, **simulated in this concept**, and **requires a reviewed contract before enablement**.

---

## OPTN Wallet functional reference

Aim for functional familiarity with OPTN Wallet while adapting it to an organization/control-plane context.

### Core wallet concepts to carry over

| OPTN Wallet concept                       | Control Plane interpretation                                                                    |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Wallet home, balances, transactions       | Organization treasury overview, protected/unprotected UTXO inventory, activity and audit        |
| BCH send and transaction review           | Proposal builder with exact input/output review and policy/covenant checks                      |
| UTXO selection / coin control             | Budget-source selection, reservations, labels, freeze state, and successor lineage              |
| CashToken portfolio                       | Asset registry, category inventory, authorities, token UTXOs, issuance history                  |
| NFT views                                 | NFT state-baton and authority inspector, commitment/state history                               |
| Custom transaction builder                | Constrained transition builder that exposes only valid reviewed routes                          |
| Contract view                             | Visual contract/workflow studio plus plain-language and technical inspection                    |
| Multisig and PSBT/UR workflows            | Organization approvals and later external signing/cosigning workspaces                          |
| WalletConnect, CashConnect, WizardConnect | Explicit external-wallet/app connection and permission boundary                                 |
| Network and custom-server settings        | Environment, provider evidence, endpoint health, and a strict Chipnet/Mainnet separation        |
| CashFusion/privacy tools                  | Later privacy posture and UTXO provenance/coin-selection guidance; never obscure covenant state |
| RPA/CashCode and payment formats          | Recipient/contact layer and reusable payout endpoints, with network-aware validation            |

### CashToken/NFT capability concepts to carry over

The design must make these visibly distinct:

- **Fungible token balance:** a category and amount held by one or more token UTXOs.
- **Plain NFT:** an end-user collectible/credential/state object without authority capability.
- **Mutable NFT authority:** a state carrier that can be recreated with a changed commitment under its valid transition rules.
- **Minting NFT authority:** an authority-bearing NFT for the category; users must understand that losing, transferring, or locking it changes future issuance capabilities.
- **Genesis slot / issuance prerequisite:** token category creation is UTXO-based, not “deploy a token contract.” The issuance experience must show the eligible genesis UTXO requirement and the resulting category identity before confirmation.

The user experience should teach rather than hide these distinctions. It should never call an authority NFT “just another token balance.”

### CashScript concepts to carry over

CashScript source/artifacts are reviewed contract material. The visual studio may expose:

- a reviewed template gallery;
- constructor parameters the template deliberately allows an operator to configure;
- a visual state-transition graph;
- generated artifact identity, locking bytecode, source/assembly view, compiler profile, and local validation evidence;
- a read-only explanation of exact constraints; and
- a transaction preview that maps directly to the graph.

It must not position a non-technical user as authoring arbitrary opcodes. The right experience is closer to a **visual CashScript playground for reviewed templates**: use carefully constrained controls to produce a transparent contract configuration, then inspect the underlying effect.

---

## Primary personas and jobs

### 1. Organization owner / treasury operator

Needs to connect a wallet, establish an organization, add their own roles, create a token or budget vault, configure a policy, initiate a proposal, and understand why a transaction will or will not be allowed.

### 2. Finance approver

Needs a concise, exact review surface: amount, recipient, selected UTXOs, token/NFT effect, fee, policy version, approvals, and what the covenant independently enforces.

### 3. Token issuer / ecosystem operator

Needs to plan and monitor category issuance, authority custody, distribution allocation, metadata, token UTXOs, and future mint/authority actions without mistaking metadata for protocol truth.

### 4. Contract reviewer / technical operator

Needs to compare the plain-language visual flow against its CashScript artifact, constructor values, output ordering, locking bytecode, source/assembly, test/VM evidence, and known unsupported paths.

### 5. Future AI-agent operator

Needs a capability-oriented view, not a wallet control panel: the agent can submit an intent within a pre-created covenant vault and approved destination/amount limits, but cannot create arbitrary transactions, redefine its own recipient, or access unrelated wallet UTXOs.

---

## Information architecture to explore

Please propose a cohesive navigation system around these surfaces. Avoid a long, disconnected left-nav list; group tasks by the user’s mental model.

1. **Command Center**
   - organization posture;
   - protected BCH and token inventory, shown separately;
   - vaults/budgets needing attention;
   - pending approvals and blocked transitions;
   - provider/evidence status;
   - recent transition lineage.

2. **Assets**
   - BCH UTXO inventory and coin-control-inspired filters;
   - CashToken categories, balances, metadata, token UTXOs, and authority badges;
   - issuance and authority lifecycle;
   - mock asset detail pages that emphasize category identity and UTXO provenance.

3. **Issuance Lab** — one of the two flagship experiences
   - create a mock CashToken category;
   - model initial allocation and optional NFT capabilities;
   - display issuance inputs/outputs as an ordered BCH transaction;
   - show category identity, authority destination, allocation recipients, BCH dust/value, and metadata attachment separately;
   - simulate a policy review before “issuing” to the local mock ledger;
   - provide a post-issuance portfolio and authority-state view.

4. **Contract Studio** — the other flagship experience
   - gallery of reviewed/template families;
   - visual graph + inspector + transaction preview;
   - editable controls only on approved parameters;
   - generated artifact and validation evidence;
   - scenario runner that visibly traces a mock transition through the graph;
   - no arbitrary-code editor as the main surface.

5. **Vaults and Budget Pools**
   - protected vault UTXOs, state/version, remaining funds, asset state, routes, and successor lineage;
   - separate treatment for native-BCH budget vaults, token treasury vaults, and NFT state-baton vaults;
   - fund, pause, recovery, and rollover concepts marked as mock or future capability according to their actual enforcement status.

6. **Proposals and Approval Room**
   - exact intent review;
   - approval quorum and role separation;
   - deterministic mock build, validation, signing, and broadcast lifecycle;
   - a final evidence bundle/audit view.

7. **Organization and Connections**
   - WalletConnect identities and roles;
   - organization setup, invitations, single-wallet pilot, signers, and recipient contacts;
   - providers/environment health;
   - explicit permission and evidence boundaries.

8. **Audit and Evidence**
   - chronological timeline;
   - artifact/policy/intent hashes;
   - vault lineage graph;
   - filters by asset, vault, category, operator, and lifecycle state.

---

## Flagship visual mockup A: Issuance Lab

Design this as a guided, visual sequence rather than a generic token form. It should make token issuance understandable to someone who knows budgets and products but not BCH internals.

### Desired structure

```text
Issuance context / stepper
    ↓
Asset identity and purpose
    ↓
Genesis-input selection
    ↓
Supply and authority design
    ↓
Allocation map and recipients
    ↓
Transaction-output preview
    ↓
Mock validation and issuance receipt
```

### Required mock interactions

- Choose **Fungible token**, **Plain NFT collection**, **Mutable state NFT**, or **Minting authority** as an issuance goal; explain the capability consequence before allowing progression.
- Select a mock eligible genesis UTXO from a visible UTXO table, not an abstract “issuer balance.”
- Name the asset and add optional display metadata, while clearly separating display metadata from category identity and on-chain token data.
- Set mock initial fungible allocation(s), authority destination, and optional NFT commitment/metadata examples.
- Drag allocation cards to organization treasury, operating budget, vendor/partner, reserve, or external recipient lanes. The graph must update an ordered transaction-output list, not merely decorative lines.
- Show a real-feeling output ledger: output index, BCH value, token category, fungible amount, NFT capability, commitment, locking destination, and purpose.
- Surface validity warnings in place: token-bearing outputs must retain BCH value, authority destinations require special confirmation, category/amount effects must be explicit, and no output may silently receive token state.
- Let the user run a **Mock issue** action. Animate the graph/ledger through preflight checks, then create local simulated UTXOs and an issuance receipt marked `simulated — not broadcast`.

### Visual questions to solve

- How does the UI make the category identity feel trustworthy without overwhelming the user with raw hashes?
- How do we represent a minting or mutable NFT authority as a powerful, separate object rather than as spendable inventory?
- How should allocation policy and token distribution connect to future budget vaults?
- What are the clearest ways to depict a category genesis event, then the post-event UTXO portfolio?

---

## Flagship visual mockup B: Contract Studio

Retain the graph as the central visual object. The graph is not an illustration: it is a projection of the reviewed contract configuration and transaction builder.

### Three-pane desktop composition

```text
Reviewed template gallery | Contract / UTXO transition graph | selected-element inspector
                          | transaction preview + validation evidence below
```

On mobile, turn the inspector into a bottom sheet and retain a focused graph with a readable transaction summary.

### Graph vocabulary

Use distinct, typed nodes. Edges represent actual transaction relationships, not abstract API calls.

| Node / edge        | What it means                                                          | Operator may edit?                                                              |
| ------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Source UTXO        | Exact BCH/token input consumed by the transition                       | Select an eligible source only; never hand-edit its facts                       |
| Asset state        | Native BCH, fungible category, or NFT state/authority                  | Depends on reviewed template; display exact fields                              |
| Covenant vault     | P2SH32/CashScript instance holding the protected state                 | Template and code read-only; exposed constructor controls only                  |
| Authorization      | Signature, role, timelock, or ticket requirement                       | Identity/branch only if template exposes it                                     |
| Output route       | Payment, allocation, issuance, recovery, or child vault                | Amount/recipient only where explicitly allowed                                  |
| Constraint         | Cap, fee bound, category equality, output order, successor requirement | Constructor values if reviewed; invariants read-only                            |
| Successor          | Next constrained UTXO state                                            | Normally read-only, because its position and lock are on-chain invariants       |
| Off-chain workflow | Approval quorum, reason, separation of duties, expiry                  | Editable organization policy; visibly not represented as an opcode unless it is |
| Artifact/evidence  | Contract version, source hash, VM/test result, provider observation    | Derived, read-only                                                              |

### Element inspector behavior

Clicking **any node or edge** opens a detailed inspector. It should answer four questions in this order:

1. **What is this in plain language?**
2. **What exact UTXO/transaction field does it bind?**
3. **Is it on-chain, off-chain workflow, or evidence only?**
4. **Can I change it? If yes, what will changing it regenerate or invalidate? If no, why is it an invariant?**

For a Bounded Release payment node, for example, show that it is output 0, has a fixed enrolled recipient locking bytecode, has a positive amount bounded by the compiled cap, and allows only the proposed amount/fee to change. For the successor node, show that output index and same covenant lock are non-editable because they preserve restricted funds. For approval quorum, show that it is an off-chain gate unless a selected future contract template enforces a signature quorum on-chain.

The technical layer can be collapsible: CashScript/CashAssembly mapping, constructor parameters, locking bytecode, satoshi values, output index, token fields, artifact hash, and validation evidence.

### Template gallery to explore

Create mock templates with explicit maturity badges:

| Template                | Mock behavior                                              | Maturity label                                 |
| ----------------------- | ---------------------------------------------------------- | ---------------------------------------------- |
| Bounded BCH release     | Fixed recipient, max payment, max fee, same-lock successor | `reviewed shape / simulated transaction`       |
| Token allocation vault  | Exact category/amount route, token-aware successor         | `concept — requires token-aware covenant`      |
| Stateful token treasury | CashToken NFT commitment carries spend/period state        | `reference — requires artifact and VM vectors` |
| Recurring payment       | Time-gated recurring release and successor state           | `reference — requires locktime-aware artifact` |
| Linear vesting          | Time-proportional release to a beneficiary                 | `reference — requires reviewed state model`    |
| Tranche release         | Milestone/unlock schedule and fixed route(s)               | `reference — requires reviewed state model`    |
| Escrow / recovery       | Separate cooperative, timeout, and recovery branches       | `concept — branch-specific covenant needed`    |

### Contract Studio scenario runner

The current graph should visibly respond when the user runs a simulation. Propose a highly legible sequence:

1. Highlight source UTXO and authorization requirements.
2. Bind template and constructor values.
3. Construct each ordered output, with amounts/token data appearing on the graph edge and transaction ledger together.
4. Show conservation: `input BCH = outputs BCH + fee`, plus a separate token category/amount/capability/commitment comparison.
5. Trace each covenant and policy rule as pass, warning, or block.
6. If successful, show the created successor UTXO as the new active state and update the lineage graph.
7. If blocked, turn only the affected nodes/edges red and explain the exact violated invariant; do not make the whole graph vaguely “fail.”

Every simulation result must say whether it is local/mock-only, deterministic local validation, or chain-observed. This mockup should show both a happy path and at least one failure path: wrong recipient, payment above cap, missing required successor, bad token category, or stale input.

---

## Core behavioral scenarios to mock

Please storyboard these as click-by-click user journeys and propose the relevant screens/states.

### Scenario 1: Establish an organization with one wallet

- User connects an OPTN Wallet through WalletConnect.
- The wallet-derived identity becomes the organization owner; no manual address/PKH entry.
- Owner selects a single-wallet pilot mode, sees the separation between dashboard account role and wallet signing authority, and can later invite another wallet-derived role.
- The UI explains that the dashboard stores no keys and has no spending ability without the wallet's separate consent.

### Scenario 2: Create a mock CashToken category and treasury allocation

- Operator selects a mock genesis UTXO.
- Operator creates a fungible category, routes initial supply to the organization treasury, and routes a minting or mutable authority to a dedicated authority vault.
- The system clearly shows category, supply, NFT capability, recipient locks, token-bearing outputs, BCH value, and issuance policy.
- After mock issuance, the Assets view reveals separate fungible inventory, authority NFT, and issuance lineage.

### Scenario 3: Convert a token allocation into a constrained budget pool

- Operator chooses a reviewed/conceptual token allocation vault.
- Operator selects category, maximum allocation per transition, allowlisted recipient, and successor requirements.
- The graph shows exactly what would be on-chain vs what is only an approval workflow.
- A simulated proposal either succeeds or demonstrates a token-category mismatch / wrong authority / missing successor failure.

### Scenario 4: Configure and run a Bounded BCH release

- Operator chooses Bounded Release.
- Operator clicks the cap node to configure max payment and fee (new constructor values / new contract artifact).
- Operator clicks output 0 to set the mock payment and fee for this proposal.
- Operator clicks the successor output and sees why it cannot be changed.
- Operator runs local simulation, sees exact outputs and validation evidence, then sees the mock successor UTXO become active.

### Scenario 5: Review and approve an exact transition

- Finance approver receives an approval card with the exact intent hash and revision.
- The approval view compares inputs, outputs, asset deltas, covenant rules, off-chain rules, and current UTXO state.
- A changed amount, source UTXO, recipient, token state, or policy revision visibly invalidates previous approval evidence.
- The user sees an intentional distinction between `approved for mock build`, `mock signed`, and `not broadcast`.

### Scenario 6: Audit a failure or a completed simulated state transition

- Operator opens a vault lineage graph.
- They can follow funding UTXO → active vault UTXO → proposal → payment output + successor UTXO.
- A failure overlays the specific broken rule; a completed mock transition retains a complete evidence record without pretending it is confirmed on-chain.

---

## Design principles and visual language

- Preserve the existing OPTN dark, restrained operator-console style: deep neutral surfaces, cool blue for primary interaction, green/amber/red only for compact status semantics, IBM Plex Sans/Mono-like readability, no gradients or crypto-casino visual treatment.
- Prefer asset-flow cards, clear transaction ledgers, and state-machine diagrams over raw hashes and code walls. Hashes and bytecode must remain available through progressive disclosure.
- Use color **and** labels/icons for state. Never rely on green/red alone.
- Make immutable fields feel intentionally locked, not simply disabled. Explain the security reason and what alternate action is necessary (for example: “create a new contract version and fund a new vault”).
- Make editable fields visibly causal: editing a cap should update the covenant artifact identity, graph labels, output possibilities, and validation result in the mock state.
- Avoid “drag anything anywhere.” Validity must be typed and constrained. If drag/drop is used, only permit reviewed components and valid ports, then explain rejected connections.
- Use progressive disclosure: business-language first; exact satoshi, category, locking bytecode, output-index, commitment, and CashScript details second.
- Show empty, loading, blocked, disconnected, and unsupported states deliberately. A blank view is never acceptable.
- Design for desktop operations first, but describe a usable mobile/small-screen adaptation.

---

## Architecture to visualize (not to implement)

Please propose an architecture diagram and UI vocabulary for these distinct layers. They must not collapse into one vague “transaction status.”

```text
Wallet / identity layer
  WalletConnect-connected identities, permissions, external signer

Organization layer
  roles, approval workflow, recipients, budgets, audit policy

Asset / UTXO layer
  BCH UTXOs, CashToken UTXOs, category inventory, NFT authority/state

Control-plan layer
  reviewed template, constructor values, artifact identity, route topology

Transition-planning layer
  exact inputs, ordered outputs, BCH/token deltas, fee, intent hash

Verification layer
  policy checks, covenant checks, deterministic local VM evidence, provider observation

Lifecycle / evidence layer
  draft, approval, simulated build, signed, broadcast, mempool, confirmed, finalized
```

The key architectural principle is that the **visual graph is a projection of canonical contract and transaction data**. It must not be a disconnected drawing that users can manipulate without changing the underlying reviewed configuration.

---

## Safety, truthfulness, and permission rules

- No user private key, recovery phrase, mnemonic, wallet file, or manually supplied signing material should appear anywhere in this product concept.
- Wallet connection, identity, recipient locks, and signing authority are wallet-derived at runtime.
- A dashboard role or approval is not automatically an on-chain covenant guarantee.
- An on-chain covenant only protects funds deliberately funded into its exact locking bytecode. Ordinary wallet UTXOs remain ordinary wallet funds.
- Every template must name its exact enforcement scope and unsupported branches.
- A template change, constructor change, recipient-lock change, or token-state-rule change creates a new policy/artifact version and invalidates relevant simulated approvals.
- BCH conservation and CashToken conservation/state checks need independent visual evidence.
- Token provenance/funding history is accounting information, not spending authority.
- Future AI agents should receive narrow capabilities/intents bound to a policy, vault/outpoint/state, asset, destination, amount, expiry, and idempotency context. They should never receive a free-form transaction editor.
- This is a mockup exercise. Do not portray any mock action as a real Chipnet or Mainnet action.

---

## Questions we want ChatGPT to answer

Please return a design exploration with these deliverables:

1. A concise north-star product narrative.
2. A recommended navigation and page map.
3. Three detailed desktop wireframe descriptions:
   - Command Center;
   - Issuance Lab;
   - Contract Studio.
4. A fourth wireframe for the exact transaction/proposal review and approval room.
5. Component-level behavior for graph nodes, graph edges, inspector states, asset cards, authority badges, transaction-output rows, validation evidence, and lifecycle chips.
6. A storyboard for the six core scenarios above, including happy paths and failure states.
7. A visual-state system that distinguishes mock, local validation, signing, broadcast, mempool, confirmation, and finalization.
8. A proposed visual architecture diagram that separates wallet identity, organization policy, UTXO/assets, contract configuration, transaction planning, verification, and audit evidence.
9. A prioritization split:
   - **Mockup now**;
   - **Chipnet MVP later**;
   - **requires a new reviewed CashScript/CashToken contract and VM test vectors**.
10. The five most important usability risks and how the visual design should reduce them.

Do not solve difficult behavior by hiding it. The design should make BCH/CashToken/CashScript constraints understandable and safe enough for a business operator, while giving advanced users a credible route down to the exact UTXO, output, artifact, and validation details.
