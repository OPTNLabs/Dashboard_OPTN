import type { AppMode, Network, PublicConfig } from "./types.ts";
import { NETWORK_CONFIG } from "./networks.ts";

function env(name: string): string | undefined {
  if (typeof process === "undefined") return undefined;
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}

export function readNetwork(): Network {
  return env("APP_NETWORK") === "mainnet" ? "mainnet" : "chipnet";
}

export function mainnetEnabled(): boolean {
  return env("ENABLE_MAINNET") === "true";
}

export function walletConnectProjectId(): string | null {
  return env("VITE_WALLETCONNECT_PROJECT_ID") ?? env("WALLETCONNECT_PROJECT_ID") ?? null;
}

export function indexerUrl(network: Network): string | null {
  if (network === "mainnet") return env("MAINNET_INDEXER_URL") ?? null;
  return env("CHIPNET_INDEXER_URL") ?? null;
}

export function broadcastUrl(network: Network): string | null {
  if (network === "mainnet")
    return env("MAINNET_BROADCAST_URL") ?? env("MAINNET_INDEXER_URL") ?? null;
  return env("CHIPNET_BROADCAST_URL") ?? env("CHIPNET_INDEXER_URL") ?? null;
}

export function sessionSecret(): string {
  return env("SESSION_SECRET") ?? "optn-demo-session-secret-not-for-mainnet";
}

export function resolveMode(network: Network): AppMode {
  if (network === "mainnet") return mainnetEnabled() ? "mainnet-live" : "demo";
  const live = Boolean(walletConnectProjectId() || indexerUrl("chipnet"));
  return live ? "chipnet-live" : "demo";
}

export function publicConfig(): PublicConfig {
  const network = readNetwork();
  const mode = resolveMode(network);
  const wc = walletConnectProjectId();
  const idx = Boolean(indexerUrl(network));
  const bcast = Boolean(broadcastUrl(network));
  const liveEnv =
    Boolean(wc) && Boolean(idx) && Boolean(bcast) && (network !== "mainnet" || mainnetEnabled());
  const unavailable: string[] = [];
  if (!wc) unavailable.push("WalletConnect project id is not configured");
  if (!idx) unavailable.push("Chain provider is not configured");
  if (!bcast) unavailable.push("Broadcast provider is not configured");
  if (network === "mainnet" && !mainnetEnabled()) {
    unavailable.push("Mainnet is gated behind ENABLE_MAINNET");
  }
  return {
    appName: "OPTN Dashboard",
    network,
    mode,
    mainnetEnabled: mainnetEnabled(),
    mainnetDisabledReason: mainnetEnabled()
      ? null
      : "Mainnet is an isolated opt-in network. ENABLE_MAINNET is false.",
    walletConnectConfigured: Boolean(wc),
    walletConnectProjectId: wc,
    walletConnectChainId: NETWORK_CONFIG[network].walletConnectChainId,
    indexerConfigured: idx,
    broadcastConfigured: bcast,
    liveSpendAvailable: liveEnv,
    unavailable,
  };
}
