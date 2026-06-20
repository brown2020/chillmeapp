import { describe, expect, it } from "vitest";
import { formatMeetingCreatedAt, formatSeconds } from "./dateUtils";

describe("dateUtils", () => {
  it("formats durations from seconds", () => {
    expect(formatSeconds(45)).toBe("45 seconds");
    expect(formatSeconds(61)).toBe("1 minute 1 second");
    expect(formatSeconds(125)).toBe("2 minutes 5 seconds");
    expect(formatSeconds(3723)).toBe("1 hour 2 minutes 3 seconds");
  });

  it("formats ISO meeting creation dates", () => {
    const createdAt = "2026-06-20T12:00:00.000Z";

    expect(formatMeetingCreatedAt(createdAt)).toBe(
      new Date(createdAt).toDateString(),
    );
  });

  it("formats Firestore timestamp-like meeting creation dates", () => {
    const createdAt = { seconds: 1781956800 };

    expect(formatMeetingCreatedAt(createdAt)).toBe(
      new Date(createdAt.seconds * 1000).toDateString(),
    );
  });

  it("falls back for invalid meeting creation dates", () => {
    expect(formatMeetingCreatedAt(null)).toBe("Unknown date");
    expect(formatMeetingCreatedAt("not-a-date")).toBe("Unknown date");
  });
});
