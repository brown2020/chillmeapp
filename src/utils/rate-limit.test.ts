import { afterEach, describe, expect, it } from "vitest";
import {
  assertWithinRateLimit,
  RateLimitError,
  resetRateLimits,
} from "./rate-limit";

describe("rate-limit", () => {
  afterEach(() => {
    resetRateLimits();
  });

  it("allows requests inside the window and blocks the next one", () => {
    assertWithinRateLimit("join", 2, 1_000, 0);
    assertWithinRateLimit("join", 2, 1_000, 10);
    expect(() => assertWithinRateLimit("join", 2, 1_000, 20)).toThrow(
      RateLimitError,
    );
  });

  it("forgets hits after the window", () => {
    assertWithinRateLimit("join", 1, 1_000, 0);
    expect(() => assertWithinRateLimit("join", 1, 1_000, 1_001)).not.toThrow();
  });
});
