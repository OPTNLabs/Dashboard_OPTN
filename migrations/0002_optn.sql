-- OPTN control-plane persistence. Rows are application objects (plans, vaults,
-- proposals, audit). Access is gated by the dashboard's own WalletConnect /
-- demo session, not platform auth. No private keys or seeds are stored.

create table if not exists optn_sessions (
  id            text primary key,
  network       text not null,
  account       text not null,
  role          text not null,
  mode          text not null,
  origin        text not null,
  created_at    timestamptz not null default now(),
  expires_at    timestamptz not null,
  last_seen_at  timestamptz not null default now()
);

create table if not exists optn_challenges (
  id            text primary key,
  network       text not null,
  account       text not null,
  origin        text not null,
  nonce         text not null unique,
  message       text not null,
  purpose       text not null,
  created_at    timestamptz not null default now(),
  expires_at    timestamptz not null,
  consumed_at   timestamptz
);

create table if not exists optn_vaults (
  id            text primary key,
  network       text not null,
  payload       jsonb not null,
  updated_at    timestamptz not null default now()
);

create table if not exists optn_plans (
  id            text primary key,
  network       text not null,
  payload       jsonb not null,
  updated_at    timestamptz not null default now()
);

create table if not exists optn_proposals (
  id            text primary key,
  network       text not null,
  payload       jsonb not null,
  updated_at    timestamptz not null default now()
);

create table if not exists optn_audit (
  id            text primary key,
  network       text not null,
  seq           bigint not null,
  prev_hash     text not null,
  event_hash    text not null,
  payload       jsonb not null,
  created_at    timestamptz not null default now()
);

create index if not exists optn_audit_network_seq_idx on optn_audit (network, seq);
create index if not exists optn_proposals_network_idx on optn_proposals (network);
create index if not exists optn_plans_network_idx on optn_plans (network);

create table if not exists optn_idempotency (
  key           text primary key,
  network       text not null,
  result        jsonb not null,
  created_at    timestamptz not null default now()
);

create table if not exists optn_meta (
  key           text primary key,
  value         text not null
);
