import { r as createServerFn, t as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { b as hexToBin, h as sha256, r as createVirtualMachineBCH, s as decodeTransaction, v as binToHex } from "../_libs/bitauth__libauth.mjs";
import { C as detectLockingType, F as signBchMessage, I as testVectorPrivateKey, L as txidFromEncoded, M as reviewedBoundedRelease, N as roleForAccount, O as lockingBytecodeHexFromAddress, R as utf8Sha256Hex, S as defaultDirectPaymentRoute, _ as buildBoundedReleaseArtifact, a as MAX_FEE_SATS, d as addressFromLockingBytecode, f as assertArtifactMatchesLock, i as IDENTITIES, j as pkhFromP2pkhLock, k as parseSatoshis, l as TEST_VECTOR_INDEX, o as NETWORK_CONFIG, r as EMPTY_TOKEN, v as canonicalJson, y as chainIdFor, z as verifyBchMessageAddress } from "./artifacts-lsD7QsAY.mjs";
import { a as demoOperatorUtxos, c as demoVaultUtxo, d as hashPolicy, f as loginMessage, i as buildCanonicalIntent, l as emptyAuditGenesis, n as SEQUENCE_ENABLE_LOCKTIME, o as demoPlan, r as approvalMessage, s as demoVault, t as SCENARIOS, u as hashIntent } from "./fixtures-CzelxbGa.mjs";
import { t as buildSignTransactionParams } from "./wallet-connect-DL5SDlMt.mjs";
import { c as previewTransition, l as signVaultRelease, n as buildUnsignedVaultRelease, o as executableStudioRules, r as compileExecutableStudio, s as explainDecision, t as assertPlanMatchesVaultArtifact, u as signedMatchesIntent } from "./tx-builder-D7rh_VTV.mjs";
import { r as assertTransition } from "./lifecycle-DdjHZIfU.mjs";
import { a as number, c as string, n as array, o as object, r as boolean, s as record, t as _enum } from "../_libs/zod.mjs";
import { n as $05743633fea447d4$export$25b4633f61498e1, t as $558b46d3f899ced5$export$2e2bcd8739ae039 } from "../_libs/@electrum-cash/network.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-D5ZEEYuc.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function env$1(name) {
	if (typeof process === "undefined") return void 0;
	const value = process.env[name];
	return value && value.trim() ? value.trim() : void 0;
}
function readNetwork() {
	return env$1("APP_NETWORK") === "mainnet" ? "mainnet" : "chipnet";
}
function mainnetEnabled() {
	return env$1("ENABLE_MAINNET") === "true";
}
function walletConnectProjectId() {
	return env$1("VITE_WALLETCONNECT_PROJECT_ID") ?? env$1("WALLETCONNECT_PROJECT_ID") ?? null;
}
function indexerUrl(network) {
	if (network === "mainnet") return env$1("MAINNET_INDEXER_URL") ?? null;
	return env$1("CHIPNET_INDEXER_URL") ?? null;
}
function broadcastUrl(network) {
	if (network === "mainnet") return env$1("MAINNET_BROADCAST_URL") ?? env$1("MAINNET_INDEXER_URL") ?? null;
	return env$1("CHIPNET_BROADCAST_URL") ?? env$1("CHIPNET_INDEXER_URL") ?? null;
}
function resolveMode(network) {
	if (network === "mainnet") return mainnetEnabled() ? "mainnet-live" : "demo";
	return Boolean(walletConnectProjectId() || indexerUrl("chipnet")) ? "chipnet-live" : "demo";
}
function publicConfig() {
	const network = readNetwork();
	const mode = resolveMode(network);
	const wc = walletConnectProjectId();
	const idx = Boolean(indexerUrl(network));
	const bcast = Boolean(broadcastUrl(network));
	const liveEnv = Boolean(wc) && Boolean(idx) && Boolean(bcast) && (network !== "mainnet" || mainnetEnabled());
	const unavailable = [];
	if (!wc) unavailable.push("WalletConnect project id is not configured");
	if (!idx) unavailable.push("Chain provider is not configured");
	if (!bcast) unavailable.push("Broadcast provider is not configured");
	if (network === "mainnet" && !mainnetEnabled()) unavailable.push("Mainnet is gated behind ENABLE_MAINNET");
	return {
		appName: "OPTN Dashboard",
		network,
		mode,
		mainnetEnabled: mainnetEnabled(),
		mainnetDisabledReason: mainnetEnabled() ? null : "Mainnet is an isolated opt-in network. ENABLE_MAINNET is false.",
		walletConnectConfigured: Boolean(wc),
		walletConnectProjectId: wc,
		walletConnectChainId: NETWORK_CONFIG[network].walletConnectChainId,
		indexerConfigured: idx,
		broadcastConfigured: bcast,
		liveSpendAvailable: liveEnv,
		unavailable
	};
}
var _0002_optn_default = "-- OPTN control-plane persistence. Rows are application objects (plans, vaults,\n-- proposals, audit). Access is gated by the dashboard's own WalletConnect /\n-- demo session, not platform auth. No private keys or seeds are stored.\n\ncreate table if not exists optn_sessions (\n  id            text primary key,\n  network       text not null,\n  account       text not null,\n  role          text not null,\n  mode          text not null,\n  origin        text not null,\n  created_at    timestamptz not null default now(),\n  expires_at    timestamptz not null,\n  last_seen_at  timestamptz not null default now()\n);\n\ncreate table if not exists optn_challenges (\n  id            text primary key,\n  network       text not null,\n  account       text not null,\n  origin        text not null,\n  nonce         text not null unique,\n  message       text not null,\n  purpose       text not null,\n  created_at    timestamptz not null default now(),\n  expires_at    timestamptz not null,\n  consumed_at   timestamptz\n);\n\ncreate table if not exists optn_vaults (\n  id            text primary key,\n  network       text not null,\n  payload       jsonb not null,\n  updated_at    timestamptz not null default now()\n);\n\ncreate table if not exists optn_plans (\n  id            text primary key,\n  network       text not null,\n  payload       jsonb not null,\n  updated_at    timestamptz not null default now()\n);\n\ncreate table if not exists optn_proposals (\n  id            text primary key,\n  network       text not null,\n  payload       jsonb not null,\n  updated_at    timestamptz not null default now()\n);\n\ncreate table if not exists optn_audit (\n  id            text primary key,\n  network       text not null,\n  seq           bigint not null,\n  prev_hash     text not null,\n  event_hash    text not null,\n  payload       jsonb not null,\n  created_at    timestamptz not null default now()\n);\n\ncreate index if not exists optn_audit_network_seq_idx on optn_audit (network, seq);\ncreate index if not exists optn_proposals_network_idx on optn_proposals (network);\ncreate index if not exists optn_plans_network_idx on optn_plans (network);\n\ncreate table if not exists optn_idempotency (\n  key           text primary key,\n  network       text not null,\n  result        jsonb not null,\n  created_at    timestamptz not null default now()\n);\n\ncreate table if not exists optn_meta (\n  key           text primary key,\n  value         text not null\n);\n";
var _0003_optn_mvp_default = "-- Immutable plan versions, outpoint reservations, and session auth method.\n-- Demo and live rows stay network-keyed. No keys or seeds are stored.\n\nalter table optn_sessions\n  add column if not exists auth_method text not null default 'demo';\n\ncreate table if not exists optn_plan_versions (\n  id            text not null,\n  version       integer not null,\n  network       text not null,\n  payload       jsonb not null,\n  created_at    timestamptz not null default now(),\n  primary key (id, version)\n);\n\ncreate table if not exists optn_reservations (\n  network       text not null,\n  txid          text not null,\n  vout          integer not null,\n  proposal_id   text not null,\n  status        text not null,\n  created_at    timestamptz not null default now(),\n  primary key (network, txid, vout)\n);\n\ncreate unique index if not exists optn_reservations_active_idx\n  on optn_reservations (network, txid, vout)\n  where status = 'reserved';\n\ncreate table if not exists optn_broadcast_locks (\n  proposal_id   text primary key,\n  txid          text,\n  created_at    timestamptz not null default now()\n);\n";
var _0004_optn_organization_default = "-- WalletConnect-derived organization membership. Account addresses are only\n-- accepted after the wallet proves control with the normal BCH login message.\n-- Invitation bearer codes are stored hashed; no private keys or mnemonics are\n-- ever persisted.\n\ncreate table if not exists optn_organizations (\n  network             text primary key,\n  owner_account       text not null,\n  recipient_account   text,\n  created_at          timestamptz not null default now(),\n  updated_at          timestamptz not null default now()\n);\n\ncreate table if not exists optn_org_members (\n  network             text not null,\n  account             text not null,\n  role                text not null,\n  added_by            text not null,\n  created_at          timestamptz not null default now(),\n  primary key (network, account)\n);\n\ncreate table if not exists optn_org_invites (\n  id                  text primary key,\n  network             text not null,\n  kind                text not null,\n  code_hash           text not null unique,\n  created_by          text not null,\n  expires_at          timestamptz not null,\n  accepted_by         text,\n  accepted_at         timestamptz,\n  created_at          timestamptz not null default now()\n);\n\ncreate index if not exists optn_org_invites_active_idx\n  on optn_org_invites (network, expires_at)\n  where accepted_at is null;\n";
var _0005_optn_covenant_blueprint_default = "-- Editable reviewed inputs for the next BoundedRelease vault. Existing vaults\n-- retain their own constructor values and are never changed by this row.\nalter table optn_organizations\n  add column if not exists covenant_max_payment_satoshis text,\n  add column if not exists covenant_max_fee_satoshis text;\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/_8.mjs");
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/_6.mjs");
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({
			"/migrations/0002_optn.sql": _0002_optn_default,
			"/migrations/0003_optn_mvp.sql": _0003_optn_mvp_default,
			"/migrations/0004_optn_organization.sql": _0004_optn_organization_default,
			"/migrations/0005_optn_covenant_blueprint.sql": _0005_optn_covenant_blueprint_default
		});
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
function reservationConflict(existing, proposalId) {
	if (!existing) return { ok: true };
	if (existing.status === "spent") return {
		ok: false,
		holder: existing.proposalId
	};
	if (existing.status === "reserved" && existing.proposalId !== proposalId) return {
		ok: false,
		holder: existing.proposalId
	};
	return { ok: true };
}
async function sql() {
	return getSql();
}
var seeded = false;
async function ensureSeeded() {
	if (seeded) return;
	if (publicConfig().mode !== "demo") {
		seeded = true;
		return;
	}
	const db = await sql();
	if (((await db`select count(*)::int as n from optn_plans`)[0]?.n ?? 0) === 0) {
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
function includeFixtureRows() {
	return publicConfig().mode === "demo";
}
function visibleVault(vault) {
	return includeFixtureRows() || vault.id !== "vault-acme-treasury" && !vault.evidence.includes("FIXTURE");
}
function visiblePlan(plan) {
	return includeFixtureRows() || plan.id !== "plan-acme-q3" && plan.sourceVaultId !== "vault-acme-treasury";
}
function visibleProposal(proposal) {
	return includeFixtureRows() || proposal.planId !== "plan-acme-q3";
}
function visibleAudit(event) {
	return includeFixtureRows() || event.evidence !== "FIXTURE";
}
async function listVaults(network) {
	await ensureSeeded();
	return (await (await sql())`
    select payload from optn_vaults where network = ${network} order by id
  `).map((row) => row.payload).filter(visibleVault);
}
async function getVault(id, network) {
	await ensureSeeded();
	const db = await sql();
	const vault = (network ? await db`
        select payload from optn_vaults where id = ${id} and network = ${network}
      ` : await db`
        select payload from optn_vaults where id = ${id}
      `)[0]?.payload ?? null;
	return vault && visibleVault(vault) ? vault : null;
}
async function putVault(vault) {
	await (await sql())`
    insert into optn_vaults (id, network, payload, updated_at)
    values (${vault.id}, ${vault.network}, ${JSON.stringify(vault)}::jsonb, now())
    on conflict (id) do update set payload = excluded.payload, updated_at = now()
  `;
	return vault;
}
async function listPlans(network) {
	await ensureSeeded();
	return (await (await sql())`
    select payload from optn_plans where network = ${network} order by id
  `).map((row) => row.payload).filter(visiblePlan);
}
async function getPlan(id, network) {
	await ensureSeeded();
	const db = await sql();
	const plan = (network ? await db`
        select payload from optn_plans where id = ${id} and network = ${network}
      ` : await db`
        select payload from optn_plans where id = ${id}
      `)[0]?.payload ?? null;
	return plan && visiblePlan(plan) ? plan : null;
}
async function putPlan(plan) {
	await (await sql())`
    insert into optn_plans (id, network, payload, updated_at)
    values (${plan.id}, ${plan.network}, ${JSON.stringify(plan)}::jsonb, now())
    on conflict (id) do update set payload = excluded.payload, updated_at = now()
  `;
	return plan;
}
async function snapshotPlanVersion(plan) {
	await (await sql())`
    insert into optn_plan_versions (id, version, network, payload)
    values (${plan.id}, ${plan.version}, ${plan.network}, ${JSON.stringify(plan)}::jsonb)
    on conflict (id, version) do nothing
  `;
}
async function getPlanVersion(id, version) {
	const plan = (await (await sql())`
    select payload from optn_plan_versions where id = ${id} and version = ${version}
  `)[0]?.payload ?? null;
	return plan && visiblePlan(plan) ? plan : null;
}
async function tryReserveOutpoint(args) {
	const db = await sql();
	const row = (await db`
    select proposal_id, status from optn_reservations
    where network = ${args.network} and txid = ${args.txid.toLowerCase()} and vout = ${args.vout}
  `)[0];
	const conflict = reservationConflict(row ? {
		proposalId: row.proposal_id,
		status: row.status
	} : null, args.proposalId);
	if (!conflict.ok) return conflict;
	await db`
    insert into optn_reservations (network, txid, vout, proposal_id, status)
    values (${args.network}, ${args.txid.toLowerCase()}, ${args.vout}, ${args.proposalId}, 'reserved')
    on conflict (network, txid, vout) do update
      set proposal_id = excluded.proposal_id, status = 'reserved'
      where optn_reservations.status <> 'spent'
        and (optn_reservations.proposal_id = ${args.proposalId} or optn_reservations.status <> 'reserved')
  `;
	const confirm = await db`
    select proposal_id, status from optn_reservations
    where network = ${args.network} and txid = ${args.txid.toLowerCase()} and vout = ${args.vout}
  `;
	if (confirm[0]?.proposal_id === args.proposalId && confirm[0]?.status === "reserved") return { ok: true };
	return {
		ok: false,
		holder: confirm[0]?.proposal_id ?? "unknown"
	};
}
async function releaseOutpoint(network, txid, vout, proposalId) {
	await (await sql())`
    delete from optn_reservations
    where network = ${network} and txid = ${txid.toLowerCase()} and vout = ${vout}
      and proposal_id = ${proposalId} and status = 'reserved'
  `;
}
async function markOutpointSpent(network, txid, vout, proposalId) {
	await (await sql())`
    update optn_reservations set status = 'spent'
    where network = ${network} and txid = ${txid.toLowerCase()} and vout = ${vout} and proposal_id = ${proposalId}
  `;
}
async function acquireBroadcastLock(proposalId) {
	const rows = await (await sql())`
    insert into optn_broadcast_locks (proposal_id)
    values (${proposalId})
    on conflict (proposal_id) do nothing
    returning proposal_id
  `;
	return Boolean(rows[0]);
}
async function getBroadcastLock(proposalId) {
	const row = (await (await sql())`
    select proposal_id, txid from optn_broadcast_locks where proposal_id = ${proposalId}
  `)[0];
	if (!row) return null;
	return {
		proposalId: row.proposal_id,
		txid: row.txid
	};
}
async function setBroadcastLockTxid(proposalId, txid) {
	await (await sql())`
    update optn_broadcast_locks set txid = ${txid} where proposal_id = ${proposalId}
  `;
}
async function releaseBroadcastLock(proposalId) {
	await (await sql())`
    delete from optn_broadcast_locks where proposal_id = ${proposalId} and txid is null
  `;
}
async function listProposals(network) {
	await ensureSeeded();
	return (await (await sql())`
    select payload from optn_proposals where network = ${network} order by id
  `).map((row) => row.payload).filter(visibleProposal);
}
async function getProposal(id, network) {
	await ensureSeeded();
	const db = await sql();
	const proposal = (network ? await db`
        select payload from optn_proposals where id = ${id} and network = ${network}
      ` : await db`
        select payload from optn_proposals where id = ${id}
      `)[0]?.payload ?? null;
	return proposal && visibleProposal(proposal) ? proposal : null;
}
async function putProposal(proposal) {
	await (await sql())`
    insert into optn_proposals (id, network, payload, updated_at)
    values (${proposal.id}, ${proposal.network}, ${JSON.stringify(proposal)}::jsonb, now())
    on conflict (id) do update set payload = excluded.payload, updated_at = now()
  `;
	return proposal;
}
async function deleteProposal(id, network) {
	await (await sql())`delete from optn_proposals where id = ${id} and network = ${network}`;
}
async function appendAudit(event) {
	await ensureSeeded();
	const db = await sql();
	const latest = await db`
    select seq, event_hash from optn_audit where network = ${event.network} order by seq desc limit 1
  `;
	const prevHash = latest[0]?.event_hash ?? "0".repeat(64);
	const seq = (latest[0]?.seq ?? 0) + 1;
	const id = `audit-${seq}`;
	const eventHash = utf8Sha256Hex(canonicalJson({
		prevHash,
		seq,
		...event
	}));
	const record = {
		...event,
		id,
		seq,
		prevHash,
		eventHash
	};
	await db`
    insert into optn_audit (id, network, seq, prev_hash, event_hash, payload)
    values (${id}, ${record.network}, ${seq}, ${prevHash}, ${eventHash}, ${JSON.stringify(record)}::jsonb)
  `;
	return record;
}
async function listAudit(network, limit = 80) {
	await ensureSeeded();
	return (await (await sql())`
    select payload from optn_audit where network = ${network} order by seq desc limit ${limit}
  `).map((row) => row.payload).filter(visibleAudit);
}
async function getIdempotent(key, network) {
	const db = await sql();
	return (network ? await db`select result from optn_idempotency where key = ${key} and network = ${network}` : await db`select result from optn_idempotency where key = ${key}`)[0]?.result ?? null;
}
async function putIdempotent(key, network, result) {
	const db = await sql();
	const inserted = await db`
    insert into optn_idempotency (key, network, result)
    values (${key}, ${network}, ${JSON.stringify(result)}::jsonb)
    on conflict (key) do nothing
    returning result
  `;
	if (inserted[0]) return inserted[0].result;
	const existing = await db`
    select network, result from optn_idempotency where key = ${key}
  `;
	if (existing[0]?.network !== network) throw new Error("Idempotency key is already used on another network");
	return existing[0]?.result ?? result;
}
async function saveChallenge(row) {
	await (await sql())`
    insert into optn_challenges (id, network, account, origin, nonce, message, purpose, expires_at)
    values (${row.id}, ${row.network}, ${row.account}, ${row.origin}, ${row.nonce}, ${row.message}, ${row.purpose}, ${row.expiresAt})
  `;
}
async function consumeChallenge(nonce) {
	const db = await sql();
	const claimed = await db`
    update optn_challenges
    set consumed_at = now()
    where nonce = ${nonce} and consumed_at is null
    returning *
  `;
	if (claimed[0]) return {
		...claimed[0],
		reused: false
	};
	const row = (await db`select * from optn_challenges where nonce = ${nonce}`)[0];
	if (!row) return null;
	return {
		...row,
		reused: true
	};
}
async function saveSession(session) {
	await (await sql())`
    insert into optn_sessions (id, network, account, role, mode, origin, created_at, expires_at, auth_method)
    values (
      ${session.id}, ${session.network}, ${session.account}, ${session.role},
      ${session.mode}, ${session.origin}, ${session.createdAt}, ${session.expiresAt}, ${session.authMethod}
    )
    on conflict (id) do update set last_seen_at = now(), auth_method = excluded.auth_method
  `;
}
async function getSession(id) {
	const row = (await (await sql())`select * from optn_sessions where id = ${id}`)[0];
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
		authMethod: row.auth_method === "walletconnect" ? "walletconnect" : "demo"
	};
}
async function deleteSession(id) {
	await (await sql())`delete from optn_sessions where id = ${id}`;
}
function inviteCode() {
	const bytes = /* @__PURE__ */ new Uint8Array(32);
	crypto.getRandomValues(bytes);
	return `optn-invite-${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}
function toOrganization(row, members) {
	return {
		network: row.network,
		ownerAccount: row.owner_account,
		recipientAccount: row.recipient_account,
		covenantMaxPaymentSatoshis: row.covenant_max_payment_satoshis,
		covenantMaxFeeSatoshis: row.covenant_max_fee_satoshis,
		members,
		createdAt: row.created_at
	};
}
async function listOrganizationMembers(network) {
	return (await (await sql())`
    select account, role, added_by, created_at from optn_org_members
    where network = ${network} order by created_at asc, account asc
  `).map((row) => ({
		account: row.account,
		role: row.role,
		addedBy: row.added_by,
		addedAt: row.created_at
	}));
}
async function getOrganization(network) {
	const row = (await (await sql())`
    select network, owner_account, recipient_account, covenant_max_payment_satoshis,
      covenant_max_fee_satoshis, created_at from optn_organizations
    where network = ${network}
  `)[0];
	if (!row) return null;
	return toOrganization(row, await listOrganizationMembers(network));
}
async function bootstrapOrganization$1(args) {
	const db = await sql();
	const inserted = await db`
    insert into optn_organizations (network, owner_account)
    values (${args.network}, ${args.ownerAccount})
    on conflict (network) do nothing
    returning network, owner_account, recipient_account, covenant_max_payment_satoshis,
      covenant_max_fee_satoshis, created_at
  `;
	const created = Boolean(inserted[0]);
	if (created) await db`
      insert into optn_org_members (network, account, role, added_by)
      values (${args.network}, ${args.ownerAccount}, 'owner', ${args.ownerAccount})
    `;
	const organization = await getOrganization(args.network);
	if (!organization) throw new Error("Organization bootstrap did not persist");
	return {
		organization,
		created
	};
}
async function roleForOrganizationAccount(account, network) {
	const organization = await getOrganization(network);
	if (!organization) return "viewer";
	return organization.members.find((member) => member.account === account)?.role ?? "viewer";
}
async function createOrganizationInvite(args) {
	const db = await sql();
	const code = inviteCode();
	await db`
    insert into optn_org_invites (id, network, kind, code_hash, created_by, expires_at)
    values (
      ${args.id}, ${args.network}, ${args.kind}, ${utf8Sha256Hex(code)},
      ${args.createdBy}, ${args.expiresAt}
    )
  `;
	return {
		id: args.id,
		code,
		expiresAt: args.expiresAt
	};
}
async function redeemOrganizationInvite$1(args) {
	const db = await sql();
	const invite = (await db`
    update optn_org_invites
    set accepted_by = ${args.account}, accepted_at = now()
    where code_hash = ${utf8Sha256Hex(args.code)}
      and network = ${args.network}
      and accepted_at is null
      and expires_at > now()
    returning network, kind, created_by
  `)[0];
	if (!invite) throw new Error("Invitation is invalid, expired, or already accepted");
	if (invite.kind === "recipient") await db`
      update optn_organizations set recipient_account = ${args.account}, updated_at = now()
      where network = ${args.network}
    `;
	else await db`
      insert into optn_org_members (network, account, role, added_by)
      values (${args.network}, ${args.account}, ${invite.kind}, ${invite.created_by})
      on conflict (network, account) do update set role = excluded.role, added_by = excluded.added_by
    `;
	const organization = await getOrganization(args.network);
	if (!organization) throw new Error("Organization is unavailable");
	return {
		organization,
		kind: invite.kind
	};
}
async function setOrganizationRecipient(args) {
	if (!(await (await sql())`
    update optn_organizations
    set recipient_account = ${args.recipientAccount}, updated_at = now()
    where network = ${args.network} and owner_account = ${args.ownerAccount}
    returning network, owner_account, recipient_account, covenant_max_payment_satoshis,
      covenant_max_fee_satoshis, created_at
  `)[0]) throw new Error("Organization ownership could not be verified");
	const organization = await getOrganization(args.network);
	if (!organization) throw new Error("Organization is unavailable");
	return organization;
}
async function setOrganizationCovenantBlueprint(args) {
	if (!(await (await sql())`
    update optn_organizations
    set covenant_max_payment_satoshis = ${args.maxPaymentSatoshis},
      covenant_max_fee_satoshis = ${args.maxFeeSatoshis}, updated_at = now()
    where network = ${args.network} and owner_account = ${args.ownerAccount}
    returning network, owner_account, recipient_account, covenant_max_payment_satoshis,
      covenant_max_fee_satoshis, created_at
  `)[0]) throw new Error("Organization ownership could not be verified");
	const organization = await getOrganization(args.network);
	if (!organization) throw new Error("Organization is unavailable");
	return organization;
}
async function updateSessionRole(id, role) {
	await (await sql())`update optn_sessions set role = ${role}, last_seen_at = now() where id = ${id}`;
}
function newId(prefix) {
	const bytes = /* @__PURE__ */ new Uint8Array(8);
	crypto.getRandomValues(bytes);
	return `${prefix}-${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}
async function audit(args) {
	return appendAudit({
		network: args.network,
		type: args.type,
		actor: args.actor,
		objectType: args.objectType,
		objectId: args.objectId,
		correlationId: args.correlationId,
		summary: args.summary,
		evidence: args.evidence ?? "DESIGNED",
		at: (/* @__PURE__ */ new Date()).toISOString(),
		detail: args.detail ?? {}
	});
}
/**
* Organization authority is derived from WalletConnect-authenticated BCH
* accounts and persisted in the control-plane store. Environment variables are
* intentionally not an authority source.
*/
async function organizationForNetwork(network) {
	return getOrganization(network);
}
async function roleForOrgAccount(account, network) {
	if (publicConfig().mode === "demo") return roleForAccount(account, network);
	return roleForOrganizationAccount(account, network);
}
function pkhForAccount(account) {
	try {
		return pkhFromP2pkhLock(lockingBytecodeHexFromAddress(account));
	} catch {
		return null;
	}
}
function env(name) {
	if (typeof process === "undefined") return void 0;
	const value = process.env[name];
	return value && value.trim() ? value.trim() : void 0;
}
function originAllowlist() {
	return (env("OPTN_ORIGIN_ALLOWLIST") ?? "").split(",").map((item) => item.trim().replace(/\/$/, "")).filter(Boolean);
}
function originFromHeaders(headers) {
	const allowlist = originAllowlist();
	const explicit = headers.get("origin")?.trim();
	const forwardedHost = headers.get("x-forwarded-host")?.split(",")[0]?.trim();
	const forwardedProto = headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
	const host = headers.get("host")?.trim();
	const referer = headers.get("referer")?.trim();
	let derived = null;
	if (explicit) try {
		derived = new URL(explicit).origin;
	} catch {
		derived = null;
	}
	else if (forwardedHost) derived = `${forwardedProto === "https" ? "https" : "http"}://${forwardedHost}`;
	else if (host) derived = `${forwardedProto === "https" || host.includes("localhost") === false ? forwardedProto ?? "http" : "http"}://${host}`;
	else if (referer) try {
		derived = new URL(referer).origin;
	} catch {
		derived = null;
	}
	if (!derived) throw new Error("Cannot derive a trusted dashboard origin from request headers");
	derived = derived.replace(/\/$/, "");
	if (allowlist.length > 0 && !allowlist.includes(derived)) throw new Error(`Origin ${derived} is not on the dashboard allowlist`);
	return derived;
}
async function requestOrigin() {
	const { getRequestHeaders } = await import("../_libs/_.mjs").then((n) => n.t);
	return originFromHeaders(getRequestHeaders());
}
async function liveOrganization(network) {
	const organization = await organizationForNetwork(network);
	if (!organization) throw new Error("Create a WalletConnect organization before preparing a covenant");
	if (!organization.recipientAccount) throw new Error("Enroll a payout recipient wallet before preparing a covenant");
	const operatorPkh = pkhForAccount(organization.ownerAccount);
	if (!operatorPkh) throw new Error("Organization owner account is not a valid BCH P2PKH account");
	return {
		organization,
		operatorPkh
	};
}
async function liveBoundedReleaseArtifact(network) {
	if (publicConfig().mode === "demo") return reviewedBoundedRelease;
	const { organization, operatorPkh } = await liveOrganization(network);
	return buildBoundedReleaseArtifact({
		operatorPkhHex: operatorPkh,
		recipientLockingBytecodeHex: lockingBytecodeHexFromAddress(organization.recipientAccount),
		maxPaymentSatoshis: organization.covenantMaxPaymentSatoshis ?? "5000000",
		maxFeeSatoshis: organization.covenantMaxFeeSatoshis ?? "2000"
	}, network);
}
function verifyTransactionVm(args) {
	try {
		const decoded = decodeTransaction(hexToBin(args.rawTxHex));
		if (typeof decoded === "string") return {
			attempted: true,
			valid: false,
			error: decoded,
			profile: "bch-2023-standard"
		};
		const result = createVirtualMachineBCH(args.standard ?? true).verify({
			transaction: decoded,
			sourceOutputs: args.sourceOutputs.map((output) => ({
				lockingBytecode: hexToBin(output.lockingBytecodeHex),
				valueSatoshis: parseSatoshis(output.valueSatoshis)
			}))
		});
		if (result === true) return {
			attempted: true,
			valid: true,
			error: null,
			profile: "bch-2023-standard"
		};
		return {
			attempted: true,
			valid: false,
			error: typeof result === "string" ? result : "VM rejected the transaction",
			profile: "bch-2023-standard"
		};
	} catch (error) {
		return {
			attempted: true,
			valid: false,
			error: error instanceof Error ? error.message : "VM verification failed",
			profile: "bch-2023-standard"
		};
	}
}
/**
* Server-only secp256k1 test-vector scalars (1..6). These are not wallet seeds
* and are never returned by the API, written to fixtures JSON, or logged.
* Used solely so demo login/approval and local VM tests share the real
* signature verification path.
*/
function demoPrivateKeyForAccount(account) {
	const entry = Object.entries(IDENTITIES).find(([, identity]) => identity.account === account);
	if (!entry) return null;
	const index = TEST_VECTOR_INDEX[entry[0]];
	return testVectorPrivateKey(index);
}
var ALL = [
	"plan.read",
	"vault.read",
	"proposal.create",
	"proposal.explain",
	"proposal.request_approval",
	"transaction.build",
	"transaction.verify",
	"transaction.broadcast"
];
function capabilitiesFor(role, config) {
	const signedIn = Boolean(role);
	const canMutate = role === "owner" || role === "operator" || role === "approver";
	const canPropose = role === "owner" || role === "operator";
	return ALL.map((id) => {
		if (!signedIn) return {
			id,
			granted: false,
			reason: "No authenticated operator session"
		};
		if (id === "plan.read" || id === "vault.read" || id === "proposal.explain") return {
			id,
			granted: true,
			reason: "Read access"
		};
		if (id === "proposal.create" || id === "proposal.request_approval") return {
			id,
			granted: canPropose,
			reason: canPropose ? "Operator may create bounded proposals" : "Role cannot create proposals"
		};
		if (id === "transaction.build" || id === "transaction.verify") return {
			id,
			granted: canMutate,
			reason: canMutate ? "Build and verify are available after approval" : "Role cannot build transactions"
		};
		return {
			id,
			granted: canPropose && config.broadcastConfigured && config.liveSpendAvailable,
			reason: config.broadcastConfigured ? config.liveSpendAvailable ? "Broadcast is a separate restricted capability" : "No live vault outpoint is attached" : "Broadcast provider is not configured; demo mode will not fake a Chipnet result"
		};
	});
}
function summarizeWallet(account, utxos) {
	return {
		account,
		balanceSatoshis: utxos.reduce((sum, utxo) => sum + parseSatoshis(utxo.valueSatoshis), 0n).toString(),
		utxoCount: utxos.length,
		tokenUtxoCount: utxos.filter((utxo) => utxo.token.categoryHex !== null).length,
		confirmedUtxoCount: utxos.filter((utxo) => utxo.confirmations > 0).length
	};
}
async function readWalletChainState(provider, network, account, allowFixtureData) {
	if (provider.kind === "fixture" && !allowFixtureData) return {
		utxos: [],
		wallet: null,
		walletError: "No live chain provider is configured; wallet balance and UTXOs are unavailable"
	};
	try {
		const utxos = provider.kind === "fixture" ? demoOperatorUtxos() : await provider.getUtxos(network, account);
		return {
			utxos,
			wallet: summarizeWallet(account, utxos),
			walletError: null
		};
	} catch (error) {
		return {
			utxos: [],
			wallet: null,
			walletError: error instanceof Error ? error.message : "Wallet chain lookup failed"
		};
	}
}
function keyOf(outpoint) {
	return `${outpoint.txid.toLowerCase()}:${outpoint.vout}`;
}
function rawTxBody(rawTxHex) {
	const bytes = hexToBin(rawTxHex);
	return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}
function parseChronikToken(output) {
	if (!("token" in output) || output.token === void 0) return {
		token: EMPTY_TOKEN,
		tokenEvidence: "unknown"
	};
	if (output.token === null) return {
		token: EMPTY_TOKEN,
		tokenEvidence: "provider-omitted"
	};
	const capability = output.token.nft?.capability ?? output.token.capability ?? "none";
	return {
		token: {
			categoryHex: output.token.tokenId ?? null,
			amount: String(output.token.amount ?? "0"),
			nftCapability: capability === "mutable" || capability === "minting" ? capability : "none",
			commitmentHex: output.token.nft?.commitment ?? output.token.commitment ?? null
		},
		tokenEvidence: "provider-reported"
	};
}
var FixtureChainProvider = class {
	kind = "fixture";
	spent = /* @__PURE__ */ new Set();
	broadcasts = /* @__PURE__ */ new Map();
	catalog() {
		return [demoVaultUtxo(), ...demoOperatorUtxos()];
	}
	async getSnapshot(network) {
		return {
			network,
			provider: "fixture",
			source: "deterministic fixture",
			reachable: false,
			height: null,
			serverVersion: null,
			genesisHash: null,
			latencyMs: null,
			checkedAt: (/* @__PURE__ */ new Date()).toISOString(),
			error: "No live chain provider is configured"
		};
	}
	async getRawTransaction(_network, txid) {
		return this.broadcasts.get(txid.toLowerCase()) ?? null;
	}
	async getTransactionOutput(network, outpoint) {
		const match = this.catalog().find((utxo) => utxo.network === network && utxo.outpoint.txid === outpoint.txid && utxo.outpoint.vout === outpoint.vout);
		if (!match) return null;
		const spent = this.spent.has(keyOf(outpoint));
		return {
			...match,
			spent,
			spentEvidence: spent ? "provider-spent" : match.spentEvidence,
			rawTxHex: null
		};
	}
	async proveUnspent(network, outpoint) {
		const observed = await this.getTransactionOutput(network, outpoint);
		if (!observed) throw new Error("Outpoint not found");
		if (observed.spent || observed.spentEvidence === "provider-spent") throw new Error("Outpoint is spent");
		if (observed.spentEvidence !== "provider-unspent" && observed.spentEvidence !== "fixture") throw new Error("Provider did not prove the outpoint is unspent");
		return observed;
	}
	async getUtxos(network, ownerOrLock) {
		return this.catalog().filter((utxo) => utxo.network === network).filter((utxo) => utxo.address === ownerOrLock || utxo.lockingBytecodeHex === ownerOrLock || ownerOrLock === "vault").map((utxo) => ({
			...utxo,
			spent: this.spent.has(keyOf(utxo.outpoint)),
			spentEvidence: this.spent.has(keyOf(utxo.outpoint)) ? "provider-spent" : utxo.spentEvidence
		}));
	}
	async getOutpoint(network, outpoint) {
		return this.getTransactionOutput(network, outpoint);
	}
	async getStatus(_network, txid) {
		if (this.broadcasts.has(txid.toLowerCase())) return {
			txid,
			kind: "unknown",
			mempool: false,
			confirmations: 0,
			confirmed: false,
			height: null,
			reason: "fixture-unbroadcastable"
		};
		return {
			txid,
			kind: "not-found",
			mempool: false,
			confirmations: 0,
			confirmed: false,
			height: null
		};
	}
	async preflight(network, rawTxHex) {
		try {
			const decoded = decodeTransaction(hexToBin(rawTxHex));
			if (typeof decoded === "string") return {
				ok: false,
				error: decoded
			};
			for (const input of decoded.inputs) {
				const txid = [...input.outpointTransactionHash].map((b) => b.toString(16).padStart(2, "0")).join("");
				try {
					await this.proveUnspent(network, {
						txid,
						vout: input.outpointIndex
					});
				} catch (error) {
					return {
						ok: false,
						error: error instanceof Error ? error.message : "Preflight failed"
					};
				}
			}
			return {
				ok: true,
				error: null
			};
		} catch (error) {
			return {
				ok: false,
				error: error instanceof Error ? error.message : "Preflight failed"
			};
		}
	}
	async broadcast() {
		throw new Error("Fixture provider refuses broadcast. Chipnet broadcast requires a configured provider.");
	}
	markSpent(outpoint) {
		this.spent.add(keyOf(outpoint));
	}
};
var ChronikChainProvider = class {
	kind = "chronik";
	baseUrl;
	broadcastBaseUrl;
	constructor(baseUrl, broadcastBaseUrl) {
		this.baseUrl = baseUrl;
		this.broadcastBaseUrl = broadcastBaseUrl;
	}
	url(path) {
		return `${this.baseUrl.replace(/\/$/, "")}${path}`;
	}
	async fetchJson(path) {
		const response = await fetch(this.url(path));
		const body = await response.json().catch(() => null);
		return {
			status: response.status,
			body
		};
	}
	async getSnapshot(network) {
		const started = Date.now();
		try {
			const { status, body } = await this.fetchJson("/blockchain-info");
			if (status !== 200) throw new Error(`Indexer returned ${status}`);
			const info = body;
			return {
				network,
				provider: "chronik",
				source: new URL(this.baseUrl).host,
				reachable: true,
				height: info.tipHeight ?? null,
				serverVersion: info.serverVersion ?? "Chronik-compatible",
				genesisHash: null,
				latencyMs: Date.now() - started,
				checkedAt: (/* @__PURE__ */ new Date()).toISOString(),
				error: null
			};
		} catch (error) {
			return {
				network,
				provider: "chronik",
				source: safeProviderLabel(this.baseUrl),
				reachable: false,
				height: null,
				serverVersion: null,
				genesisHash: null,
				latencyMs: Date.now() - started,
				checkedAt: (/* @__PURE__ */ new Date()).toISOString(),
				error: error instanceof Error ? error.message : "Indexer check failed"
			};
		}
	}
	async getRawTransaction(_network, txid) {
		for (const path of [`/raw-tx/${txid}`, `/tx/${txid}/raw`]) {
			const response = await fetch(this.url(path));
			if (response.status === 404) continue;
			if (!response.ok) continue;
			const hex = (await response.text()).replace(/"/g, "").trim();
			if (/^[0-9a-f]+$/i.test(hex) && hex.length > 20) return hex;
		}
		const { status, body } = await this.fetchJson(`/tx/${txid}`);
		if (status === 404) return null;
		if (status !== 200) throw new Error(`Indexer returned ${status}`);
		const tx = body;
		return tx.hex ?? tx.raw ?? null;
	}
	async getTransactionOutput(network, outpoint) {
		const { status, body } = await this.fetchJson(`/tx/${outpoint.txid}`);
		if (status === 404) return null;
		if (status !== 200) throw new Error(`Indexer returned ${status}`);
		const tx = body;
		const output = tx.outputs?.[outpoint.vout];
		if (!output) return null;
		const lockingBytecodeHex = output.outputScript ?? "";
		const parsed = !("token" in output) ? {
			token: EMPTY_TOKEN,
			tokenEvidence: "unknown"
		} : parseChronikToken(output);
		const spentBy = output.spentBy;
		const spent = Boolean(spentBy?.txid);
		return {
			network,
			outpoint,
			valueSatoshis: String(output.sats ?? "0"),
			lockingBytecodeHex,
			address: null,
			token: parsed.token,
			tokenEvidence: parsed.tokenEvidence,
			spent,
			spentEvidence: spent ? "provider-spent" : "unknown",
			confirmations: tx.block?.height ? 1 : 0,
			chainEvidence: "provider-observed",
			lockingType: detectLockingType(lockingBytecodeHex),
			rawTxHex: tx.hex ?? tx.raw ?? null,
			blockHeight: tx.block?.height ?? null
		};
	}
	scriptUtxoPath(lockingBytecodeHex) {
		const type = detectLockingType(lockingBytecodeHex);
		if (type === "p2pkh") return `/script/p2pkh/${lockingBytecodeHex.slice(6, 46)}/utxos`;
		if (type === "p2sh32") return `/script/p2sh32/${lockingBytecodeHex.slice(4, 68)}/utxos`;
		if (type === "p2sh20") return `/script/p2sh/${lockingBytecodeHex.slice(2, 42)}/utxos`;
		return `/script/other/${lockingBytecodeHex}/utxos`;
	}
	async proveUnspent(network, outpoint) {
		const observed = await this.getTransactionOutput(network, outpoint);
		if (!observed) throw new Error("Outpoint not found");
		if (observed.spentEvidence === "provider-spent") throw new Error("Outpoint is spent");
		const path = this.scriptUtxoPath(observed.lockingBytecodeHex);
		if (!path) throw new Error("Cannot query UTXO set for this locking type");
		const { status, body } = await this.fetchJson(path);
		if (status !== 200) throw new Error(`UTXO set lookup failed (${status})`);
		if (!(Array.isArray(body) ? body : body.utxos ?? []).some((row) => (row.outpoint?.txid ?? "").toLowerCase() === outpoint.txid.toLowerCase() && row.outpoint?.outIdx === outpoint.vout)) throw new Error("Outpoint exists in history but is not in the UTXO set");
		return {
			...observed,
			spent: false,
			spentEvidence: "provider-unspent"
		};
	}
	async getUtxos(network, ownerOrLock) {
		const lockingBytecodeHex = ownerOrLock.includes(":") ? lockingBytecodeHexFromAddress(ownerOrLock) : ownerOrLock;
		const path = this.scriptUtxoPath(lockingBytecodeHex);
		if (!path) return [];
		const { status, body } = await this.fetchJson(path);
		if (status !== 200) throw new Error(`Indexer returned ${status}`);
		return (Array.isArray(body) ? body : body.utxos ?? []).map((row) => {
			const parsed = "token" in row ? parseChronikToken(row) : {
				token: EMPTY_TOKEN,
				tokenEvidence: "unknown"
			};
			return {
				network,
				outpoint: {
					txid: row.outpoint?.txid ?? "",
					vout: row.outpoint?.outIdx ?? 0
				},
				valueSatoshis: String(row.sats ?? "0"),
				lockingBytecodeHex,
				address: ownerOrLock.includes(":") ? ownerOrLock : null,
				token: parsed.token,
				tokenEvidence: parsed.tokenEvidence,
				spent: false,
				spentEvidence: "provider-unspent",
				confirmations: 0,
				chainEvidence: "provider-observed",
				lockingType: detectLockingType(lockingBytecodeHex)
			};
		});
	}
	async getOutpoint(network, outpoint) {
		try {
			return await this.proveUnspent(network, outpoint);
		} catch {
			const observed = await this.getTransactionOutput(network, outpoint);
			if (!observed) return null;
			return {
				...observed,
				spent: true,
				spentEvidence: observed.spentEvidence === "provider-spent" ? "provider-spent" : "unknown"
			};
		}
	}
	async getStatus(_network, txid) {
		const { status, body } = await this.fetchJson(`/tx/${txid}`);
		if (status === 404) return {
			txid,
			kind: "not-found",
			mempool: false,
			confirmations: 0,
			confirmed: false,
			height: null
		};
		if (status !== 200) return {
			txid,
			kind: "unknown",
			mempool: false,
			confirmations: 0,
			confirmed: false,
			height: null,
			reason: `indexer ${status}`
		};
		const height = body.block?.height ?? null;
		if (height && height > 0) return {
			txid,
			kind: "confirmed",
			mempool: false,
			confirmations: 1,
			confirmed: true,
			height
		};
		return {
			txid,
			kind: "mempool",
			mempool: true,
			confirmations: 0,
			confirmed: false,
			height: null
		};
	}
	async preflight(network, rawTxHex) {
		try {
			const decoded = decodeTransaction(hexToBin(rawTxHex));
			if (typeof decoded === "string") return {
				ok: false,
				error: decoded
			};
			const binToHexLocal = (bin) => [...bin].map((b) => b.toString(16).padStart(2, "0")).join("");
			for (const input of decoded.inputs) try {
				await this.proveUnspent(network, {
					txid: binToHexLocal(input.outpointTransactionHash),
					vout: input.outpointIndex
				});
			} catch (error) {
				return {
					ok: false,
					error: error instanceof Error ? error.message : "Preflight failed"
				};
			}
			const validation = await fetch(this.url("/validate-tx"), {
				method: "POST",
				headers: { "content-type": "application/octet-stream" },
				body: rawTxBody(rawTxHex)
			});
			if (validation.status !== 404 && validation.status !== 405) {
				if (!validation.ok) {
					const text = await validation.text();
					return {
						ok: false,
						error: `Provider validation rejected: ${validation.status} ${text}`
					};
				}
				return {
					ok: true,
					error: null
				};
			}
			return {
				ok: true,
				error: null
			};
		} catch (error) {
			return {
				ok: false,
				error: error instanceof Error ? error.message : "Preflight failed"
			};
		}
	}
	async broadcast(_network, rawTxHex) {
		const base = (this.broadcastBaseUrl ?? this.baseUrl).replace(/\/$/, "");
		const paths = ["/broadcast-tx", "/tx"];
		for (const path of paths) {
			const response = await fetch(`${base}${path}`, {
				method: "POST",
				headers: { "content-type": "application/octet-stream" },
				body: rawTxBody(rawTxHex)
			});
			if (response.status === 404 && path !== paths.at(-1)) continue;
			if (!response.ok) {
				const text = await response.text();
				throw new Error(`Broadcast rejected: ${response.status} ${text}`);
			}
			return { txid: (await response.text()).replace(/"/g, "").trim() };
		}
		throw new Error("Broadcast endpoint was not found");
	}
};
var EXPECTED_GENESIS = {
	chipnet: "000000001dd410c49a788668ce26751718cc797474d3152a5fc073dd44fd9f7b",
	mainnet: "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f"
};
function parseElectrumEndpoint(value) {
	const trimmed = value.trim();
	const url = trimmed.includes("://") ? new URL(trimmed) : new URL(`wss://${trimmed}`);
	if (url.protocol !== "wss:" && url.protocol !== "ws:") throw new Error("Electrum endpoint must use wss:// (or ws:// on loopback)");
	const loopback = url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "::1";
	if (url.protocol === "ws:" && !loopback) throw new Error("Unencrypted Electrum WebSocket is allowed only on loopback");
	const port = Number(url.port || (url.protocol === "wss:" ? 50004 : 50003));
	if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid Electrum port");
	return {
		host: url.hostname,
		port,
		encrypted: url.protocol === "wss:",
		label: `${url.hostname}:${port}`
	};
}
function electrumScriptHash(lockingBytecodeHex) {
	return binToHex(sha256.hash(hexToBin(lockingBytecodeHex)).reverse());
}
function parseElectrumToken(token) {
	if (!token) return {
		token: EMPTY_TOKEN,
		tokenEvidence: "provider-reported"
	};
	const capability = token.nft?.capability;
	return {
		token: {
			categoryHex: token.category ?? null,
			amount: String(token.amount ?? "0"),
			nftCapability: capability === "mutable" || capability === "minting" ? capability : "none",
			commitmentHex: token.nft?.commitment ?? null
		},
		tokenEvidence: "provider-reported"
	};
}
function safeProviderLabel(value) {
	try {
		return new URL(value).host;
	} catch {
		return "configured provider";
	}
}
var ElectrumChainProvider = class {
	kind = "electrum";
	endpoint;
	constructor(endpoint) {
		this.endpoint = parseElectrumEndpoint(endpoint);
	}
	async request(method, ...parameters) {
		const socket = new $05743633fea447d4$export$25b4633f61498e1(this.endpoint.host, this.endpoint.port, this.endpoint.encrypted, 8e3);
		const client = new $558b46d3f899ced5$export$2e2bcd8739ae039("OPTN Dashboard", "1.4.1", socket);
		try {
			await client.connect();
			const result = await client.request(method, ...parameters);
			if (result instanceof Error) throw result;
			return result;
		} finally {
			await client.disconnect().catch(() => false);
		}
	}
	async getSnapshot(network) {
		const started = Date.now();
		try {
			const [header, features] = await Promise.all([this.request("blockchain.headers.subscribe"), this.request("server.features")]);
			const genesisHash = features.genesis_hash ?? null;
			if (genesisHash?.toLowerCase() !== EXPECTED_GENESIS[network]) throw new Error(`Provider genesis does not match ${network}`);
			return {
				network,
				provider: "electrum",
				source: this.endpoint.label,
				reachable: true,
				height: header.height ?? null,
				serverVersion: features.server_version ?? "Electrum",
				genesisHash,
				latencyMs: Date.now() - started,
				checkedAt: (/* @__PURE__ */ new Date()).toISOString(),
				error: null
			};
		} catch (error) {
			return {
				network,
				provider: "electrum",
				source: this.endpoint.label,
				reachable: false,
				height: null,
				serverVersion: null,
				genesisHash: null,
				latencyMs: Date.now() - started,
				checkedAt: (/* @__PURE__ */ new Date()).toISOString(),
				error: error instanceof Error ? error.message : "Electrum check failed"
			};
		}
	}
	async getRawTransaction(_network, txid) {
		try {
			return await this.request("blockchain.transaction.get", txid);
		} catch (error) {
			if (/not found|unknown transaction/i.test(error instanceof Error ? error.message : String(error))) return null;
			throw error;
		}
	}
	async getTransactionOutput(network, outpoint) {
		const rawTxHex = await this.getRawTransaction(network, outpoint.txid);
		if (!rawTxHex) return null;
		const decoded = decodeTransaction(hexToBin(rawTxHex));
		if (typeof decoded === "string") throw new Error(`Could not decode provider transaction: ${decoded}`);
		const output = decoded.outputs[outpoint.vout];
		if (!output) return null;
		const parsed = parseElectrumToken(output.token ? {
			category: binToHex(output.token.category),
			amount: output.token.amount.toString(),
			nft: output.token.nft ? {
				capability: output.token.nft.capability,
				commitment: binToHex(output.token.nft.commitment)
			} : void 0
		} : void 0);
		const status = await this.getStatus(network, outpoint.txid);
		const lockingBytecodeHex = binToHex(output.lockingBytecode);
		return {
			network,
			outpoint,
			valueSatoshis: output.valueSatoshis.toString(),
			lockingBytecodeHex,
			address: null,
			token: parsed.token,
			tokenEvidence: parsed.tokenEvidence,
			spent: false,
			spentEvidence: "unknown",
			confirmations: status.confirmations,
			chainEvidence: "provider-observed",
			lockingType: detectLockingType(lockingBytecodeHex),
			rawTxHex,
			blockHeight: status.height
		};
	}
	async getUtxos(network, ownerOrLock) {
		const lockingBytecodeHex = ownerOrLock.includes(":") ? lockingBytecodeHexFromAddress(ownerOrLock) : ownerOrLock;
		const [rows, snapshot] = await Promise.all([this.request("blockchain.scripthash.listunspent", electrumScriptHash(lockingBytecodeHex), "include_tokens"), this.getSnapshot(network)]);
		if (!snapshot.reachable || snapshot.height == null) throw new Error(snapshot.error ?? "Could not verify Electrum network tip");
		return rows.map((row) => {
			const height = Number(row.height ?? 0);
			const parsed = parseElectrumToken(row.token_data);
			return {
				network,
				outpoint: {
					txid: row.tx_hash ?? "",
					vout: Number(row.tx_pos ?? 0)
				},
				valueSatoshis: String(row.value ?? "0"),
				lockingBytecodeHex,
				address: ownerOrLock.includes(":") ? ownerOrLock : null,
				token: parsed.token,
				tokenEvidence: parsed.tokenEvidence,
				spent: false,
				spentEvidence: "provider-unspent",
				confirmations: height > 0 ? Math.max(1, snapshot.height - height + 1) : 0,
				chainEvidence: "provider-observed",
				lockingType: detectLockingType(lockingBytecodeHex),
				blockHeight: height > 0 ? height : null
			};
		});
	}
	async proveUnspent(network, outpoint) {
		const observed = await this.getTransactionOutput(network, outpoint);
		if (!observed) throw new Error("Outpoint not found");
		const match = (await this.getUtxos(network, observed.lockingBytecodeHex)).find((row) => row.outpoint.txid.toLowerCase() === outpoint.txid.toLowerCase() && row.outpoint.vout === outpoint.vout);
		if (!match) throw new Error("Outpoint exists in history but is not in the UTXO set");
		return {
			...observed,
			...match,
			rawTxHex: observed.rawTxHex
		};
	}
	async getOutpoint(network, outpoint) {
		try {
			return await this.proveUnspent(network, outpoint);
		} catch {
			const observed = await this.getTransactionOutput(network, outpoint);
			return observed ? {
				...observed,
				spent: true,
				spentEvidence: "provider-spent"
			} : null;
		}
	}
	async getStatus(_network, txid) {
		try {
			const result = await this.request("blockchain.transaction.get", txid, true);
			const height = Number(result.height ?? 0);
			const confirmations = Number(result.confirmations ?? 0);
			if (height > 0 || confirmations > 0) return {
				txid,
				kind: "confirmed",
				mempool: false,
				confirmations,
				confirmed: true,
				height
			};
			return {
				txid,
				kind: "mempool",
				mempool: true,
				confirmations: 0,
				confirmed: false,
				height: null
			};
		} catch (error) {
			const reason = error instanceof Error ? error.message : String(error);
			if (/not found|unknown transaction/i.test(reason)) return {
				txid,
				kind: "not-found",
				mempool: false,
				confirmations: 0,
				confirmed: false,
				height: null
			};
			return {
				txid,
				kind: "unknown",
				mempool: false,
				confirmations: 0,
				confirmed: false,
				height: null,
				reason
			};
		}
	}
	async preflight(network, rawTxHex) {
		const decoded = decodeTransaction(hexToBin(rawTxHex));
		if (typeof decoded === "string") return {
			ok: false,
			error: decoded
		};
		for (const input of decoded.inputs) {
			const txid = binToHex(input.outpointTransactionHash);
			try {
				await this.proveUnspent(network, {
					txid,
					vout: input.outpointIndex
				});
			} catch (error) {
				return {
					ok: false,
					error: error instanceof Error ? error.message : "Input proof failed"
				};
			}
		}
		return {
			ok: true,
			error: null
		};
	}
	async broadcast(_network, rawTxHex) {
		return { txid: await this.request("blockchain.transaction.broadcast", rawTxHex) };
	}
};
function createChainProvider(args) {
	if (!args.indexerUrl) return new FixtureChainProvider();
	if (/^wss?:\/\//i.test(args.indexerUrl) || !args.indexerUrl.includes("://") && /^[^/]+(?::\d+)?$/.test(args.indexerUrl)) return new ElectrumChainProvider(args.indexerUrl);
	return new ChronikChainProvider(args.indexerUrl, args.broadcastUrl ?? void 0);
}
var SESSION_COOKIE = "optn_session";
var satoshisSchema = string().regex(/^\d+$/, "Satoshis must be a non-negative integer string");
function canOperate(session) {
	return session.role === "owner" || session.role === "operator";
}
function canApprove(session) {
	return canOperate(session) || session.role === "approver";
}
var canvasSchema = object({
	nodes: array(object({
		id: string().min(1),
		kind: _enum([
			"source",
			"vault",
			"asset",
			"route",
			"constraint",
			"governance",
			"recovery",
			"evidence"
		]),
		label: string(),
		x: number().finite(),
		y: number().finite(),
		data: record(string(), string())
	})),
	edges: array(object({
		id: string().min(1),
		source: string().min(1),
		target: string().min(1),
		kind: _enum([
			"bch",
			"successor",
			"approval",
			"recovery"
		]),
		label: string()
	}))
});
async function readCookie() {
	const { getCookie } = await import("../_libs/_.mjs").then((n) => n.t);
	return getCookie(SESSION_COOKIE) ?? null;
}
async function writeCookie(id, expiresAt) {
	const { setCookie } = await import("../_libs/_.mjs").then((n) => n.t);
	setCookie(SESSION_COOKIE, id, {
		httpOnly: true,
		sameSite: "lax",
		path: "/",
		expires: expiresAt,
		secure: true
	});
}
async function clearCookie() {
	const { setCookie } = await import("../_libs/_.mjs").then((n) => n.t);
	setCookie(SESSION_COOKIE, "", {
		httpOnly: true,
		sameSite: "lax",
		path: "/",
		expires: /* @__PURE__ */ new Date(0)
	});
}
async function requireSession() {
	const id = await readCookie();
	if (!id) throw new Error("Not authenticated");
	const session = await getSession(id);
	if (!session) throw new Error("Session expired");
	return session;
}
async function optionalSession() {
	const id = await readCookie();
	if (!id) return null;
	return getSession(id);
}
async function assertNetworkGate(network) {
	const config = publicConfig();
	if (network === "mainnet" && !mainnetEnabled()) throw new Error("Mainnet is server-disabled. ENABLE_MAINNET is not set.");
	if (network !== config.network) throw new Error("Requested network does not match the dashboard network");
}
async function requireSessionOn(network) {
	const session = await requireSession();
	await assertNetworkGate(session.network);
	if (network && session.network !== network) throw new Error("Session network does not match this object");
	return session;
}
function providerFor(network) {
	return createChainProvider({
		indexerUrl: indexerUrl(network),
		broadcastUrl: broadcastUrl(network)
	});
}
async function freshVaultState(vault, network) {
	if (!vault) throw new Error("Vault not found");
	const provider = providerFor(network);
	if (provider.kind === "fixture") {
		if (publicConfig().mode !== "demo") throw new Error("A live chain provider is required to refresh covenant vault state");
		return vault.state;
	}
	const observed = await provider.proveUnspent(network, vault.stateOutpoint);
	if (observed.network !== network) throw new Error("Observed vault UTXO is on the wrong network");
	if (observed.outpoint.txid !== vault.stateOutpoint.txid || observed.outpoint.vout !== vault.stateOutpoint.vout) throw new Error("Provider returned a different vault outpoint");
	if (observed.lockingBytecodeHex.toLowerCase() !== vault.covenantLockingBytecodeHex.toLowerCase()) throw new Error("Provider UTXO lock does not match the attached vault");
	if (observed.tokenEvidence === "unknown" || observed.tokenEvidence === "provider-omitted") throw new Error("Provider did not prove native-only token state");
	if (observed.token.categoryHex) throw new Error("Native BoundedRelease refuses a token-bearing vault UTXO");
	return observed;
}
async function resolveOrigin() {
	return requestOrigin();
}
async function issueChallengeRecord(account, network) {
	await assertNetworkGate(network);
	const origin = await resolveOrigin();
	const nonce = newId("nonce");
	const issuedAt = (/* @__PURE__ */ new Date()).toISOString();
	const expiresAt = new Date(Date.now() + 3e5).toISOString();
	const message = loginMessage({
		origin,
		network,
		account,
		nonce,
		issuedAt,
		expiresAt
	});
	await saveChallenge({
		id: newId("chal"),
		network,
		account,
		origin,
		nonce,
		message,
		purpose: "login",
		expiresAt
	});
	return {
		nonce,
		message,
		expiresAt,
		methods: ["bch_signMessage"]
	};
}
var getPublicConfig_createServerFn_handler = createServerRpc({
	id: "1ad1f03003647e56861c8678a90101b67900c817f6bc95d0dcf1330dca50b36e",
	name: "getPublicConfig",
	filename: "src/lib/optn/api.ts"
}, (opts) => getPublicConfig.__executeServer(opts));
var getPublicConfig = createServerFn({ method: "GET" }).handler(getPublicConfig_createServerFn_handler, async () => {
	return publicConfig();
});
var getCurrentSession_createServerFn_handler = createServerRpc({
	id: "1f9e7a54e6c69bd4c9106557f70495589993c2103227da314dfc0288c8a7c88f",
	name: "getCurrentSession",
	filename: "src/lib/optn/api.ts"
}, (opts) => getCurrentSession.__executeServer(opts));
var getCurrentSession = createServerFn({ method: "GET" }).handler(getCurrentSession_createServerFn_handler, async () => {
	return {
		session: await optionalSession(),
		config: publicConfig()
	};
});
var loadOrganization_createServerFn_handler = createServerRpc({
	id: "717f56c946a2ddc3921f7c85fede9df652988ebd5a69cc9762c49ad43709ebd8",
	name: "loadOrganization",
	filename: "src/lib/optn/api.ts"
}, (opts) => loadOrganization.__executeServer(opts));
var loadOrganization = createServerFn({ method: "GET" }).handler(loadOrganization_createServerFn_handler, async () => {
	const session = await optionalSession();
	const config = publicConfig();
	if (!session) return {
		config,
		session: null,
		organization: null,
		covenant: null
	};
	await assertNetworkGate(session.network);
	const organization = await getOrganization(session.network);
	const artifact = organization?.recipientAccount && config.mode !== "demo" ? await liveBoundedReleaseArtifact(session.network) : null;
	return {
		config,
		session,
		organization,
		covenant: artifact ? {
			address: addressFromLockingBytecode(session.network, artifact.lockingBytecodeHex),
			lockingBytecodeHex: artifact.lockingBytecodeHex,
			artifactHash: artifact.artifactHash,
			maxPaymentSatoshis: artifact.maxPaymentSatoshis,
			maxFeeSatoshis: artifact.maxFeeSatoshis,
			sourceAssembly: artifact.sourceAssembly
		} : null
	};
});
var listDemoIdentities_createServerFn_handler = createServerRpc({
	id: "cbfafd7724b333c5e8a9af78662a1132addf080c7ef4b97c9868de3c93b8979a",
	name: "listDemoIdentities",
	filename: "src/lib/optn/api.ts"
}, (opts) => listDemoIdentities.__executeServer(opts));
var listDemoIdentities = createServerFn({ method: "GET" }).handler(listDemoIdentities_createServerFn_handler, async () => {
	return Object.entries(IDENTITIES).filter(([key]) => key === "alice" || key === "bob" || key === "carol").map(([key, identity]) => ({
		id: key,
		label: identity.label,
		role: identity.role,
		account: identity.account
	}));
});
var issueLoginChallenge_createServerFn_handler = createServerRpc({
	id: "d4bc7d69cbc8bfe8e9774d8046b712361acb2f227287a90cb4b2714f2391c5f4",
	name: "issueLoginChallenge",
	filename: "src/lib/optn/api.ts"
}, (opts) => issueLoginChallenge.__executeServer(opts));
var issueLoginChallenge = createServerFn({ method: "POST" }).validator(object({
	account: string(),
	network: _enum(["chipnet", "mainnet"])
})).handler(issueLoginChallenge_createServerFn_handler, async ({ data }) => {
	const config = publicConfig();
	if (data.network !== config.network) throw new Error("Challenge network does not match dashboard network");
	return issueChallengeRecord(data.account, data.network);
});
async function establishSession(args) {
	const config = publicConfig();
	const expiresAt = new Date(Date.now() + 432e5);
	const origin = await resolveOrigin();
	const session = {
		id: newId("sess"),
		network: args.network,
		account: args.account,
		role: await roleForOrgAccount(args.account, args.network),
		mode: config.mode,
		origin,
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		expiresAt: expiresAt.toISOString(),
		authMethod: args.method
	};
	await saveSession(session);
	await writeCookie(session.id, expiresAt);
	await audit({
		network: session.network,
		type: "session.login",
		actor: session.account,
		objectType: "session",
		objectId: session.id,
		correlationId: session.id,
		summary: `${session.authMethod} login as ${session.role}`,
		evidence: session.authMethod === "demo" ? "FIXTURE" : "DESIGNED"
	});
	return session;
}
var demoLogin_createServerFn_handler = createServerRpc({
	id: "575ed8a6f18f2f4416f1872a282ca2b2466cf192729961d157eefc60d0fea3c7",
	name: "demoLogin",
	filename: "src/lib/optn/api.ts"
}, (opts) => demoLogin.__executeServer(opts));
var demoLogin = createServerFn({ method: "POST" }).validator(object({ account: string() })).handler(demoLogin_createServerFn_handler, async ({ data }) => {
	const config = publicConfig();
	if (config.network === "mainnet") throw new Error("Demo login is not available on Mainnet");
	if (!(IDENTITIES.alice.account === data.account || IDENTITIES.bob.account === data.account || IDENTITIES.carol.account === data.account ? data.account : null)) throw new Error("Unknown demo account");
	await assertNetworkGate(config.network);
	const challenge = await issueChallengeRecord(data.account, config.network);
	const key = demoPrivateKeyForAccount(data.account);
	if (!key) throw new Error("Demo key unavailable");
	const signature = signBchMessage(key, challenge.message);
	if (!verifyBchMessageAddress(config.network, data.account, challenge.message, signature)) throw new Error("Demo signature failed verification");
	const consumed = await consumeChallenge(challenge.nonce);
	if (!consumed || consumed.reused) throw new Error("Challenge reuse rejected");
	return {
		session: await establishSession({
			account: data.account,
			network: config.network,
			method: "demo"
		}),
		evidence: "FIXTURE"
	};
});
var verifyLogin_createServerFn_handler = createServerRpc({
	id: "b30824df6eabb780722aa506ae26c5e2dbb949d19ca9ca654eae2ee5ca697e09",
	name: "verifyLogin",
	filename: "src/lib/optn/api.ts"
}, (opts) => verifyLogin.__executeServer(opts));
var verifyLogin = createServerFn({ method: "POST" }).validator(object({
	account: string(),
	nonce: string(),
	signature: string(),
	network: _enum(["chipnet", "mainnet"])
})).handler(verifyLogin_createServerFn_handler, async ({ data }) => {
	await assertNetworkGate(data.network);
	const origin = await resolveOrigin();
	const consumed = await consumeChallenge(data.nonce);
	if (!consumed) throw new Error("Unknown challenge");
	if (consumed.reused) throw new Error("Nonce reuse rejected");
	if (new Date(consumed.expires_at).getTime() < Date.now()) throw new Error("Challenge expired");
	if (consumed.account !== data.account) throw new Error("Account mismatch");
	if (consumed.network !== data.network) throw new Error("Network mismatch");
	if (consumed.origin !== origin) throw new Error("Challenge origin does not match this dashboard origin");
	if (!verifyBchMessageAddress(data.network, data.account, consumed.message, data.signature)) throw new Error("BCH message signature could not be verified");
	return {
		session: await establishSession({
			account: data.account,
			network: data.network,
			method: "walletconnect"
		}),
		evidence: "DESIGNED"
	};
});
var logout_createServerFn_handler = createServerRpc({
	id: "842a10e90c1eca8e402b45d6d274de7de9c3e28a30444d53340e6db4f8c5497c",
	name: "logout",
	filename: "src/lib/optn/api.ts"
}, (opts) => logout.__executeServer(opts));
var logout = createServerFn({ method: "POST" }).handler(logout_createServerFn_handler, async () => {
	const id = await readCookie();
	if (id) await deleteSession(id);
	await clearCookie();
	return { ok: true };
});
var bootstrapOrganization_createServerFn_handler = createServerRpc({
	id: "4ab10be263850758309b6b6000d6a4e35025012143e6f792dd5100645ecdb2bf",
	name: "bootstrapOrganization",
	filename: "src/lib/optn/api.ts"
}, (opts) => bootstrapOrganization.__executeServer(opts));
var bootstrapOrganization = createServerFn({ method: "POST" }).handler(bootstrapOrganization_createServerFn_handler, async () => {
	const session = await requireSessionOn();
	if (session.authMethod !== "walletconnect") throw new Error("Create a live organization with a WalletConnect-authenticated BCH wallet");
	const result = await bootstrapOrganization$1({
		network: session.network,
		ownerAccount: session.account
	});
	if (!result.created && result.organization.ownerAccount !== session.account) throw new Error("This network already has an organization owned by another wallet");
	await updateSessionRole(session.id, "owner");
	await audit({
		network: session.network,
		type: "organization.bootstrap",
		actor: session.account,
		objectType: "session",
		objectId: session.id,
		correlationId: result.organization.network,
		summary: "Created WalletConnect organization and assigned owner role"
	});
	return {
		organization: result.organization,
		session: {
			...session,
			role: "owner"
		}
	};
});
var refreshOrganizationAccess_createServerFn_handler = createServerRpc({
	id: "f7f5638487d71002f75f3308b18fc12b68231488f71ee2d28fecefd3db030f40",
	name: "refreshOrganizationAccess",
	filename: "src/lib/optn/api.ts"
}, (opts) => refreshOrganizationAccess.__executeServer(opts));
var refreshOrganizationAccess = createServerFn({ method: "POST" }).handler(refreshOrganizationAccess_createServerFn_handler, async () => {
	const session = await requireSessionOn();
	if (session.authMethod !== "walletconnect") throw new Error("Refresh organization access with the WalletConnect BCH wallet that owns or joined it");
	const organization = await getOrganization(session.network);
	const role = organization ? organization.ownerAccount === session.account ? "owner" : await roleForOrgAccount(session.account, session.network) : "viewer";
	await updateSessionRole(session.id, role);
	await audit({
		network: session.network,
		type: "session.role.refresh",
		actor: session.account,
		objectType: "session",
		objectId: session.id,
		correlationId: session.id,
		summary: role === "viewer" ? "Organization access refresh found no membership for this wallet" : `Organization access refreshed as ${role}`,
		evidence: "DESIGNED"
	});
	return {
		organization,
		session: {
			...session,
			role
		}
	};
});
var issueOrganizationInvite_createServerFn_handler = createServerRpc({
	id: "055d5e7723442d087f802681195d1246c3401ec522e35cc82307959d698e711a",
	name: "issueOrganizationInvite",
	filename: "src/lib/optn/api.ts"
}, (opts) => issueOrganizationInvite.__executeServer(opts));
var issueOrganizationInvite = createServerFn({ method: "POST" }).validator(object({ kind: _enum([
	"operator",
	"approver",
	"recipient"
]) })).handler(issueOrganizationInvite_createServerFn_handler, async ({ data }) => {
	const session = await requireSessionOn();
	if (session.role !== "owner") throw new Error("Only the organization owner can issue invitations");
	if (session.authMethod !== "walletconnect") throw new Error("Live invitations require WalletConnect");
	const organization = await getOrganization(session.network);
	if (!organization || organization.ownerAccount !== session.account) throw new Error("Organization ownership could not be verified");
	const expiresAt = new Date(Date.now() + 36e5).toISOString();
	const invite = await createOrganizationInvite({
		id: newId("org-invite"),
		network: session.network,
		kind: data.kind,
		createdBy: session.account,
		expiresAt
	});
	await audit({
		network: session.network,
		type: "organization.invite.issue",
		actor: session.account,
		objectType: "session",
		objectId: invite.id,
		correlationId: invite.id,
		summary: `Issued ${data.kind} WalletConnect enrollment invitation`
	});
	return invite;
});
var enrollSelfAsRecipient_createServerFn_handler = createServerRpc({
	id: "eb3d2edae73229e26dde0b584252c2d5c41b12631c89d52d751e52d826b55222",
	name: "enrollSelfAsRecipient",
	filename: "src/lib/optn/api.ts"
}, (opts) => enrollSelfAsRecipient.__executeServer(opts));
var enrollSelfAsRecipient = createServerFn({ method: "POST" }).handler(enrollSelfAsRecipient_createServerFn_handler, async () => {
	const session = await requireSessionOn();
	if (session.authMethod !== "walletconnect" || session.role !== "owner") throw new Error("Only the WalletConnect organization owner can enable a single-wallet pilot");
	const organization = await setOrganizationRecipient({
		network: session.network,
		ownerAccount: session.account,
		recipientAccount: session.account
	});
	await audit({
		network: session.network,
		type: "organization.recipient.self-enroll",
		actor: session.account,
		objectType: "session",
		objectId: session.id,
		correlationId: organization.network,
		summary: "Enabled single-wallet recipient pilot; separation of duties is not configured"
	});
	return { organization };
});
var saveCovenantBlueprint_createServerFn_handler = createServerRpc({
	id: "d0b1033aa40c233c16f00fa7dff9626c98b220fe208695fa6c0ca74ed07bf207",
	name: "saveCovenantBlueprint",
	filename: "src/lib/optn/api.ts"
}, (opts) => saveCovenantBlueprint.__executeServer(opts));
var saveCovenantBlueprint = createServerFn({ method: "POST" }).validator(object({
	maxPaymentSatoshis: satoshisSchema,
	maxFeeSatoshis: satoshisSchema
})).handler(saveCovenantBlueprint_createServerFn_handler, async ({ data }) => {
	const session = await requireSessionOn();
	if (session.authMethod !== "walletconnect" || session.role !== "owner") throw new Error("Only the WalletConnect organization owner can change the next-vault blueprint");
	if (parseSatoshis(data.maxPaymentSatoshis) <= 0n || parseSatoshis(data.maxFeeSatoshis) <= 0n) throw new Error("Payment and fee limits must be positive");
	const organization = await setOrganizationCovenantBlueprint({
		network: session.network,
		ownerAccount: session.account,
		maxPaymentSatoshis: data.maxPaymentSatoshis,
		maxFeeSatoshis: data.maxFeeSatoshis
	});
	const artifact = await liveBoundedReleaseArtifact(session.network);
	await audit({
		network: session.network,
		type: "covenant.blueprint.save",
		actor: session.account,
		objectType: "session",
		objectId: session.id,
		correlationId: artifact.artifactHash,
		summary: "Saved next-vault BoundedRelease blueprint",
		evidence: "DESIGNED"
	});
	return {
		organization,
		artifact
	};
});
var redeemOrganizationInvite_createServerFn_handler = createServerRpc({
	id: "b4e24e5d8ee6f1974b0bd5cf23ab4586dae798dc0a961282b0d10e3e0069c0ea",
	name: "redeemOrganizationInvite",
	filename: "src/lib/optn/api.ts"
}, (opts) => redeemOrganizationInvite.__executeServer(opts));
var redeemOrganizationInvite = createServerFn({ method: "POST" }).validator(object({ code: string().min(24) })).handler(redeemOrganizationInvite_createServerFn_handler, async ({ data }) => {
	const session = await requireSessionOn();
	if (session.authMethod !== "walletconnect") throw new Error("Accept invitations with a WalletConnect-authenticated BCH wallet");
	const result = await redeemOrganizationInvite$1({
		code: data.code,
		account: session.account,
		network: session.network
	});
	const role = result.kind === "recipient" ? "viewer" : result.kind;
	await updateSessionRole(session.id, role);
	await audit({
		network: session.network,
		type: "organization.invite.accept",
		actor: session.account,
		objectType: "session",
		objectId: session.id,
		correlationId: result.organization.network,
		summary: result.kind === "recipient" ? "Enrolled WalletConnect payout recipient" : `Accepted ${result.kind} WalletConnect organization invitation`
	});
	return {
		organization: result.organization,
		session: {
			...session,
			role
		}
	};
});
var loadOverview_createServerFn_handler = createServerRpc({
	id: "3bdb947955485b2122398a4a5ae93a49389178c256d8a8cd21885e6f639f909d",
	name: "loadOverview",
	filename: "src/lib/optn/api.ts"
}, (opts) => loadOverview.__executeServer(opts));
var loadOverview = createServerFn({ method: "GET" }).handler(loadOverview_createServerFn_handler, async () => {
	const config = publicConfig();
	const session = await optionalSession();
	const provider = providerFor(config.network);
	const chain = await provider.getSnapshot(config.network);
	if (!session) return {
		config,
		session: null,
		chain,
		wallet: null,
		walletError: null,
		vaults: [],
		organization: null,
		plans: [],
		proposals: [],
		events: [],
		totals: {
			protectedBchSatoshis: "0",
			protectedTokenAmount: "0",
			pendingApprovals: 0,
			blocked: 0
		}
	};
	await assertNetworkGate(session.network);
	const [vaults, plans, proposals, events, walletRead, organization] = await Promise.all([
		listVaults(session.network),
		listPlans(session.network),
		listProposals(session.network),
		listAudit(session.network, 12),
		readWalletChainState(provider, session.network, session.account, config.mode === "demo"),
		getOrganization(session.network)
	]);
	const protectedBch = vaults.reduce((sum, vault) => sum + parseSatoshis(vault.state.valueSatoshis), 0n);
	return {
		config,
		session,
		chain,
		wallet: walletRead.wallet,
		walletError: walletRead.walletError,
		vaults,
		organization,
		plans,
		proposals,
		events,
		totals: {
			protectedBchSatoshis: protectedBch.toString(),
			protectedTokenAmount: "0",
			pendingApprovals: proposals.filter((item) => item.stage === "policy-valid" || item.stage === "intent").length,
			blocked: proposals.filter((item) => item.stage === "rejected-by-policy").length
		}
	};
});
var loadVaults_createServerFn_handler = createServerRpc({
	id: "5ef176b5e1e22eaf27059fc5ecced4e2f79a193d2d3c2b4ebbe7f280fc4d53fe",
	name: "loadVaults",
	filename: "src/lib/optn/api.ts"
}, (opts) => loadVaults.__executeServer(opts));
var loadVaults = createServerFn({ method: "GET" }).handler(loadVaults_createServerFn_handler, async () => {
	const config = publicConfig();
	const session = await optionalSession();
	const provider = providerFor(config.network);
	const chain = await provider.getSnapshot(config.network);
	if (!session) return {
		config,
		chain,
		vaults: [],
		utxos: [],
		wallet: null,
		walletError: null
	};
	await assertNetworkGate(session.network);
	const walletRead = await readWalletChainState(provider, session.network, session.account, config.mode === "demo");
	return {
		config,
		chain,
		vaults: await listVaults(session.network),
		utxos: walletRead.utxos,
		wallet: walletRead.wallet,
		walletError: walletRead.walletError
	};
});
var attachVault_createServerFn_handler = createServerRpc({
	id: "8d0de0a465d496eb25f577f0bf1825d6c6f86beb4d23161c1fdcbffd86419b17",
	name: "attachVault",
	filename: "src/lib/optn/api.ts"
}, (opts) => attachVault.__executeServer(opts));
var attachVault = createServerFn({ method: "POST" }).validator(object({
	txid: string().regex(/^[0-9a-f]{64}$/i, "Transaction id must be 32-byte hex"),
	vout: number().int().nonnegative(),
	expectedLockingBytecodeHex: string().optional()
})).handler(attachVault_createServerFn_handler, async ({ data }) => {
	const session = await requireSessionOn();
	if (!canOperate(session)) throw new Error("Only operators can attach vaults");
	const provider = createChainProvider({
		indexerUrl: indexerUrl(session.network),
		broadcastUrl: broadcastUrl(session.network)
	});
	if (provider.kind === "fixture") throw new Error("Attach requires a Chipnet indexer. The fixture provider cannot prove an outpoint is unspent.");
	const observed = await provider.proveUnspent(session.network, {
		txid: data.txid,
		vout: data.vout
	});
	const artifact = await liveBoundedReleaseArtifact(session.network);
	assertArtifactMatchesLock(artifact, observed.lockingBytecodeHex);
	if (data.expectedLockingBytecodeHex && observed.lockingBytecodeHex !== data.expectedLockingBytecodeHex) throw new Error("Locking bytecode does not match the reviewed artifact");
	if (observed.tokenEvidence === "unknown") throw new Error("Provider did not report token state; native attach refuses unknown token evidence");
	if (observed.token.categoryHex) throw new Error("Native BoundedRelease attach rejects a token-bearing output");
	if (observed.network !== session.network) throw new Error("Observed outpoint network does not match the session");
	const vault = await putVault({
		id: newId("vault"),
		network: session.network,
		name: "Attached BoundedRelease vault",
		contractName: artifact.name,
		contractVersion: artifact.version,
		artifactHash: artifact.artifactHash,
		reviewedShapeId: artifact.id,
		covenantLockingBytecodeHex: artifact.lockingBytecodeHex,
		redeemBytecodeHex: artifact.redeemBytecodeHex,
		stateOutpoint: observed.outpoint,
		state: observed,
		reviewed: artifact.reviewStatus === "reviewed",
		liveSpendEnabled: observed.spentEvidence === "provider-unspent" && observed.chainEvidence === "provider-observed",
		onChainRecipientEnforced: artifact.onChainRecipientEnforced,
		constructor: { ...artifact.constructor },
		evidence: ["DESIGNED"],
		notes: ["Attached from provider-proved unspent outpoint. The dashboard did not deploy or fund this vault.", "Recipient-on-chain is true only because the observed lock matches the reviewed BoundedRelease artifact."]
	});
	await audit({
		network: session.network,
		type: "vault.attach",
		actor: session.account,
		objectType: "vault",
		objectId: vault.id,
		correlationId: vault.id,
		summary: `Attached vault outpoint ${data.txid.slice(0, 8)}…:${data.vout}`,
		evidence: "DESIGNED"
	});
	return vault;
});
var loadPlans_createServerFn_handler = createServerRpc({
	id: "afefc797935bd9017cce56c5ea27280cf055540428a98f3338f0d52065e2555a",
	name: "loadPlans",
	filename: "src/lib/optn/api.ts"
}, (opts) => loadPlans.__executeServer(opts));
var loadPlans = createServerFn({ method: "GET" }).handler(loadPlans_createServerFn_handler, async () => {
	const config = publicConfig();
	const session = await optionalSession();
	if (!session) return {
		config,
		plans: [],
		vaults: []
	};
	await assertNetworkGate(session.network);
	return {
		config,
		plans: await listPlans(session.network),
		vaults: await listVaults(session.network)
	};
});
var loadPlan_createServerFn_handler = createServerRpc({
	id: "f2a59d90627ddf4b413b419f9bb2f0816557bf0723e78eedb93304c57fdb0b60",
	name: "loadPlan",
	filename: "src/lib/optn/api.ts"
}, (opts) => loadPlan.__executeServer(opts));
var loadPlan = createServerFn({ method: "POST" }).validator(object({ id: string() })).handler(loadPlan_createServerFn_handler, async ({ data }) => {
	const session = await requireSessionOn();
	const plan = await getPlan(data.id, session.network);
	if (!plan) throw new Error("Plan not found");
	if (plan.network !== session.network) throw new Error("Plan is not on this session network");
	const vault = await getVault(plan.sourceVaultId, session.network);
	if (!vault || vault.network !== session.network) throw new Error("Plan vault is not on this session network");
	return {
		plan,
		vault,
		config: publicConfig()
	};
});
var savePlanDraft_createServerFn_handler = createServerRpc({
	id: "b3c1235b821cf759266b5d9423dc9c74642d67b47fbae41b2e21f67239943124",
	name: "savePlanDraft",
	filename: "src/lib/optn/api.ts"
}, (opts) => savePlanDraft.__executeServer(opts));
var savePlanDraft = createServerFn({ method: "POST" }).validator(object({
	id: string().optional(),
	name: string().min(1),
	description: string(),
	perPaymentSatoshis: satoshisSchema,
	sessionAllowanceSatoshis: satoshisSchema,
	maxFeeSatoshis: satoshisSchema,
	threshold: number().int().min(1).max(3),
	pause: boolean(),
	canvas: canvasSchema.optional()
})).handler(savePlanDraft_createServerFn_handler, async ({ data }) => {
	const session = await requireSessionOn();
	if (!canOperate(session)) throw new Error("Only owners/operators can edit plans");
	const existing = data.id ? await getPlan(data.id, session.network) : null;
	if (existing && existing.network !== session.network) throw new Error("Plan network mismatch");
	const vaults = await listVaults(session.network);
	if (vaults.length === 0 && publicConfig().mode !== "demo") throw new Error("A live plan requires an attached, provider-proven BoundedRelease vault");
	const vault = vaults[0] ?? demoVault();
	if (parseSatoshis(data.perPaymentSatoshis) <= 0n || parseSatoshis(data.maxFeeSatoshis) <= 0n) throw new Error("Payment and fee caps must be positive");
	if (vault.reviewedShapeId !== "bounded-release-v1" || !vault.onChainRecipientEnforced) throw new Error("Only the reviewed recipient-enforcing BoundedRelease vault can back this MVP plan");
	const authorizedAccounts = (await getOrganization(session.network))?.members.map((member) => member.account) ?? (publicConfig().mode === "demo" ? [
		IDENTITIES.alice.account,
		IDENTITIES.bob.account,
		IDENTITIES.carol.account
	] : []);
	if (data.threshold > authorizedAccounts.length) throw new Error("Approval threshold exceeds the configured organization size");
	const recipientLockingBytecodeHex = vault.constructor.recipientLock;
	const maxPaymentSatoshis = vault.constructor.maxPaymentSatoshis;
	const maxFeeSatoshis = vault.constructor.maxFeeSatoshis;
	if (!recipientLockingBytecodeHex || !maxPaymentSatoshis || !maxFeeSatoshis) throw new Error("Attached vault lacks immutable BoundedRelease constructor values");
	if (data.perPaymentSatoshis !== maxPaymentSatoshis || data.maxFeeSatoshis !== maxFeeSatoshis) throw new Error("Payment and fee caps are compiled into the funded vault. Create and fund a new vault to change them.");
	const recipientAddress = addressFromLockingBytecode(session.network, recipientLockingBytecodeHex);
	if (!recipientAddress) throw new Error("Vault recipient lock cannot be encoded as a BCH address");
	const base = existing ?? {
		schemaVersion: 1,
		id: newId("plan"),
		network: session.network,
		asset: { type: "native-bch" },
		sourceVaultId: vault.id,
		reviewedShapeId: "bounded-release-v1",
		artifactHash: vault.artifactHash,
		routes: [defaultDirectPaymentRoute({
			destinationAddress: recipientAddress,
			destinationLockingBytecodeHex: recipientLockingBytecodeHex,
			maxAmountSatoshis: maxPaymentSatoshis
		})],
		recovery: {
			enabled: true,
			destinationAddress: IDENTITIES.recovery.account,
			destinationLockingBytecodeHex: IDENTITIES.recovery.lockingBytecodeHex,
			separateAuthority: true,
			enforcement: "not-implemented"
		},
		canvas: {
			nodes: [],
			edges: []
		},
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		parentPolicyId: null,
		version: 1,
		actor: session.account
	};
	const next = {
		...base,
		name: data.name,
		description: data.description,
		governance: {
			threshold: data.threshold,
			authorizedAccounts,
			proposerCannotBeSoleApprover: authorizedAccounts.length > 1,
			expirySeconds: 3600,
			separationOfDuties: authorizedAccounts.length > 1
		},
		limits: {
			perPaymentSatoshis: maxPaymentSatoshis,
			sessionAllowanceSatoshis: data.sessionAllowanceSatoshis,
			sessionConsumedSatoshis: existing?.limits.sessionConsumedSatoshis ?? "0",
			maxFeeSatoshis,
			windowKind: "daily",
			windowCapSatoshis: "20000000"
		},
		pause: data.pause,
		status: "draft",
		canvas: data.canvas ?? base.canvas,
		updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		actor: session.account,
		policyId: "",
		artifactHash: vault.artifactHash
	};
	next.canvas = compileExecutableStudio(next, vault).canvas;
	assertPlanMatchesVaultArtifact(next, vault);
	next.policyId = hashPolicy(next);
	const saved = await putPlan(next);
	await audit({
		network: session.network,
		type: "plan.save",
		actor: session.account,
		objectType: "plan",
		objectId: saved.id,
		correlationId: saved.id,
		summary: `Saved draft “${saved.name}”`
	});
	return saved;
});
var publishPlan_createServerFn_handler = createServerRpc({
	id: "05225a2d7eac590123dc96e65b45a3f980e0c2f6878df2bb7015a198728e4b89",
	name: "publishPlan",
	filename: "src/lib/optn/api.ts"
}, (opts) => publishPlan.__executeServer(opts));
var publishPlan = createServerFn({ method: "POST" }).validator(object({ id: string() })).handler(publishPlan_createServerFn_handler, async ({ data }) => {
	const session = await requireSessionOn();
	if (session.role !== "owner" && session.role !== "operator") throw new Error("Only owners/operators can publish");
	const plan = await getPlan(data.id, session.network);
	if (!plan) throw new Error("Plan not found");
	if (plan.network !== session.network) throw new Error("Plan network mismatch");
	const vault = await getVault(plan.sourceVaultId, session.network);
	if (!vault) throw new Error("Plan vault is not attached");
	const canvasIssues = executableStudioRules(plan, vault).filter((item) => !item.pass);
	if (canvasIssues.length > 0) throw new Error(`Cannot publish an incomplete control-flow canvas: ${canvasIssues.map((item) => item.label).join(", ")}`);
	const nextVersion = await getPlanVersion(plan.id, plan.version) ? plan.version + 1 : plan.version;
	const published = {
		...plan,
		status: "active",
		version: nextVersion,
		parentPolicyId: plan.policyId,
		updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		actor: session.account
	};
	published.policyId = hashPolicy(published);
	const saved = await putPlan(published);
	await snapshotPlanVersion(saved);
	await audit({
		network: session.network,
		type: "plan.publish",
		actor: session.account,
		objectType: "plan",
		objectId: saved.id,
		correlationId: saved.id,
		summary: `Published ${saved.name} v${saved.version}`
	});
	return saved;
});
function successorValue(utxoValue, amount, fee) {
	return (parseSatoshis(utxoValue) - parseSatoshis(amount) - parseSatoshis(fee)).toString();
}
async function createProposalFrom(args) {
	if (!canOperate(args.session)) throw new Error("Only owners/operators can create allocation proposals");
	const existing = await getIdempotent(args.idempotencyKey, args.session.network);
	if (existing) return existing;
	const plan = await getPlan(args.planId, args.session.network);
	if (!plan) throw new Error("Plan not found");
	if (plan.network !== args.session.network) throw new Error("Plan network mismatch");
	if (plan.status !== "active") throw new Error("Only an active published plan can create proposals");
	await assertNetworkGate(plan.network);
	const vault = await getVault(plan.sourceVaultId, args.session.network);
	if (!vault) throw new Error("Vault not found");
	assertPlanMatchesVaultArtifact(plan, vault);
	const chainState = await freshVaultState(vault, args.session.network);
	const utxo = {
		...chainState,
		spent: args.spent ?? chainState.spent,
		token: args.tokenCategory ? {
			...chainState.token,
			categoryHex: args.tokenCategory,
			amount: "1"
		} : chainState.token
	};
	const destination = args.destinationLockingBytecodeHex ?? plan.routes.find((route) => route.id === args.routeId)?.destinationLockingBytecodeHex ?? IDENTITIES.vendor.lockingBytecodeHex;
	const successor = args.successorLockingBytecodeHex ?? vault.covenantLockingBytecodeHex;
	const now = /* @__PURE__ */ new Date();
	const proposalId = newId("prop");
	const expiresAt = new Date(now.getTime() + plan.governance.expirySeconds * 1e3);
	const preview = previewTransition({
		plan,
		vaultLockingBytecodeHex: vault.covenantLockingBytecodeHex,
		utxo,
		routeId: args.routeId,
		amountSatoshis: args.amountSatoshis,
		feeSatoshis: args.feeSatoshis,
		destinationLockingBytecodeHex: destination,
		successorLockingBytecodeHex: successor,
		proposalId,
		nonce: proposalId,
		createdAt: now.toISOString(),
		expiresAt: expiresAt.toISOString()
	});
	const intent = buildCanonicalIntent({
		plan,
		proposalId,
		vaultId: vault.id,
		utxo,
		routeId: args.routeId,
		amountSatoshis: args.amountSatoshis,
		feeSatoshis: args.feeSatoshis,
		destinationLockingBytecodeHex: destination,
		successorLockingBytecodeHex: successor,
		successorValueSatoshis: successorValue(utxo.valueSatoshis, args.amountSatoshis, args.feeSatoshis),
		artifactId: vault.reviewedShapeId,
		artifactHash: vault.artifactHash,
		txVersion: 2,
		locktime: 0,
		inputSequence: SEQUENCE_ENABLE_LOCKTIME,
		nonce: proposalId,
		createdAt: now.toISOString(),
		expiresAt: expiresAt.toISOString()
	});
	const stage = preview.policyDecision.allowed ? "policy-valid" : "rejected-by-policy";
	if (stage === "policy-valid") {
		const reserved = await tryReserveOutpoint({
			network: plan.network,
			txid: utxo.outpoint.txid,
			vout: utxo.outpoint.vout,
			proposalId
		});
		if (!reserved.ok) throw new Error(`Source outpoint is already reserved by ${reserved.holder}`);
	}
	const proposal = {
		id: proposalId,
		network: plan.network,
		planId: plan.id,
		planVersion: plan.version,
		policyId: plan.policyId,
		vaultId: vault.id,
		routeId: args.routeId,
		artifactId: vault.reviewedShapeId,
		artifactHash: vault.artifactHash,
		sourceOutpoint: utxo.outpoint,
		sourceValueSatoshis: utxo.valueSatoshis,
		sourceToken: utxo.token,
		destinationAddress: plan.routes.find((route) => route.id === args.routeId)?.destinationAddress ?? "",
		destinationLockingBytecodeHex: destination,
		amountSatoshis: args.amountSatoshis,
		feeSatoshis: args.feeSatoshis,
		feeCapSatoshis: plan.limits.maxFeeSatoshis,
		successorLockingBytecodeHex: successor,
		successorValueSatoshis: successorValue(utxo.valueSatoshis, args.amountSatoshis, args.feeSatoshis),
		txVersion: 2,
		locktime: 0,
		inputSequence: SEQUENCE_ENABLE_LOCKTIME,
		walletConnectChainId: chainIdFor(plan.network),
		intentHash: hashIntent(intent),
		canonicalIntent: JSON.stringify(intent, null, 2),
		policyDecision: preview.policyDecision,
		covenantDecision: preview.covenantDecision,
		preview,
		approvals: [],
		threshold: plan.governance.threshold,
		unsignedTxHex: null,
		signedTxHex: null,
		signedTxid: null,
		broadcastTxid: null,
		confirmations: 0,
		stage,
		failureReason: preview.policyDecision.allowed ? null : explainDecision(preview.policyDecision),
		evidence: preview.evidence,
		idempotencyKey: args.idempotencyKey,
		createdAt: now.toISOString(),
		expiresAt: expiresAt.toISOString(),
		updatedAt: now.toISOString(),
		actor: args.session.account,
		correlationId: proposalId
	};
	await putProposal(proposal);
	const stored = await putIdempotent(args.idempotencyKey, plan.network, proposal);
	if (stored.id !== proposal.id) {
		await deleteProposal(proposal.id, plan.network);
		await releaseOutpoint(plan.network, proposal.sourceOutpoint.txid, proposal.sourceOutpoint.vout, proposal.id);
		return stored;
	}
	await audit({
		network: plan.network,
		type: "proposal.create",
		actor: args.session.account,
		objectType: "proposal",
		objectId: proposal.id,
		correlationId: proposal.correlationId,
		summary: preview.policyDecision.allowed ? `Proposal ${proposal.id} is policy-valid` : `Proposal blocked: ${proposal.failureReason}`,
		evidence: preview.policyDecision.allowed ? "DESIGNED" : "FAILED"
	});
	return proposal;
}
var createProposal_createServerFn_handler = createServerRpc({
	id: "a64b0696fac88ff7122968eff01b22953931e3ffd86487a1f9aee1914a0f04e9",
	name: "createProposal",
	filename: "src/lib/optn/api.ts"
}, (opts) => createProposal.__executeServer(opts));
var createProposal = createServerFn({ method: "POST" }).validator(object({
	planId: string(),
	routeId: number().int(),
	amountSatoshis: satoshisSchema,
	feeSatoshis: satoshisSchema.default(MAX_FEE_SATS),
	idempotencyKey: string().optional()
})).handler(createProposal_createServerFn_handler, async ({ data }) => {
	return createProposalFrom({
		session: await requireSessionOn(),
		planId: data.planId,
		routeId: data.routeId,
		amountSatoshis: data.amountSatoshis,
		feeSatoshis: data.feeSatoshis,
		idempotencyKey: data.idempotencyKey ?? newId("idem")
	});
});
var loadProposal_createServerFn_handler = createServerRpc({
	id: "6e12cc054573c597fbfd0096c7420328dbf4d35d9a09c214fd5a18b8b8fe8cb3",
	name: "loadProposal",
	filename: "src/lib/optn/api.ts"
}, (opts) => loadProposal.__executeServer(opts));
var loadProposal = createServerFn({ method: "POST" }).validator(object({ id: string() })).handler(loadProposal_createServerFn_handler, async ({ data }) => {
	const session = await requireSessionOn();
	if (!canApprove(session)) throw new Error("Only configured organization members can view proposal details");
	const proposal = await getProposal(data.id, session.network);
	if (!proposal) throw new Error("Proposal not found");
	if (proposal.network !== session.network) throw new Error("Proposal is not on this session network");
	return {
		proposal,
		plan: await getPlan(proposal.planId, session.network),
		vault: await getVault(proposal.vaultId, session.network),
		config: publicConfig()
	};
});
var loadProposals_createServerFn_handler = createServerRpc({
	id: "31d3cbedc86c5e8848e230e52bcf588af224061c76122ddf6fedd9249f4990c1",
	name: "loadProposals",
	filename: "src/lib/optn/api.ts"
}, (opts) => loadProposals.__executeServer(opts));
var loadProposals = createServerFn({ method: "GET" }).handler(loadProposals_createServerFn_handler, async () => {
	const config = publicConfig();
	const session = await optionalSession();
	if (!session) return {
		config,
		proposals: []
	};
	await assertNetworkGate(session.network);
	return {
		config,
		proposals: await listProposals(session.network)
	};
});
var approveProposal_createServerFn_handler = createServerRpc({
	id: "342c268c6056eb24c3fcb07e370254d3046c1c3bc5b5e048cf78016245aedbb2",
	name: "approveProposal",
	filename: "src/lib/optn/api.ts"
}, (opts) => approveProposal.__executeServer(opts));
var approveProposal = createServerFn({ method: "POST" }).validator(object({
	id: string(),
	signature: string().optional(),
	demo: boolean().optional()
})).handler(approveProposal_createServerFn_handler, async ({ data }) => {
	const session = await requireSessionOn();
	const proposal = await getProposal(data.id, session.network);
	if (!proposal) throw new Error("Proposal not found");
	if (proposal.network !== session.network) throw new Error("Proposal network mismatch");
	const plan = await getPlan(proposal.planId, session.network);
	if (!plan) throw new Error("Plan not found");
	if (plan.network !== session.network) throw new Error("Plan network mismatch");
	if (!canApprove(session)) throw new Error("Account is not an authorized approver for this organization");
	if (!plan.governance.authorizedAccounts.includes(session.account)) throw new Error("Account is not an authorized approver for this plan");
	if (new Date(proposal.expiresAt).getTime() < Date.now()) {
		proposal.stage = "approval-expired";
		proposal.failureReason = "Proposal expired";
		await releaseOutpoint(proposal.network, proposal.sourceOutpoint.txid, proposal.sourceOutpoint.vout, proposal.id);
		await putProposal(proposal);
		throw new Error("Proposal expired");
	}
	if (proposal.approvals.some((item) => item.account === session.account)) return proposal;
	const message = approvalMessage(proposal.intentHash, proposal.network, proposal.id);
	let signature = data.signature ?? "";
	let evidence = "DESIGNED";
	const demoAllowed = session.authMethod === "demo" && publicConfig().mode === "demo";
	if (data.demo) {
		if (!demoAllowed) throw new Error("Demo approval is only available in demo mode");
		const key = demoPrivateKeyForAccount(session.account);
		if (!key) throw new Error("Demo key unavailable");
		signature = signBchMessage(key, message);
		evidence = "FIXTURE";
	} else if (session.authMethod === "demo" && !signature) throw new Error("Demo session must explicitly request a labelled demo approval");
	if (!verifyBchMessageAddress(proposal.network, session.account, message, signature)) throw new Error("Approval signature does not match this account and intent");
	if (plan.governance.proposerCannotBeSoleApprover && proposal.actor === session.account && proposal.approvals.length === 0 && plan.governance.threshold === 1) throw new Error("Proposer cannot be the sole approver");
	proposal.approvals.push({
		account: session.account,
		role: session.role,
		intentHash: proposal.intentHash,
		signature,
		evidence,
		at: (/* @__PURE__ */ new Date()).toISOString()
	});
	const unique = new Set(proposal.approvals.map((item) => item.account));
	if (unique.size >= proposal.threshold) {
		if (proposal.stage === "policy-valid") assertTransition(proposal.stage, "approved");
		proposal.stage = "approved";
	}
	proposal.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
	await putProposal(proposal);
	await audit({
		network: proposal.network,
		type: "proposal.approve",
		actor: session.account,
		objectType: "proposal",
		objectId: proposal.id,
		correlationId: proposal.correlationId,
		summary: `Approval ${unique.size}/${proposal.threshold}`,
		evidence
	});
	return proposal;
});
var approvalPayload_createServerFn_handler = createServerRpc({
	id: "607bd0c2d22af9610ca170c10f2c8fe9896199127fea3199ed20ff06a0d7bb34",
	name: "approvalPayload",
	filename: "src/lib/optn/api.ts"
}, (opts) => approvalPayload.__executeServer(opts));
var approvalPayload = createServerFn({ method: "POST" }).validator(object({ id: string() })).handler(approvalPayload_createServerFn_handler, async ({ data }) => {
	const session = await requireSessionOn();
	const proposal = await getProposal(data.id, session.network);
	if (!proposal) throw new Error("Proposal not found");
	if (proposal.network !== session.network) throw new Error("Proposal network mismatch");
	return {
		message: approvalMessage(proposal.intentHash, proposal.network, proposal.id),
		methods: ["bch_signMessage"],
		chainId: chainIdFor(session.network),
		account: session.account
	};
});
var buildProposalTx_createServerFn_handler = createServerRpc({
	id: "ea96676233f3829456ec5b536bfdf5b6709e83ed8c833806451eab0dd411efed",
	name: "buildProposalTx",
	filename: "src/lib/optn/api.ts"
}, (opts) => buildProposalTx.__executeServer(opts));
var buildProposalTx = createServerFn({ method: "POST" }).validator(object({ id: string() })).handler(buildProposalTx_createServerFn_handler, async ({ data }) => {
	const session = await requireSessionOn();
	const proposal = await getProposal(data.id, session.network);
	if (!proposal) throw new Error("Proposal not found");
	if (proposal.network !== session.network) throw new Error("Proposal network mismatch");
	if (proposal.stage !== "approved" && proposal.stage !== "unsigned-built") throw new Error("Proposal is not approved");
	const plan = await getPlan(proposal.planId, session.network);
	if (!plan) throw new Error("Plan not found");
	if (plan.status !== "active" || plan.version !== proposal.planVersion || plan.policyId !== proposal.policyId) throw new Error("Plan version is no longer the active published policy");
	const vault = await getVault(proposal.vaultId, session.network);
	if (!vault) throw new Error("Vault not found");
	assertPlanMatchesVaultArtifact(plan, vault);
	const operatorPkh = pkhForAccount(session.account);
	if (!operatorPkh || operatorPkh !== vault.constructor.operatorPkh) throw new Error("Authenticated account is not the covenant operator for this vault");
	const chainState = await freshVaultState(vault, session.network);
	if (chainState.outpoint.txid !== proposal.sourceOutpoint.txid || chainState.outpoint.vout !== proposal.sourceOutpoint.vout) {
		proposal.stage = "stale-input";
		proposal.failureReason = "Attached vault outpoint changed since proposal creation";
		await releaseOutpoint(proposal.network, proposal.sourceOutpoint.txid, proposal.sourceOutpoint.vout, proposal.id);
		await putProposal(proposal);
		throw new Error(proposal.failureReason);
	}
	if (chainState.valueSatoshis !== proposal.sourceValueSatoshis) {
		proposal.stage = "stale-input";
		proposal.failureReason = "Source value changed since proposal creation";
		await releaseOutpoint(proposal.network, proposal.sourceOutpoint.txid, proposal.sourceOutpoint.vout, proposal.id);
		await putProposal(proposal);
		throw new Error(proposal.failureReason);
	}
	if (chainState.spent) {
		proposal.stage = "stale-input";
		proposal.failureReason = "Source outpoint is spent";
		await releaseOutpoint(proposal.network, proposal.sourceOutpoint.txid, proposal.sourceOutpoint.vout, proposal.id);
		await putProposal(proposal);
		throw new Error(proposal.failureReason);
	}
	const built = buildUnsignedVaultRelease({
		utxo: chainState,
		paymentLockingBytecodeHex: proposal.destinationLockingBytecodeHex,
		successorLockingBytecodeHex: proposal.successorLockingBytecodeHex,
		amountSatoshis: proposal.amountSatoshis,
		feeSatoshis: proposal.feeSatoshis
	});
	proposal.unsignedTxHex = built.rawHex;
	proposal.stage = "unsigned-built";
	proposal.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
	await putProposal(proposal);
	await audit({
		network: proposal.network,
		type: "transaction.build",
		actor: session.account,
		objectType: "proposal",
		objectId: proposal.id,
		correlationId: proposal.correlationId,
		summary: "Unsigned transaction constructed",
		evidence: "DESIGNED"
	});
	return {
		proposal,
		built
	};
});
var simulateLocalSign_createServerFn_handler = createServerRpc({
	id: "f1f190728672fe0cba037cb076bc5ea5acb64c4ea40dcf4fd03f68bd7d7799b2",
	name: "simulateLocalSign",
	filename: "src/lib/optn/api.ts"
}, (opts) => simulateLocalSign.__executeServer(opts));
var simulateLocalSign = createServerFn({ method: "POST" }).validator(object({ id: string() })).handler(simulateLocalSign_createServerFn_handler, async ({ data }) => {
	const session = await requireSessionOn();
	if (session.authMethod !== "demo" || publicConfig().mode !== "demo") throw new Error("Local VM sign with demo keys is only available in demo mode");
	if (!canOperate(session)) throw new Error("Only the demo operator can use local demo signing");
	const proposal = await getProposal(data.id, session.network);
	if (!proposal) throw new Error("Proposal not found");
	if (proposal.network !== session.network) throw new Error("Proposal network mismatch");
	if (!proposal.unsignedTxHex) throw new Error("Build the unsigned transaction first");
	if (proposal.stage !== "unsigned-built" && proposal.stage !== "locally-vm-validated") throw new Error("Proposal is not ready for local demo signing");
	const vault = await getVault(proposal.vaultId, session.network);
	if (!vault) throw new Error("Vault not found");
	const key = demoPrivateKeyForAccount(IDENTITIES.alice.account);
	if (!key) throw new Error("Demo operator key unavailable");
	const signed = signVaultRelease({
		unsignedHex: proposal.unsignedTxHex,
		redeemHex: vault.redeemBytecodeHex,
		privateKey: key,
		publicKey: hexToBin(IDENTITIES.alice.publicKeyHex),
		sourceValueSatoshis: vault.state.valueSatoshis,
		sourceLockingBytecodeHex: vault.covenantLockingBytecodeHex
	});
	const match = signedMatchesIntent({
		signedHex: signed.signedHex,
		expectedNetwork: proposal.network,
		expectedVersion: proposal.txVersion ?? 2,
		expectedLocktime: proposal.locktime ?? 0,
		expectedSequence: proposal.inputSequence ?? 4294967294,
		expectedOutpoints: [proposal.sourceOutpoint],
		expectedOutputs: proposal.preview.outputs,
		expectedFee: proposal.feeSatoshis,
		inputValueSatoshis: vault.state.valueSatoshis
	});
	if (!match.ok) {
		proposal.stage = "wallet-mismatched";
		proposal.failureReason = match.reason;
		await putProposal(proposal);
		throw new Error(match.reason ?? "Signed transaction mismatch");
	}
	const vm = verifyTransactionVm({
		rawTxHex: signed.signedHex,
		sourceOutputs: [{
			lockingBytecodeHex: vault.covenantLockingBytecodeHex,
			valueSatoshis: vault.state.valueSatoshis
		}]
	});
	proposal.signedTxHex = signed.signedHex;
	proposal.signedTxid = signed.txid;
	proposal.covenantDecision = {
		...proposal.covenantDecision,
		vmAttempted: vm.attempted,
		vmValid: vm.valid,
		vmError: vm.error
	};
	proposal.stage = vm.valid ? "locally-vm-validated" : "vm-invalid";
	proposal.failureReason = vm.valid ? null : vm.error;
	proposal.evidence = vm.valid ? ["FIXTURE", "LOCALLY_VM_VALIDATED"] : ["FAILED"];
	proposal.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
	await putProposal(proposal);
	await audit({
		network: proposal.network,
		type: "transaction.simulate-sign",
		actor: session.account,
		objectType: "proposal",
		objectId: proposal.id,
		correlationId: proposal.correlationId,
		summary: vm.valid ? "Local CashVM passed (DEMO keys, unbroadcast)" : `VM invalid: ${vm.error}`,
		evidence: vm.valid ? "LOCALLY_VM_VALIDATED" : "FAILED"
	});
	return {
		proposal,
		vm
	};
});
var verifySignedTx_createServerFn_handler = createServerRpc({
	id: "92b20b76d38f70681eea98f5da46a6fd009dddd1579c134f12e8440eb2e69a66",
	name: "verifySignedTx",
	filename: "src/lib/optn/api.ts"
}, (opts) => verifySignedTx.__executeServer(opts));
var verifySignedTx = createServerFn({ method: "POST" }).validator(object({
	id: string(),
	signedTxHex: string().regex(/^(?:[0-9a-f]{2})+$/i, "Signed transaction must be hex")
})).handler(verifySignedTx_createServerFn_handler, async ({ data }) => {
	const session = await requireSessionOn();
	if (!canOperate(session)) throw new Error("Only the configured covenant operator can submit a signed transaction");
	const proposal = await getProposal(data.id, session.network);
	if (!proposal) throw new Error("Proposal not found");
	if (proposal.network !== session.network) throw new Error("Proposal network mismatch");
	if (![
		"unsigned-built",
		"locally-vm-validated",
		"signing-requested",
		"signed",
		"signed-vm-validated"
	].includes(proposal.stage)) throw new Error("Proposal is not ready for signed-transaction verification");
	const vault = await getVault(proposal.vaultId, session.network);
	if (!vault) throw new Error("Vault not found");
	const chainState = await freshVaultState(vault, session.network);
	if (chainState.outpoint.txid !== proposal.sourceOutpoint.txid || chainState.outpoint.vout !== proposal.sourceOutpoint.vout) throw new Error("Source outpoint changed since proposal creation");
	if (chainState.valueSatoshis !== proposal.sourceValueSatoshis) throw new Error("Source value changed since proposal creation");
	const operatorPkh = pkhForAccount(session.account);
	if (!operatorPkh || !vault.constructor.operatorPkh || operatorPkh !== vault.constructor.operatorPkh) throw new Error("Authenticated account is not the covenant operator for this vault");
	if (proposal.stage === "unsigned-built" || proposal.stage === "locally-vm-validated") proposal.stage = "signing-requested";
	const match = signedMatchesIntent({
		signedHex: data.signedTxHex,
		expectedNetwork: proposal.network,
		expectedVersion: proposal.txVersion ?? 2,
		expectedLocktime: proposal.locktime ?? 0,
		expectedSequence: proposal.inputSequence ?? 4294967294,
		expectedOutpoints: [proposal.sourceOutpoint],
		expectedOutputs: proposal.preview.outputs,
		expectedFee: proposal.feeSatoshis,
		inputValueSatoshis: chainState.valueSatoshis
	});
	if (!match.ok) {
		proposal.stage = "wallet-mismatched";
		proposal.failureReason = match.reason;
		await putProposal(proposal);
		throw new Error(match.reason ?? "Wallet returned a different transaction");
	}
	proposal.stage = "signed";
	proposal.signedTxHex = data.signedTxHex;
	const vm = verifyTransactionVm({
		rawTxHex: data.signedTxHex,
		sourceOutputs: [{
			lockingBytecodeHex: vault.covenantLockingBytecodeHex,
			valueSatoshis: chainState.valueSatoshis
		}]
	});
	proposal.covenantDecision = {
		...proposal.covenantDecision,
		vmAttempted: true,
		vmValid: vm.valid,
		vmError: vm.error
	};
	proposal.stage = vm.valid ? "signed-vm-validated" : "vm-invalid";
	proposal.signedTxid = vm.valid ? txidFromEncoded(hexToBin(data.signedTxHex)) : null;
	proposal.evidence = vm.valid ? ["SIGNED_BUT_UNBROADCAST", "LOCALLY_VM_VALIDATED"] : ["FAILED"];
	proposal.failureReason = vm.valid ? null : vm.error;
	proposal.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
	await putProposal(proposal);
	await audit({
		network: session.network,
		type: "transaction.verify-signed",
		actor: session.account,
		objectType: "proposal",
		objectId: proposal.id,
		correlationId: proposal.correlationId,
		summary: vm.valid ? "Wallet-signed transaction verified" : `VM invalid: ${vm.error}`,
		evidence: vm.valid ? "SIGNED_BUT_UNBROADCAST" : "FAILED"
	});
	return {
		proposal,
		vm
	};
});
var signingPayload_createServerFn_handler = createServerRpc({
	id: "841349b1fad647a3929c52ec41f03662e713b4323aae590b7522d40e791642c4",
	name: "signingPayload",
	filename: "src/lib/optn/api.ts"
}, (opts) => signingPayload.__executeServer(opts));
var signingPayload = createServerFn({ method: "POST" }).validator(object({ id: string() })).handler(signingPayload_createServerFn_handler, async ({ data }) => {
	const session = await requireSessionOn();
	if (!canOperate(session)) throw new Error("Only the configured covenant operator can request transaction signing");
	const proposal = await getProposal(data.id, session.network);
	if (!proposal) throw new Error("Proposal not found");
	if (proposal.network !== session.network) throw new Error("Proposal network mismatch");
	if (!proposal.unsignedTxHex) throw new Error("Build the unsigned transaction first");
	if (proposal.stage !== "unsigned-built" && proposal.stage !== "signing-requested") throw new Error("Proposal is not ready for wallet signing");
	if (new Date(proposal.expiresAt).getTime() < Date.now()) throw new Error("Proposal expired");
	if (new Set(proposal.approvals.map((item) => item.account)).size < proposal.threshold) throw new Error("Approval threshold is not met");
	const vault = await getVault(proposal.vaultId, session.network);
	if (!vault) throw new Error("Vault not found");
	const operatorPkh = pkhForAccount(session.account);
	if (!operatorPkh || operatorPkh !== vault.constructor.operatorPkh) throw new Error("Authenticated account is not the covenant operator for this vault");
	const chainState = await freshVaultState(vault, session.network);
	if (chainState.outpoint.txid !== proposal.sourceOutpoint.txid || chainState.outpoint.vout !== proposal.sourceOutpoint.vout) throw new Error("Source outpoint changed since proposal creation");
	proposal.stage = "signing-requested";
	await putProposal(proposal);
	return {
		proposal,
		request: buildSignTransactionParams({
			account: session.account,
			unsignedHex: proposal.unsignedTxHex,
			source: chainState,
			redeemBytecodeHex: vault.redeemBytecodeHex,
			contractName: vault.contractName,
			userPrompt: `Sign BoundedRelease payment ${proposal.amountSatoshis} sats. Broadcast is disabled in-wallet.`
		}),
		methods: ["bch_signTransaction"],
		chainId: chainIdFor(session.network)
	};
});
var broadcastProposal_createServerFn_handler = createServerRpc({
	id: "39c84cb8ce5e67990f9f1f682dfd0521f8cbf06bed5e2d51b4dfc0b40e41dbea",
	name: "broadcastProposal",
	filename: "src/lib/optn/api.ts"
}, (opts) => broadcastProposal.__executeServer(opts));
var broadcastProposal = createServerFn({ method: "POST" }).validator(object({
	id: string(),
	explicitConfirm: boolean()
})).handler(broadcastProposal_createServerFn_handler, async ({ data }) => {
	const session = await requireSessionOn();
	if (!data.explicitConfirm) throw new Error("Broadcast requires explicit confirmation");
	const proposal = await getProposal(data.id, session.network);
	if (!proposal) throw new Error("Proposal not found");
	if (proposal.network !== session.network) throw new Error("Proposal network mismatch");
	if (proposal.broadcastTxid) return {
		proposal,
		duplicate: true
	};
	if (proposal.stage !== "signed-vm-validated") throw new Error("Broadcast requires signed-vm-validated state. Demo local VM is not wallet-signed.");
	if (!proposal.signedTxHex) throw new Error("No signed transaction");
	if (new Date(proposal.expiresAt).getTime() < Date.now()) {
		proposal.stage = "approval-expired";
		await releaseOutpoint(proposal.network, proposal.sourceOutpoint.txid, proposal.sourceOutpoint.vout, proposal.id);
		await putProposal(proposal);
		throw new Error("Proposal expired");
	}
	const plan = await getPlan(proposal.planId, session.network);
	if (!plan || plan.status !== "active" || plan.version !== proposal.planVersion || plan.policyId !== proposal.policyId) throw new Error("Published plan version is no longer active");
	if (plan.network !== session.network || plan.artifactHash !== proposal.artifactHash) throw new Error("Proposal artifact/network does not match the active plan");
	if (new Set(proposal.approvals.map((item) => item.account)).size < proposal.threshold) throw new Error("Approval threshold is no longer met");
	const vault = await getVault(proposal.vaultId, session.network);
	if (!vault?.liveSpendEnabled) throw new Error("Vault is not live-spend enabled");
	if (!vault.onChainRecipientEnforced || vault.reviewedShapeId !== "bounded-release-v1") throw new Error("Only the reviewed recipient-enforcing BoundedRelease shape can broadcast");
	const reviewedArtifact = await liveBoundedReleaseArtifact(session.network);
	assertArtifactMatchesLock(reviewedArtifact, vault.covenantLockingBytecodeHex);
	if (reviewedArtifact.artifactHash !== vault.artifactHash) throw new Error("Vault artifact is not the currently reviewed artifact");
	if (vault.artifactHash !== proposal.artifactHash || vault.artifactHash !== plan.artifactHash) throw new Error("Vault, proposal, and plan artifact hashes do not match");
	for (const approval of proposal.approvals) {
		if (approval.intentHash !== proposal.intentHash) throw new Error("Approval intent hash no longer matches");
		if (!verifyBchMessageAddress(proposal.network, approval.account, approvalMessage(proposal.intentHash, proposal.network, proposal.id), approval.signature)) throw new Error(`Approval signature for ${approval.account} could not be re-verified`);
	}
	const chainState = await freshVaultState(vault, session.network);
	if (chainState.outpoint.txid !== proposal.sourceOutpoint.txid || chainState.outpoint.vout !== proposal.sourceOutpoint.vout) throw new Error("Source outpoint changed since proposal creation");
	if (chainState.valueSatoshis !== proposal.sourceValueSatoshis) throw new Error("Source value changed since proposal creation");
	if (!publicConfig().broadcastConfigured) throw new Error("Broadcast is unavailable: no Chipnet provider is configured. Demo mode will not invent a live result.");
	const match = signedMatchesIntent({
		signedHex: proposal.signedTxHex,
		expectedNetwork: proposal.network,
		expectedVersion: proposal.txVersion ?? 2,
		expectedLocktime: proposal.locktime ?? 0,
		expectedSequence: proposal.inputSequence ?? 4294967294,
		expectedOutpoints: [proposal.sourceOutpoint],
		expectedOutputs: proposal.preview.outputs,
		expectedFee: proposal.feeSatoshis,
		inputValueSatoshis: chainState.valueSatoshis
	});
	if (!match.ok) throw new Error(match.reason ?? "Signed transaction no longer matches intent");
	const vm = verifyTransactionVm({
		rawTxHex: proposal.signedTxHex,
		sourceOutputs: [{
			lockingBytecodeHex: vault.covenantLockingBytecodeHex,
			valueSatoshis: chainState.valueSatoshis
		}]
	});
	if (!vm.valid) {
		proposal.stage = "vm-invalid";
		proposal.failureReason = vm.error;
		await putProposal(proposal);
		throw new Error(vm.error ?? "VM invalid");
	}
	if (proposal.covenantDecision.vmValid !== true) throw new Error("Broadcast requires a previously recorded signed-transaction VM pass");
	const signedTxid = txidFromEncoded(hexToBin(proposal.signedTxHex));
	if (proposal.signedTxid && proposal.signedTxid !== signedTxid) throw new Error("Stored signed transaction id does not match signed bytes");
	const provider = createChainProvider({
		indexerUrl: indexerUrl(session.network),
		broadcastUrl: broadcastUrl(session.network)
	});
	try {
		await provider.proveUnspent(session.network, proposal.sourceOutpoint);
	} catch (error) {
		proposal.stage = "stale-input";
		proposal.failureReason = error instanceof Error ? error.message : "Outpoint is not unspent";
		await putProposal(proposal);
		throw new Error(proposal.failureReason);
	}
	const preflight = await provider.preflight(session.network, proposal.signedTxHex);
	if (!preflight.ok) {
		proposal.stage = "provider-rejected";
		proposal.failureReason = preflight.error;
		await putProposal(proposal);
		throw new Error(preflight.error ?? "Provider preflight failed");
	}
	const existingLock = await getBroadcastLock(proposal.id);
	if (existingLock?.txid) {
		const latest = await getProposal(proposal.id, session.network);
		if (latest?.broadcastTxid) return {
			proposal: latest,
			duplicate: true
		};
		throw new Error("Broadcast lock has a recorded txid but proposal state is inconsistent; reconcile before retrying");
	}
	const locked = await acquireBroadcastLock(proposal.id);
	const latest = await getProposal(proposal.id, session.network);
	if (latest?.broadcastTxid) return {
		proposal: latest,
		duplicate: true
	};
	if (!locked && existingLock && !existingLock.txid) throw new Error("Broadcast already in progress");
	proposal.stage = "broadcast-requested";
	await putProposal(proposal);
	try {
		const result = await provider.broadcast(session.network, proposal.signedTxHex);
		if (result.txid.toLowerCase() !== signedTxid.toLowerCase()) throw new Error("Provider returned a txid that does not match the signed transaction");
		proposal.broadcastTxid = result.txid;
		proposal.stage = "provider-accepted";
		proposal.evidence = ["PROVIDER_ACCEPTED"];
		await putProposal(proposal);
		await setBroadcastLockTxid(proposal.id, result.txid);
		await markOutpointSpent(proposal.network, proposal.sourceOutpoint.txid, proposal.sourceOutpoint.vout, proposal.id);
		await audit({
			network: session.network,
			type: "transaction.broadcast",
			actor: session.account,
			objectType: "proposal",
			objectId: proposal.id,
			correlationId: proposal.correlationId,
			summary: `Provider accepted ${result.txid}`,
			evidence: "PROVIDER_ACCEPTED"
		});
		return {
			proposal,
			duplicate: false
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Broadcast failed";
		const definitiveRejection = /^Broadcast rejected: 4\d\d\b/.test(message) || message === "Broadcast endpoint was not found";
		if (definitiveRejection) await releaseBroadcastLock(proposal.id);
		proposal.stage = definitiveRejection ? "provider-rejected" : "broadcast-uncertain";
		proposal.failureReason = definitiveRejection ? message : `${message}. Provider acceptance is uncertain; the broadcast lock was retained to prevent a duplicate spend.`;
		await putProposal(proposal);
		throw error;
	}
});
var reconcileBroadcast_createServerFn_handler = createServerRpc({
	id: "169ff87a3dfe93e96363d557729b17a2b125305d2792d0ff88c829781a4c314c",
	name: "reconcileBroadcast",
	filename: "src/lib/optn/api.ts"
}, (opts) => reconcileBroadcast.__executeServer(opts));
var reconcileBroadcast = createServerFn({ method: "POST" }).validator(object({ id: string() })).handler(reconcileBroadcast_createServerFn_handler, async ({ data }) => {
	const session = await requireSessionOn();
	const proposal = await getProposal(data.id, session.network);
	if (!proposal) throw new Error("Proposal not found");
	if (proposal.network !== session.network) throw new Error("Proposal network mismatch");
	if (!proposal.signedTxHex || !proposal.signedTxid) throw new Error("No signed transaction to reconcile");
	if (proposal.broadcastTxid) return {
		proposal,
		status: await providerFor(session.network).getStatus(session.network, proposal.broadcastTxid)
	};
	if (proposal.stage !== "broadcast-uncertain") throw new Error("Only a broadcast-uncertain proposal can be reconciled without a provider txid");
	const signedTxid = txidFromEncoded(hexToBin(proposal.signedTxHex));
	if (signedTxid !== proposal.signedTxid) throw new Error("Stored signed transaction id does not match signed bytes");
	const provider = providerFor(session.network);
	const status = await provider.getStatus(session.network, signedTxid);
	if (status.kind !== "mempool" && status.kind !== "confirmed") return {
		proposal,
		status
	};
	const existingLock = await getBroadcastLock(proposal.id);
	if (existingLock?.txid && existingLock.txid.toLowerCase() !== signedTxid.toLowerCase()) throw new Error("Broadcast lock txid does not match the signed transaction");
	if (!existingLock) {
		if (!await acquireBroadcastLock(proposal.id)) throw new Error("Broadcast reconciliation is already in progress");
	}
	await setBroadcastLockTxid(proposal.id, signedTxid);
	proposal.broadcastTxid = signedTxid;
	proposal.stage = status.kind === "confirmed" ? "confirmed" : "mempool-observed";
	proposal.confirmations = status.confirmations;
	proposal.evidence = status.kind === "confirmed" ? ["CONFIRMED"] : ["MEMPOOL_OBSERVED"];
	if (status.kind === "confirmed") {
		const observed = await provider.getTransactionOutput(session.network, {
			txid: signedTxid,
			vout: 1
		});
		if (observed && observed.lockingBytecodeHex === proposal.successorLockingBytecodeHex && observed.valueSatoshis === proposal.successorValueSatoshis) {
			proposal.stage = "successor-verified";
			proposal.evidence = ["SUCCESSOR_VERIFIED"];
		} else if (observed) {
			proposal.stage = "failed";
			proposal.failureReason = "Successor output does not match the approved intent";
		}
	}
	proposal.failureReason = proposal.stage === "failed" ? proposal.failureReason : null;
	proposal.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
	await putProposal(proposal);
	await markOutpointSpent(proposal.network, proposal.sourceOutpoint.txid, proposal.sourceOutpoint.vout, proposal.id);
	await audit({
		network: session.network,
		type: "transaction.reconcile",
		actor: session.account,
		objectType: "proposal",
		objectId: proposal.id,
		correlationId: proposal.correlationId,
		summary: `Reconciled provider-observed transaction ${signedTxid}`,
		evidence: proposal.evidence[0] ?? "UNKNOWN"
	});
	return {
		proposal,
		status
	};
});
var refreshProposalStatus_createServerFn_handler = createServerRpc({
	id: "02a86496db7ff13db310f851e098eed737f39e58156f3820415eeefc882b12e8",
	name: "refreshProposalStatus",
	filename: "src/lib/optn/api.ts"
}, (opts) => refreshProposalStatus.__executeServer(opts));
var refreshProposalStatus = createServerFn({ method: "POST" }).validator(object({ id: string() })).handler(refreshProposalStatus_createServerFn_handler, async ({ data }) => {
	const session = await requireSessionOn();
	const proposal = await getProposal(data.id, session.network);
	if (!proposal?.broadcastTxid) throw new Error("No broadcast txid to observe");
	if (proposal.network !== session.network) throw new Error("Proposal network mismatch");
	const vault = await getVault(proposal.vaultId, session.network);
	const provider = createChainProvider({
		indexerUrl: indexerUrl(session.network),
		broadcastUrl: broadcastUrl(session.network)
	});
	const status = await provider.getStatus(session.network, proposal.broadcastTxid);
	if (status.kind === "not-found" && proposal.stage === "provider-accepted") {
		proposal.stage = "broadcast-uncertain";
		proposal.failureReason = "Provider accepted but indexer does not yet see the transaction";
	} else if (status.kind === "not-found") proposal.stage = "mempool-dropped";
	else if (status.kind === "mempool") {
		proposal.stage = "mempool-observed";
		proposal.evidence = ["MEMPOOL_OBSERVED"];
	} else if (status.kind === "confirmed") {
		proposal.stage = "confirmed";
		proposal.confirmations = status.confirmations;
		proposal.evidence = ["CONFIRMED"];
		const observed = await provider.getTransactionOutput(session.network, {
			txid: proposal.broadcastTxid,
			vout: 1
		});
		if (observed && observed.lockingBytecodeHex === proposal.successorLockingBytecodeHex && observed.valueSatoshis === proposal.successorValueSatoshis) {
			proposal.stage = "successor-verified";
			proposal.evidence = ["SUCCESSOR_VERIFIED"];
		} else if (observed) {
			proposal.stage = "failed";
			proposal.failureReason = "Successor output does not match the approved intent";
		}
	} else if (status.kind === "unknown") {
		proposal.stage = "broadcast-uncertain";
		proposal.failureReason = status.reason ?? "Indexer status unknown";
	}
	proposal.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
	await putProposal(proposal);
	return {
		proposal,
		status,
		vault
	};
});
var loadAudit_createServerFn_handler = createServerRpc({
	id: "b205befb6bc6e2932d4ebaa3076b6780d08aedd129a516fef9fa0294d9bdcd53",
	name: "loadAudit",
	filename: "src/lib/optn/api.ts"
}, (opts) => loadAudit.__executeServer(opts));
var loadAudit = createServerFn({ method: "GET" }).handler(loadAudit_createServerFn_handler, async () => {
	const config = publicConfig();
	const session = await optionalSession();
	if (!session) return {
		config,
		events: []
	};
	await assertNetworkGate(session.network);
	return {
		config,
		events: await listAudit(session.network, 120)
	};
});
var loadCapabilities_createServerFn_handler = createServerRpc({
	id: "549d0030a8654e2f83fa37cfe83d2c223eec051b7c109115581074b0364218fa",
	name: "loadCapabilities",
	filename: "src/lib/optn/api.ts"
}, (opts) => loadCapabilities.__executeServer(opts));
var loadCapabilities = createServerFn({ method: "GET" }).handler(loadCapabilities_createServerFn_handler, async () => {
	const session = await optionalSession();
	const config = publicConfig();
	return {
		config,
		session,
		grants: capabilitiesFor(session?.role ?? null, config)
	};
});
var runScenario_createServerFn_handler = createServerRpc({
	id: "2839caf665de1c5d93a60fa9e31bc0f266aae1166647711d0b5bdfdc80a60b26",
	name: "runScenario",
	filename: "src/lib/optn/api.ts"
}, (opts) => runScenario.__executeServer(opts));
var runScenario = createServerFn({ method: "POST" }).validator(object({ scenario: string() })).handler(runScenario_createServerFn_handler, async ({ data }) => {
	const session = await requireSessionOn();
	const plan = (await listPlans(session.network))[0];
	if (!plan) throw new Error("No plan");
	const scenario = data.scenario;
	const base = {
		session,
		planId: plan.id,
		routeId: 0,
		amountSatoshis: "2000000",
		feeSatoshis: "1000",
		idempotencyKey: newId("scn")
	};
	switch (scenario) {
		case "valid-spend": return {
			scenario,
			proposal: await createProposalFrom(base),
			catalog: SCENARIOS
		};
		case "over-limit": return {
			scenario,
			proposal: await createProposalFrom({
				...base,
				amountSatoshis: "8000000"
			}),
			catalog: SCENARIOS
		};
		case "wrong-recipient": return {
			scenario,
			proposal: await createProposalFrom({
				...base,
				destinationLockingBytecodeHex: IDENTITIES.recovery.lockingBytecodeHex
			}),
			catalog: SCENARIOS
		};
		case "wrong-category": return {
			scenario,
			proposal: await createProposalFrom({
				...base,
				tokenCategory: "aa".repeat(32)
			}),
			catalog: SCENARIOS
		};
		case "altered-successor": return {
			scenario,
			proposal: await createProposalFrom({
				...base,
				successorLockingBytecodeHex: IDENTITIES.alice.lockingBytecodeHex
			}),
			catalog: SCENARIOS
		};
		case "stale-outpoint": return {
			scenario,
			proposal: await createProposalFrom({
				...base,
				spent: true
			}),
			catalog: SCENARIOS
		};
		case "duplicate-intent": {
			const first = await createProposalFrom({
				...base,
				idempotencyKey: "dup-fixed"
			});
			return {
				scenario,
				proposal: await createProposalFrom({
					...base,
					idempotencyKey: "dup-fixed"
				}),
				duplicateOf: first.id,
				catalog: SCENARIOS
			};
		}
		case "insufficient-approvals": return {
			scenario,
			proposal: await createProposalFrom(base),
			catalog: SCENARIOS
		};
		default: throw new Error("Unknown scenario");
	}
});
var listScenarios_createServerFn_handler = createServerRpc({
	id: "bc1500be8093921884ac7e0bbba5034ac2af9c95848734885c016a529e7391cc",
	name: "listScenarios",
	filename: "src/lib/optn/api.ts"
}, (opts) => listScenarios.__executeServer(opts));
var listScenarios = createServerFn({ method: "GET" }).handler(listScenarios_createServerFn_handler, async () => SCENARIOS);
//#endregion
export { approvalPayload_createServerFn_handler, approveProposal_createServerFn_handler, attachVault_createServerFn_handler, bootstrapOrganization_createServerFn_handler, broadcastProposal_createServerFn_handler, buildProposalTx_createServerFn_handler, createProposal_createServerFn_handler, demoLogin_createServerFn_handler, enrollSelfAsRecipient_createServerFn_handler, getCurrentSession_createServerFn_handler, getPublicConfig_createServerFn_handler, issueLoginChallenge_createServerFn_handler, issueOrganizationInvite_createServerFn_handler, listDemoIdentities_createServerFn_handler, listScenarios_createServerFn_handler, loadAudit_createServerFn_handler, loadCapabilities_createServerFn_handler, loadOrganization_createServerFn_handler, loadOverview_createServerFn_handler, loadPlan_createServerFn_handler, loadPlans_createServerFn_handler, loadProposal_createServerFn_handler, loadProposals_createServerFn_handler, loadVaults_createServerFn_handler, logout_createServerFn_handler, publishPlan_createServerFn_handler, reconcileBroadcast_createServerFn_handler, redeemOrganizationInvite_createServerFn_handler, refreshOrganizationAccess_createServerFn_handler, refreshProposalStatus_createServerFn_handler, runScenario_createServerFn_handler, saveCovenantBlueprint_createServerFn_handler, savePlanDraft_createServerFn_handler, signingPayload_createServerFn_handler, simulateLocalSign_createServerFn_handler, verifyLogin_createServerFn_handler, verifySignedTx_createServerFn_handler };
