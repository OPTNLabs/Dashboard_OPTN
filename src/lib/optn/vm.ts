import { createVirtualMachineBCH, hexToBin, decodeTransaction } from "@bitauth/libauth";
import { parseSatoshis } from "./money.ts";

export type VmVerification = {
  attempted: boolean;
  valid: boolean | null;
  error: string | null;
  profile: "bch-2023-standard" | "none";
};

export function verifyTransactionVm(args: {
  rawTxHex: string;
  sourceOutputs: Array<{ lockingBytecodeHex: string; valueSatoshis: string }>;
  standard?: boolean;
}): VmVerification {
  try {
    const decoded = decodeTransaction(hexToBin(args.rawTxHex));
    if (typeof decoded === "string") {
      return { attempted: true, valid: false, error: decoded, profile: "bch-2023-standard" };
    }
    const vm = createVirtualMachineBCH(args.standard ?? true);
    const result = vm.verify({
      transaction: decoded,
      sourceOutputs: args.sourceOutputs.map((output) => ({
        lockingBytecode: hexToBin(output.lockingBytecodeHex),
        valueSatoshis: parseSatoshis(output.valueSatoshis),
      })),
    });
    if (result === true) {
      return { attempted: true, valid: true, error: null, profile: "bch-2023-standard" };
    }
    return {
      attempted: true,
      valid: false,
      error: typeof result === "string" ? result : "VM rejected the transaction",
      profile: "bch-2023-standard",
    };
  } catch (error) {
    return {
      attempted: true,
      valid: false,
      error: error instanceof Error ? error.message : "VM verification failed",
      profile: "bch-2023-standard",
    };
  }
}
