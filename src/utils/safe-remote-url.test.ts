import { describe, expect, it } from "vitest";
import {
  assertSafeDownloadUrl,
  isBlockedIpAddress,
  UnsafeRemoteUrlError,
} from "./safe-remote-url";

describe("safe-remote-url", () => {
  it("blocks private, loopback, and link-local addresses", () => {
    expect(isBlockedIpAddress("127.0.0.1")).toBe(true);
    expect(isBlockedIpAddress("10.1.2.3")).toBe(true);
    expect(isBlockedIpAddress("192.168.1.9")).toBe(true);
    expect(isBlockedIpAddress("169.254.169.254")).toBe(true);
    expect(isBlockedIpAddress("172.16.0.1")).toBe(true);
    expect(isBlockedIpAddress("::1")).toBe(true);
    expect(isBlockedIpAddress("8.8.8.8")).toBe(false);
  });

  it("rejects non-https and private targets", async () => {
    await expect(
      assertSafeDownloadUrl("http://cdn.example.com/file.mp4", async () => [
        "8.8.8.8",
      ]),
    ).rejects.toBeInstanceOf(UnsafeRemoteUrlError);

    await expect(
      assertSafeDownloadUrl("https://cdn.example.com/file.mp4", async () => [
        "10.0.0.5",
      ]),
    ).rejects.toBeInstanceOf(UnsafeRemoteUrlError);

    await expect(
      assertSafeDownloadUrl("https://169.254.169.254/latest", async () => [
        "169.254.169.254",
      ]),
    ).rejects.toBeInstanceOf(UnsafeRemoteUrlError);
  });

  it("allows https hosts that resolve to public addresses", async () => {
    await expect(
      assertSafeDownloadUrl("https://cdn.example.com/file.mp4", async () => [
        "8.8.8.8",
      ]),
    ).resolves.toBeUndefined();
  });
});
