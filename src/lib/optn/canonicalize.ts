function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function canonicalize(value: unknown): unknown {
  if (typeof value === "bigint") return value.toString();
  if (value instanceof Uint8Array) {
    return Array.from(value, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!isPlainObject(value)) return value;
  const keys = Object.keys(value).sort();
  const out: Record<string, unknown> = {};
  for (const key of keys) {
    const item = value[key];
    if (item === undefined) continue;
    out[key] = canonicalize(item);
  }
  return out;
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}
