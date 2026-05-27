import { describe, expect, it } from "vitest";
import {
  buildSignInUrl,
  isAuthRoute,
  isProtectedRoute,
  isPublicApiRoute,
  isPublicRoute,
  normalizePathname,
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

  it("identifies auth routes", () => {
    expect(isAuthRoute("/auth/signin")).toBe(true);
    expect(isAuthRoute("/live")).toBe(false);
  });

  it("identifies protected routes", () => {
    expect(isProtectedRoute("/live")).toBe(true);
    expect(isProtectedRoute("/live/abc-def-ghi-jkl")).toBe(true);
    expect(isProtectedRoute("/")).toBe(false);
    expect(isProtectedRoute("/api/webhook/livekit")).toBe(false);
  });

  it("allows public API routes", () => {
    expect(isPublicApiRoute("/api/webhook/livekit")).toBe(true);
    expect(isPublicApiRoute("/api/auth/session")).toBe(true);
    expect(isPublicApiRoute("/api/other")).toBe(false);
  });

  it("builds sign-in callback URLs safely", () => {
    const url = buildSignInUrl("http://localhost:3000", "/live");
    expect(url.pathname).toBe("/auth/signin");
    expect(url.searchParams.get("callbackUrl")).toBe("/live");
  });
});
