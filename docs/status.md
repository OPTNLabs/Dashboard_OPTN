# Implementation status

Reported by evidence, not optimism.

| Capability                                                                        | Status                                                                                                             |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Operator overview, network/mode badges                                            | Implemented and tested locally                                                                                     |
| Typed Policy Studio (reviewed palette, canvas, inspector)                         | Implemented locally; canvas is visual-only                                                                         |
| Canonical Control Plan + policy id                                                | Implemented and unit-tested; canvas excluded from hash                                                             |
| Immutable published plan versions                                                 | Implemented (`optn_plan_versions`)                                                                                 |
| Proposal + exact intent hash                                                      | Implemented and unit-tested                                                                                        |
| Off-chain 2-of-3 approval policy                                                  | Implemented; labelled off-chain, not an on-chain quorum                                                            |
| Demo approvals over BCH message signatures                                        | Implemented locally (requires operator switch)                                                                     |
| WalletConnect approval signatures                                                 | Implemented; requires a live `bch_signMessage` session                                                             |
| Deterministic vault-release builder                                               | Implemented and unit-tested                                                                                        |
| BoundedRelease CashVM (authorized / wrong dest / extra in-out / caps / successor) | Implemented and unit-tested                                                                                        |
| Unused recipientPkh regression                                                    | Implemented and unit-tested                                                                                        |
| Native-only token rejection                                                       | Implemented as off-chain policy + builder; script does not inspect tokens                                          |
| WalletConnect login (`bch_signMessage`)                                           | Implemented; requires `WALLETCONNECT_PROJECT_ID`                                                                   |
| WalletConnect `bch_signTransaction`                                               | Implemented as a **separate** post-approval session with covenant placeholder unlocking data and contract metadata |
| Exact signed-tx matcher                                                           | Implemented and unit-tested                                                                                        |
| Chipnet chain reads + UTXO-set unspent proof                                      | Implemented for Fulcrum/Electrum WSS and Chronik HTTPS; wallet address comes from WalletConnect                    |
| Outpoint reservations                                                             | Implemented (`optn_reservations`)                                                                                  |
| Broadcast lock / idempotent submit                                                | Implemented (`optn_broadcast_locks`) with retained-lock reconciliation for uncertain provider responses            |
| Broadcast requires `signed-vm-validated` + explicit confirm + preflight           | Implemented; blocked in demo                                                                                       |
| Mempool / confirmation / successor monitor                                        | Implemented adapter; unavailable without provider                                                                  |
| Organization membership from env                                                  | Implemented; demo identities only when env lists are empty                                                         |
| Mainnet                                                                           | Gated; disabled by default on every live endpoint                                                                  |
| AI agent capabilities listing                                                     | Implemented (read/propose/explain; broadcast denied without live env)                                              |

Unavailable in this environment unless configured:

- WalletConnect project id
- Chipnet chain provider / broadcast
- Configured live operator/approver accounts
- A funded live vault UTXO whose lock matches the reviewed artifact
- Mainnet

## Independently verified here

- Focused protocol/CashVM/chain tests: 58 passed
- `npm test`: 186 passed, 9 existing Grok PWA/migration fixture tests failed; no failures were in the covenant/control-plane test set
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- browser smoke against the running dashboard

## Not independently verified here

- A real Chipnet WalletConnect pairing
- A real approver `bch_signMessage` from a hardware/software wallet
- A real operator `bch_signTransaction`
- Provider acceptance, mempool observation, confirmation, or successor verification of a live transaction

No live Chipnet transaction was signed, broadcast, confirmed, or successor-verified in this environment.

## Remaining risks

- Session and daily budgets are display/policy fields, not atomically reserved and not covenant-enforced.
- The reviewed BoundedRelease script does not inspect CashTokens; native-only is a control-plane rule.
- A live operator must fund a vault compiled for their PKH and reviewed recipient; the demo Alice vault cannot be spent by an arbitrary WalletConnect account.
- WalletConnect wallets that cannot add `bch_signTransaction` after login need a second pairing; that path is implemented but unproven against every BCH wallet.
- Chronik response shapes vary; unknown token evidence fails closed on attach.
- Live broadcast and real WalletConnect pairing remain separately gated; read-only Fulcrum height and genesis verification are covered independently.
