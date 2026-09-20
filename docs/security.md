# OPTN Dashboard security

## Prohibited material

The dashboard never requests, accepts, displays, logs, or stores:

- seed phrases or mnemonics
- private keys or WIF
- wallet files / keystores
- long-lived WalletConnect secrets in source

Demo login uses BIP340/secp256k1 test-vector scalars (`n = 1..6`) on the server to exercise real `bch_signMessage` and CashVM paths. Those scalars are not wallet seeds, are not serialized in fixtures, and are not returned by the API.

## Network isolation

- Sessions, UTXOs, plans, proposals, and audit events are keyed by network.
- Chipnet (`bch:bchtest`) and Mainnet (`bch:bitcoincash`) cannot share a session or approval.
- Mainnet is disabled unless `ENABLE_MAINNET=true`. Every live mutation checks the server gate.
- The UI never silently falls back between networks.
- Chipnet artifacts, UTXO caches, and approvals are not reused on Mainnet.

## Authentication

- Login challenges are single-use, origin/network/account-bound, and expire in five minutes.
- The origin is derived from request headers and an optional `OPTN_ORIGIN_ALLOWLIST`. It is never a constant such as `optn-dashboard`.
- Challenges are consumed atomically so concurrent verification cannot both succeed.
- Login requests `bch_signMessage` only. Transaction signing is a later `bch_signTransaction` session.
- Sessions are HttpOnly cookies. A wallet address is not proof of control without a verified signature.

## Organization membership

Live authorization uses `OPTN_OPERATOR_ACCOUNTS` and `OPTN_APPROVER_ACCOUNTS`. Demo Alice/Bob/Carol are used only when those lists are empty. A WalletConnect account that is not in the organization registry is a viewer and cannot approve or spend.

## Approvals and intents

- Approvals are signatures over a canonical intent hash, not over UI copy.
- The intent includes network, WalletConnect chain id, plan id/version, artifact id/hash, source outpoint and value, token state, tx version/locktime/sequence, outputs, fee, threshold, expiry, and nonce.
- Changing any of those values produces a different hash and invalidates prior approvals.
- Distinct authorized accounts are required for distinct approval slots.
- The proposer cannot be the sole approver when that rule is set.
- 2-of-3 is an **off-chain approval policy**. BoundedRelease enforces one operator CHECKSIG.

## Transaction review gate

Broadcast is allowed only after:

1. Policy evaluation (fail-closed)
2. Off-chain approval threshold
3. Deterministic unsigned build
4. Wallet `bch_signTransaction` signature
5. Parse + exact match of the signed transaction
6. CashVM verification with source outputs
7. Provider proof the outpoint is still unspent
8. Provider preflight
9. Explicit broadcast confirmation (`explicitConfirm: true`)
10. Idempotent provider submit under a broadcast lock

A wallet that adds inputs or changes outputs is rejected. Simulation-only shapes (including the unused-`recipientPkh` TreasuryVault fixture) cannot broadcast. Demo local VM (`locally-vm-validated`) cannot broadcast.

## UTXO attachment

Attach requires a live indexer. The fixture provider cannot prove an outpoint is unspent. Attachment constructs a vault only after:

- the outpoint exists
- it is listed in the UTXO set
- BCH value and locking bytecode are exact
- the lock matches the reviewed artifact
- token evidence is reported and empty

An indexer history hit is not proof of unspent. Empty token is not assumed when the provider omitted token data.

## Idempotency

Proposal creation uses idempotency keys. Source outpoints are reserved per network/txid/vout so two active proposals cannot share one UTXO. Broadcast uses a unique lock so a duplicate request returns the original txid rather than submitting a second time. Definitive provider rejection releases the lock; timeout/unknown responses retain it and can be reconciled by querying the signed txid before any retry.

## Evidence labels

`FIXTURE`, `SIMULATED`, `LOCALLY_VM_VALIDATED`, `SIGNED_BUT_UNBROADCAST`, `PROVIDER_ACCEPTED`, `MEMPOOL_OBSERVED`, `CONFIRMED`, and `SUCCESSOR_VERIFIED` are distinct. A txid is not confirmation. Confirmation is not successor verification. Provider acceptance is not mempool observation.

## Policy hash

The policy hash covers semantic fields (routes, governance, limits, artifact, pause, version). Canvas coordinates are visual layout and are intentionally excluded. Session consumed amounts are accounting state and are excluded.
