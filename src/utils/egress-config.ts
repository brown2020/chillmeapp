export const RECORDING_DISABLED_MESSAGE =
  "Recording isn't enabled in this demo";

type EnvRecord = Record<string, string | undefined>;

const ENABLED_FLAGS = new Set(["1", "true", "yes", "on"]);
const DISABLED_FLAGS = new Set(["0", "false", "no", "off"]);

export interface EgressS3Output {
  provider: "s3";
  accessKey: string;
  secret: string;
  region: string;
  bucket: string;
  endpoint?: string;
}

export interface EgressGcpOutput {
  provider: "gcp";
  credentials: string;
  bucket: string;
}

export interface EgressAzureOutput {
  provider: "azure";
  accountName: string;
  accountKey: string;
  containerName: string;
}

export type EgressStorageOutput =
  EgressS3Output | EgressGcpOutput | EgressAzureOutput;

function readEnv(key: string, env?: EnvRecord): string | undefined {
  const raw = env ? env[key] : process.env[key];
  const value = raw?.trim();
  return value ? value : undefined;
}

/**
 * Storage destination LiveKit requires on room-composite egress (`output`).
 * A partial set is treated as not configured.
 */
export function getEgressStorageOutput(
  env?: EnvRecord,
): EgressStorageOutput | null {
  const accessKey = readEnv("LIVEKIT_EGRESS_S3_ACCESS_KEY", env);
  const secret = readEnv("LIVEKIT_EGRESS_S3_SECRET", env);
  const region = readEnv("LIVEKIT_EGRESS_S3_REGION", env);
  const bucket = readEnv("LIVEKIT_EGRESS_S3_BUCKET", env);
  if (accessKey && secret && region && bucket) {
    const endpoint = readEnv("LIVEKIT_EGRESS_S3_ENDPOINT", env);
    return {
      provider: "s3",
      accessKey,
      secret,
      region,
      bucket,
      ...(endpoint ? { endpoint } : {}),
    };
  }

  const credentials = readEnv("LIVEKIT_EGRESS_GCP_CREDENTIALS", env);
  const gcpBucket = readEnv("LIVEKIT_EGRESS_GCP_BUCKET", env);
  if (credentials && gcpBucket) {
    return { provider: "gcp", credentials, bucket: gcpBucket };
  }

  const accountName = readEnv("LIVEKIT_EGRESS_AZURE_ACCOUNT_NAME", env);
  const accountKey = readEnv("LIVEKIT_EGRESS_AZURE_ACCOUNT_KEY", env);
  const containerName = readEnv("LIVEKIT_EGRESS_AZURE_CONTAINER", env);
  if (accountName && accountKey && containerName) {
    return { provider: "azure", accountName, accountKey, containerName };
  }

  return null;
}

/**
 * Recording can start only when LiveKit can be given a file output.
 *
 * `LIVEKIT_EGRESS_ENABLED=false` forces recording off.
 * `LIVEKIT_EGRESS_ENABLED=true` opts in, and still needs a complete S3, GCP,
 * or Azure destination because LiveKit rejects egress with no `output`.
 * When the flag is unset, that storage destination alone enables recording.
 */
export function isLiveKitEgressEnabled(env?: EnvRecord): boolean {
  const flag = readEnv("LIVEKIT_EGRESS_ENABLED", env)?.toLowerCase();
  if (flag && DISABLED_FLAGS.has(flag)) return false;
  if (flag && !ENABLED_FLAGS.has(flag)) return false;
  return getEgressStorageOutput(env) !== null;
}
