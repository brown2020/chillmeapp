import { describe, expect, it } from "vitest";
import {
  getEgressStorageOutput,
  isLiveKitEgressEnabled,
} from "./egress-config";

const s3Env = {
  LIVEKIT_EGRESS_S3_ACCESS_KEY: "key",
  LIVEKIT_EGRESS_S3_SECRET: "secret",
  LIVEKIT_EGRESS_S3_REGION: "us-east-1",
  LIVEKIT_EGRESS_S3_BUCKET: "recordings",
};

describe("egress-config", () => {
  it("is disabled when egress is not configured", () => {
    expect(isLiveKitEgressEnabled({})).toBe(false);
    expect(getEgressStorageOutput({})).toBeNull();
  });

  it("stays disabled when the flag is set without a storage destination", () => {
    expect(isLiveKitEgressEnabled({ LIVEKIT_EGRESS_ENABLED: "true" })).toBe(
      false,
    );
    expect(isLiveKitEgressEnabled({ LIVEKIT_EGRESS_ENABLED: "1" })).toBe(false);
  });

  it("enables recording from a complete S3 destination", () => {
    expect(isLiveKitEgressEnabled(s3Env)).toBe(true);
    expect(getEgressStorageOutput(s3Env)).toEqual({
      provider: "s3",
      accessKey: "key",
      secret: "secret",
      region: "us-east-1",
      bucket: "recordings",
    });
  });

  it("keeps an optional S3 endpoint", () => {
    expect(
      getEgressStorageOutput({
        ...s3Env,
        LIVEKIT_EGRESS_S3_ENDPOINT: " https://s3.example.com ",
      }),
    ).toMatchObject({ endpoint: "https://s3.example.com" });
  });

  it("ignores a partial S3 destination", () => {
    expect(
      isLiveKitEgressEnabled({
        LIVEKIT_EGRESS_S3_ACCESS_KEY: "key",
        LIVEKIT_EGRESS_S3_BUCKET: "recordings",
      }),
    ).toBe(false);
  });

  it("enables recording from GCP or Azure credentials", () => {
    expect(
      isLiveKitEgressEnabled({
        LIVEKIT_EGRESS_GCP_CREDENTIALS: '{"type":"service_account"}',
        LIVEKIT_EGRESS_GCP_BUCKET: "bucket",
      }),
    ).toBe(true);
    expect(
      getEgressStorageOutput({
        LIVEKIT_EGRESS_AZURE_ACCOUNT_NAME: "account",
        LIVEKIT_EGRESS_AZURE_ACCOUNT_KEY: "key",
        LIVEKIT_EGRESS_AZURE_CONTAINER: "recordings",
      }),
    ).toEqual({
      provider: "azure",
      accountName: "account",
      accountKey: "key",
      containerName: "recordings",
    });
  });

  it("lets an explicit false flag override storage credentials", () => {
    expect(
      isLiveKitEgressEnabled({
        ...s3Env,
        LIVEKIT_EGRESS_ENABLED: "false",
      }),
    ).toBe(false);
    expect(
      isLiveKitEgressEnabled({
        ...s3Env,
        LIVEKIT_EGRESS_ENABLED: "off",
      }),
    ).toBe(false);
  });

  it("accepts an explicit true flag together with storage", () => {
    expect(
      isLiveKitEgressEnabled({
        ...s3Env,
        LIVEKIT_EGRESS_ENABLED: " yes ",
      }),
    ).toBe(true);
  });
});
