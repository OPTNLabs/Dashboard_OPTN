/**
 * Chipnet covenant end-to-end preflight.
 *
 * This script consumes CHIPNET_DEV_MNEMONIC only in process memory. It never
 * writes or prints key material, raw transactions, or a mnemonic. It creates
 * no network side effect unless both --execute-chipnet and
 * --confirm-chipnet-broadcast are explicitly supplied.
 *
 * It proves the existing ordinary BCH inputs are unspent, signs a candidate
 * P2PKH funding transition locally, validates it in CashVM, then constructs
 * and CashVM-validates the resulting BoundedRelease covenant transition.
 * The covenant input is intentionally not submitted to provider preflight: it
 * does not exist until the funding transaction has actually been broadcast.
 */
import { deriveHdPath, deriveHdPrivateNodeFromBip39Mnemonic } from "@bitauth/libauth";
import { createChainProvider } from "../src/lib/optn/chain.ts";
import type { ChainProvider } from "../src/lib/optn/chain.ts";
import { indexerUrl } from "../src/lib/optn/config.server.ts";
import { compileBoundedRelease } from "../src/lib/optn/covenant.ts";
import {
  binToHex,
  concatBins,
  encodeDataPush,
  encodeTransaction,
  generateSigningSerializationBCH,
  hash160,
  hash256,
  hexToBin,
  lockingBytecodeHexFromAddress,
  p2pkhAddressFromPublicKey,
  secp256k1,
  SigningSerializationTypeBCH,
  txidFromEncoded,
} from "../src/lib/optn/encoding.ts";
import { formatBch, parseSatoshis } from "../src/lib/optn/money.ts";
import { buildUnsignedVaultRelease, signVaultRelease } from "../src/lib/optn/tx-builder.ts";
import {
  LOCKTIME_NONE,
  SEQUENCE_ENABLE_LOCKTIME,
  TX_VERSION,
} from "../src/lib/optn/tx-constants.ts";
import type { UtxoState } from "../src/lib/optn/types.ts";
import { verifyTransactionVm } from "../src/lib/optn/vm.ts";

const OPERATOR_PATH = "m/44'/1'/0'/0/0";
const RECIPIENT_PATH = "m/44'/1'/0'/0/1";
const FUNDING_SATOSHIS = 5_000_000n;
const FUNDING_FEE_SATOSHIS = 1_000n;
const PAYMENT_SATOSHIS = 1_000_000n;
const SPEND_FEE_SATOSHIS = 1_000n;
const MAX_PAYMENT_SATOSHIS = 2_000_000n;
const MAX_FEE_SATOSHIS = 2_000n;
const DUST_SATOSHIS = 546n;

function fail(message: string): never {
  throw new Error(`Chipnet covenant preflight: ${message}`);
}

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

async function waitForUnspent(args: {
  provider: ChainProvider;
  txid: string;
  vout: number;
  description: string;
}): Promise<UtxoState> {
  let lastError = "not yet observed";
  for (let attempt = 1; attempt <= 8; attempt += 1) {
    try {
      return await args.provider.proveUnspent("chipnet", { txid: args.txid, vout: args.vout });
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      if (attempt < 8) await wait(1_500);
    }
  }
  fail(`${args.description} was not observed as an unspent Chipnet output: ${lastError}`);
}

function deriveKey(mnemonic: string, path: string) {
  const child = deriveHdPath(deriveHdPrivateNodeFromBip39Mnemonic(mnemonic), path);
  if (typeof child === "string") fail(`could not derive ${path}: ${child}`);
  const publicKey = secp256k1.derivePublicKeyCompressed(child.privateKey);
  if (typeof publicKey === "string") fail(`could not derive public key at ${path}: ${publicKey}`);
  return { privateKey: child.privateKey, publicKey };
}

function selectInputs(utxos: UtxoState[]) {
  const ordinary = utxos
    .filter(
      (utxo) =>
        !utxo.spent &&
        utxo.token.categoryHex === null &&
        utxo.tokenEvidence === "provider-reported" &&
        utxo.lockingType === "p2pkh",
    )
    .sort((a, b) => Number(parseSatoshis(b.valueSatoshis) - parseSatoshis(a.valueSatoshis)));
  const required = FUNDING_SATOSHIS + FUNDING_FEE_SATOSHIS + DUST_SATOSHIS;
  const selected: UtxoState[] = [];
  let total = 0n;
  for (const utxo of ordinary) {
    selected.push(utxo);
    total += parseSatoshis(utxo.valueSatoshis);
    if (total >= required) break;
  }
  if (total < required) {
    fail(
      `need at least ${required.toString()} ordinary sats for funding plus change; found ${total.toString()}`,
    );
  }
  return {
    selected,
    total,
    excludedTokenUtxoCount: utxos.filter((utxo) => !utxo.spent && utxo.token.categoryHex !== null)
      .length,
  };
}

function signFundingTransaction(args: {
  inputs: UtxoState[];
  operatorPrivateKey: Uint8Array;
  operatorPublicKey: Uint8Array;
  vaultLockingBytecodeHex: string;
  changeLockingBytecodeHex: string;
}) {
  const inputValue = args.inputs.reduce((sum, utxo) => sum + parseSatoshis(utxo.valueSatoshis), 0n);
  const change = inputValue - FUNDING_SATOSHIS - FUNDING_FEE_SATOSHIS;
  if (change < DUST_SATOSHIS) fail("funding change would be dust");
  const transaction = {
    version: TX_VERSION,
    locktime: LOCKTIME_NONE,
    inputs: args.inputs.map((utxo) => ({
      outpointIndex: utxo.outpoint.vout,
      outpointTransactionHash: hexToBin(utxo.outpoint.txid),
      sequenceNumber: SEQUENCE_ENABLE_LOCKTIME,
      unlockingBytecode: new Uint8Array(),
    })),
    outputs: [
      { lockingBytecode: hexToBin(args.vaultLockingBytecodeHex), valueSatoshis: FUNDING_SATOSHIS },
      { lockingBytecode: hexToBin(args.changeLockingBytecodeHex), valueSatoshis: change },
    ],
  };
  const sourceOutputs = args.inputs.map((utxo) => ({
    lockingBytecode: hexToBin(utxo.lockingBytecodeHex),
    valueSatoshis: parseSatoshis(utxo.valueSatoshis),
  }));
  const typeByte = SigningSerializationTypeBCH.allOutputsAllUtxos;
  for (const [inputIndex, utxo] of args.inputs.entries()) {
    const serialization = generateSigningSerializationBCH(
      { inputIndex, sourceOutputs, transaction },
      {
        coveredBytecode: hexToBin(utxo.lockingBytecodeHex),
        signingSerializationType: Uint8Array.of(typeByte),
      },
    );
    const signature = secp256k1.signMessageHashSchnorr(
      args.operatorPrivateKey,
      hash256(serialization),
    );
    if (typeof signature === "string")
      fail(`could not sign funding input ${inputIndex}: ${signature}`);
    const signatureWithType = new Uint8Array(signature.length + 1);
    signatureWithType.set(signature);
    signatureWithType[signature.length] = typeByte;
    transaction.inputs[inputIndex]!.unlockingBytecode = concatBins([
      encodeDataPush(signatureWithType),
      encodeDataPush(args.operatorPublicKey),
    ]);
  }
  const encoded = encodeTransaction(transaction);
  return {
    rawHex: binToHex(encoded),
    candidateTxid: txidFromEncoded(encoded),
    change,
    sourceOutputs: args.inputs.map((utxo) => ({
      lockingBytecodeHex: utxo.lockingBytecodeHex,
      valueSatoshis: utxo.valueSatoshis,
    })),
  };
}

async function main() {
  const execute = process.argv.includes("--execute-chipnet");
  const confirmed = process.argv.includes("--confirm-chipnet-broadcast");
  if (execute !== confirmed) {
    fail("broadcast requires both --execute-chipnet and --confirm-chipnet-broadcast");
  }
  if (process.env.APP_NETWORK === "mainnet")
    fail("APP_NETWORK must be chipnet for this dev-only run");
  const mnemonic = process.env.CHIPNET_DEV_MNEMONIC;
  if (!mnemonic?.trim()) fail("CHIPNET_DEV_MNEMONIC is not available to this process");
  const indexer = indexerUrl("chipnet");
  if (!indexer) fail("CHIPNET_INDEXER_URL is not configured");

  const operator = deriveKey(mnemonic, OPERATOR_PATH);
  const recipient = deriveKey(mnemonic, RECIPIENT_PATH);
  const operatorAddress = p2pkhAddressFromPublicKey("chipnet", operator.publicKey);
  const recipientAddress = p2pkhAddressFromPublicKey("chipnet", recipient.publicKey);
  const operatorLockingBytecodeHex = lockingBytecodeHexFromAddress(operatorAddress);
  const recipientLockingBytecodeHex = lockingBytecodeHexFromAddress(recipientAddress);
  const operatorPkhHex = binToHex(hash160(operator.publicKey));
  const compiled = compileBoundedRelease({
    operatorPkhHex,
    recipientLockingBytecodeHex,
    maxPaymentSatoshis: MAX_PAYMENT_SATOSHIS.toString(),
    maxFeeSatoshis: MAX_FEE_SATOSHIS.toString(),
  });

  const provider = createChainProvider({ indexerUrl: indexer, broadcastUrl: null });
  if (provider.kind === "fixture") fail("configured indexer resolved to the fixture provider");
  const utxos = await provider.getUtxos("chipnet", operatorAddress);
  const selected = selectInputs(utxos);
  const funding = signFundingTransaction({
    inputs: selected.selected,
    operatorPrivateKey: operator.privateKey,
    operatorPublicKey: operator.publicKey,
    vaultLockingBytecodeHex: compiled.lockingBytecodeHex,
    changeLockingBytecodeHex: operatorLockingBytecodeHex,
  });
  const fundingVm = verifyTransactionVm({
    rawTxHex: funding.rawHex,
    sourceOutputs: funding.sourceOutputs,
  });
  if (fundingVm.valid !== true)
    fail(`CashVM rejected funding candidate: ${fundingVm.error ?? "unknown error"}`);
  const fundingInputProof = await provider.preflight("chipnet", funding.rawHex);
  if (!fundingInputProof.ok)
    fail(`provider input proof rejected funding candidate: ${fundingInputProof.error}`);

  const plannedVault: UtxoState = {
    network: "chipnet",
    outpoint: { txid: funding.candidateTxid, vout: 0 },
    valueSatoshis: FUNDING_SATOSHIS.toString(),
    lockingBytecodeHex: compiled.lockingBytecodeHex,
    address: null,
    token: { categoryHex: null, amount: "0", nftCapability: "none", commitmentHex: null },
    tokenEvidence: "provider-reported",
    spent: false,
    spentEvidence: "unknown",
    confirmations: 0,
    chainEvidence: "unknown",
    lockingType: "p2sh32",
  };
  const unsignedSpend = buildUnsignedVaultRelease({
    utxo: plannedVault,
    paymentLockingBytecodeHex: recipientLockingBytecodeHex,
    successorLockingBytecodeHex: compiled.lockingBytecodeHex,
    amountSatoshis: PAYMENT_SATOSHIS.toString(),
    feeSatoshis: SPEND_FEE_SATOSHIS.toString(),
  });
  const signedSpend = signVaultRelease({
    unsignedHex: unsignedSpend.rawHex,
    redeemHex: compiled.redeemHex,
    privateKey: operator.privateKey,
    publicKey: operator.publicKey,
    sourceValueSatoshis: plannedVault.valueSatoshis,
    sourceLockingBytecodeHex: plannedVault.lockingBytecodeHex,
  });
  const spendVm = verifyTransactionVm({
    rawTxHex: signedSpend.signedHex,
    sourceOutputs: [
      {
        lockingBytecodeHex: plannedVault.lockingBytecodeHex,
        valueSatoshis: plannedVault.valueSatoshis,
      },
    ],
  });
  if (spendVm.valid !== true)
    fail(`CashVM rejected covenant spend candidate: ${spendVm.error ?? "unknown error"}`);

  let fundingResult: Record<string, string> = {
    vaultValue: formatBch(FUNDING_SATOSHIS),
    feeSatoshis: FUNDING_FEE_SATOSHIS.toString(),
    changeValue: formatBch(funding.change),
    cashVm: "valid",
    providerInputProof: "passed",
    candidateTxid: funding.candidateTxid,
    broadcast: "not requested",
  };
  let covenantSpendResult: Record<string, string> = {
    paymentValue: formatBch(PAYMENT_SATOSHIS),
    feeSatoshis: SPEND_FEE_SATOSHIS.toString(),
    successorValue: formatBch(FUNDING_SATOSHIS - PAYMENT_SATOSHIS - SPEND_FEE_SATOSHIS),
    cashVm: "valid",
    providerInputProof: "not applicable until funding output exists on Chipnet",
    broadcast: "not requested",
  };

  if (execute) {
    const fundingBroadcast = await provider.broadcast("chipnet", funding.rawHex);
    if (fundingBroadcast.txid.toLowerCase() !== funding.candidateTxid.toLowerCase()) {
      fail(
        "funding broadcast returned a txid different from the signed candidate; refusing covenant spend",
      );
    }
    const fundingStatus = await provider.getStatus("chipnet", fundingBroadcast.txid);
    const observedVault = await waitForUnspent({
      provider,
      txid: fundingBroadcast.txid,
      vout: 0,
      description: "funded covenant vault",
    });
    if (
      observedVault.valueSatoshis !== FUNDING_SATOSHIS.toString() ||
      observedVault.lockingBytecodeHex !== compiled.lockingBytecodeHex ||
      observedVault.token.categoryHex !== null
    ) {
      fail("observed funding output does not match the reviewed native-BCH vault commitment");
    }
    fundingResult = {
      ...fundingResult,
      broadcast: "accepted by Electrum server",
      networkStatus: fundingStatus.kind,
      vaultUtxo: `${fundingBroadcast.txid}:0`,
      vaultUnspentProof: "passed",
    };

    const spendInputProof = await provider.preflight("chipnet", signedSpend.signedHex);
    if (!spendInputProof.ok) {
      fail(`provider input proof rejected covenant spend: ${spendInputProof.error}`);
    }
    const spendBroadcast = await provider.broadcast("chipnet", signedSpend.signedHex);
    if (spendBroadcast.txid.toLowerCase() !== signedSpend.txid.toLowerCase()) {
      fail("covenant broadcast returned a txid different from the signed candidate");
    }
    const spendStatus = await provider.getStatus("chipnet", spendBroadcast.txid);
    const observedSuccessor = await waitForUnspent({
      provider,
      txid: spendBroadcast.txid,
      vout: 1,
      description: "covenant successor",
    });
    const expectedSuccessor = FUNDING_SATOSHIS - PAYMENT_SATOSHIS - SPEND_FEE_SATOSHIS;
    if (
      observedSuccessor.valueSatoshis !== expectedSuccessor.toString() ||
      observedSuccessor.lockingBytecodeHex !== compiled.lockingBytecodeHex ||
      observedSuccessor.token.categoryHex !== null
    ) {
      fail("observed successor does not match the covenant-required value and locking bytecode");
    }
    covenantSpendResult = {
      ...covenantSpendResult,
      providerInputProof: "passed against live funded vault UTXO",
      broadcast: "accepted by Electrum server",
      networkStatus: spendStatus.kind,
      successorUtxo: `${spendBroadcast.txid}:1`,
      successorUnspentProof: "passed",
    };
  }

  // Public diagnostics only. A candidate txid identifies a locally built
  // transaction; it is not a broadcast, mempool observation, or confirmation.
  console.log(
    JSON.stringify(
      {
        network: "chipnet",
        mode: execute ? "chipnet-broadcast-cycle" : "no-broadcast-preflight",
        operatorDerivationPath: OPERATOR_PATH,
        recipientDerivationPath: RECIPIENT_PATH,
        operatorAddress,
        recipientAddress,
        selectedOrdinaryInputCount: selected.selected.length,
        excludedTokenUtxoCount: selected.excludedTokenUtxoCount,
        selectedInputValue: formatBch(selected.total),
        funding: fundingResult,
        covenantSpend: covenantSpendResult,
      },
      null,
      2,
    ),
  );
}

await main();
