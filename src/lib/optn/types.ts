export const SCHEMA_VERSION = 1 as const;

export type Network = "chipnet" | "mainnet";

export type AppMode = "demo" | "chipnet-live" | "mainnet-live";

export type Role = "owner" | "operator" | "approver" | "viewer";

export type OrganizationMemberRole = Exclude<Role, "viewer">;

export type OrganizationMember = {
  account: string;
  role: OrganizationMemberRole;
  addedBy: string;
  addedAt: string;
};

export type Organization = {
  network: Network;
  ownerAccount: string;
  recipientAccount: string | null;
  covenantMaxPaymentSatoshis: string | null;
  covenantMaxFeeSatoshis: string | null;
  members: OrganizationMember[];
  createdAt: string;
};

export type OrganizationInviteKind = OrganizationMemberRole | "recipient";

export type EvidenceLevel =
  | "DESIGNED"
  | "FIXTURE"
  | "SIMULATED"
  | "LOCALLY_VM_VALIDATED"
  | "SIGNED_BUT_UNBROADCAST"
  | "PROVIDER_ACCEPTED"
  | "MEMPOOL_OBSERVED"
  | "CONFIRMED"
  | "SUCCESSOR_VERIFIED"
  | "FAILED"
  | "UNKNOWN";

export type LifecycleStage =
  | "intent"
  | "policy-valid"
  | "approved"
  | "unsigned-built"
  | "locally-vm-validated"
  | "signing-requested"
  | "signed"
  | "signed-vm-validated"
  | "broadcast-requested"
  | "provider-accepted"
  | "mempool-observed"
  | "confirmed"
  | "successor-verified"
  | "finalized"
  | "rejected-by-policy"
  | "approval-expired"
  | "stale-input"
  | "wallet-rejected"
  | "wallet-mismatched"
  | "vm-invalid"
  | "provider-rejected"
  | "broadcast-uncertain"
  | "mempool-dropped"
  | "reorg"
  | "failed";

export type Enforcement =
  "on-chain" | "off-chain-policy" | "accounting-only" | "not-implemented" | "simulation-only";

export type NftCapability = "none" | "mutable" | "minting";

export type SpentEvidence = "provider-unspent" | "provider-spent" | "fixture" | "unknown";

export type TokenEvidence = "provider-reported" | "provider-omitted" | "fixture" | "unknown";

export type ChainTxKind = "confirmed" | "mempool" | "not-found" | "dropped" | "unknown";

export type Outpoint = {
  txid: string;
  vout: number;
};

export type TokenState = {
  categoryHex: string | null;
  amount: string;
  nftCapability: NftCapability;
  commitmentHex: string | null;
};

export type UtxoState = {
  network: Network;
  outpoint: Outpoint;
  valueSatoshis: string;
  lockingBytecodeHex: string;
  address: string | null;
  token: TokenState;
  spent: boolean;
  spentEvidence: SpentEvidence;
  tokenEvidence: TokenEvidence;
  confirmations: number;
  chainEvidence: "provider-observed" | "fixture" | "unknown";
  lockingType: "p2pkh" | "p2sh32" | "p2sh20" | "covenant" | "unknown";
  rawTxHex?: string | null;
  blockHeight?: number | null;
};

export type SourceOutput = {
  network: Network;
  outpoint: Outpoint;
  valueSatoshis: string;
  lockingBytecodeHex: string;
  token: TokenState;
  tokenEvidence: TokenEvidence;
  spent: boolean;
  spentEvidence: SpentEvidence;
  redeemBytecodeHex?: string;
  contractName?: string;
  evidence: EvidenceLevel;
};

export type ChainTxStatus = {
  txid: string;
  kind: ChainTxKind;
  mempool: boolean;
  confirmations: number;
  confirmed: boolean;
  height: number | null;
  reason?: string;
};

export type ChainSnapshot = {
  network: Network;
  provider: "fixture" | "chronik" | "electrum";
  source: string;
  reachable: boolean;
  height: number | null;
  serverVersion: string | null;
  genesisHash: string | null;
  latencyMs: number | null;
  checkedAt: string;
  error: string | null;
};

export type WalletChainSnapshot = {
  account: string;
  balanceSatoshis: string;
  utxoCount: number;
  tokenUtxoCount: number;
  confirmedUtxoCount: number;
};

export type VaultInstance = {
  id: string;
  network: Network;
  name: string;
  contractName: string;
  contractVersion: string;
  artifactHash: string;
  reviewedShapeId: string;
  covenantLockingBytecodeHex: string;
  redeemBytecodeHex: string;
  stateOutpoint: Outpoint;
  state: UtxoState;
  reviewed: boolean;
  liveSpendEnabled: boolean;
  onChainRecipientEnforced: boolean;
  constructor: Record<string, string>;
  evidence: EvidenceLevel[];
  notes: string[];
};

export type AssetSpec =
  { type: "native-bch" } | { type: "fungible-cashtoken"; categoryHex: string; note: string };

export type RouteType = "DIRECT_PAYMENT" | "COVENANT" | "RECOVERY";

export type ReviewedRoute = {
  id: number;
  type: RouteType;
  label: string;
  destinationAddress: string;
  destinationLockingBytecodeHex: string;
  maxAmountSatoshis: string;
  successor: {
    required: boolean;
    outputIndex: number;
    sameCovenantLock: boolean;
    description: string;
  };
  reviewedShapeId: string;
  enforcement: Enforcement;
  whyConstrained: string;
};

export type GovernancePolicy = {
  threshold: number;
  authorizedAccounts: string[];
  proposerCannotBeSoleApprover: boolean;
  expirySeconds: number;
  separationOfDuties: boolean;
};

export type RecoveryPolicy = {
  enabled: boolean;
  destinationAddress: string;
  destinationLockingBytecodeHex: string;
  separateAuthority: boolean;
  enforcement: Enforcement;
};

export type CanvasNodeKind =
  "source" | "vault" | "asset" | "route" | "constraint" | "governance" | "recovery" | "evidence";

export type CanvasNode = {
  id: string;
  kind: CanvasNodeKind;
  label: string;
  x: number;
  y: number;
  data: Record<string, string>;
};

export type CanvasEdge = {
  id: string;
  source: string;
  target: string;
  kind: "bch" | "successor" | "approval" | "recovery";
  label: string;
};

export type PlanStatus =
  "draft" | "review" | "active" | "paused" | "retired" | "superseded" | "blocked";

export type ControlPlan = {
  schemaVersion: typeof SCHEMA_VERSION;
  id: string;
  name: string;
  description: string;
  network: Network;
  asset: AssetSpec;
  sourceVaultId: string;
  reviewedShapeId: string;
  artifactHash: string;
  routes: ReviewedRoute[];
  governance: GovernancePolicy;
  recovery: RecoveryPolicy;
  limits: {
    perPaymentSatoshis: string;
    sessionAllowanceSatoshis: string;
    sessionConsumedSatoshis: string;
    maxFeeSatoshis: string;
    windowKind: "none" | "daily";
    windowCapSatoshis: string;
  };
  pause: boolean;
  status: PlanStatus;
  version: number;
  policyId: string;
  parentPolicyId: string | null;
  canvas: { nodes: CanvasNode[]; edges: CanvasEdge[] };
  createdAt: string;
  updatedAt: string;
  actor: string;
};

export type PolicyRuleId =
  | "network.mismatch"
  | "plan.paused"
  | "plan.not-active"
  | "asset.native-only"
  | "asset.token-leak"
  | "amount.non-positive"
  | "amount.over-per-payment"
  | "amount.over-session"
  | "amount.over-window"
  | "destination.not-allowlisted"
  | "destination.lock-mismatch"
  | "fee.over-cap"
  | "fee.unproven"
  | "utxo.stale"
  | "utxo.spent"
  | "utxo.missing"
  | "successor.required"
  | "successor.lock-mismatch"
  | "successor.index"
  | "output.order"
  | "output.cardinality"
  | "input.cardinality"
  | "dust.output"
  | "value.conservation"
  | "shape.unreviewed"
  | "shape.simulation-only"
  | "approval.threshold"
  | "approval.duplicate-account"
  | "approval.proposer-sole"
  | "approval.expired"
  | "approval.intent-mismatch"
  | "intent.expired"
  | "idempotency.conflict"
  | "broadcast.blocked"
  | "mainnet.disabled"
  | "wallet.network-mismatch";

export type PolicyRuleResult = {
  id: PolicyRuleId;
  label: string;
  pass: boolean;
  enforcement: Enforcement;
  detail: string;
};

export type PolicyDecision = {
  allowed: boolean;
  rules: PolicyRuleResult[];
  blocking: PolicyRuleResult[];
};

export type CovenantDecision = {
  shapeId: string;
  onChainRecipientEnforced: boolean;
  vmAttempted: boolean;
  vmValid: boolean | null;
  vmError: string | null;
  rules: PolicyRuleResult[];
};

export type PlannedOutput = {
  index: number;
  role: "payment" | "successor" | "change" | "other";
  valueSatoshis: string;
  lockingBytecodeHex: string;
  address: string | null;
  token: TokenState;
};

export type AssetDelta = {
  asset: "bch" | "fungible-token" | "nft" | "fee";
  inValue: string;
  outValue: string;
  conserved: boolean;
  detail: string;
};

export type TransitionPreview = {
  input: UtxoState;
  outputs: PlannedOutput[];
  feeSatoshis: string;
  assetDeltas: AssetDelta[];
  policyDecision: PolicyDecision;
  covenantDecision: CovenantDecision;
  intentHash: string;
  evidence: EvidenceLevel[];
  conservationLine: string;
};

export type ApprovalRecord = {
  account: string;
  role: Role;
  intentHash: string;
  signature: string;
  evidence: EvidenceLevel;
  at: string;
};

export type Proposal = {
  id: string;
  network: Network;
  planId: string;
  planVersion: number;
  policyId: string;
  vaultId: string;
  routeId: number;
  artifactId: string;
  artifactHash: string;
  sourceOutpoint: Outpoint;
  sourceValueSatoshis: string;
  sourceToken: TokenState;
  destinationAddress: string;
  destinationLockingBytecodeHex: string;
  amountSatoshis: string;
  feeSatoshis: string;
  feeCapSatoshis: string;
  successorLockingBytecodeHex: string;
  successorValueSatoshis: string;
  txVersion: number;
  locktime: number;
  inputSequence: number;
  walletConnectChainId: string;
  intentHash: string;

  canonicalIntent: string;
  policyDecision: PolicyDecision;
  covenantDecision: CovenantDecision;
  preview: TransitionPreview;
  approvals: ApprovalRecord[];
  threshold: number;
  unsignedTxHex: string | null;
  signedTxHex: string | null;
  signedTxid: string | null;
  broadcastTxid: string | null;
  confirmations: number;
  stage: LifecycleStage;
  failureReason: string | null;
  evidence: EvidenceLevel[];
  idempotencyKey: string;
  createdAt: string;
  expiresAt: string;
  updatedAt: string;
  actor: string;
  correlationId: string;
};

export type AuditEvent = {
  id: string;
  network: Network;
  seq: number;
  prevHash: string;
  eventHash: string;
  type: string;
  actor: string;
  objectType: "plan" | "proposal" | "vault" | "session" | "system";
  objectId: string;
  correlationId: string;
  summary: string;
  evidence: EvidenceLevel;
  at: string;
  detail: Record<string, string>;
};

export type OperatorSession = {
  id: string;
  network: Network;
  account: string;
  role: Role;
  mode: AppMode;
  origin: string;
  createdAt: string;
  expiresAt: string;
  authMethod: "walletconnect" | "demo";
};

export type PublicConfig = {
  appName: string;
  network: Network;
  mode: AppMode;
  mainnetEnabled: boolean;
  mainnetDisabledReason: string | null;
  walletConnectConfigured: boolean;
  walletConnectProjectId: string | null;
  walletConnectChainId: string;
  indexerConfigured: boolean;
  broadcastConfigured: boolean;
  liveSpendAvailable: boolean;
  unavailable: string[];
};

export type CapabilityId =
  | "plan.read"
  | "vault.read"
  | "proposal.create"
  | "proposal.explain"
  | "proposal.request_approval"
  | "transaction.build"
  | "transaction.verify"
  | "transaction.broadcast";

export type CapabilityGrant = {
  id: CapabilityId;
  granted: boolean;
  reason: string;
};

export type Identity = {
  label: string;
  role: Role;
  account: string;
  publicKeyHex: string;
  pkhHex: string;
  lockingBytecodeHex: string;
  synthetic: boolean;
};
