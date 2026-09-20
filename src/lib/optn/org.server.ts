import { lockingBytecodeHexFromAddress, pkhFromP2pkhLock } from "./encoding.ts";
import { publicConfig } from "./config.server.ts";
import { roleForAccount } from "./identities.ts";
import { getOrganization, roleForOrganizationAccount } from "./store.server.ts";
import type { Network, Organization, Role } from "./types.ts";

/**
 * Organization authority is derived from WalletConnect-authenticated BCH
 * accounts and persisted in the control-plane store. Environment variables are
 * intentionally not an authority source.
 */
export async function organizationForNetwork(network: Network): Promise<Organization | null> {
  return getOrganization(network);
}

export async function roleForOrgAccount(account: string, network: Network): Promise<Role> {
  if (publicConfig().mode === "demo") return roleForAccount(account, network);
  return roleForOrganizationAccount(account, network);
}

export function pkhForAccount(account: string): string | null {
  try {
    return pkhFromP2pkhLock(lockingBytecodeHexFromAddress(account));
  } catch {
    return null;
  }
}
