"use server";

import {
  AccessToken,
  AzureBlobUpload,
  EgressClient,
  EncodedFileOutput,
  EncodedFileType,
  GCPUpload,
  RoomServiceClient,
  S3Upload,
  VideoGrant,
} from "livekit-server-sdk";
import { headers } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { generateUniqueRoomCode } from "@/utils/roomCodeGenerator";
import {
  getMeetingInfoInternal,
  saveMeetingSessionForHost,
} from "@/backend/services/meeting-admin";
import {
  requireServerUser,
  UnauthorizedError,
} from "@/backend/services/server-auth";
import {
  assertMeetingPasswordAccess,
  MeetingPasswordError,
  normalizeMeetingPassword,
} from "@/utils/meeting-password";
import { assertWithinRateLimit } from "@/utils/rate-limit";
import { HOST_PARTICIPANT_ROLE } from "@/utils/meeting-host";
import {
  getEgressStorageOutput,
  isLiveKitEgressEnabled,
} from "@/utils/egress-config";

const livekitHost = process.env.LIVEKIT_URL!;
const apiKey = process.env.LIVEKIT_API_KEY!;
const apiSecret = process.env.LIVEKIT_API_SECRET!;

const roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret);

export interface CreateRoomResult {
  room?: {
    id: string;
    name: string;
    created_at: string;
    metadata?: string;
  };
  error?: string;
}

function normalizeDisplayName(displayName?: string): string {
  const trimmed = displayName?.trim() ?? "";
  if (trimmed.length < 1 || trimmed.length > 64) {
    throw new Error("Display name must be between 1 and 64 characters");
  }
  return trimmed;
}

function buildEncodedFileOutput(roomName: string): EncodedFileOutput | null {
  const storage = getEgressStorageOutput();
  if (!storage) return null;

  const filepath = `recordings/${roomName}/${Date.now()}.mp4`;
  if (storage.provider === "s3") {
    return new EncodedFileOutput({
      fileType: EncodedFileType.MP4,
      filepath,
      output: {
        case: "s3",
        value: new S3Upload({
          accessKey: storage.accessKey,
          secret: storage.secret,
          region: storage.region,
          bucket: storage.bucket,
          endpoint: storage.endpoint,
        }),
      },
    });
  }

  if (storage.provider === "gcp") {
    return new EncodedFileOutput({
      fileType: EncodedFileType.MP4,
      filepath,
      output: {
        case: "gcp",
        value: new GCPUpload({
          credentials: storage.credentials,
          bucket: storage.bucket,
        }),
      },
    });
  }

  return new EncodedFileOutput({
    fileType: EncodedFileType.MP4,
    filepath,
    output: {
      case: "azure",
      value: new AzureBlobUpload({
        accountName: storage.accountName,
        accountKey: storage.accountKey,
        containerName: storage.containerName,
      }),
    },
  });
}

async function startRoomRecording(roomName: string): Promise<void> {
  const fileOutput = buildEncodedFileOutput(roomName);
  if (!fileOutput) {
    throw new Error("Recording storage is not configured");
  }

  const egressClient = new EgressClient(livekitHost, apiKey, apiSecret);
  await egressClient.startRoomCompositeEgress(roomName, fileOutput, {
    layout: "grid",
  });
}

async function resolveParticipant(
  roomName: string,
  displayName?: string,
  roomPassword?: string,
): Promise<{ identity: string; name: string; isHost: boolean }> {
  const roomInfo = await getMeetingInfoInternal(roomName);
  if (!roomInfo) {
    throw new Error("Meeting not found");
  }

  try {
    const { uid } = await requireServerUser();
    const participant = {
      identity: uid,
      name: normalizeDisplayName(displayName || uid),
      isHost: uid === roomInfo.broadcaster,
    };
    assertMeetingPasswordAccess(roomInfo, roomPassword, participant.isHost);
    return participant;
  } catch (error) {
    if (!(error instanceof UnauthorizedError)) {
      throw error;
    }

    const participant = {
      identity: `guest-${uuidv4()}`,
      name: normalizeDisplayName(displayName),
      isHost: false,
    };
    assertMeetingPasswordAccess(roomInfo, roomPassword, participant.isHost);
    return participant;
  }
}

const JOIN_RATE_WINDOW_MS = 15 * 60 * 1000;

async function assertJoinRateLimit(roomName: string): Promise<void> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    "unknown";
  assertWithinRateLimit(`meeting-join:${ip}`, 60, JOIN_RATE_WINDOW_MS);
  assertWithinRateLimit(
    `meeting-join:${ip}:${roomName}`,
    20,
    JOIN_RATE_WINDOW_MS,
  );
}

async function deleteLiveKitRoom(roomName: string): Promise<void> {
  try {
    await roomService.deleteRoom(roomName);
  } catch (deleteError) {
    console.error("Failed to delete LiveKit room:", deleteError);
  }
}

export async function createRoom(
  shouldRecord: boolean,
  password?: string,
): Promise<CreateRoomResult> {
  try {
    const { uid } = await requireServerUser();

    if (password?.trim()) {
      normalizeMeetingPassword(password);
    }

    const roomName = generateUniqueRoomCode();
    // Ignore a recording request when egress has no storage output. Calling
    // LiveKit without `output` returns 400 and used to fail the whole meeting.
    const recordSession = shouldRecord && isLiveKitEgressEnabled();

    const room = await roomService.createRoom({
      name: roomName,
      emptyTimeout: 10 * 60, // 10 minutes
      maxParticipants: 20,
      metadata: JSON.stringify({
        recording: recordSession,
        hostIdentity: uid,
      }),
    });

    if (recordSession) {
      try {
        await startRoomRecording(room.name);
      } catch (recordingError) {
        console.error("Failed to start room recording:", recordingError);
        await deleteLiveKitRoom(room.name);
        return {
          error:
            "Could not start session recording. Check LiveKit egress configuration and try again.",
        };
      }
    }

    try {
      await saveMeetingSessionForHost(uid, {
        id: room.name,
        name: room.name,
        created_at: new Date().toISOString(),
        recordingEnabled: recordSession,
        password,
      });
    } catch (saveError) {
      console.error("Failed to save meeting session:", saveError);
      await deleteLiveKitRoom(room.name);
      if (saveError instanceof MeetingPasswordError) {
        return { error: saveError.message };
      }
      return { error: "Failed to save meeting details." };
    }

    return {
      room: {
        id: room.name,
        name: room.name,
        created_at: new Date().toISOString(),
        metadata: room.metadata,
      },
    };
  } catch (err: unknown) {
    if (err instanceof UnauthorizedError) {
      return { error: "You must be signed in to create a meeting." };
    }

    const error = err as Error;
    console.error("Error creating room:", error.message);
    return {
      error: error?.message || "An error occurred while creating the room",
    };
  }
}

export async function getAccessToken(
  roomName: string,
  displayName?: string,
  roomPassword?: string,
) {
  try {
    if (!roomName || roomName.length > 64) throw new Error("Missing roomName");

    await assertJoinRateLimit(roomName);

    const participant = await resolveParticipant(
      roomName,
      displayName,
      roomPassword,
    );

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participant.identity,
      name: participant.name,
      ttl: "2h",
      attributes: {
        role: participant.isHost ? HOST_PARTICIPANT_ROLE : "guest",
      },
    });

    const grant: VideoGrant = {
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      roomAdmin: participant.isHost,
    };

    at.addGrant(grant);
    const token = await at.toJwt();

    return { token };
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Error generating access token:", error.message);
    throw error;
  }
}

export async function deleteRoom(roomName: string) {
  try {
    const { uid } = await requireServerUser();
    const meeting = await getMeetingInfoInternal(roomName);
    if (!meeting || meeting.broadcaster !== uid) {
      throw new Error("Only the host can end this meeting.");
    }
    await roomService.deleteRoom(roomName);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Error deleting room:", error.message);
    throw error;
  }
}
