import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const BLOCKED_HOSTS = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata",
  "metadata.google.internal",
  "metadata.internal",
]);

export class UnsafeRemoteUrlError extends Error {
  constructor(message = "Recording download URL is not allowed") {
    super(message);
    this.name = "UnsafeRemoteUrlError";
  }
}

export function isBlockedIpAddress(address: string): boolean {
  const normalized = address.toLowerCase().replace(/^\[|\]$/g, "");
  const mapped = normalized.startsWith("::ffff:")
    ? normalized.slice("::ffff:".length)
    : normalized;

  if (
    mapped === "::1" ||
    mapped === "0.0.0.0" ||
    mapped.startsWith("fe80:") ||
    mapped.startsWith("fc") ||
    mapped.startsWith("fd")
  ) {
    return true;
  }

  const parts = mapped.split(".").map((part) => Number(part));
  if (
    parts.length !== 4 ||
    parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
  ) {
    return false;
  }

  const [a, b] = parts;
  if (a === 10 || a === 127 || a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

function isBlockedHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  if (BLOCKED_HOSTS.has(host)) return true;
  if (
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".localhost")
  ) {
    return true;
  }
  return false;
}

async function defaultLookup(hostname: string): Promise<string[]> {
  const results = await lookup(hostname, { all: true, verbatim: true });
  return results.map((result) => result.address);
}

export async function assertSafeDownloadUrl(
  rawUrl: string,
  resolveHost: (hostname: string) => Promise<string[]> = defaultLookup,
): Promise<void> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new UnsafeRemoteUrlError("Recording download URL is invalid");
  }

  if (url.protocol !== "https:") {
    throw new UnsafeRemoteUrlError("Recording download URL must use https");
  }
  if (url.username || url.password) {
    throw new UnsafeRemoteUrlError(
      "Recording download URL must not include credentials",
    );
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  if (!hostname || isBlockedHostname(hostname)) {
    throw new UnsafeRemoteUrlError();
  }

  const addresses = isIP(hostname) ? [hostname] : await resolveHost(hostname);
  if (
    addresses.length === 0 ||
    addresses.some((address) => isBlockedIpAddress(address))
  ) {
    throw new UnsafeRemoteUrlError();
  }
}
