function env(name: string): string | undefined {
  if (typeof process === "undefined") return undefined;
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}

export function originAllowlist(): string[] {
  return (env("OPTN_ORIGIN_ALLOWLIST") ?? "")
    .split(",")
    .map((item) => item.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

export function originFromHeaders(headers: Headers): string {
  const allowlist = originAllowlist();
  const explicit = headers.get("origin")?.trim();
  const forwardedHost = headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const forwardedProto = headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const host = headers.get("host")?.trim();
  const referer = headers.get("referer")?.trim();
  let derived: string | null = null;
  if (explicit) {
    try {
      derived = new URL(explicit).origin;
    } catch {
      derived = null;
    }
  } else if (forwardedHost) {
    const proto = forwardedProto === "https" ? "https" : "http";
    derived = `${proto}://${forwardedHost}`;
  } else if (host) {
    const proto = forwardedProto === "https" || host.includes("localhost") === false ? forwardedProto ?? "http" : "http";
    derived = `${proto}://${host}`;
  } else if (referer) {
    try {
      derived = new URL(referer).origin;
    } catch {
      derived = null;
    }
  }
  if (!derived) throw new Error("Cannot derive a trusted dashboard origin from request headers");
  derived = derived.replace(/\/$/, "");
  if (allowlist.length > 0 && !allowlist.includes(derived)) {
    throw new Error(`Origin ${derived} is not on the dashboard allowlist`);
  }
  return derived;
}

export async function requestOrigin(): Promise<string> {
  const { getRequestHeaders } = await import("@tanstack/react-start/server");
  return originFromHeaders(getRequestHeaders());
}
