import { getSql } from "@/lib/db";
import type {
  AuditEvent,
  ControlPlan,
  EvidenceLevel,
  Network,
  Organization,
  OrganizationInviteKind,
  OrganizationMember,
  OrganizationMemberRole,
  OperatorSession,
  Proposal,
  Role,
  VaultInstance,
} from "./types.ts";

import { canonicalJson } from "./canonicalize.ts";
import { utf8Sha256Hex } from "./encoding.ts";
import { DEMO_PLAN_ID, DEMO_VAULT_ID, demoPlan, demoVault, emptyAuditGenesis } from "./fixtures.ts";
import { publicConfig } from "./config.server.ts";
import { reservationConflict } from "./reservation.ts";

type Json = Record<string, unknown>;

async function sql() {
  return getSql();
}

let seeded = false;

export async function ensureSeeded(): Promise<void> {
  if (seeded) return;
  if (publicConfig().mode !== "demo") {
    seeded = true;
    return;
  }
  const db = await sql();
  const rows = await db<{ n: number }>`select count(*)::int as n from optn_plans`;
  if ((rows[0]?.n ?? 0) === 0) {
    const vault = demoVault();
    const plan = demoPlan();
    const genesis = emptyAuditGenesis(publicConfig().network);
    await db`
      insert into optn_vaults (id, network, payload)
      values (${vault.id}, ${vault.network}, ${JSON.stringify(vault)}::jsonb)
    `;
    await db`
      insert into optn_plans (id, network, payload)
      values (${plan.id}, ${plan.network}, ${JSON.stringify(plan)}::jsonb)
    `;
    await db`
      insert into optn_audit (id, network, seq, prev_hash, event_hash, payload)
      values (
        ${genesis.id}, ${genesis.network}, ${genesis.seq}, ${genesis.prevHash},
        ${genesis.eventHash}, ${JSON.stringify(genesis)}::jsonb
      )
    `;
    await db`
      insert into optn_meta (key, value) values ('audit_seq', '1')
      on conflict (key) do nothing
    `;
  }
  seeded = true;
}

function includeFixtureRows(): boolean {
  return publicConfig().mode === "demo";
}

function visibleVault(vault: VaultInstance): boolean {
  return (
    includeFixtureRows() || (vault.id !== DEMO_VAULT_ID && !vault.evidence.includes("FIXTURE"))
  );
}

function visiblePlan(plan: ControlPlan): boolean {
  return includeFixtureRows() || (plan.id !== DEMO_PLAN_ID && plan.sourceVaultId !== DEMO_VAULT_ID);
}

function visibleProposal(proposal: Proposal): boolean {
  return includeFixtureRows() || proposal.planId !== DEMO_PLAN_ID;
}

function visibleAudit(event: AuditEvent): boolean {
  return includeFixtureRows() || event.evidence !== "FIXTURE";
}

export async function listVaults(network: Network): Promise<VaultInstance[]> {
  await ensureSeeded();
  const db = await sql();
  const rows = await db<{ payload: VaultInstance }>`
    select payload from optn_vaults where network = ${network} order by id
  `;
  return rows.map((row) => row.payload).filter(visibleVault);
}

export async function getVault(id: string, network?: Network): Promise<VaultInstance | null> {
  await ensureSeeded();
  const db = await sql();
  const rows = network
    ? await db<{ payload: VaultInstance }>`
        select payload from optn_vaults where id = ${id} and network = ${network}
      `
    : await db<{ payload: VaultInstance }>`
        select payload from optn_vaults where id = ${id}
      `;
  const vault = rows[0]?.payload ?? null;
  return vault && visibleVault(vault) ? vault : null;
}

export async function putVault(vault: VaultInstance): Promise<VaultInstance> {
  const db = await sql();
  await db`
    insert into optn_vaults (id, network, payload, updated_at)
    values (${vault.id}, ${vault.network}, ${JSON.stringify(vault)}::jsonb, now())
    on conflict (id) do update set payload = excluded.payload, updated_at = now()
  `;
  return vault;
}

export async function listPlans(network: Network): Promise<ControlPlan[]> {
  await ensureSeeded();
  const db = await sql();
  const rows = await db<{ payload: ControlPlan }>`
    select payload from optn_plans where network = ${network} order by id
  `;
  return rows.map((row) => row.payload).filter(visiblePlan);
}

export async function getPlan(id: string, network?: Network): Promise<ControlPlan | null> {
  await ensureSeeded();
  const db = await sql();
  const rows = network
    ? await db<{ payload: ControlPlan }>`
        select payload from optn_plans where id = ${id} and network = ${network}
      `
    : await db<{ payload: ControlPlan }>`
        select payload from optn_plans where id = ${id}
      `;
  const plan = rows[0]?.payload ?? null;
  return plan && visiblePlan(plan) ? plan : null;
}

export async function putPlan(plan: ControlPlan): Promise<ControlPlan> {
  const db = await sql();
  await db`
    insert into optn_plans (id, network, payload, updated_at)
    values (${plan.id}, ${plan.network}, ${JSON.stringify(plan)}::jsonb, now())
    on conflict (id) do update set payload = excluded.payload, updated_at = now()
  `;
  return plan;
}

export async function snapshotPlanVersion(plan: ControlPlan): Promise<void> {
  const db = await sql();
  await db`
    insert into optn_plan_versions (id, version, network, payload)
    values (${plan.id}, ${plan.version}, ${plan.network}, ${JSON.stringify(plan)}::jsonb)
    on conflict (id, version) do nothing
  `;
}

export async function getPlanVersion(id: string, version: number): Promise<ControlPlan | null> {
  const db = await sql();
  const rows = await db<{ payload: ControlPlan }>`
    select payload from optn_plan_versions where id = ${id} and version = ${version}
  `;
  const plan = rows[0]?.payload ?? null;
  return plan && visiblePlan(plan) ? plan : null;
}

export async function tryReserveOutpoint(args: {
  network: Network;
  txid: string;
  vout: number;
  proposalId: string;
}): Promise<{ ok: true } | { ok: false; holder: string }> {
  const db = await sql();
  const existing = await db<{ proposal_id: string; status: string }>`
    select proposal_id, status from optn_reservations
    where network = ${args.network} and txid = ${args.txid.toLowerCase()} and vout = ${args.vout}
  `;
  const row = existing[0];
  const conflict = reservationConflict(
    row ? { proposalId: row.proposal_id, status: row.status as "reserved" | "spent" } : null,
    args.proposalId,
  );
  if (!conflict.ok) return conflict;
  await db`
    insert into optn_reservations (network, txid, vout, proposal_id, status)
    values (${args.network}, ${args.txid.toLowerCase()}, ${args.vout}, ${args.proposalId}, 'reserved')
    on conflict (network, txid, vout) do update
      set proposal_id = excluded.proposal_id, status = 'reserved'
      where optn_reservations.status <> 'spent'
        and (optn_reservations.proposal_id = ${args.proposalId} or optn_reservations.status <> 'reserved')
  `;
  const confirm = await db<{ proposal_id: string; status: string }>`
    select proposal_id, status from optn_reservations
    where network = ${args.network} and txid = ${args.txid.toLowerCase()} and vout = ${args.vout}
  `;
  if (confirm[0]?.proposal_id === args.proposalId && confirm[0]?.status === "reserved") {
    return { ok: true };
  }
  return { ok: false, holder: confirm[0]?.proposal_id ?? "unknown" };
}

export async function releaseOutpoint(
  network: Network,
  txid: string,
  vout: number,
  proposalId: string,
) {
  const db = await sql();
  await db`
    delete from optn_reservations
    where network = ${network} and txid = ${txid.toLowerCase()} and vout = ${vout}
      and proposal_id = ${proposalId} and status = 'reserved'
  `;
}

export async function markOutpointSpent(
  network: Network,
  txid: string,
  vout: number,
  proposalId: string,
) {
  const db = await sql();
  await db`
    update optn_reservations set status = 'spent'
    where network = ${network} and txid = ${txid.toLowerCase()} and vout = ${vout} and proposal_id = ${proposalId}
  `;
}

export async function acquireBroadcastLock(proposalId: string): Promise<boolean> {
  const db = await sql();
  const rows = await db<{ proposal_id: string }>`
    insert into optn_broadcast_locks (proposal_id)
    values (${proposalId})
    on conflict (proposal_id) do nothing
    returning proposal_id
  `;
  return Boolean(rows[0]);
}

export async function getBroadcastLock(
  proposalId: string,
): Promise<{ proposalId: string; txid: string | null } | null> {
  const db = await sql();
  const rows = await db<{ proposal_id: string; txid: string | null }>`
    select proposal_id, txid from optn_broadcast_locks where proposal_id = ${proposalId}
  `;
  const row = rows[0];
  if (!row) return null;
  return { proposalId: row.proposal_id, txid: row.txid };
}

export async function setBroadcastLockTxid(proposalId: string, txid: string) {
  const db = await sql();
  await db`
    update optn_broadcast_locks set txid = ${txid} where proposal_id = ${proposalId}
  `;
}

export async function releaseBroadcastLock(proposalId: string) {
  const db = await sql();
  await db`
    delete from optn_broadcast_locks where proposal_id = ${proposalId} and txid is null
  `;
}

export async function listProposals(network: Network): Promise<Proposal[]> {
  await ensureSeeded();
  const db = await sql();
  const rows = await db<{ payload: Proposal }>`
    select payload from optn_proposals where network = ${network} order by id
  `;
  return rows.map((row) => row.payload).filter(visibleProposal);
}

export async function getProposal(id: string, network?: Network): Promise<Proposal | null> {
  await ensureSeeded();
  const db = await sql();
  const rows = network
    ? await db<{ payload: Proposal }>`
        select payload from optn_proposals where id = ${id} and network = ${network}
      `
    : await db<{ payload: Proposal }>`
        select payload from optn_proposals where id = ${id}
      `;
  const proposal = rows[0]?.payload ?? null;
  return proposal && visibleProposal(proposal) ? proposal : null;
}

export async function putProposal(proposal: Proposal): Promise<Proposal> {
  const db = await sql();
  await db`
    insert into optn_proposals (id, network, payload, updated_at)
    values (${proposal.id}, ${proposal.network}, ${JSON.stringify(proposal)}::jsonb, now())
    on conflict (id) do update set payload = excluded.payload, updated_at = now()
  `;
  return proposal;
}

export async function deleteProposal(id: string, network: Network): Promise<void> {
  const db = await sql();
  await db`delete from optn_proposals where id = ${id} and network = ${network}`;
}

export async function appendAudit(
  event: Omit<AuditEvent, "id" | "seq" | "prevHash" | "eventHash">,
): Promise<AuditEvent> {
  await ensureSeeded();
  const db = await sql();
  const latest = await db<{ seq: number; event_hash: string }>`
    select seq, event_hash from optn_audit where network = ${event.network} order by seq desc limit 1
  `;
  const prevHash = latest[0]?.event_hash ?? "0".repeat(64);
  const seq = (latest[0]?.seq ?? 0) + 1;
  const id = `audit-${seq}`;
  const eventHash = utf8Sha256Hex(canonicalJson({ prevHash, seq, ...event }));
  const record: AuditEvent = { ...event, id, seq, prevHash, eventHash };
  await db`
    insert into optn_audit (id, network, seq, prev_hash, event_hash, payload)
    values (${id}, ${record.network}, ${seq}, ${prevHash}, ${eventHash}, ${JSON.stringify(record)}::jsonb)
  `;
  return record;
}

export async function listAudit(network: Network, limit = 80): Promise<AuditEvent[]> {
  await ensureSeeded();
  const db = await sql();
  const rows = await db<{ payload: AuditEvent }>`
    select payload from optn_audit where network = ${network} order by seq desc limit ${limit}
  `;
  return rows.map((row) => row.payload).filter(visibleAudit);
}

export async function getIdempotent<T>(key: string, network?: Network): Promise<T | null> {
  const db = await sql();
  const rows = network
    ? await db<{
        result: T;
      }>`select result from optn_idempotency where key = ${key} and network = ${network}`
    : await db<{ result: T }>`select result from optn_idempotency where key = ${key}`;
  return rows[0]?.result ?? null;
}

export async function putIdempotent<T>(key: string, network: Network, result: T): Promise<T> {
  const db = await sql();
  const inserted = await db<{ result: T }>`
    insert into optn_idempotency (key, network, result)
    values (${key}, ${network}, ${JSON.stringify(result)}::jsonb)
    on conflict (key) do nothing
    returning result
  `;
  if (inserted[0]) return inserted[0].result;
  const existing = await db<{ network: Network; result: T }>`
    select network, result from optn_idempotency where key = ${key}
  `;
  if (existing[0]?.network !== network)
    throw new Error("Idempotency key is already used on another network");
  return existing[0]?.result ?? result;
}

export async function saveChallenge(row: {
  id: string;
  network: Network;
  account: string;
  origin: string;
  nonce: string;
  message: string;
  purpose: string;
  expiresAt: string;
}) {
  const db = await sql();
  await db`
    insert into optn_challenges (id, network, account, origin, nonce, message, purpose, expires_at)
    values (${row.id}, ${row.network}, ${row.account}, ${row.origin}, ${row.nonce}, ${row.message}, ${row.purpose}, ${row.expiresAt})
  `;
}

export async function consumeChallenge(nonce: string) {
  const db = await sql();
  const claimed = await db<{
    id: string;
    network: Network;
    account: string;
    origin: string;
    nonce: string;
    message: string;
    purpose: string;
    expires_at: string;
    consumed_at: string | null;
  }>`
    update optn_challenges
    set consumed_at = now()
    where nonce = ${nonce} and consumed_at is null
    returning *
  `;
  if (claimed[0]) return { ...claimed[0], reused: false as const };
  const rows = await db<{
    id: string;
    network: Network;
    account: string;
    origin: string;
    nonce: string;
    message: string;
    purpose: string;
    expires_at: string;
    consumed_at: string | null;
  }>`select * from optn_challenges where nonce = ${nonce}`;
  const row = rows[0];
  if (!row) return null;
  return { ...row, reused: true as const };
}

export async function saveSession(session: OperatorSession) {
  const db = await sql();
  await db`
    insert into optn_sessions (id, network, account, role, mode, origin, created_at, expires_at, auth_method)
    values (
      ${session.id}, ${session.network}, ${session.account}, ${session.role},
      ${session.mode}, ${session.origin}, ${session.createdAt}, ${session.expiresAt}, ${session.authMethod}
    )
    on conflict (id) do update set last_seen_at = now(), auth_method = excluded.auth_method
  `;
}

export async function getSession(id: string): Promise<OperatorSession | null> {
  const db = await sql();
  const rows = await db<{
    id: string;
    network: Network;
    account: string;
    role: OperatorSession["role"];
    mode: OperatorSession["mode"];
    origin: string;
    created_at: string;
    expires_at: string;
    auth_method: OperatorSession["authMethod"] | null;
  }>`select * from optn_sessions where id = ${id}`;
  const row = rows[0];
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) return null;
  return {
    id: row.id,
    network: row.network,
    account: row.account,
    role: row.role,
    mode: row.mode,
    origin: row.origin,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    authMethod: row.auth_method === "walletconnect" ? "walletconnect" : "demo",
  };
}

export async function deleteSession(id: string) {
  const db = await sql();
  await db`delete from optn_sessions where id = ${id}`;
}

function inviteCode(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `optn-invite-${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

type OrganizationRow = {
  network: Network;
  owner_account: string;
  recipient_account: string | null;
  covenant_max_payment_satoshis: string | null;
  covenant_max_fee_satoshis: string | null;
  created_at: string;
};

type OrganizationMemberRow = {
  account: string;
  role: OrganizationMemberRole;
  added_by: string;
  created_at: string;
};

function toOrganization(row: OrganizationRow, members: OrganizationMember[]): Organization {
  return {
    network: row.network,
    ownerAccount: row.owner_account,
    recipientAccount: row.recipient_account,
    covenantMaxPaymentSatoshis: row.covenant_max_payment_satoshis,
    covenantMaxFeeSatoshis: row.covenant_max_fee_satoshis,
    members,
    createdAt: row.created_at,
  };
}

async function listOrganizationMembers(network: Network): Promise<OrganizationMember[]> {
  const db = await sql();
  const rows = await db<OrganizationMemberRow>`
    select account, role, added_by, created_at from optn_org_members
    where network = ${network} order by created_at asc, account asc
  `;
  return rows.map((row) => ({
    account: row.account,
    role: row.role,
    addedBy: row.added_by,
    addedAt: row.created_at,
  }));
}

export async function getOrganization(network: Network): Promise<Organization | null> {
  const db = await sql();
  const rows = await db<OrganizationRow>`
    select network, owner_account, recipient_account, covenant_max_payment_satoshis,
      covenant_max_fee_satoshis, created_at from optn_organizations
    where network = ${network}
  `;
  const row = rows[0];
  if (!row) return null;
  return toOrganization(row, await listOrganizationMembers(network));
}

export async function bootstrapOrganization(args: {
  network: Network;
  ownerAccount: string;
}): Promise<{ organization: Organization; created: boolean }> {
  const db = await sql();
  const inserted = await db<OrganizationRow>`
    insert into optn_organizations (network, owner_account)
    values (${args.network}, ${args.ownerAccount})
    on conflict (network) do nothing
    returning network, owner_account, recipient_account, covenant_max_payment_satoshis,
      covenant_max_fee_satoshis, created_at
  `;
  const created = Boolean(inserted[0]);
  if (created) {
    await db`
      insert into optn_org_members (network, account, role, added_by)
      values (${args.network}, ${args.ownerAccount}, 'owner', ${args.ownerAccount})
    `;
  }
  const organization = await getOrganization(args.network);
  if (!organization) throw new Error("Organization bootstrap did not persist");
  return { organization, created };
}

export async function roleForOrganizationAccount(account: string, network: Network): Promise<Role> {
  const organization = await getOrganization(network);
  if (!organization) return "viewer";
  return organization.members.find((member) => member.account === account)?.role ?? "viewer";
}

export async function createOrganizationInvite(args: {
  id: string;
  network: Network;
  kind: OrganizationInviteKind;
  createdBy: string;
  expiresAt: string;
}): Promise<{ id: string; code: string; expiresAt: string }> {
  const db = await sql();
  const code = inviteCode();
  await db`
    insert into optn_org_invites (id, network, kind, code_hash, created_by, expires_at)
    values (
      ${args.id}, ${args.network}, ${args.kind}, ${utf8Sha256Hex(code)},
      ${args.createdBy}, ${args.expiresAt}
    )
  `;
  return { id: args.id, code, expiresAt: args.expiresAt };
}

export async function redeemOrganizationInvite(args: {
  code: string;
  account: string;
  network: Network;
}): Promise<{ organization: Organization; kind: OrganizationInviteKind }> {
  const db = await sql();
  const claimed = await db<{ network: Network; kind: OrganizationInviteKind; created_by: string }>`
    update optn_org_invites
    set accepted_by = ${args.account}, accepted_at = now()
    where code_hash = ${utf8Sha256Hex(args.code)}
      and network = ${args.network}
      and accepted_at is null
      and expires_at > now()
    returning network, kind, created_by
  `;
  const invite = claimed[0];
  if (!invite) throw new Error("Invitation is invalid, expired, or already accepted");
  if (invite.kind === "recipient") {
    await db`
      update optn_organizations set recipient_account = ${args.account}, updated_at = now()
      where network = ${args.network}
    `;
  } else {
    await db`
      insert into optn_org_members (network, account, role, added_by)
      values (${args.network}, ${args.account}, ${invite.kind}, ${invite.created_by})
      on conflict (network, account) do update set role = excluded.role, added_by = excluded.added_by
    `;
  }
  const organization = await getOrganization(args.network);
  if (!organization) throw new Error("Organization is unavailable");
  return { organization, kind: invite.kind };
}

export async function setOrganizationRecipient(args: {
  network: Network;
  ownerAccount: string;
  recipientAccount: string;
}): Promise<Organization> {
  const db = await sql();
  const updated = await db<OrganizationRow>`
    update optn_organizations
    set recipient_account = ${args.recipientAccount}, updated_at = now()
    where network = ${args.network} and owner_account = ${args.ownerAccount}
    returning network, owner_account, recipient_account, covenant_max_payment_satoshis,
      covenant_max_fee_satoshis, created_at
  `;
  if (!updated[0]) throw new Error("Organization ownership could not be verified");
  const organization = await getOrganization(args.network);
  if (!organization) throw new Error("Organization is unavailable");
  return organization;
}

export async function setOrganizationCovenantBlueprint(args: {
  network: Network;
  ownerAccount: string;
  maxPaymentSatoshis: string;
  maxFeeSatoshis: string;
}): Promise<Organization> {
  const db = await sql();
  const updated = await db<OrganizationRow>`
    update optn_organizations
    set covenant_max_payment_satoshis = ${args.maxPaymentSatoshis},
      covenant_max_fee_satoshis = ${args.maxFeeSatoshis}, updated_at = now()
    where network = ${args.network} and owner_account = ${args.ownerAccount}
    returning network, owner_account, recipient_account, covenant_max_payment_satoshis,
      covenant_max_fee_satoshis, created_at
  `;
  if (!updated[0]) throw new Error("Organization ownership could not be verified");
  const organization = await getOrganization(args.network);
  if (!organization) throw new Error("Organization is unavailable");
  return organization;
}

export async function updateSessionRole(id: string, role: OperatorSession["role"]): Promise<void> {
  const db = await sql();
  await db`update optn_sessions set role = ${role}, last_seen_at = now() where id = ${id}`;
}

export function newId(prefix: string): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return `${prefix}-${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}

export async function audit(args: {
  network: Network;
  type: string;
  actor: string;
  objectType: AuditEvent["objectType"];
  objectId: string;
  correlationId: string;
  summary: string;
  evidence?: EvidenceLevel;
  detail?: Record<string, string>;
}) {
  return appendAudit({
    network: args.network,
    type: args.type,
    actor: args.actor,
    objectType: args.objectType,
    objectId: args.objectId,
    correlationId: args.correlationId,
    summary: args.summary,
    evidence: args.evidence ?? "DESIGNED",
    at: new Date().toISOString(),
    detail: args.detail ?? {},
  });
}

export type { Json };
