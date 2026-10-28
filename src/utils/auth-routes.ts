export const PUBLIC_ROUTES = [
  "/",
  "/auth/signin",
  "/auth/signup",
  "/auth/signout",
  "/auth/forgot-password",
  "/auth/verify-email",
  "/terms",
  "/privacy",
] as const;

export const PUBLIC_API_ROUTE_PREFIXES = [
  "/api/webhook/livekit",
  "/api/webhook/stripe",
  "/api/auth/session",
] as const;

export function isSameOriginRequest(
  originHeader: string | null,
  expectedOrigin: string,
): boolean {
  if (!originHeader || !expectedOrigin) return false;
  try {
    return new URL(originHeader).origin === new URL(expectedOrigin).origin;
  } catch {
    return false;
  }
}

/**
 * Accept only same-origin relative paths. Rejects protocol-relative URLs and
 * backslash variants that the URL parser treats as `https://host`.
 */
export function safeInternalPath(
  candidate: string | null,
  fallback: string,
  baseOrigin = "https://chill.me",
): string {
  if (!candidate) return fallback;
  const trimmed = candidate.trim();
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("\\") ||
    trimmed.includes("://") ||
    trimmed.includes("\0")
  ) {
    return fallback;
  }

  let base: URL;
  try {
    base = new URL(baseOrigin);
  } catch {
    return fallback;
  }

  let resolved: URL;
  try {
    resolved = new URL(trimmed, base);
  } catch {
    return fallback;
  }

  if (resolved.origin !== base.origin) return fallback;
  if (resolved.pathname.startsWith("//") || resolved.pathname.includes("\\")) {
    return fallback;
  }

  return `${resolved.pathname}${resolved.search}${resolved.hash}`;
}

export function getSessionCookieName(): string {
  return (
    process.env.AUTH_SESSION_COOKIE_NAME ||
    process.env.NEXT_PUBLIC_COOKIE_NAME ||
    "chillmeAuthToken"
  );
}

export function normalizePathname(pathname: string): string {
  if (!pathname) return "/";
  const withoutTrailingSlash =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  return withoutTrailingSlash;
}

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.includes(
    normalizePathname(pathname) as (typeof PUBLIC_ROUTES)[number],
  );
}

export function isAuthRoute(pathname: string): boolean {
  return normalizePathname(pathname).startsWith("/auth/");
}

/** Shared meeting links: /live/{roomId} — public for guests; /live alone stays protected. */
export function isGuestJoinRoute(pathname: string): boolean {
  const normalized = normalizePathname(pathname);
  const match = normalized.match(/^\/live\/([^/]+)$/);
  return Boolean(match?.[1]);
}

export function isPublicApiRoute(pathname: string): boolean {
  const normalized = normalizePathname(pathname);
  return PUBLIC_API_ROUTE_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}

export function isProtectedRoute(pathname: string): boolean {
  const normalized = normalizePathname(pathname);
  if (isPublicRoute(normalized)) return false;
  if (isGuestJoinRoute(normalized)) return false;
  if (normalized.startsWith("/api/")) return false;
  return true;
}

export function buildSignInUrl(requestUrl: string, callbackPath: string): URL {
  const signInUrl = new URL("/auth/signin", requestUrl);
  const safeCallback = safeInternalPath(
    callbackPath,
    "/live",
    signInUrl.origin,
  );
  if (safeCallback !== "/auth/signin") {
    signInUrl.searchParams.set("callbackUrl", safeCallback);
  }
  return signInUrl;
}
