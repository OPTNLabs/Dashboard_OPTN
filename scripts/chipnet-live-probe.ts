/**
 * Read-only prerequisite check for a Chipnet integration run.
 *
 * The mnemonic is consumed from CHIPNET_DEV_MNEMONIC only in process memory.
 * This script deliberately never serializes, logs, or writes mnemonic/private
 * material, and it cannot sign or broadcast a transaction.
 */
import { deriveHdPath, deriveHdPrivateNodeFromBip39Mnemonic } from "@bitauth/libauth";
import { createChainProvider } from "../src/lib/optn/chain.ts";
import { indexerUrl } from "../src/lib/optn/config.server.ts";
import { p2pkhAddressFromPublicKey, secp256k1 } from "../src/lib/optn/encoding.ts";
import { formatBch, parseSatoshis } from "../src/lib/optn/money.ts";

const CHIPNET_BIP44_PATH = "m/44'/1'/0'/0/0";

function fail(message: string): never {
  throw new Error(`Chipnet live probe: ${message}`);
}

async function main() {
  if (process.env.APP_NETWORK === "mainnet") {
    fail("APP_NETWORK must be chipnet for this dev-only probe");
  }
  const mnemonic = process.env.CHIPNET_DEV_MNEMONIC;
  if (!mnemonic?.trim()) fail("CHIPNET_DEV_MNEMONIC is not available to this process");
  const indexer = indexerUrl("chipnet");
  if (!indexer) fail("CHIPNET_INDEXER_URL is not configured");

  const child = deriveHdPath(deriveHdPrivateNodeFromBip39Mnemonic(mnemonic), CHIPNET_BIP44_PATH);
  if (typeof child === "string") fail(`could not derive ${CHIPNET_BIP44_PATH}: ${child}`);
  const publicKey = secp256k1.derivePublicKeyCompressed(child.privateKey);
  if (typeof publicKey === "string") fail(`could not derive a public key: ${publicKey}`);
  const address = p2pkhAddressFromPublicKey("chipnet", publicKey);
  const provider = createChainProvider({ indexerUrl: indexer, broadcastUrl: null });
  if (provider.kind === "fixture") fail("configured indexer resolved to the fixture provider");

  const [snapshot, utxos] = await Promise.all([
    provider.getSnapshot("chipnet"),
    provider.getUtxos("chipnet", address),
  ]);
  if (!snapshot.reachable || snapshot.height === null) {
    fail(snapshot.error ?? "provider did not return a verified Chipnet tip");
  }
  const plain = utxos.filter((utxo) => utxo.token.categoryHex === null && !utxo.spent);
  const tokenBearing = utxos.filter((utxo) => utxo.token.categoryHex !== null && !utxo.spent);
  const plainSatoshis = plain.reduce((sum, utxo) => sum + parseSatoshis(utxo.valueSatoshis), 0n);

  // Public diagnostics only. No mnemonic, private key, raw transaction, or
  // endpoint credentials are included in this output.
  console.log(
    JSON.stringify(
      {
        network: "chipnet",
        derivationPath: CHIPNET_BIP44_PATH,
        address,
        provider: snapshot.provider,
        tipHeight: snapshot.height,
        plainUtxoCount: plain.length,
        tokenUtxoCount: tokenBearing.length,
        plainBch: formatBch(plainSatoshis),
        fundingEligible: plain.some((utxo) => parseSatoshis(utxo.valueSatoshis) > 10_000n),
        mode: "read-only",
      },
      null,
      2,
    ),
  );
}

await main();
