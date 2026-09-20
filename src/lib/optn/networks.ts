import type { Network } from "./types.ts";

export const NETWORK_CONFIG = {
  chipnet: {
    id: "chipnet" as const,
    label: "Chipnet",
    walletConnectChainId: "bch:bchtest",
    addressPrefix: "bchtest" as const,
    enabledByDefault: true,
    explorerTx: (txid: string) => `https://chipnet.chaingraph.cash/tx/${txid}`,
  },
  mainnet: {
    id: "mainnet" as const,
    label: "Mainnet",
    walletConnectChainId: "bch:bitcoincash",
    addressPrefix: "bitcoincash" as const,
    enabledByDefault: false,
    explorerTx: (txid: string) => `https://explorer.bitcoinunlimited.info/tx/${txid}`,
  },
} as const;

export function cacheKey(network: Network, txid: string, vout: number): string {
  return `${network}:${txid.toLowerCase()}:${vout}`;
}

export function assertNetwork(value: string): Network {
  if (value === "chipnet" || value === "mainnet") return value;
  throw new Error(`Unknown network: ${value}`);
}

export function chainIdFor(network: Network): string {
  return NETWORK_CONFIG[network].walletConnectChainId;
}

export function prefixFor(network: Network): "bchtest" | "bitcoincash" {
  return NETWORK_CONFIG[network].addressPrefix;
}
