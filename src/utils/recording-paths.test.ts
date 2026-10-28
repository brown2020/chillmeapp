import { describe, expect, it } from "vitest";
import {
  buildRecordingObjectPath,
  extractEgressDownloadUrl,
  getRecordingDestinationFolder,
  isSafeRecordingPath,
  roomIdFromRecordingPath,
} from "./recording-paths";

describe("recording-paths", () => {
  it("builds Firebase storage folder paths", () => {
    expect(getRecordingDestinationFolder("abcd-efgh-ijkl-mnop")).toBe(
      "recordings/abcd-efgh-ijkl-mnop/",
    );
  });

  it("prefers egress location URLs", () => {
    expect(
      extractEgressDownloadUrl({
        location: "https://example.com/recording.mp4",
        filename: "recording.mp4",
      }),
    ).toBe("https://example.com/recording.mp4");
  });

  it("falls back to filename when it is a URL", () => {
    expect(
      extractEgressDownloadUrl({
        filename: "https://cdn.example.com/recording.mp4",
      }),
    ).toBe("https://cdn.example.com/recording.mp4");
  });

  it("returns null when no download URL is available", () => {
    expect(
      extractEgressDownloadUrl({
        filename: "recordings/room/file.mp4",
      }),
    ).toBeNull();
    expect(
      extractEgressDownloadUrl({
        location: "http://example.com/recording.mp4",
      }),
    ).toBeNull();
  });

  it("builds a stable object path and rejects traversal", () => {
    expect(buildRecordingObjectPath("abcd-efgh-ijkl-mnop", "EG_123")).toBe(
      "recordings/abcd-efgh-ijkl-mnop/EG_123.mp4",
    );
    expect(buildRecordingObjectPath("../etc", "EG_123")).toBeNull();
    expect(
      isSafeRecordingPath("recordings/abcd-efgh-ijkl-mnop/EG_123.mp4"),
    ).toBe(true);
    expect(isSafeRecordingPath("recordings/../secret.mp4")).toBe(false);
    expect(
      roomIdFromRecordingPath("recordings/abcd-efgh-ijkl-mnop/EG_123.mp4"),
    ).toBe("abcd-efgh-ijkl-mnop");
  });
});
