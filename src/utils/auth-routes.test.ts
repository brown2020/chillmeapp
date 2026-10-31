import { describe, expect, it } from "vitest";
import {
  buildSignInUrl,
  isAuthRoute,
  isGuestJoinRoute,
  isProtectedRoute,
  isPublicApiRoute,
  isPublicRoute,
  isSameOriginRequest,
  normalizePathname,
  safeInternalPath,
} from "./auth-routes";

describe("auth-routes", () => {
  it("normalizes trailing slashes", () => {
    expect(normalizePathname("/live/")).toBe("/live");
    expect(normalizePathname("/")).toBe("/");
  });

  it("identifies public routes", () => {
    expect(isPublicRoute("/")).toBe(true);
    expect(isPublicRoute("/auth/signin")).toBe(true);
    expect(isPublicRoute("/live")).toBe(false);
  });

  it("identifies guest join routes", () => {
    expect(isGuestJoinRoute("/live/abc-def-ghi-jkl")).toBe(true);
    expect(isGuestJoinRoute("/live")).toBe(false);
    expect(isGuestJoinRoute("/live/room/extra")).toBe(false);
  });

  it("identifies auth routes", () => {
    expect(isAuthRoute("/auth/signin")).toBe(true);
    expect(isAuthRoute("/live")).toBe(false);
  });

  it("identifies protected routes", () => {
    expect(isProtectedRoute("/live")).toBe(true);
    expect(isProtectedRoute("/live/abc-def-ghi-jkl")).toBe(false);
    expect(isProtectedRoute("/past-meetings")).toBe(true);
    expect(isProtectedRoute("/")).toBe(false);
    expect(isProtectedRoute("/api/webhook/livekit")).toBe(false);
  });

  it("allows public API routes", () => {
    expect(isPublicApiRoute("/api/webhook/livekit")).toBe(true);
    expect(isPublicApiRoute("/api/webhook/stripe")).toBe(true);
    expect(isPublicApiRoute("/api/auth/session")).toBe(true);
    expect(isPublicApiRoute("/api/recording")).toBe(true);
    expect(isPublicApiRoute("/api/other")).toBe(false);
  });

  it("accepts only same-origin callback paths", () => {
    expect(safeInternalPath("/live", "/home", "https://chill.me")).toBe(
      "/live",
    );
    expect(safeInternalPath("/live?room=1", "/home", "https://chill.me")).toBe(
      "/live?room=1",
    );
    expect(safeInternalPath("//evil.com", "/home", "https://chill.me")).toBe(
      "/home",
    );
    expect(safeInternalPath("/\\evil.com", "/home", "https://chill.me")).toBe(
      "/home",
    );
    expect(
      safeInternalPath("https://evil.com", "/home", "https://chill.me"),
    ).toBe("/home");
    expect(safeInternalPath(null, "/home", "https://chill.me")).toBe("/home");
  });

  it("requires a matching Origin header", () => {
    expect(isSameOriginRequest("https://chill.me", "https://chill.me")).toBe(
      true,
    );
    expect(isSameOriginRequest("https://evil.com", "https://chill.me")).toBe(
      false,
    );
    expect(isSameOriginRequest(null, "https://chill.me")).toBe(false);
  });

  it("builds sign-in callback URLs safely", () => {
    const url = buildSignInUrl("http://localhost:3000", "/live");
    expect(url.pathname).toBe("/auth/signin");
    expect(url.searchParams.get("callbackUrl")).toBe("/live");
  });
});
