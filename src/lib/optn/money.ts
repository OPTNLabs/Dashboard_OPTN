export const SATOSHIS_PER_BCH = 100_000_000n;

export function parseSatoshis(value: string | number | bigint): bigint {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") {
    if (!Number.isInteger(value) || value < 0) {
      throw new Error("Satoshis must be a non-negative integer");
    }
    return BigInt(value);
  }
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) throw new Error(`Invalid satoshi amount: ${value}`);
  return BigInt(trimmed);
}

export function satoshisToBch(satoshis: string | bigint): string {
  const value = parseSatoshis(satoshis);
  const whole = value / SATOSHIS_PER_BCH;
  const frac = value % SATOSHIS_PER_BCH;
  if (frac === 0n) return `${whole}`;
  const fracStr = frac.toString().padStart(8, "0").replace(/0+$/, "");
  return `${whole}.${fracStr}`;
}

export function bchToSatoshis(bch: string): bigint {
  const trimmed = bch.trim();
  if (!/^\d+(\.\d{1,8})?$/.test(trimmed)) {
    throw new Error("BCH amount must have at most 8 decimal places");
  }
  const [whole, frac = ""] = trimmed.split(".");
  return BigInt(whole ?? "0") * SATOSHIS_PER_BCH + BigInt((frac ?? "").padEnd(8, "0"));
}

export function formatBch(satoshis: string | bigint, digits = 4): string {
  const bch = Number(satoshisToBch(satoshis));
  return `${bch.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: digits,
  })} BCH`;
}

export function formatSats(satoshis: string | bigint): string {
  const value = parseSatoshis(satoshis);
  return `${value.toLocaleString("en-US")} sats`;
}

export function percentConsumed(consumed: string | bigint, total: string | bigint): number {
  const c = parseSatoshis(consumed);
  const t = parseSatoshis(total);
  if (t === 0n) return 0;
  return Math.min(100, Math.round(Number((c * 1000n) / t) / 10));
}
