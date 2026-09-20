import {
  binToHex,
  hexToBin,
  utf8ToBin,
  binToUtf8,
  hash160,
  hash256,
  sha256,
  hmacSha256,
  secp256k1,
  encodeLockingBytecodeP2pkh,
  encodeLockingBytecodeP2sh32,
  cashAddressToLockingBytecode,
  lockingBytecodeToCashAddress,
  publicKeyToP2pkhCashAddress,
  encodeTransaction,
  decodeTransaction,
  hashTransactionUiOrder,
  binToBase64,
  base64ToBin,
  bigIntToCompactUint,
  flattenBinArray,
  encodeDataPush,
  cashAssemblyToBin,
  generateSigningSerializationBCH,
  SigningSerializationTypeBCH,
  isDustOutput,
} from "@bitauth/libauth";
import { prefixFor } from "./networks.ts";
import type { Network, TokenState } from "./types.ts";

export {
  binToHex,
  hexToBin,
  utf8ToBin,
  binToUtf8,
  hash160,
  hash256,
  sha256,
  hmacSha256,
  secp256k1,
  encodeLockingBytecodeP2pkh,
  encodeLockingBytecodeP2sh32,
  encodeTransaction,
  decodeTransaction,
  hashTransactionUiOrder,
  binToBase64,
  base64ToBin,
  encodeDataPush,
  flattenBinArray,
  generateSigningSerializationBCH,
  SigningSerializationTypeBCH,
  isDustOutput,
};

export const EMPTY_TOKEN: TokenState = {
  categoryHex: null,
  amount: "0",
  nftCapability: "none",
  commitmentHex: null,
};

export function sha256Hex(bytes: Uint8Array): string {
  return binToHex(sha256.hash(bytes));
}

export function hash256Hex(bytes: Uint8Array): string {
  return binToHex(hash256(bytes));
}

export function utf8Sha256Hex(text: string): string {
  return sha256Hex(utf8ToBin(text));
}

export function concatBins(parts: Uint8Array[]): Uint8Array {
  return flattenBinArray(parts);
}

export function compileAsm(source: string): Uint8Array {
  const result = cashAssemblyToBin(source);
  if (typeof result === "string") {
    throw new Error(`CashAssembly compile failed: ${result}`);
  }
  return result;
}

export function p2pkhLockFromPkh(pkhHex: string): Uint8Array {
  return encodeLockingBytecodeP2pkh(hexToBin(pkhHex));
}

export function p2sh32LockFromRedeem(redeem: Uint8Array): Uint8Array {
  return encodeLockingBytecodeP2sh32(hash256(redeem));
}

export function lockingBytecodeHexFromAddress(address: string): string {
  const decoded = cashAddressToLockingBytecode(address);
  if (typeof decoded === "string") {
    throw new Error(decoded);
  }
  return binToHex(decoded.bytecode);
}

export function addressFromLockingBytecode(
  network: Network,
  lockingBytecodeHex: string,
): string | null {
  const result = lockingBytecodeToCashAddress({
    bytecode: hexToBin(lockingBytecodeHex),
    prefix: prefixFor(network),
  });
  if (typeof result === "string") return null;
  return result.address;
}

export function p2pkhAddressFromPublicKey(network: Network, publicKey: Uint8Array): string {
  const result = publicKeyToP2pkhCashAddress({
    publicKey,
    prefix: prefixFor(network),
  });
  if (typeof result === "string") throw new Error(result);
  return result.address;
}

export function testVectorPrivateKey(n: number): Uint8Array {
  if (n < 1 || n > 255) throw new Error("test vector out of range");
  const key = new Uint8Array(32);
  key[31] = n;
  return key;
}

export function testVectorPublicKey(n: number): Uint8Array {
  const pub = secp256k1.derivePublicKeyCompressed(testVectorPrivateKey(n));
  if (typeof pub === "string") throw new Error(pub);
  return pub;
}

export function detectLockingType(
  lockingBytecodeHex: string,
): "p2pkh" | "p2sh32" | "p2sh20" | "covenant" | "unknown" {
  const bin = hexToBin(lockingBytecodeHex);
  if (bin.length === 25 && bin[0] === 0x76 && bin[1] === 0xa9 && bin[23] === 0x88 && bin[24] === 0xac) {
    return "p2pkh";
  }
  if (bin.length === 35 && bin[0] === 0xaa && bin[1] === 0x20 && bin[34] === 0x87) {
    return "p2sh32";
  }
  if (bin.length === 23 && bin[0] === 0xa9 && bin[22] === 0x87) {
    return "p2sh20";
  }
  if (bin.length > 0) return "covenant";
  return "unknown";
}

const MESSAGE_MAGIC = "Bitcoin Signed Message:\n";

export function bchSignedMessageHash(message: string): Uint8Array {
  const magic = utf8ToBin(MESSAGE_MAGIC);
  const msg = utf8ToBin(message);
  return hash256(
    flattenBinArray([
      Uint8Array.of(magic.length),
      magic,
      bigIntToCompactUint(BigInt(msg.length)),
      msg,
    ]),
  );
}

export function signBchMessage(privateKey: Uint8Array, message: string): string {
  const digest = bchSignedMessageHash(message);
  const rec = secp256k1.signMessageHashRecoverableCompact(privateKey, digest);
  if (typeof rec === "string") throw new Error(rec);
  const flag = 31 + rec.recoveryId;
  return binToBase64(flattenBinArray([Uint8Array.of(flag), rec.signature]));
}

export function recoverBchMessagePublicKey(
  message: string,
  signatureB64: string,
): Uint8Array {
  const bin = base64ToBin(signatureB64);
  if (typeof bin === "string") throw new Error(bin);
  if (bin.length !== 65) throw new Error("BCH message signature must be 65 bytes");
  const flag = bin[0] ?? 0;
  const compressed = flag >= 31;
  const recoveryId = (flag - (compressed ? 31 : 27)) as 0 | 1 | 2 | 3;
  if (recoveryId < 0 || recoveryId > 3) {
    throw new Error("Invalid BCH message recovery flag");
  }
  const recovered = secp256k1.recoverPublicKeyCompressed(
    bin.slice(1),
    recoveryId,
    bchSignedMessageHash(message),
  );
  if (typeof recovered === "string") throw new Error(recovered);
  return recovered;
}

export function verifyBchMessageAddress(
  network: Network,
  account: string,
  message: string,
  signatureB64: string,
): boolean {
  try {
    const pub = recoverBchMessagePublicKey(message, signatureB64);
    return p2pkhAddressFromPublicKey(network, pub) === account;
  } catch {
    return false;
  }
}

export function parseAccount(account: string): { network: Network; address: string } {
  if (account.startsWith("bchtest:")) return { network: "chipnet", address: account };
  if (account.startsWith("bitcoincash:")) return { network: "mainnet", address: account };
  throw new Error("Account must be a prefixed cashaddr");
}

export function outpointKey(network: Network, txid: string, vout: number): string {
  return `${network}:${txid.toLowerCase()}:${vout}`;
}

export function txidFromEncoded(raw: Uint8Array): string {
  return binToHex(hashTransactionUiOrder(raw));
}

export function dustThresholdSatoshis(): bigint {
  return 546n;
}

export function isDustValue(value: bigint): boolean {
  return value < dustThresholdSatoshis();
}

export function pkhFromP2pkhLock(lockingBytecodeHex: string): string {
  const type = detectLockingType(lockingBytecodeHex);
  if (type !== "p2pkh") throw new Error("Locking bytecode is not P2PKH");
  return lockingBytecodeHex.slice(6, 46);
}

export function assertHex(value: string, label: string, byteLength?: number): string {
  const trimmed = value.trim().toLowerCase();
  if (!/^[0-9a-f]+$/.test(trimmed) || trimmed.length % 2 !== 0) {
    throw new Error(`${label} must be even-length hex`);
  }
  if (byteLength !== undefined && trimmed.length !== byteLength * 2) {
    throw new Error(`${label} must be ${byteLength} bytes`);
  }
  return trimmed;
}

