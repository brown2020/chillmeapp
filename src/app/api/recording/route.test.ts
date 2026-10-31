import { afterEach, describe, expect, it, vi } from "vitest";
import { RECORDING_DISABLED_MESSAGE } from "@/utils/egress-config";
import { GET, POST } from "./route";

const EGRESS_ENV_KEYS = [
  "LIVEKIT_EGRESS_ENABLED",
  "LIVEKIT_EGRESS_S3_ACCESS_KEY",
  "LIVEKIT_EGRESS_S3_SECRET",
  "LIVEKIT_EGRESS_S3_REGION",
  "LIVEKIT_EGRESS_S3_BUCKET",
  "LIVEKIT_EGRESS_S3_ENDPOINT",
  "LIVEKIT_EGRESS_GCP_CREDENTIALS",
  "LIVEKIT_EGRESS_GCP_BUCKET",
  "LIVEKIT_EGRESS_AZURE_ACCOUNT_NAME",
  "LIVEKIT_EGRESS_AZURE_ACCOUNT_KEY",
  "LIVEKIT_EGRESS_AZURE_CONTAINER",
] as const;

function clearEgressEnv() {
  for (const key of EGRESS_ENV_KEYS) {
    vi.stubEnv(key, "");
  }
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("/api/recording", () => {
  it("reports recording as unavailable", async () => {
    clearEgressEnv();

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ enabled: false });
  });

  it("returns 501 JSON when recording is requested but unavailable", async () => {
    clearEgressEnv();

    const response = await POST(
      new Request("http://localhost/api/recording", { method: "POST" }),
    );

    expect(response.status).toBe(501);
    expect(await response.json()).toEqual({
      error: RECORDING_DISABLED_MESSAGE,
    });
  });

  it("returns 400 JSON for a recording request without a room name", async () => {
    clearEgressEnv();
    vi.stubEnv("LIVEKIT_EGRESS_ENABLED", "true");
    vi.stubEnv("LIVEKIT_EGRESS_S3_ACCESS_KEY", "key");
    vi.stubEnv("LIVEKIT_EGRESS_S3_SECRET", "secret");
    vi.stubEnv("LIVEKIT_EGRESS_S3_REGION", "us-east-1");
    vi.stubEnv("LIVEKIT_EGRESS_S3_BUCKET", "recordings");

    const response = await POST(
      new Request("http://localhost/api/recording", {
        method: "POST",
        body: JSON.stringify({}),
        headers: { "content-type": "application/json" },
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Missing room name" });
  });

  it("returns 400 JSON for an invalid recording body", async () => {
    clearEgressEnv();
    vi.stubEnv("LIVEKIT_EGRESS_S3_ACCESS_KEY", "key");
    vi.stubEnv("LIVEKIT_EGRESS_S3_SECRET", "secret");
    vi.stubEnv("LIVEKIT_EGRESS_S3_REGION", "us-east-1");
    vi.stubEnv("LIVEKIT_EGRESS_S3_BUCKET", "recordings");

    const response = await POST(
      new Request("http://localhost/api/recording", {
        method: "POST",
        body: "{",
        headers: { "content-type": "application/json" },
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Invalid request" });
  });
});
