import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { IDENTITIES } from "./identities.ts";
import {
  assertLoginNamespace,
  assertSigningNamespace,
  extractSignedTransaction,
  parseCaip10Account,
  buildSignMessageParams,
  buildSignTransactionParams,
  normalizeWalletConnectPairingUri,
} from "./wallet-connect.ts";
import {
  approvalMessage,
  hashIntent,
  hashPolicy,
  loginMessage,
  buildCanonicalIntent,
} from "./intent.ts";
import { originFromHeaders } from "./origin.server.ts";
import { reservationConflict, broadcastLockDecision } from "./reservation.ts";
import { canTransition } from "./lifecycle.ts";
import { demoPlan, demoVault, demoVaultUtxo } from "./fixtures.ts";
import { buildUnsignedVaultRelease } from "./tx-builder.ts";
import {
  hexToBin,
  signBchMessage,
  testVectorPrivateKey,
  verifyBchMessageAddress,
} from "./encoding.ts";

const aliceKey = testVectorPrivateKey(1);

describe("WalletConnect protocol", () => {
  it("keeps the raw wc: pairing URI expected by OPTN Wallet", () => {
    const uri = "wc:abc123@2?relay-protocol=irn&symKey=def456";
    assert.equal(normalizeWalletConnectPairingUri(`  ${uri}  `), uri);
    assert.throws(() => normalizeWalletConnectPairingUri(`pairing:${uri}`));
  });

  it("accepts Chipnet CAIP-10 and cashaddr", () => {
    const payload = IDENTITIES.alice.account.slice("bchtest:".length);
    assert.equal(parseCaip10Account(`bch:bchtest:${payload}`, "chipnet"), IDENTITIES.alice.account);
    assert.equal(parseCaip10Account(IDENTITIES.alice.account, "chipnet"), IDENTITIES.alice.account);
  });

  it("rejects the wrong chain", () => {
    assert.throws(() => parseCaip10Account("bch:bitcoincash:qtest", "chipnet"));
    assert.throws(() => parseCaip10Account(IDENTITIES.alice.account, "mainnet"));
  });

  it("login namespace requires bch_signMessage", () => {
    assert.throws(() =>
      assertLoginNamespace(
        { namespaces: { bch: { chains: ["bch:bchtest"], methods: ["bch_signTransaction"] } } },
        "chipnet",
      ),
    );
    assert.doesNotThrow(() =>
      assertLoginNamespace(
        { namespaces: { bch: { chains: ["bch:bchtest"], methods: ["bch_signMessage"] } } },
        "chipnet",
      ),
    );
    assert.throws(() =>
      assertLoginNamespace({ namespaces: { bch: { methods: ["bch_signMessage"] } } }, "chipnet"),
    );
  });

  it("signing namespace requires bch_signTransaction and matching account", () => {
    assert.throws(() =>
      assertSigningNamespace(
        {
          namespaces: {
            bch: {
              methods: ["bch_signMessage"],
              accounts: [`bch:bchtest:${IDENTITIES.alice.account.slice("bchtest:".length)}`],
            },
          },
        },
        "chipnet",
        IDENTITIES.alice.account,
      ),
    );
    assert.doesNotThrow(() =>
      assertSigningNamespace(
        {
          namespaces: {
            bch: {
              methods: ["bch_signTransaction"],
              accounts: [`bch:bchtest:${IDENTITIES.alice.account.slice("bchtest:".length)}`],
            },
          },
        },
        "chipnet",
        IDENTITIES.alice.account,
      ),
    );
  });

  it("extracts signed transaction hex from wallet result shapes", () => {
    assert.equal(extractSignedTransaction("aabbcc"), "aabbcc");
    assert.equal(extractSignedTransaction({ signedTransaction: "ddeeff" }), "ddeeff");
    assert.throws(() => extractSignedTransaction({}));
  });

  it("sign-message params include the address field", () => {
    const params = buildSignMessageParams(IDENTITIES.alice.account, "hello");
    assert.equal(params.address, IDENTITIES.alice.account);
    assert.equal("account" in params, false);
  });

  it("sign-transaction params disable in-wallet broadcast and include source outputs", () => {
    const utxo = demoVaultUtxo();
    const built = buildUnsignedVaultRelease({
      utxo,
      paymentLockingBytecodeHex: IDENTITIES.vendor.lockingBytecodeHex,
      successorLockingBytecodeHex: demoVault().covenantLockingBytecodeHex,
      amountSatoshis: "100000",
      feeSatoshis: "1000",
    });
    const params = buildSignTransactionParams({
      account: IDENTITIES.alice.account,
      unsignedHex: built.rawHex,
      source: utxo,
      redeemBytecodeHex: demoVault().redeemBytecodeHex,
      userPrompt: "sign",
    });
    assert.equal(params.broadcast, false);
    assert.deepEqual(
      [...params.sourceOutputs[0]!.outpointTransactionHash],
      [...hexToBin(utxo.outpoint.txid)],
    );
    assert.equal(params.sourceOutputs[0]?.contract?.artifact?.contractName, "BoundedReleaseVault");
    assert.equal(params.sourceOutputs[0]?.contract?.abiFunction?.name, "spend");
    assert.equal(params.transaction.inputs[0]?.unlockingBytecode.length > 0, true);
  });
});

describe("login and approval messages", () => {
  it("binds origin/network/account and rejects the wrong account", () => {
    const message = loginMessage({
      origin: "https://optn.example",
      network: "chipnet",
      account: IDENTITIES.alice.account,
      nonce: "n1",
      issuedAt: "2026-01-01T00:00:00.000Z",
      expiresAt: "2026-01-01T00:05:00.000Z",
    });
    assert.match(message, /https:\/\/optn.example/);
    const signature = signBchMessage(aliceKey, message);
    assert.equal(
      verifyBchMessageAddress("chipnet", IDENTITIES.alice.account, message, signature),
      true,
    );
    assert.equal(
      verifyBchMessageAddress("chipnet", IDENTITIES.bob.account, message, signature),
      false,
    );
  });

  it("approval signatures bind the intent hash", () => {
    const message = approvalMessage("ab".repeat(32), "chipnet", "prop-1");
    const signature = signBchMessage(aliceKey, message);
    assert.equal(
      verifyBchMessageAddress("chipnet", IDENTITIES.alice.account, message, signature),
      true,
    );
    const other = approvalMessage("cd".repeat(32), "chipnet", "prop-1");
    assert.equal(
      verifyBchMessageAddress("chipnet", IDENTITIES.alice.account, other, signature),
      false,
    );
  });
});

describe("origin allowlist", () => {
  it("derives origin from headers and rejects unknown allowlist entries", () => {
    const origin = originFromHeaders(new Headers({ origin: "https://optn.example" }));
    assert.equal(origin, "https://optn.example");
    const previous = process.env.OPTN_ORIGIN_ALLOWLIST;
    process.env.OPTN_ORIGIN_ALLOWLIST = "https://allowed.example";
    try {
      assert.throws(() => originFromHeaders(new Headers({ origin: "https://evil.example" })));
    } finally {
      if (previous === undefined) delete process.env.OPTN_ORIGIN_ALLOWLIST;
      else process.env.OPTN_ORIGIN_ALLOWLIST = previous;
    }
  });
});

describe("reservations and broadcast locks", () => {
  it("two proposals cannot hold the same outpoint", () => {
    const first = reservationConflict(null, "prop-a");
    assert.equal(first.ok, true);
    const second = reservationConflict({ proposalId: "prop-a", status: "reserved" }, "prop-b");
    assert.equal(second.ok, false);
    if (!second.ok) assert.equal(second.holder, "prop-a");
    assert.equal(
      reservationConflict({ proposalId: "prop-a", status: "spent" }, "prop-a").ok,
      false,
    );
  });

  it("broadcast lock is idempotent once a txid is stored", () => {
    assert.equal(broadcastLockDecision(null), "acquire");
    assert.equal(broadcastLockDecision({ proposalId: "p1", txid: null }), "in-flight");
    assert.equal(broadcastLockDecision({ proposalId: "p1", txid: "aa".repeat(32) }), "duplicate");
  });
});

describe("lifecycle gates", () => {
  it("build cannot occur before approval and broadcast cannot occur before signed-vm-validated", () => {
    assert.equal(canTransition("policy-valid", "unsigned-built"), false);
    assert.equal(canTransition("approved", "unsigned-built"), true);
    assert.equal(canTransition("unsigned-built", "broadcast-requested"), false);
    assert.equal(canTransition("locally-vm-validated", "broadcast-requested"), false);
    assert.equal(canTransition("vm-invalid", "broadcast-requested"), false);
    assert.equal(canTransition("signed-vm-validated", "broadcast-requested"), true);
  });
});

describe("policy hash", () => {
  it("changes when semantics change and ignores canvas layout", () => {
    const plan = demoPlan();
    const base = hashPolicy(plan);
    const moved = hashPolicy({
      ...plan,
      canvas: {
        nodes: plan.canvas.nodes.map((node) => ({ ...node, x: node.x + 40, y: node.y + 10 })),
        edges: plan.canvas.edges,
      },
    });
    assert.equal(base, moved);
    const semantic = hashPolicy({
      ...plan,
      limits: { ...plan.limits, perPaymentSatoshis: "4000000" },
    });
    assert.notEqual(base, semantic);
  });

  it("intent hash changes when artifact or sequence changes", () => {
    const plan = demoPlan();
    const vault = demoVault();
    const baseArgs = {
      plan,
      proposalId: "prop-1",
      vaultId: vault.id,
      utxo: vault.state,
      routeId: 0,
      amountSatoshis: "2000000",
      feeSatoshis: "1000",
      destinationLockingBytecodeHex: IDENTITIES.vendor.lockingBytecodeHex,
      successorLockingBytecodeHex: vault.covenantLockingBytecodeHex,
      successorValueSatoshis: "1247999000",
      nonce: "n1",
      createdAt: "2026-01-01T00:00:00.000Z",
      expiresAt: "2026-01-01T01:00:00.000Z",
    };
    const a = hashIntent(buildCanonicalIntent(baseArgs));
    const b = hashIntent(buildCanonicalIntent({ ...baseArgs, artifactHash: "ff".repeat(32) }));
    const c = hashIntent(buildCanonicalIntent({ ...baseArgs, inputSequence: 1 }));
    assert.notEqual(a, b);
    assert.notEqual(a, c);
  });
});

describe("off-chain labelling", () => {
  it("approval threshold is off-chain-policy on the demo plan", () => {
    const plan = demoPlan();
    assert.equal(plan.governance.threshold, 2);
    assert.equal(plan.recovery.enforcement, "not-implemented");
  });
});
