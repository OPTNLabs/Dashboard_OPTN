import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type {
  ControlPlan,
  EvidenceLevel,
  LifecycleStage,
  Network,
  OperatorSession,
  Proposal,
  PublicConfig,
} from "./types.ts";
import { publicConfig, indexerUrl, broadcastUrl, mainnetEnabled } from "./config.server.ts";
import {
  audit,
  consumeChallenge,
  deleteSession,
  getIdempotent,
  getPlan,
  getPlanVersion,
  getProposal,
  getSession,
  getOrganization,
  deleteProposal,
  getVault,
  listAudit,
  listPlans,
  listProposals,
  listVaults,
  newId,
  putIdempotent,
  putPlan,
  putProposal,
  putVault,
  saveChallenge,
  saveSession,
  snapshotPlanVersion,
  tryReserveOutpoint,
  releaseOutpoint,
  acquireBroadcastLock,
  getBroadcastLock,
  setBroadcastLockTxid,
  releaseBroadcastLock,
  markOutpointSpent,
  bootstrapOrganization as persistOrganization,
  createOrganizationInvite as persistOrganizationInvite,
  redeemOrganizationInvite as redeemPersistedOrganizationInvite,
  setOrganizationCovenantBlueprint,
  setOrganizationRecipient,
  updateSessionRole,
} from "./store.server.ts";
import { IDENTITIES } from "./identities.ts";
import { pkhForAccount, roleForOrgAccount } from "./org.server.ts";

import { requestOrigin } from "./origin.server.ts";
import { TX_VERSION, SEQUENCE_ENABLE_LOCKTIME } from "./tx-constants.ts";
import { assertArtifactMatchesLock } from "./artifacts.ts";
import { liveBoundedReleaseArtifact } from "./artifacts.server.ts";
import { chainIdFor } from "./networks.ts";
import { buildSignTransactionParams } from "./wallet-connect.ts";

import { demoVault, SCENARIOS, type ScenarioId } from "./fixtures.ts";
import { MAX_FEE_SATS } from "./artifacts.ts";
import { BOUNDED_RELEASE_SHAPE_ID, defaultDirectPaymentRoute } from "./covenant.ts";
import {
  hashPolicy,
  loginMessage,
  approvalMessage,
  buildCanonicalIntent,
  hashIntent,
} from "./intent.ts";
import { explainDecision } from "./policy.ts";
import {
  assertPlanMatchesVaultArtifact,
  compileExecutableStudio,
  executableStudioRules,
} from "./studio-compiler.ts";
import {
  previewTransition,
  buildUnsignedVaultRelease,
  signVaultRelease,
  signedMatchesIntent,
} from "./tx-builder.ts";
import { verifyTransactionVm } from "./vm.ts";
import { parseSatoshis } from "./money.ts";
import {
  addressFromLockingBytecode,
  signBchMessage,
  verifyBchMessageAddress,
  hexToBin,
  txidFromEncoded,
} from "./encoding.ts";
import { demoPrivateKeyForAccount } from "./demo-keys.server.ts";
import { capabilitiesFor } from "./capabilities.ts";
import { createChainProvider, readWalletChainState } from "./chain.ts";
import { assertTransition } from "./lifecycle.ts";

const SESSION_COOKIE = "optn_session";
const satoshisSchema = z.string().regex(/^\d+$/, "Satoshis must be a non-negative integer string");

function canOperate(session: OperatorSession): boolean {
  return session.role === "owner" || session.role === "operator";
}

function canApprove(session: OperatorSession): boolean {
  return canOperate(session) || session.role === "approver";
}

const canvasSchema = z.object({
  nodes: z.array(
    z.object({
      id: z.string().min(1),
      kind: z.enum([
        "source",
        "vault",
        "asset",
        "route",
        "constraint",
        "governance",
        "recovery",
        "evidence",
      ]),
      label: z.string(),
      x: z.number().finite(),
      y: z.number().finite(),
      data: z.record(z.string(), z.string()),
    }),
  ),
  edges: z.array(
    z.object({
      id: z.string().min(1),
      source: z.string().min(1),
      target: z.string().min(1),
      kind: z.enum(["bch", "successor", "approval", "recovery"]),
      label: z.string(),
    }),
  ),
});

async function readCookie(): Promise<string | null> {
  const { getCookie } = await import("@tanstack/react-start/server");
  return getCookie(SESSION_COOKIE) ?? null;
}

async function writeCookie(id: string, expiresAt: Date) {
  const { setCookie } = await import("@tanstack/react-start/server");
  setCookie(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
    secure: process.env.NODE_ENV === "production",
  });
}

async function clearCookie() {
  const { setCookie } = await import("@tanstack/react-start/server");
  setCookie(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}

async function requireSession(): Promise<OperatorSession> {
  const id = await readCookie();
  if (!id) throw new Error("Not authenticated");
  const session = await getSession(id);
  if (!session) throw new Error("Session expired");
  return session;
}

async function optionalSession(): Promise<OperatorSession | null> {
  const id = await readCookie();
  if (!id) return null;
  return getSession(id);
}

async function assertNetworkGate(network: Network) {
  const config = publicConfig();
  if (network === "mainnet" && !mainnetEnabled()) {
    throw new Error("Mainnet is server-disabled. ENABLE_MAINNET is not set.");
  }
  if (network !== config.network) {
    throw new Error("Requested network does not match the dashboard network");
  }
}

async function requireSessionOn(network?: Network): Promise<OperatorSession> {
  const session = await requireSession();
  await assertNetworkGate(session.network);
  if (network && session.network !== network)
    throw new Error("Session network does not match this object");
  return session;
}

function providerFor(network: Network) {
  return createChainProvider({
    indexerUrl: indexerUrl(network),
    broadcastUrl: broadcastUrl(network),
  });
}

async function freshVaultState(vault: Awaited<ReturnType<typeof getVault>>, network: Network) {
  if (!vault) throw new Error("Vault not found");
  const provider = providerFor(network);
  if (provider.kind === "fixture") {
    if (publicConfig().mode !== "demo") {
      throw new Error("A live chain provider is required to refresh covenant vault state");
    }
    return vault.state;
  }
  const observed = await provider.proveUnspent(network, vault.stateOutpoint);
  if (observed.network !== network) throw new Error("Observed vault UTXO is on the wrong network");
  if (
    observed.outpoint.txid !== vault.stateOutpoint.txid ||
    observed.outpoint.vout !== vault.stateOutpoint.vout
  ) {
    throw new Error("Provider returned a different vault outpoint");
  }
  if (
    observed.lockingBytecodeHex.toLowerCase() !== vault.covenantLockingBytecodeHex.toLowerCase()
  ) {
    throw new Error("Provider UTXO lock does not match the attached vault");
  }
  if (observed.tokenEvidence === "unknown" || observed.tokenEvidence === "provider-omitted") {
    throw new Error("Provider did not prove native-only token state");
  }
  if (observed.token.categoryHex)
    throw new Error("Native BoundedRelease refuses a token-bearing vault UTXO");
  return observed;
}

async function resolveOrigin(): Promise<string> {
  return requestOrigin();
}

async function issueChallengeRecord(account: string, network: "chipnet" | "mainnet") {
  await assertNetworkGate(network);
  const origin = await resolveOrigin();

  const nonce = newId("nonce");
  const issuedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  const message = loginMessage({
    origin,
    network,
    account,
    nonce,
    issuedAt,
    expiresAt,
  });
  await saveChallenge({
    id: newId("chal"),
    network,
    account,
    origin,
    nonce,
    message,
    purpose: "login",
    expiresAt,
  });
  return { nonce, message, expiresAt, methods: ["bch_signMessage"] as const };
}

export const getPublicConfig = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicConfig> => {
    return publicConfig();
  },
);

export const getCurrentSession = createServerFn({ method: "GET" }).handler(async () => {
  return { session: await optionalSession(), config: publicConfig() };
});

export const loadOrganization = createServerFn({ method: "GET" }).handler(async () => {
  const session = await optionalSession();
  const config = publicConfig();
  if (!session) return { config, session: null, organization: null, covenant: null };
  await assertNetworkGate(session.network);
  const organization = await getOrganization(session.network);
  const artifact =
    organization?.recipientAccount && config.mode !== "demo"
      ? await liveBoundedReleaseArtifact(session.network)
      : null;
  return {
    config,
    session,
    organization,
    covenant: artifact
      ? {
          address: addressFromLockingBytecode(session.network, artifact.lockingBytecodeHex),
          lockingBytecodeHex: artifact.lockingBytecodeHex,
          artifactHash: artifact.artifactHash,
          maxPaymentSatoshis: artifact.maxPaymentSatoshis,
          maxFeeSatoshis: artifact.maxFeeSatoshis,
          sourceAssembly: artifact.sourceAssembly,
        }
      : null,
  };
});

export const listDemoIdentities = createServerFn({ method: "GET" }).handler(async () => {
  return Object.entries(IDENTITIES)
    .filter(([key]) => key === "alice" || key === "bob" || key === "carol")
    .map(([key, identity]) => ({
      id: key,
      label: identity.label,
      role: identity.role,
      account: identity.account,
    }));
});

export const issueLoginChallenge = createServerFn({ method: "POST" })
  .validator(z.object({ account: z.string(), network: z.enum(["chipnet", "mainnet"]) }))
  .handler(async ({ data }) => {
    const config = publicConfig();
    if (data.network !== config.network)
      throw new Error("Challenge network does not match dashboard network");
    return issueChallengeRecord(data.account, data.network);
  });

async function establishSession(args: {
  account: string;
  network: "chipnet" | "mainnet";
  method: "demo" | "walletconnect";
}) {
  const config = publicConfig();
  const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000);
  const origin = await resolveOrigin();
  const session: OperatorSession = {
    id: newId("sess"),
    network: args.network,
    account: args.account,
    role: await roleForOrgAccount(args.account, args.network),
    mode: config.mode,
    origin,
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
    authMethod: args.method,
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
    evidence: session.authMethod === "demo" ? "FIXTURE" : "DESIGNED",
  });
  return session;
}

export const demoLogin = createServerFn({ method: "POST" })
  .validator(z.object({ account: z.string() }))
  .handler(async ({ data }) => {
    const config = publicConfig();
    if (config.network === "mainnet") throw new Error("Demo login is not available on Mainnet");
    const identity =
      IDENTITIES.alice.account === data.account ||
      IDENTITIES.bob.account === data.account ||
      IDENTITIES.carol.account === data.account
        ? data.account
        : null;
    if (!identity) throw new Error("Unknown demo account");
    await assertNetworkGate(config.network);

    const challenge = await issueChallengeRecord(data.account, config.network);
    const key = demoPrivateKeyForAccount(data.account);
    if (!key) throw new Error("Demo key unavailable");
    const signature = signBchMessage(key, challenge.message);
    if (!verifyBchMessageAddress(config.network, data.account, challenge.message, signature)) {
      throw new Error("Demo signature failed verification");
    }
    const consumed = await consumeChallenge(challenge.nonce);
    if (!consumed || consumed.reused) throw new Error("Challenge reuse rejected");
    const session = await establishSession({
      account: data.account,
      network: config.network,
      method: "demo",
    });
    return { session, evidence: "FIXTURE" as EvidenceLevel };
  });

export const verifyLogin = createServerFn({ method: "POST" })
  .validator(
    z.object({
      account: z.string(),
      nonce: z.string(),
      signature: z.string(),
      network: z.enum(["chipnet", "mainnet"]),
    }),
  )
  .handler(async ({ data }) => {
    await assertNetworkGate(data.network);
    const origin = await resolveOrigin();
    const consumed = await consumeChallenge(data.nonce);
    if (!consumed) throw new Error("Unknown challenge");
    if (consumed.reused) throw new Error("Nonce reuse rejected");
    if (new Date(consumed.expires_at).getTime() < Date.now()) throw new Error("Challenge expired");
    if (consumed.account !== data.account) throw new Error("Account mismatch");
    if (consumed.network !== data.network) throw new Error("Network mismatch");
    if (consumed.origin !== origin)
      throw new Error("Challenge origin does not match this dashboard origin");
    if (!verifyBchMessageAddress(data.network, data.account, consumed.message, data.signature)) {
      throw new Error("BCH message signature could not be verified");
    }
    const session = await establishSession({
      account: data.account,
      network: data.network,
      method: "walletconnect",
    });
    return { session, evidence: "DESIGNED" as EvidenceLevel };
  });

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  const id = await readCookie();
  if (id) await deleteSession(id);
  await clearCookie();
  return { ok: true };
});

export const bootstrapOrganization = createServerFn({ method: "POST" }).handler(async () => {
  const session = await requireSessionOn();
  if (session.authMethod !== "walletconnect") {
    throw new Error("Create a live organization with a WalletConnect-authenticated BCH wallet");
  }
  const result = await persistOrganization({
    network: session.network,
    ownerAccount: session.account,
  });
  if (!result.created && result.organization.ownerAccount !== session.account) {
    throw new Error("This network already has an organization owned by another wallet");
  }
  await updateSessionRole(session.id, "owner");
  await audit({
    network: session.network,
    type: "organization.bootstrap",
    actor: session.account,
    objectType: "session",
    objectId: session.id,
    correlationId: result.organization.network,
    summary: "Created WalletConnect organization and assigned owner role",
  });
  return { organization: result.organization, session: { ...session, role: "owner" as const } };
});

/**
 * Session roles are only a cache. Reconcile them against the organization
 * record after a WalletConnect login; this never promotes an unrelated wallet.
 */
export const refreshOrganizationAccess = createServerFn({ method: "POST" }).handler(async () => {
  const session = await requireSessionOn();
  if (session.authMethod !== "walletconnect") {
    throw new Error(
      "Refresh organization access with the WalletConnect BCH wallet that owns or joined it",
    );
  }
  const organization = await getOrganization(session.network);
  const role = organization
    ? organization.ownerAccount === session.account
      ? "owner"
      : await roleForOrgAccount(session.account, session.network)
    : "viewer";
  await updateSessionRole(session.id, role);
  await audit({
    network: session.network,
    type: "session.role.refresh",
    actor: session.account,
    objectType: "session",
    objectId: session.id,
    correlationId: session.id,
    summary:
      role === "viewer"
        ? "Organization access refresh found no membership for this wallet"
        : `Organization access refreshed as ${role}`,
    evidence: "DESIGNED",
  });
  return {
    organization,
    session: { ...session, role },
  };
});

export const issueOrganizationInvite = createServerFn({ method: "POST" })
  .validator(z.object({ kind: z.enum(["operator", "approver", "recipient"]) }))
  .handler(async ({ data }) => {
    const session = await requireSessionOn();
    if (session.role !== "owner")
      throw new Error("Only the organization owner can issue invitations");
    if (session.authMethod !== "walletconnect")
      throw new Error("Live invitations require WalletConnect");
    const organization = await getOrganization(session.network);
    if (!organization || organization.ownerAccount !== session.account) {
      throw new Error("Organization ownership could not be verified");
    }
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const invite = await persistOrganizationInvite({
      id: newId("org-invite"),
      network: session.network,
      kind: data.kind,
      createdBy: session.account,
      expiresAt,
    });
    await audit({
      network: session.network,
      type: "organization.invite.issue",
      actor: session.account,
      objectType: "session",
      objectId: invite.id,
      correlationId: invite.id,
      summary: `Issued ${data.kind} WalletConnect enrollment invitation`,
    });
    return invite;
  });

export const enrollSelfAsRecipient = createServerFn({ method: "POST" }).handler(async () => {
  const session = await requireSessionOn();
  if (session.authMethod !== "walletconnect" || session.role !== "owner") {
    throw new Error("Only the WalletConnect organization owner can enable a single-wallet pilot");
  }
  const organization = await setOrganizationRecipient({
    network: session.network,
    ownerAccount: session.account,
    recipientAccount: session.account,
  });
  await audit({
    network: session.network,
    type: "organization.recipient.self-enroll",
    actor: session.account,
    objectType: "session",
    objectId: session.id,
    correlationId: organization.network,
    summary: "Enabled single-wallet recipient pilot; separation of duties is not configured",
  });
  return { organization };
});

export const saveCovenantBlueprint = createServerFn({ method: "POST" })
  .validator(
    z.object({
      maxPaymentSatoshis: satoshisSchema,
      maxFeeSatoshis: satoshisSchema,
    }),
  )
  .handler(async ({ data }) => {
    const session = await requireSessionOn();
    if (session.authMethod !== "walletconnect" || session.role !== "owner") {
      throw new Error(
        "Only the WalletConnect organization owner can change the next-vault blueprint",
      );
    }
    if (parseSatoshis(data.maxPaymentSatoshis) <= 0n || parseSatoshis(data.maxFeeSatoshis) <= 0n) {
      throw new Error("Payment and fee limits must be positive");
    }
    const organization = await setOrganizationCovenantBlueprint({
      network: session.network,
      ownerAccount: session.account,
      maxPaymentSatoshis: data.maxPaymentSatoshis,
      maxFeeSatoshis: data.maxFeeSatoshis,
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
      evidence: "DESIGNED",
    });
    return { organization, artifact };
  });

export const redeemOrganizationInvite = createServerFn({ method: "POST" })
  .validator(z.object({ code: z.string().min(24) }))
  .handler(async ({ data }) => {
    const session = await requireSessionOn();
    if (session.authMethod !== "walletconnect") {
      throw new Error("Accept invitations with a WalletConnect-authenticated BCH wallet");
    }
    const result = await redeemPersistedOrganizationInvite({
      code: data.code,
      account: session.account,
      network: session.network,
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
      summary:
        result.kind === "recipient"
          ? "Enrolled WalletConnect payout recipient"
          : `Accepted ${result.kind} WalletConnect organization invitation`,
    });
    return { organization: result.organization, session: { ...session, role } };
  });

export const loadOverview = createServerFn({ method: "GET" }).handler(async () => {
  const config = publicConfig();
  const session = await optionalSession();
  const provider = providerFor(config.network);
  const chain = await provider.getSnapshot(config.network);
  if (!session) {
    return {
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
        blocked: 0,
      },
    };
  }
  await assertNetworkGate(session.network);
  const [vaults, plans, proposals, events, walletRead, organization] = await Promise.all([
    listVaults(session.network),
    listPlans(session.network),
    listProposals(session.network),
    listAudit(session.network, 12),
    readWalletChainState(provider, session.network, session.account, config.mode === "demo"),
    getOrganization(session.network),
  ]);
  const protectedBch = vaults.reduce(
    (sum, vault) => sum + parseSatoshis(vault.state.valueSatoshis),
    0n,
  );
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
      pendingApprovals: proposals.filter(
        (item) => item.stage === "policy-valid" || item.stage === "intent",
      ).length,
      blocked: proposals.filter((item) => item.stage === "rejected-by-policy").length,
    },
  };
});

export const loadVaults = createServerFn({ method: "GET" }).handler(async () => {
  const config = publicConfig();
  const session = await optionalSession();
  const provider = providerFor(config.network);
  const chain = await provider.getSnapshot(config.network);
  if (!session) {
    return { config, chain, vaults: [], utxos: [], wallet: null, walletError: null };
  }
  await assertNetworkGate(session.network);
  const walletRead = await readWalletChainState(
    provider,
    session.network,
    session.account,
    config.mode === "demo",
  );
  return {
    config,
    chain,
    vaults: await listVaults(session.network),
    utxos: walletRead.utxos,
    wallet: walletRead.wallet,
    walletError: walletRead.walletError,
  };
});

export const attachVault = createServerFn({ method: "POST" })
  .validator(
    z.object({
      txid: z.string().regex(/^[0-9a-f]{64}$/i, "Transaction id must be 32-byte hex"),
      vout: z.number().int().nonnegative(),
      expectedLockingBytecodeHex: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const session = await requireSessionOn();
    if (!canOperate(session)) {
      throw new Error("Only operators can attach vaults");
    }
    const provider = createChainProvider({
      indexerUrl: indexerUrl(session.network),
      broadcastUrl: broadcastUrl(session.network),
    });
    if (provider.kind === "fixture") {
      throw new Error(
        "Attach requires a Chipnet indexer. The fixture provider cannot prove an outpoint is unspent.",
      );
    }
    const observed = await provider.proveUnspent(session.network, {
      txid: data.txid,
      vout: data.vout,
    });
    const artifact = await liveBoundedReleaseArtifact(session.network);
    assertArtifactMatchesLock(artifact, observed.lockingBytecodeHex);
    if (
      data.expectedLockingBytecodeHex &&
      observed.lockingBytecodeHex !== data.expectedLockingBytecodeHex
    ) {
      throw new Error("Locking bytecode does not match the reviewed artifact");
    }
    if (observed.tokenEvidence === "unknown") {
      throw new Error(
        "Provider did not report token state; native attach refuses unknown token evidence",
      );
    }
    if (observed.token.categoryHex) {
      throw new Error("Native BoundedRelease attach rejects a token-bearing output");
    }
    if (observed.network !== session.network) {
      throw new Error("Observed outpoint network does not match the session");
    }
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
      liveSpendEnabled:
        observed.spentEvidence === "provider-unspent" &&
        observed.chainEvidence === "provider-observed",
      onChainRecipientEnforced: artifact.onChainRecipientEnforced,
      constructor: { ...artifact.constructor },
      evidence: ["DESIGNED"],
      notes: [
        "Attached from provider-proved unspent outpoint. The dashboard did not deploy or fund this vault.",
        "Recipient-on-chain is true only because the observed lock matches the reviewed BoundedRelease artifact.",
      ],
    });
    await audit({
      network: session.network,
      type: "vault.attach",
      actor: session.account,
      objectType: "vault",
      objectId: vault.id,
      correlationId: vault.id,
      summary: `Attached vault outpoint ${data.txid.slice(0, 8)}…:${data.vout}`,
      evidence: "DESIGNED",
    });
    return vault;
  });

export const loadPlans = createServerFn({ method: "GET" }).handler(async () => {
  const config = publicConfig();
  const session = await optionalSession();
  if (!session) return { config, plans: [], vaults: [] };
  await assertNetworkGate(session.network);
  return {
    config,
    plans: await listPlans(session.network),
    vaults: await listVaults(session.network),
  };
});

export const loadPlan = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const session = await requireSessionOn();
    const plan = await getPlan(data.id, session.network);
    if (!plan) throw new Error("Plan not found");
    if (plan.network !== session.network) throw new Error("Plan is not on this session network");
    const vault = await getVault(plan.sourceVaultId, session.network);
    if (!vault || vault.network !== session.network)
      throw new Error("Plan vault is not on this session network");
    return { plan, vault, config: publicConfig() };
  });

export const savePlanDraft = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1),
      description: z.string(),
      perPaymentSatoshis: satoshisSchema,
      sessionAllowanceSatoshis: satoshisSchema,
      maxFeeSatoshis: satoshisSchema,
      threshold: z.number().int().min(1).max(3),
      pause: z.boolean(),
      canvas: canvasSchema.optional(),
    }),
  )
  .handler(async ({ data }) => {
    const session = await requireSessionOn();
    if (!canOperate(session)) throw new Error("Only owners/operators can edit plans");
    const existing = data.id ? await getPlan(data.id, session.network) : null;
    if (existing && existing.network !== session.network) throw new Error("Plan network mismatch");
    const vaults = await listVaults(session.network);
    if (vaults.length === 0 && publicConfig().mode !== "demo") {
      throw new Error("A live plan requires an attached, provider-proven BoundedRelease vault");
    }
    const vault = vaults[0] ?? demoVault();
    if (parseSatoshis(data.perPaymentSatoshis) <= 0n || parseSatoshis(data.maxFeeSatoshis) <= 0n) {
      throw new Error("Payment and fee caps must be positive");
    }
    if (vault.reviewedShapeId !== BOUNDED_RELEASE_SHAPE_ID || !vault.onChainRecipientEnforced) {
      throw new Error(
        "Only the reviewed recipient-enforcing BoundedRelease vault can back this MVP plan",
      );
    }
    const organization = await getOrganization(session.network);
    const authorizedAccounts =
      organization?.members.map((member) => member.account) ??
      (publicConfig().mode === "demo"
        ? [IDENTITIES.alice.account, IDENTITIES.bob.account, IDENTITIES.carol.account]
        : []);
    if (data.threshold > authorizedAccounts.length) {
      throw new Error("Approval threshold exceeds the configured organization size");
    }
    const recipientLockingBytecodeHex = vault.constructor.recipientLock;
    const maxPaymentSatoshis = vault.constructor.maxPaymentSatoshis;
    const maxFeeSatoshis = vault.constructor.maxFeeSatoshis;
    if (!recipientLockingBytecodeHex || !maxPaymentSatoshis || !maxFeeSatoshis) {
      throw new Error("Attached vault lacks immutable BoundedRelease constructor values");
    }
    if (data.perPaymentSatoshis !== maxPaymentSatoshis || data.maxFeeSatoshis !== maxFeeSatoshis) {
      throw new Error(
        "Payment and fee caps are compiled into the funded vault. Create and fund a new vault to change them.",
      );
    }
    const recipientAddress = addressFromLockingBytecode(
      session.network,
      recipientLockingBytecodeHex,
    );
    if (!recipientAddress)
      throw new Error("Vault recipient lock cannot be encoded as a BCH address");
    const base = existing ?? {
      schemaVersion: 1 as const,
      id: newId("plan"),
      network: session.network,
      asset: { type: "native-bch" as const },
      sourceVaultId: vault.id,
      reviewedShapeId: BOUNDED_RELEASE_SHAPE_ID,
      artifactHash: vault.artifactHash,
      routes: [
        defaultDirectPaymentRoute({
          destinationAddress: recipientAddress,
          destinationLockingBytecodeHex: recipientLockingBytecodeHex,
          maxAmountSatoshis: maxPaymentSatoshis,
        }),
      ],
      recovery: {
        enabled: true,
        destinationAddress: IDENTITIES.recovery.account,
        destinationLockingBytecodeHex: IDENTITIES.recovery.lockingBytecodeHex,
        separateAuthority: true,
        enforcement: "not-implemented" as const,
      },
      canvas: { nodes: [], edges: [] },
      createdAt: new Date().toISOString(),
      parentPolicyId: null,
      version: 1,
      actor: session.account,
    };
    const next: ControlPlan = {
      ...base,
      name: data.name,
      description: data.description,
      governance: {
        threshold: data.threshold,
        authorizedAccounts,
        proposerCannotBeSoleApprover: authorizedAccounts.length > 1,
        expirySeconds: 3600,
        separationOfDuties: authorizedAccounts.length > 1,
      },
      limits: {
        perPaymentSatoshis: maxPaymentSatoshis,
        sessionAllowanceSatoshis: data.sessionAllowanceSatoshis,
        sessionConsumedSatoshis: existing?.limits.sessionConsumedSatoshis ?? "0",
        maxFeeSatoshis,
        windowKind: "daily",
        windowCapSatoshis: "20000000",
      },
      pause: data.pause,
      status: "draft",
      canvas: (data.canvas as ControlPlan["canvas"]) ?? base.canvas,
      updatedAt: new Date().toISOString(),
      actor: session.account,
      policyId: "",
      artifactHash: vault.artifactHash,
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
      summary: `Saved draft “${saved.name}”`,
    });
    return saved;
  });

export const publishPlan = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const session = await requireSessionOn();
    if (session.role !== "owner" && session.role !== "operator") {
      throw new Error("Only owners/operators can publish");
    }
    const plan = await getPlan(data.id, session.network);
    if (!plan) throw new Error("Plan not found");
    if (plan.network !== session.network) throw new Error("Plan network mismatch");
    const vault = await getVault(plan.sourceVaultId, session.network);
    if (!vault) throw new Error("Plan vault is not attached");
    const canvasIssues = executableStudioRules(plan, vault).filter((item) => !item.pass);
    if (canvasIssues.length > 0) {
      throw new Error(
        `Cannot publish an incomplete control-flow canvas: ${canvasIssues.map((item) => item.label).join(", ")}`,
      );
    }
    const existingVersion = await getPlanVersion(plan.id, plan.version);
    const nextVersion = existingVersion ? plan.version + 1 : plan.version;
    const published: ControlPlan = {
      ...plan,
      status: "active",
      version: nextVersion,
      parentPolicyId: plan.policyId,
      updatedAt: new Date().toISOString(),
      actor: session.account,
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
      summary: `Published ${saved.name} v${saved.version}`,
    });
    return saved;
  });

function successorValue(utxoValue: string, amount: string, fee: string): string {
  return (parseSatoshis(utxoValue) - parseSatoshis(amount) - parseSatoshis(fee)).toString();
}

async function createProposalFrom(args: {
  session: OperatorSession;
  planId: string;
  routeId: number;
  amountSatoshis: string;
  feeSatoshis: string;
  destinationLockingBytecodeHex?: string;
  successorLockingBytecodeHex?: string;
  spent?: boolean;
  tokenCategory?: string | null;
  idempotencyKey: string;
}): Promise<Proposal> {
  if (!canOperate(args.session)) {
    throw new Error("Only owners/operators can create allocation proposals");
  }
  const existing = await getIdempotent<Proposal>(args.idempotencyKey, args.session.network);
  if (existing) return existing;
  const plan = await getPlan(args.planId, args.session.network);
  if (!plan) throw new Error("Plan not found");
  if (plan.network !== args.session.network) throw new Error("Plan network mismatch");
  if (plan.status !== "active")
    throw new Error("Only an active published plan can create proposals");
  await assertNetworkGate(plan.network);
  const vault = await getVault(plan.sourceVaultId, args.session.network);
  if (!vault) throw new Error("Vault not found");
  assertPlanMatchesVaultArtifact(plan, vault);
  const chainState = await freshVaultState(vault, args.session.network);
  const utxo = {
    ...chainState,
    spent: args.spent ?? chainState.spent,
    token: args.tokenCategory
      ? { ...chainState.token, categoryHex: args.tokenCategory, amount: "1" }
      : chainState.token,
  };
  const destination =
    args.destinationLockingBytecodeHex ??
    plan.routes.find((route) => route.id === args.routeId)?.destinationLockingBytecodeHex ??
    IDENTITIES.vendor.lockingBytecodeHex;
  const successor = args.successorLockingBytecodeHex ?? vault.covenantLockingBytecodeHex;
  const now = new Date();
  const proposalId = newId("prop");
  const expiresAt = new Date(now.getTime() + plan.governance.expirySeconds * 1000);
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
    expiresAt: expiresAt.toISOString(),
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
    successorValueSatoshis: successorValue(
      utxo.valueSatoshis,
      args.amountSatoshis,
      args.feeSatoshis,
    ),
    artifactId: vault.reviewedShapeId,
    artifactHash: vault.artifactHash,
    txVersion: TX_VERSION,
    locktime: 0,
    inputSequence: SEQUENCE_ENABLE_LOCKTIME,
    nonce: proposalId,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  });
  const stage: LifecycleStage = preview.policyDecision.allowed
    ? "policy-valid"
    : "rejected-by-policy";
  if (stage === "policy-valid") {
    const reserved = await tryReserveOutpoint({
      network: plan.network,
      txid: utxo.outpoint.txid,
      vout: utxo.outpoint.vout,
      proposalId,
    });
    if (!reserved.ok) {
      throw new Error(`Source outpoint is already reserved by ${reserved.holder}`);
    }
  }
  const proposal: Proposal = {
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
    destinationAddress:
      plan.routes.find((route) => route.id === args.routeId)?.destinationAddress ?? "",
    destinationLockingBytecodeHex: destination,
    amountSatoshis: args.amountSatoshis,
    feeSatoshis: args.feeSatoshis,
    feeCapSatoshis: plan.limits.maxFeeSatoshis,
    successorLockingBytecodeHex: successor,
    successorValueSatoshis: successorValue(
      utxo.valueSatoshis,
      args.amountSatoshis,
      args.feeSatoshis,
    ),
    txVersion: TX_VERSION,
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
    correlationId: proposalId,
  };
  await putProposal(proposal);
  const stored = await putIdempotent(args.idempotencyKey, plan.network, proposal);
  if (stored.id !== proposal.id) {
    await deleteProposal(proposal.id, plan.network);
    await releaseOutpoint(
      plan.network,
      proposal.sourceOutpoint.txid,
      proposal.sourceOutpoint.vout,
      proposal.id,
    );
    return stored;
  }
  await audit({
    network: plan.network,
    type: "proposal.create",
    actor: args.session.account,
    objectType: "proposal",
    objectId: proposal.id,
    correlationId: proposal.correlationId,
    summary: preview.policyDecision.allowed
      ? `Proposal ${proposal.id} is policy-valid`
      : `Proposal blocked: ${proposal.failureReason}`,
    evidence: preview.policyDecision.allowed ? "DESIGNED" : "FAILED",
  });
  return proposal;
}

export const createProposal = createServerFn({ method: "POST" })
  .validator(
    z.object({
      planId: z.string(),
      routeId: z.number().int(),
      amountSatoshis: satoshisSchema,
      feeSatoshis: satoshisSchema.default(MAX_FEE_SATS),
      idempotencyKey: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const session = await requireSessionOn();
    return createProposalFrom({
      session,
      planId: data.planId,
      routeId: data.routeId,
      amountSatoshis: data.amountSatoshis,
      feeSatoshis: data.feeSatoshis,
      idempotencyKey: data.idempotencyKey ?? newId("idem"),
    });
  });

export const loadProposal = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const session = await requireSessionOn();
    if (!canApprove(session)) {
      throw new Error("Only configured organization members can view proposal details");
    }
    const proposal = await getProposal(data.id, session.network);
    if (!proposal) throw new Error("Proposal not found");
    if (proposal.network !== session.network)
      throw new Error("Proposal is not on this session network");
    const plan = await getPlan(proposal.planId, session.network);
    const vault = await getVault(proposal.vaultId, session.network);
    return { proposal, plan, vault, config: publicConfig() };
  });

export const loadProposals = createServerFn({ method: "GET" }).handler(async () => {
  const config = publicConfig();
  const session = await optionalSession();
  if (!session) return { config, proposals: [] };
  await assertNetworkGate(session.network);
  return { config, proposals: await listProposals(session.network) };
});

export const approveProposal = createServerFn({ method: "POST" })
  .validator(
    z.object({ id: z.string(), signature: z.string().optional(), demo: z.boolean().optional() }),
  )
  .handler(async ({ data }) => {
    const session = await requireSessionOn();
    const proposal = await getProposal(data.id, session.network);
    if (!proposal) throw new Error("Proposal not found");
    if (proposal.network !== session.network) throw new Error("Proposal network mismatch");
    const plan = await getPlan(proposal.planId, session.network);
    if (!plan) throw new Error("Plan not found");
    if (plan.network !== session.network) throw new Error("Plan network mismatch");
    if (!canApprove(session)) {
      throw new Error("Account is not an authorized approver for this organization");
    }
    if (!plan.governance.authorizedAccounts.includes(session.account)) {
      throw new Error("Account is not an authorized approver for this plan");
    }
    if (new Date(proposal.expiresAt).getTime() < Date.now()) {
      proposal.stage = "approval-expired";
      proposal.failureReason = "Proposal expired";
      await releaseOutpoint(
        proposal.network,
        proposal.sourceOutpoint.txid,
        proposal.sourceOutpoint.vout,
        proposal.id,
      );
      await putProposal(proposal);
      throw new Error("Proposal expired");
    }
    if (proposal.approvals.some((item) => item.account === session.account)) {
      return proposal;
    }
    const message = approvalMessage(proposal.intentHash, proposal.network, proposal.id);
    let signature = data.signature ?? "";
    let evidence: EvidenceLevel = "DESIGNED";
    const demoAllowed = session.authMethod === "demo" && publicConfig().mode === "demo";
    if (data.demo) {
      if (!demoAllowed) throw new Error("Demo approval is only available in demo mode");
      const key = demoPrivateKeyForAccount(session.account);
      if (!key) throw new Error("Demo key unavailable");
      signature = signBchMessage(key, message);
      evidence = "FIXTURE";
    } else if (session.authMethod === "demo" && !signature) {
      throw new Error("Demo session must explicitly request a labelled demo approval");
    }
    if (!verifyBchMessageAddress(proposal.network, session.account, message, signature)) {
      throw new Error("Approval signature does not match this account and intent");
    }

    if (
      plan.governance.proposerCannotBeSoleApprover &&
      proposal.actor === session.account &&
      proposal.approvals.length === 0 &&
      plan.governance.threshold === 1
    ) {
      throw new Error("Proposer cannot be the sole approver");
    }
    proposal.approvals.push({
      account: session.account,
      role: session.role,
      intentHash: proposal.intentHash,
      signature,
      evidence,
      at: new Date().toISOString(),
    });
    const unique = new Set(proposal.approvals.map((item) => item.account));
    if (unique.size >= proposal.threshold) {
      if (proposal.stage === "policy-valid") assertTransition(proposal.stage, "approved");
      proposal.stage = "approved";
    }
    proposal.updatedAt = new Date().toISOString();
    await putProposal(proposal);
    await audit({
      network: proposal.network,
      type: "proposal.approve",
      actor: session.account,
      objectType: "proposal",
      objectId: proposal.id,
      correlationId: proposal.correlationId,
      summary: `Approval ${unique.size}/${proposal.threshold}`,
      evidence,
    });
    return proposal;
  });

export const approvalPayload = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const session = await requireSessionOn();
    const proposal = await getProposal(data.id, session.network);
    if (!proposal) throw new Error("Proposal not found");
    if (proposal.network !== session.network) throw new Error("Proposal network mismatch");
    return {
      message: approvalMessage(proposal.intentHash, proposal.network, proposal.id),
      methods: ["bch_signMessage"] as const,
      chainId: chainIdFor(session.network),
      account: session.account,
    };
  });

export const buildProposalTx = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const session = await requireSessionOn();
    const proposal = await getProposal(data.id, session.network);
    if (!proposal) throw new Error("Proposal not found");
    if (proposal.network !== session.network) throw new Error("Proposal network mismatch");
    if (proposal.stage !== "approved" && proposal.stage !== "unsigned-built") {
      throw new Error("Proposal is not approved");
    }
    const plan = await getPlan(proposal.planId, session.network);
    if (!plan) throw new Error("Plan not found");
    if (
      plan.status !== "active" ||
      plan.version !== proposal.planVersion ||
      plan.policyId !== proposal.policyId
    ) {
      throw new Error("Plan version is no longer the active published policy");
    }
    const vault = await getVault(proposal.vaultId, session.network);
    if (!vault) throw new Error("Vault not found");
    assertPlanMatchesVaultArtifact(plan, vault);
    const operatorPkh = pkhForAccount(session.account);
    if (!operatorPkh || operatorPkh !== vault.constructor.operatorPkh) {
      throw new Error("Authenticated account is not the covenant operator for this vault");
    }
    const chainState = await freshVaultState(vault, session.network);
    if (
      chainState.outpoint.txid !== proposal.sourceOutpoint.txid ||
      chainState.outpoint.vout !== proposal.sourceOutpoint.vout
    ) {
      proposal.stage = "stale-input";
      proposal.failureReason = "Attached vault outpoint changed since proposal creation";
      await releaseOutpoint(
        proposal.network,
        proposal.sourceOutpoint.txid,
        proposal.sourceOutpoint.vout,
        proposal.id,
      );
      await putProposal(proposal);
      throw new Error(proposal.failureReason);
    }
    if (chainState.valueSatoshis !== proposal.sourceValueSatoshis) {
      proposal.stage = "stale-input";
      proposal.failureReason = "Source value changed since proposal creation";
      await releaseOutpoint(
        proposal.network,
        proposal.sourceOutpoint.txid,
        proposal.sourceOutpoint.vout,
        proposal.id,
      );
      await putProposal(proposal);
      throw new Error(proposal.failureReason);
    }
    if (chainState.spent) {
      proposal.stage = "stale-input";
      proposal.failureReason = "Source outpoint is spent";
      await releaseOutpoint(
        proposal.network,
        proposal.sourceOutpoint.txid,
        proposal.sourceOutpoint.vout,
        proposal.id,
      );
      await putProposal(proposal);
      throw new Error(proposal.failureReason);
    }
    const built = buildUnsignedVaultRelease({
      utxo: chainState,
      paymentLockingBytecodeHex: proposal.destinationLockingBytecodeHex,
      successorLockingBytecodeHex: proposal.successorLockingBytecodeHex,
      amountSatoshis: proposal.amountSatoshis,
      feeSatoshis: proposal.feeSatoshis,
    });
    proposal.unsignedTxHex = built.rawHex;
    proposal.stage = "unsigned-built";
    proposal.updatedAt = new Date().toISOString();
    await putProposal(proposal);
    await audit({
      network: proposal.network,
      type: "transaction.build",
      actor: session.account,
      objectType: "proposal",
      objectId: proposal.id,
      correlationId: proposal.correlationId,
      summary: "Unsigned transaction constructed",
      evidence: "DESIGNED",
    });
    return { proposal, built };
  });

export const simulateLocalSign = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const session = await requireSessionOn();
    if (session.authMethod !== "demo" || publicConfig().mode !== "demo") {
      throw new Error("Local VM sign with demo keys is only available in demo mode");
    }
    if (!canOperate(session)) {
      throw new Error("Only the demo operator can use local demo signing");
    }
    const proposal = await getProposal(data.id, session.network);
    if (!proposal) throw new Error("Proposal not found");
    if (proposal.network !== session.network) throw new Error("Proposal network mismatch");
    if (!proposal.unsignedTxHex) throw new Error("Build the unsigned transaction first");
    if (proposal.stage !== "unsigned-built" && proposal.stage !== "locally-vm-validated") {
      throw new Error("Proposal is not ready for local demo signing");
    }
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
      sourceLockingBytecodeHex: vault.covenantLockingBytecodeHex,
    });
    const match = signedMatchesIntent({
      signedHex: signed.signedHex,
      expectedNetwork: proposal.network,
      expectedVersion: proposal.txVersion ?? TX_VERSION,
      expectedLocktime: proposal.locktime ?? 0,
      expectedSequence: proposal.inputSequence ?? SEQUENCE_ENABLE_LOCKTIME,
      expectedOutpoints: [proposal.sourceOutpoint],
      expectedOutputs: proposal.preview.outputs,
      expectedFee: proposal.feeSatoshis,
      inputValueSatoshis: vault.state.valueSatoshis,
    });

    if (!match.ok) {
      proposal.stage = "wallet-mismatched";
      proposal.failureReason = match.reason;
      await putProposal(proposal);
      throw new Error(match.reason ?? "Signed transaction mismatch");
    }
    const vm = verifyTransactionVm({
      rawTxHex: signed.signedHex,
      sourceOutputs: [
        {
          lockingBytecodeHex: vault.covenantLockingBytecodeHex,
          valueSatoshis: vault.state.valueSatoshis,
        },
      ],
    });
    proposal.signedTxHex = signed.signedHex;
    proposal.signedTxid = signed.txid;
    proposal.covenantDecision = {
      ...proposal.covenantDecision,
      vmAttempted: vm.attempted,
      vmValid: vm.valid,
      vmError: vm.error,
    };
    proposal.stage = vm.valid ? "locally-vm-validated" : "vm-invalid";
    proposal.failureReason = vm.valid ? null : vm.error;
    proposal.evidence = vm.valid ? ["FIXTURE", "LOCALLY_VM_VALIDATED"] : ["FAILED"];
    proposal.updatedAt = new Date().toISOString();
    await putProposal(proposal);
    await audit({
      network: proposal.network,
      type: "transaction.simulate-sign",
      actor: session.account,
      objectType: "proposal",
      objectId: proposal.id,
      correlationId: proposal.correlationId,
      summary: vm.valid
        ? "Local CashVM passed (DEMO keys, unbroadcast)"
        : `VM invalid: ${vm.error}`,
      evidence: vm.valid ? "LOCALLY_VM_VALIDATED" : "FAILED",
    });
    return { proposal, vm };
  });

export const verifySignedTx = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string(),
      signedTxHex: z.string().regex(/^(?:[0-9a-f]{2})+$/i, "Signed transaction must be hex"),
    }),
  )
  .handler(async ({ data }) => {
    const session = await requireSessionOn();
    if (!canOperate(session)) {
      throw new Error("Only the configured covenant operator can submit a signed transaction");
    }
    const proposal = await getProposal(data.id, session.network);
    if (!proposal) throw new Error("Proposal not found");
    if (proposal.network !== session.network) throw new Error("Proposal network mismatch");
    const ready = [
      "unsigned-built",
      "locally-vm-validated",
      "signing-requested",
      "signed",
      "signed-vm-validated",
    ];
    if (!ready.includes(proposal.stage)) {
      throw new Error("Proposal is not ready for signed-transaction verification");
    }
    const vault = await getVault(proposal.vaultId, session.network);
    if (!vault) throw new Error("Vault not found");
    const chainState = await freshVaultState(vault, session.network);
    if (
      chainState.outpoint.txid !== proposal.sourceOutpoint.txid ||
      chainState.outpoint.vout !== proposal.sourceOutpoint.vout
    ) {
      throw new Error("Source outpoint changed since proposal creation");
    }
    if (chainState.valueSatoshis !== proposal.sourceValueSatoshis) {
      throw new Error("Source value changed since proposal creation");
    }
    const operatorPkh = pkhForAccount(session.account);
    if (
      !operatorPkh ||
      !vault.constructor.operatorPkh ||
      operatorPkh !== vault.constructor.operatorPkh
    ) {
      throw new Error("Authenticated account is not the covenant operator for this vault");
    }
    if (proposal.stage === "unsigned-built" || proposal.stage === "locally-vm-validated") {
      proposal.stage = "signing-requested";
    }
    const match = signedMatchesIntent({
      signedHex: data.signedTxHex,
      expectedNetwork: proposal.network,
      expectedVersion: proposal.txVersion ?? TX_VERSION,
      expectedLocktime: proposal.locktime ?? 0,
      expectedSequence: proposal.inputSequence ?? SEQUENCE_ENABLE_LOCKTIME,
      expectedOutpoints: [proposal.sourceOutpoint],
      expectedOutputs: proposal.preview.outputs,
      expectedFee: proposal.feeSatoshis,
      inputValueSatoshis: chainState.valueSatoshis,
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
      sourceOutputs: [
        {
          lockingBytecodeHex: vault.covenantLockingBytecodeHex,
          valueSatoshis: chainState.valueSatoshis,
        },
      ],
    });
    proposal.covenantDecision = {
      ...proposal.covenantDecision,
      vmAttempted: true,
      vmValid: vm.valid,
      vmError: vm.error,
    };
    proposal.stage = vm.valid ? "signed-vm-validated" : "vm-invalid";
    proposal.signedTxid = vm.valid ? txidFromEncoded(hexToBin(data.signedTxHex)) : null;
    proposal.evidence = vm.valid ? ["SIGNED_BUT_UNBROADCAST", "LOCALLY_VM_VALIDATED"] : ["FAILED"];
    proposal.failureReason = vm.valid ? null : vm.error;
    proposal.updatedAt = new Date().toISOString();
    await putProposal(proposal);
    await audit({
      network: session.network,
      type: "transaction.verify-signed",
      actor: session.account,
      objectType: "proposal",
      objectId: proposal.id,
      correlationId: proposal.correlationId,
      summary: vm.valid ? "Wallet-signed transaction verified" : `VM invalid: ${vm.error}`,
      evidence: vm.valid ? "SIGNED_BUT_UNBROADCAST" : "FAILED",
    });
    return { proposal, vm };
  });

export const signingPayload = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const session = await requireSessionOn();
    if (!canOperate(session)) {
      throw new Error("Only the configured covenant operator can request transaction signing");
    }
    const proposal = await getProposal(data.id, session.network);
    if (!proposal) throw new Error("Proposal not found");
    if (proposal.network !== session.network) throw new Error("Proposal network mismatch");
    if (!proposal.unsignedTxHex) throw new Error("Build the unsigned transaction first");
    if (proposal.stage !== "unsigned-built" && proposal.stage !== "signing-requested") {
      throw new Error("Proposal is not ready for wallet signing");
    }
    if (new Date(proposal.expiresAt).getTime() < Date.now()) throw new Error("Proposal expired");
    if (new Set(proposal.approvals.map((item) => item.account)).size < proposal.threshold) {
      throw new Error("Approval threshold is not met");
    }
    const vault = await getVault(proposal.vaultId, session.network);
    if (!vault) throw new Error("Vault not found");
    const operatorPkh = pkhForAccount(session.account);
    if (!operatorPkh || operatorPkh !== vault.constructor.operatorPkh) {
      throw new Error("Authenticated account is not the covenant operator for this vault");
    }
    const chainState = await freshVaultState(vault, session.network);
    if (
      chainState.outpoint.txid !== proposal.sourceOutpoint.txid ||
      chainState.outpoint.vout !== proposal.sourceOutpoint.vout
    ) {
      throw new Error("Source outpoint changed since proposal creation");
    }
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
        userPrompt: `Sign BoundedRelease payment ${proposal.amountSatoshis} sats. Broadcast is disabled in-wallet.`,
      }),
      methods: ["bch_signTransaction"],
      chainId: chainIdFor(session.network),
    };
  });

export const broadcastProposal = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string(), explicitConfirm: z.boolean() }))
  .handler(async ({ data }) => {
    const session = await requireSessionOn();
    if (!data.explicitConfirm) throw new Error("Broadcast requires explicit confirmation");
    const proposal = await getProposal(data.id, session.network);
    if (!proposal) throw new Error("Proposal not found");
    if (proposal.network !== session.network) throw new Error("Proposal network mismatch");
    if (proposal.broadcastTxid) return { proposal, duplicate: true as const };
    if (proposal.stage !== "signed-vm-validated") {
      throw new Error(
        "Broadcast requires signed-vm-validated state. Demo local VM is not wallet-signed.",
      );
    }
    if (!proposal.signedTxHex) throw new Error("No signed transaction");
    if (new Date(proposal.expiresAt).getTime() < Date.now()) {
      proposal.stage = "approval-expired";
      await releaseOutpoint(
        proposal.network,
        proposal.sourceOutpoint.txid,
        proposal.sourceOutpoint.vout,
        proposal.id,
      );
      await putProposal(proposal);
      throw new Error("Proposal expired");
    }
    const plan = await getPlan(proposal.planId, session.network);
    if (
      !plan ||
      plan.status !== "active" ||
      plan.version !== proposal.planVersion ||
      plan.policyId !== proposal.policyId
    ) {
      throw new Error("Published plan version is no longer active");
    }
    if (plan.network !== session.network || plan.artifactHash !== proposal.artifactHash) {
      throw new Error("Proposal artifact/network does not match the active plan");
    }
    const unique = new Set(proposal.approvals.map((item) => item.account));
    if (unique.size < proposal.threshold) throw new Error("Approval threshold is no longer met");
    const vault = await getVault(proposal.vaultId, session.network);
    if (!vault?.liveSpendEnabled) throw new Error("Vault is not live-spend enabled");
    if (!vault.onChainRecipientEnforced || vault.reviewedShapeId !== BOUNDED_RELEASE_SHAPE_ID) {
      throw new Error("Only the reviewed recipient-enforcing BoundedRelease shape can broadcast");
    }
    const reviewedArtifact = await liveBoundedReleaseArtifact(session.network);
    assertArtifactMatchesLock(reviewedArtifact, vault.covenantLockingBytecodeHex);
    if (reviewedArtifact.artifactHash !== vault.artifactHash) {
      throw new Error("Vault artifact is not the currently reviewed artifact");
    }
    if (vault.artifactHash !== proposal.artifactHash || vault.artifactHash !== plan.artifactHash) {
      throw new Error("Vault, proposal, and plan artifact hashes do not match");
    }
    for (const approval of proposal.approvals) {
      if (approval.intentHash !== proposal.intentHash)
        throw new Error("Approval intent hash no longer matches");
      if (
        !verifyBchMessageAddress(
          proposal.network,
          approval.account,
          approvalMessage(proposal.intentHash, proposal.network, proposal.id),
          approval.signature,
        )
      ) {
        throw new Error(`Approval signature for ${approval.account} could not be re-verified`);
      }
    }
    const chainState = await freshVaultState(vault, session.network);
    if (
      chainState.outpoint.txid !== proposal.sourceOutpoint.txid ||
      chainState.outpoint.vout !== proposal.sourceOutpoint.vout
    ) {
      throw new Error("Source outpoint changed since proposal creation");
    }
    if (chainState.valueSatoshis !== proposal.sourceValueSatoshis) {
      throw new Error("Source value changed since proposal creation");
    }
    const config = publicConfig();
    if (!config.broadcastConfigured) {
      throw new Error(
        "Broadcast is unavailable: no Chipnet provider is configured. Demo mode will not invent a live result.",
      );
    }
    const match = signedMatchesIntent({
      signedHex: proposal.signedTxHex,
      expectedNetwork: proposal.network,
      expectedVersion: proposal.txVersion ?? TX_VERSION,
      expectedLocktime: proposal.locktime ?? 0,
      expectedSequence: proposal.inputSequence ?? SEQUENCE_ENABLE_LOCKTIME,
      expectedOutpoints: [proposal.sourceOutpoint],
      expectedOutputs: proposal.preview.outputs,
      expectedFee: proposal.feeSatoshis,
      inputValueSatoshis: chainState.valueSatoshis,
    });
    if (!match.ok) throw new Error(match.reason ?? "Signed transaction no longer matches intent");
    const vm = verifyTransactionVm({
      rawTxHex: proposal.signedTxHex,
      sourceOutputs: [
        {
          lockingBytecodeHex: vault.covenantLockingBytecodeHex,
          valueSatoshis: chainState.valueSatoshis,
        },
      ],
    });
    if (!vm.valid) {
      proposal.stage = "vm-invalid";
      proposal.failureReason = vm.error;
      await putProposal(proposal);
      throw new Error(vm.error ?? "VM invalid");
    }
    if (proposal.covenantDecision.vmValid !== true) {
      throw new Error("Broadcast requires a previously recorded signed-transaction VM pass");
    }
    const signedTxid = txidFromEncoded(hexToBin(proposal.signedTxHex));
    if (proposal.signedTxid && proposal.signedTxid !== signedTxid) {
      throw new Error("Stored signed transaction id does not match signed bytes");
    }
    const provider = createChainProvider({
      indexerUrl: indexerUrl(session.network),
      broadcastUrl: broadcastUrl(session.network),
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
      if (latest?.broadcastTxid) return { proposal: latest, duplicate: true as const };
      throw new Error(
        "Broadcast lock has a recorded txid but proposal state is inconsistent; reconcile before retrying",
      );
    }
    const locked = await acquireBroadcastLock(proposal.id);
    const latest = await getProposal(proposal.id, session.network);
    if (latest?.broadcastTxid) return { proposal: latest, duplicate: true as const };
    if (!locked && existingLock && !existingLock.txid) {
      throw new Error("Broadcast already in progress");
    }
    proposal.stage = "broadcast-requested";
    await putProposal(proposal);
    try {
      const result = await provider.broadcast(session.network, proposal.signedTxHex);
      if (result.txid.toLowerCase() !== signedTxid.toLowerCase()) {
        throw new Error("Provider returned a txid that does not match the signed transaction");
      }
      proposal.broadcastTxid = result.txid;
      proposal.stage = "provider-accepted";
      proposal.evidence = ["PROVIDER_ACCEPTED"];
      await putProposal(proposal);
      await setBroadcastLockTxid(proposal.id, result.txid);
      await markOutpointSpent(
        proposal.network,
        proposal.sourceOutpoint.txid,
        proposal.sourceOutpoint.vout,
        proposal.id,
      );
      await audit({
        network: session.network,
        type: "transaction.broadcast",
        actor: session.account,
        objectType: "proposal",
        objectId: proposal.id,
        correlationId: proposal.correlationId,
        summary: `Provider accepted ${result.txid}`,
        evidence: "PROVIDER_ACCEPTED",
      });
      return { proposal, duplicate: false as const };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Broadcast failed";
      const definitiveRejection =
        /^Broadcast rejected: 4\d\d\b/.test(message) ||
        message === "Broadcast endpoint was not found";
      if (definitiveRejection) await releaseBroadcastLock(proposal.id);
      proposal.stage = definitiveRejection ? "provider-rejected" : "broadcast-uncertain";
      proposal.failureReason = definitiveRejection
        ? message
        : `${message}. Provider acceptance is uncertain; the broadcast lock was retained to prevent a duplicate spend.`;
      await putProposal(proposal);
      throw error;
    }
  });

export const reconcileBroadcast = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const session = await requireSessionOn();
    const proposal = await getProposal(data.id, session.network);
    if (!proposal) throw new Error("Proposal not found");
    if (proposal.network !== session.network) throw new Error("Proposal network mismatch");
    if (!proposal.signedTxHex || !proposal.signedTxid)
      throw new Error("No signed transaction to reconcile");
    if (proposal.broadcastTxid)
      return {
        proposal,
        status: await providerFor(session.network).getStatus(
          session.network,
          proposal.broadcastTxid,
        ),
      };
    if (proposal.stage !== "broadcast-uncertain") {
      throw new Error(
        "Only a broadcast-uncertain proposal can be reconciled without a provider txid",
      );
    }

    const signedTxid = txidFromEncoded(hexToBin(proposal.signedTxHex));
    if (signedTxid !== proposal.signedTxid)
      throw new Error("Stored signed transaction id does not match signed bytes");
    const provider = providerFor(session.network);
    const status = await provider.getStatus(session.network, signedTxid);
    if (status.kind !== "mempool" && status.kind !== "confirmed") {
      return { proposal, status };
    }

    const existingLock = await getBroadcastLock(proposal.id);
    if (existingLock?.txid && existingLock.txid.toLowerCase() !== signedTxid.toLowerCase()) {
      throw new Error("Broadcast lock txid does not match the signed transaction");
    }
    if (!existingLock) {
      const acquired = await acquireBroadcastLock(proposal.id);
      if (!acquired) throw new Error("Broadcast reconciliation is already in progress");
    }
    await setBroadcastLockTxid(proposal.id, signedTxid);
    proposal.broadcastTxid = signedTxid;
    proposal.stage = status.kind === "confirmed" ? "confirmed" : "mempool-observed";
    proposal.confirmations = status.confirmations;
    proposal.evidence = status.kind === "confirmed" ? ["CONFIRMED"] : ["MEMPOOL_OBSERVED"];
    if (status.kind === "confirmed") {
      const observed = await provider.getTransactionOutput(session.network, {
        txid: signedTxid,
        vout: 1,
      });
      if (
        observed &&
        observed.lockingBytecodeHex === proposal.successorLockingBytecodeHex &&
        observed.valueSatoshis === proposal.successorValueSatoshis
      ) {
        proposal.stage = "successor-verified";
        proposal.evidence = ["SUCCESSOR_VERIFIED"];
      } else if (observed) {
        proposal.stage = "failed";
        proposal.failureReason = "Successor output does not match the approved intent";
      }
    }
    proposal.failureReason = proposal.stage === "failed" ? proposal.failureReason : null;
    proposal.updatedAt = new Date().toISOString();
    await putProposal(proposal);
    await markOutpointSpent(
      proposal.network,
      proposal.sourceOutpoint.txid,
      proposal.sourceOutpoint.vout,
      proposal.id,
    );
    await audit({
      network: session.network,
      type: "transaction.reconcile",
      actor: session.account,
      objectType: "proposal",
      objectId: proposal.id,
      correlationId: proposal.correlationId,
      summary: `Reconciled provider-observed transaction ${signedTxid}`,
      evidence: proposal.evidence[0] ?? "UNKNOWN",
    });
    return { proposal, status };
  });

export const refreshProposalStatus = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const session = await requireSessionOn();
    const proposal = await getProposal(data.id, session.network);
    if (!proposal?.broadcastTxid) throw new Error("No broadcast txid to observe");
    if (proposal.network !== session.network) throw new Error("Proposal network mismatch");
    const vault = await getVault(proposal.vaultId, session.network);
    const provider = createChainProvider({
      indexerUrl: indexerUrl(session.network),
      broadcastUrl: broadcastUrl(session.network),
    });
    const status = await provider.getStatus(session.network, proposal.broadcastTxid);
    if (status.kind === "not-found" && proposal.stage === "provider-accepted") {
      proposal.stage = "broadcast-uncertain";
      proposal.failureReason = "Provider accepted but indexer does not yet see the transaction";
    } else if (status.kind === "not-found") {
      proposal.stage = "mempool-dropped";
    } else if (status.kind === "mempool") {
      proposal.stage = "mempool-observed";
      proposal.evidence = ["MEMPOOL_OBSERVED"];
    } else if (status.kind === "confirmed") {
      proposal.stage = "confirmed";
      proposal.confirmations = status.confirmations;
      proposal.evidence = ["CONFIRMED"];
      const observed = await provider.getTransactionOutput(session.network, {
        txid: proposal.broadcastTxid,
        vout: 1,
      });
      if (
        observed &&
        observed.lockingBytecodeHex === proposal.successorLockingBytecodeHex &&
        observed.valueSatoshis === proposal.successorValueSatoshis
      ) {
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
    proposal.updatedAt = new Date().toISOString();
    await putProposal(proposal);
    return { proposal, status, vault };
  });

export const loadAudit = createServerFn({ method: "GET" }).handler(async () => {
  const config = publicConfig();
  const session = await optionalSession();
  if (!session) return { config, events: [] };
  await assertNetworkGate(session.network);
  return { config, events: await listAudit(session.network, 120) };
});

export const loadCapabilities = createServerFn({ method: "GET" }).handler(async () => {
  const session = await optionalSession();
  const config = publicConfig();
  return {
    config,
    session,
    grants: capabilitiesFor(session?.role ?? null, config),
  };
});

export const runScenario = createServerFn({ method: "POST" })
  .validator(z.object({ scenario: z.string() }))
  .handler(async ({ data }) => {
    const session = await requireSessionOn();
    const plans = await listPlans(session.network);
    const plan = plans[0];
    if (!plan) throw new Error("No plan");
    const scenario = data.scenario as ScenarioId;
    const base = {
      session,
      planId: plan.id,
      routeId: 0,
      amountSatoshis: "2000000",
      feeSatoshis: "1000",
      idempotencyKey: newId("scn"),
    };
    switch (scenario) {
      case "valid-spend":
        return { scenario, proposal: await createProposalFrom(base), catalog: SCENARIOS };
      case "over-limit":
        return {
          scenario,
          proposal: await createProposalFrom({ ...base, amountSatoshis: "8000000" }),
          catalog: SCENARIOS,
        };
      case "wrong-recipient":
        return {
          scenario,
          proposal: await createProposalFrom({
            ...base,
            destinationLockingBytecodeHex: IDENTITIES.recovery.lockingBytecodeHex,
          }),
          catalog: SCENARIOS,
        };
      case "wrong-category":
        return {
          scenario,
          proposal: await createProposalFrom({ ...base, tokenCategory: "aa".repeat(32) }),
          catalog: SCENARIOS,
        };
      case "altered-successor":
        return {
          scenario,
          proposal: await createProposalFrom({
            ...base,
            successorLockingBytecodeHex: IDENTITIES.alice.lockingBytecodeHex,
          }),
          catalog: SCENARIOS,
        };
      case "stale-outpoint":
        return {
          scenario,
          proposal: await createProposalFrom({ ...base, spent: true }),
          catalog: SCENARIOS,
        };
      case "duplicate-intent": {
        const first = await createProposalFrom({ ...base, idempotencyKey: "dup-fixed" });
        const second = await createProposalFrom({ ...base, idempotencyKey: "dup-fixed" });
        return { scenario, proposal: second, duplicateOf: first.id, catalog: SCENARIOS };
      }
      case "insufficient-approvals": {
        const proposal = await createProposalFrom(base);
        return { scenario, proposal, catalog: SCENARIOS };
      }
      default:
        throw new Error("Unknown scenario");
    }
  });

export const listScenarios = createServerFn({ method: "GET" }).handler(async () => SCENARIOS);
