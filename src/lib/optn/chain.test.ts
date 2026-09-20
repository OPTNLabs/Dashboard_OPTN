import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ElectrumChainProvider,
  FixtureChainProvider,
  createChainProvider,
  electrumScriptHash,
  parseChronikToken,
  parseElectrumEndpoint,
  parseElectrumToken,
  readWalletChainState,
} from "./chain.ts";
import { demoVaultUtxo } from "./fixtures.ts";

describe("Chronik token parsing", () => {
  it("marks omitted vs unknown vs reported", () => {
    const unknown = parseChronikToken({});
    assert.equal(unknown.tokenEvidence, "unknown");
    const omitted = parseChronikToken({ token: null });
    assert.equal(omitted.tokenEvidence, "provider-omitted");
    assert.equal(omitted.token.categoryHex, null);
    const reported = parseChronikToken({
      token: {
        tokenId: "aa".repeat(32),
        amount: "5",
        nft: { capability: "mutable", commitment: "ff" },
      },
    });
    assert.equal(reported.tokenEvidence, "provider-reported");
    assert.equal(reported.token.amount, "5");
    assert.equal(reported.token.nftCapability, "mutable");
  });
});

describe("fixture provider", () => {
  it("proves the demo vault outpoint as fixture-unspent and refuses broadcast", async () => {
    const provider = new FixtureChainProvider();
    const utxo = demoVaultUtxo();
    const observed = await provider.proveUnspent("chipnet", utxo.outpoint);
    assert.equal(observed.spent, false);
    assert.equal(observed.spentEvidence, "fixture");
    await assert.rejects(() => provider.broadcast());
  });

  it("rejects a spent outpoint and missing output", async () => {
    const provider = new FixtureChainProvider();
    const utxo = demoVaultUtxo();
    provider.markSpent(utxo.outpoint);
    await assert.rejects(() => provider.proveUnspent("chipnet", utxo.outpoint));
    const missing = await provider.getTransactionOutput("chipnet", {
      txid: "00".repeat(32),
      vout: 9,
    });
    assert.equal(missing, null);
    const status = await provider.getStatus("chipnet", "deadbeef");
    assert.equal(status.kind, "not-found");
  });

  it("preflight fails for a spent input", async () => {
    const provider = new FixtureChainProvider();
    const result = await provider.preflight("chipnet", "00");
    assert.equal(result.ok, false);
  });

  it("createChainProvider stays on the fixture when no indexer is configured", () => {
    const provider = createChainProvider({ indexerUrl: null, broadcastUrl: null });
    assert.equal(provider.kind, "fixture");
  });

  it("never leaks demo wallet balances into a live-mode read", async () => {
    const result = await readWalletChainState(
      new FixtureChainProvider(),
      "chipnet",
      "bchtest:qq000000000000000000000000000000000000000",
      false,
    );
    assert.deepEqual(result.utxos, []);
    assert.equal(result.wallet, null);
    assert.match(result.walletError ?? "", /No live chain provider is configured/);
  });

  it("retains deterministic wallet data only when demo mode explicitly allows it", async () => {
    const result = await readWalletChainState(new FixtureChainProvider(), "chipnet", "demo", true);
    assert.equal(result.utxos.length, 2);
    assert.equal(result.wallet?.balanceSatoshis, "1262500000");
    assert.equal(result.walletError, null);
  });
});

describe("Electrum provider", () => {
  it("parses secure WSS endpoints and rejects remote plaintext", () => {
    assert.deepEqual(parseElectrumEndpoint("wss://electrum-chipnet.optnlabs.com:50004"), {
      host: "electrum-chipnet.optnlabs.com",
      port: 50004,
      encrypted: true,
      label: "electrum-chipnet.optnlabs.com:50004",
    });
    assert.throws(() => parseElectrumEndpoint("ws://electrum-chipnet.optnlabs.com:50003"));
  });

  it("uses Electrum's reversed SHA-256 script hash and token evidence", () => {
    const hash = electrumScriptHash("76a914000000000000000000000000000000000000000088ac");
    assert.equal(hash.length, 64);
    assert.match(hash, /^[0-9a-f]{64}$/);
    assert.equal(parseElectrumToken(undefined).tokenEvidence, "provider-reported");
    const token = parseElectrumToken({
      category: "aa".repeat(32),
      amount: "42",
      nft: { capability: "minting", commitment: "ff" },
    });
    assert.equal(token.token.amount, "42");
    assert.equal(token.token.nftCapability, "minting");
  });

  it("selects Electrum for WSS and keeps HTTP on Chronik", () => {
    const electrum = createChainProvider({
      indexerUrl: "wss://electrum-chipnet.optnlabs.com:50004",
      broadcastUrl: null,
    });
    assert.ok(electrum instanceof ElectrumChainProvider);
    assert.equal(electrum.kind, "electrum");
    assert.equal(
      createChainProvider({ indexerUrl: "https://chronik.example", broadcastUrl: null }).kind,
      "chronik",
    );
  });
});
