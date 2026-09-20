/**
 * Server-only secp256k1 test-vector scalars (1..6). These are not wallet seeds
 * and are never returned by the API, written to fixtures JSON, or logged.
 * Used solely so demo login/approval and local VM tests share the real
 * signature verification path.
 */
import { IDENTITIES, TEST_VECTOR_INDEX } from "./identities.ts";
import { hexToBin, testVectorPrivateKey } from "./encoding.ts";

export function demoPrivateKeyForAccount(account: string): Uint8Array | null {
  const entry = Object.entries(IDENTITIES).find(([, identity]) => identity.account === account);
  if (!entry) return null;
  const index = TEST_VECTOR_INDEX[entry[0] as keyof typeof TEST_VECTOR_INDEX];
  return testVectorPrivateKey(index);
}

export function demoPublicKeyForAccount(account: string): Uint8Array | null {
  const identity = Object.values(IDENTITIES).find((item) => item.account === account);
  if (!identity) return null;
  return hexToBin(identity.publicKeyHex);
}

export function isDemoAccount(account: string): boolean {
  return Object.values(IDENTITIES).some((item) => item.account === account);
}
