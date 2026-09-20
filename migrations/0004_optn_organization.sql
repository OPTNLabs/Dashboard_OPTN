-- WalletConnect-derived organization membership. Account addresses are only
-- accepted after the wallet proves control with the normal BCH login message.
-- Invitation bearer codes are stored hashed; no private keys or mnemonics are
-- ever persisted.

create table if not exists optn_organizations (
  network             text primary key,
  owner_account       text not null,
  recipient_account   text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table if not exists optn_org_members (
  network             text not null,
  account             text not null,
  role                text not null,
  added_by            text not null,
  created_at          timestamptz not null default now(),
  primary key (network, account)
);

create table if not exists optn_org_invites (
  id                  text primary key,
  network             text not null,
  kind                text not null,
  code_hash           text not null unique,
  created_by          text not null,
  expires_at          timestamptz not null,
  accepted_by         text,
  accepted_at         timestamptz,
  created_at          timestamptz not null default now()
);

create index if not exists optn_org_invites_active_idx
  on optn_org_invites (network, expires_at)
  where accepted_at is null;
