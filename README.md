# OPTN Dashboard

Operator control plane for bounded Bitcoin Cash allocation. A Control Plan is the primary object — not a raw transaction and not a CashScript IDE.

The dashboard lets an operator inspect discrete UTXOs, compose a reviewed native-BCH vault route, request distinct WalletConnect (or labelled demo) approvals over a canonical intent hash, build a deterministic transaction, locally CashVM-validate it, request a separate WalletConnect `bch_signTransaction` session, and — only when a Chipnet provider is configured and the proposal is `signed-vm-validated` — explicitly broadcast.

This workspace implements a Chipnet-first MVP. It does **not** implement live CashToken payments, on-chain 2-of-3, atomic session/daily budgets, recovery spends, or Mainnet spending.

## Modes

| Mode             | When                                                      | What it will not do                                                                                                             |
| ---------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **DEMO**         | Default. No WalletConnect project id and no indexer.      | Invent a Chipnet txid, confirmation, or successor observation. Demo local VM stays `locally-vm-validated` and cannot broadcast. |
| **CHIPNET_LIVE** | WalletConnect and/or a Chipnet Electrum/Chronik provider. | Broadcast without an approved, wallet-signed, VM-valid, recipient-enforcing, live-spend vault.                                  |
| **MAINNET_LIVE** | `ENABLE_MAINNET=true` plus Mainnet indexer/broadcast.     | Reuse a Chipnet session, approval, artifact, or UTXO cache. Off by default.                                                     |

Demo fixtures are labelled `[DEMO]` / `FIXTURE`. They exercise the same policy, intent, transaction, and CashVM code as live.

## Setup

```bash
npm install
npm run dev
```

The local `.env` is ignored by Git and contains the Chipnet WalletConnect
configuration. For another checkout, copy `.env.development.example` to
`.env.development.local`, fill only local values, and run `sh startup.sh`; the
startup wrapper loads the ignored env file before starting Vite. Do not put a
mnemonic in a production environment.

The development template includes `CHIPNET_DEV_MNEMONIC` as an empty,
local-only placeholder for future Chipnet test tooling. The current E2E suite
uses deterministic server-side demo identities and does not consume a mnemonic.
WalletConnect remains the live signing boundary.

### Environment (optional live Chipnet)

| Variable                                                     | Purpose                                                         |
| ------------------------------------------------------------ | --------------------------------------------------------------- |
| `APP_NETWORK`                                                | `chipnet` (default) or `mainnet`                                |
| `ENABLE_MAINNET`                                             | `true` to ungate Mainnet. Default false.                        |
| `VITE_WALLETCONNECT_PROJECT_ID` / `WALLETCONNECT_PROJECT_ID` | WalletConnect Cloud project id                                  |
| `CHIPNET_INDEXER_URL`                                        | Fulcrum/Electrum `wss://` endpoint or Chronik-compatible HTTPS  |
| `CHIPNET_BROADCAST_URL`                                      | Optional Chronik broadcast endpoint; Electrum uses the same WSS |
| `MAINNET_INDEXER_URL` / `MAINNET_BROADCAST_URL`              | Only when Mainnet is enabled                                    |
| `OPTN_ORIGIN_ALLOWLIST`                                      | Comma-separated dashboard origins accepted for login challenges |
| `SESSION_SECRET`                                             | Server session material. Do not commit.                         |

Wallet addresses, operator identity, approval identity, PKHs, recipient locks,
and recipient addresses are intentionally not environment configuration. They
must come from the connected WalletConnect wallet(s) and be bound to the
reviewed intent at runtime. The dashboard fails closed when that binding or a
provider proof is missing.

The default development template uses OPTN's public Chipnet Fulcrum endpoint at
`wss://electrum-chipnet.optnlabs.com:50004`. The adapter validates the provider's
genesis hash before reporting a live Chipnet height. Riften's Cauldron API is a
different service and must not be used as the chain-provider URL.

Login requests `bch_signMessage` only. `bch_signTransaction` is a separate session after approval. The dashboard never requests keys, seeds, or wallet files.

The Wallet page displays the raw WalletConnect v2 `wc:` URI as both a QR code
and copyable text. OPTN Wallet rejects decorated values such as `pairing:wc:`;
scan the QR or paste the unchanged `wc:` value into OPTN Wallet's Connect flow.

WalletConnect chain ids: `bch:bchtest` (Chipnet), `bch:bitcoincash` (Mainnet).

## Reviewed contract

Live spends use **BoundedReleaseVault** (`bounded-release-v1`), a P2SH32 redeem script that enforces:

- operator signature
- 1 input / 2 outputs
- payment lock at output 0
- successor covenant lock at output 1
- per-payment cap
- fee cap

It does **not** enforce 2-of-3 approval, session/daily budgets, recovery, token state, or plan governance. Those remain off-chain policy or unimplemented.

The original TreasuryVault fixture declared `recipientPkh` but did not constrain output 0. It remains in the registry as `treasury-vault-unreviewed-v0` with live spend disabled. A regression test proves unauthorized destinations are not on-chain enforced by that shape.

A changed artifact requires a newly funded vault instance. Never reuse an old outpoint with a new redeem script.

## Visual walkthrough

Use the **Walkthrough** button in the dashboard header. The five-step, read-only
tour moves through live chain verification, WalletConnect pairing, real wallet
UTXOs, visual policy construction, and the proposal lifecycle. It never signs or
broadcasts a transaction.

When a live provider is configured, deterministic demo vaults, plans, proposals,
and audit events are excluded from application responses. Local plans and
approvals are labelled as control-plane records; only provider-observed UTXOs,
heights, transaction status, and confirmations are presented as chain facts.

## Tests

```bash
npm test
npm run typecheck
npm run lint
npm run build
npm run e2e
npm run e2e:live
npm run preview:restart
npm run e2e:preview
```

`npm run e2e` starts an isolated deterministic demo app on `127.0.0.1:8082` and
verifies every control-plane route plus the demo Alice → Bob approval →
unsigned build → local CashVM validation flow. It explicitly blanks live
provider variables in the child process, so local WalletConnect configuration
cannot silently change demo roles. `npm run e2e:live` checks the Chipnet chain
configuration and WalletConnect login boundary against the development app on
port 8080. An actual WalletConnect approval or signature requires interaction
in the wallet and is not simulated from `CHIPNET_DEV_MNEMONIC`.

Set `PLAYWRIGHT_EXECUTABLE_PATH` when the system Chrome executable is not at
`/usr/bin/google-chrome`. After a production build, `npm run preview:restart`
owns port 8081 and `npm run e2e:preview` runs against the built output.

Independently verified in this workspace:

- policy, intent, conservation, lifecycle
- BoundedRelease CashVM positive and negative cases
- Electrum WSS and Chronik token/unspent parsing
- WalletConnect login/signing protocol helpers
- reservation and broadcast-lock decision logic

Not run here unless configured:

- a real WalletConnect pairing
- a funded Chipnet vault outpoint
- a live Chronik indexer / broadcast

## Security

See `docs/security.md`. Private keys, seeds, and wallet files never enter the browser, fixtures JSON, logs, or API responses. Demo signatures use secp256k1 test-vector scalars on the server only.
