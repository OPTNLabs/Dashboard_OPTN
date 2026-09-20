import type { Identity, Network, Role } from "./types.ts";

export const IDENTITIES: Record<"alice" | "bob" | "carol" | "vendor" | "recovery", Identity> = {
  alice: {
    label: "Alice (DEMO)",
    role: "owner",
    account: "bchtest:qp63uahgrxged4z5jswyt5dn5v3lzsem6cq85x00dt",
    publicKeyHex: "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
    pkhHex: "751e76e8199196d454941c45d1b3a323f1433bd6",
    lockingBytecodeHex: "76a914751e76e8199196d454941c45d1b3a323f1433bd688ac",
    synthetic: true,
  },
  bob: {
    label: "Bob (DEMO)",
    role: "approver",
    account: "bchtest:qqr2l4rteh7j9mu54sfz4gglysfyfgm7escmcz2hd6",
    publicKeyHex: "02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5",
    pkhHex: "06afd46bcdfd22ef94ac122aa11f241244a37ecc",
    lockingBytecodeHex: "76a91406afd46bcdfd22ef94ac122aa11f241244a37ecc88ac",
    synthetic: true,
  },
  carol: {
    label: "Carol (DEMO)",
    role: "approver",
    account: "bchtest:qp7av4vj6z4jlcxsy474wx4lqvkdnkunms9kkx0r2k",
    publicKeyHex: "02f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9",
    pkhHex: "7dd65592d0ab2fe0d0257d571abf032cd9db93dc",
    lockingBytecodeHex: "76a9147dd65592d0ab2fe0d0257d571abf032cd9db93dc88ac",
    synthetic: true,
  },
  vendor: {
    label: "Acme vendor payout (DEMO)",
    role: "viewer",
    account: "bchtest:qpr506r5dnwmxwc00726jruflz0m8p7tkcm9mmsrqy",
    publicKeyHex: "022f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe4",
    pkhHex: "4747e8746cddb33b0f7f95a90f89f89fb387cbb6",
    lockingBytecodeHex: "76a9144747e8746cddb33b0f7f95a90f89f89fb387cbb688ac",
    synthetic: true,
  },
  recovery: {
    label: "Recovery destination (DEMO)",
    role: "viewer",
    account: "bchtest:qpla488syrqket8498y8mr0gn078pwxfevta6yxfc2",
    publicKeyHex: "03fff97bd5755eeea420453a14355235d382f6472f8568a18b2f057a1460297556",
    pkhHex: "7fda9cf020c16cacf529c87d8de89bfc70b8c9cb",
    lockingBytecodeHex: "76a9147fda9cf020c16cacf529c87d8de89bfc70b8c9cb88ac",
    synthetic: true,
  },
};

export const TEST_VECTOR_INDEX: Record<keyof typeof IDENTITIES, number> = {
  alice: 1,
  bob: 2,
  carol: 3,
  vendor: 5,
  recovery: 6,
};

export function identityByAccount(account: string): Identity | undefined {
  return Object.values(IDENTITIES).find((item) => item.account === account);
}

export function roleForAccount(account: string, network: Network): Role {
  if (network === "mainnet") return "viewer";
  const identity = identityByAccount(account);
  return identity?.role ?? "viewer";
}

export function authorizedApprovers(): string[] {
  return [IDENTITIES.alice.account, IDENTITIES.bob.account, IDENTITIES.carol.account];
}
