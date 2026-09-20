-- Immutable plan versions, outpoint reservations, and session auth method.
-- Demo and live rows stay network-keyed. No keys or seeds are stored.

alter table optn_sessions
  add column if not exists auth_method text not null default 'demo';

create table if not exists optn_plan_versions (
  id            text not null,
  version       integer not null,
  network       text not null,
  payload       jsonb not null,
  created_at    timestamptz not null default now(),
  primary key (id, version)
);

create table if not exists optn_reservations (
  network       text not null,
  txid          text not null,
  vout          integer not null,
  proposal_id   text not null,
  status        text not null,
  created_at    timestamptz not null default now(),
  primary key (network, txid, vout)
);

create unique index if not exists optn_reservations_active_idx
  on optn_reservations (network, txid, vout)
  where status = 'reserved';

create table if not exists optn_broadcast_locks (
  proposal_id   text primary key,
  txid          text,
  created_at    timestamptz not null default now()
);
