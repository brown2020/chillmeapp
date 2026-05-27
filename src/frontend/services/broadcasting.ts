"use server";

import {
  EgressClient,
  EncodedFileOutput,
  EncodedFileType,
  RoomServiceClient,
  AccessToken,
  VideoGrant,
} from "livekit-server-sdk";
import { v4 as uuidv4 } from "uuid";
import { generateUniqueRoomCode } from "@/utils/roomCodeGenerator";
import { getMeetingInfo } from "@/backend/services/meeting";
import {
  requireServerUser,
  UnauthorizedError,
} from "@/backend/services/server-auth";

const livekitHost = process.env.LIVEKIT_URL!;
const apiKey = process.env.LIVEKIT_API_KEY!;
const apiSecret = process.env.LIVEKIT_API_SECRET!;

const roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret);
const egressClient = new EgressClient(livekitHost, apiKey, apiSecret);

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

async function startRoomRecording(roomName: string): Promise<void> {
  const fileOutput = {
    fileType: EncodedFileType.MP4,
    filepath: `recordings/${roomName}/${Date.now()}.mp4`,
  } as EncodedFileOutput;

  await egressClient.startRoomCompositeEgress(roomName, fileOutput, {
    layout: "grid",
  });
}

async function resolveParticipant(
  roomName: string,
  displayName?: string,
): Promise<{ identity: string; name: string; isHost: boolean }> {
  const roomInfo = await getMeetingInfo(roomName);
  if (!roomInfo) {
    throw new Error("Meeting not found");
  }

  try {
    const { uid } = await requireServerUser();
    return {
      identity: uid,
      name: normalizeDisplayName(displayName || uid),
      isHost: uid === roomInfo.broadcaster,
    };
  } catch (error) {
    if (!(error instanceof UnauthorizedError)) {
      throw error;
    }

    return {
      identity: `guest-${uuidv4()}`,
      name: normalizeDisplayName(displayName),
      isHost: false,
    };
  }
}

export async function createRoom(
  shouldRecord: boolean,
): Promise<CreateRoomResult> {
  try {
    await requireServerUser();

    const roomName = generateUniqueRoomCode();

    const room = await roomService.createRoom({
      name: roomName,
      emptyTimeout: 10 * 60, // 10 minutes
      maxParticipants: 20,
      metadata: JSON.stringify({ recording: shouldRecord }),
    });

    if (shouldRecord) {
      try {
        await startRoomRecording(room.name);
      } catch (recordingError) {
        console.error("Failed to start room recording:", recordingError);
        await roomService.deleteRoom(room.name);
        return {
          error:
            "Could not start session recording. Check LiveKit egress configuration and try again.",
        };
      }
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

export async function getAccessToken(roomName: string, displayName?: string) {
  try {
    if (!roomName) throw new Error("Missing roomName");

    const participant = await resolveParticipant(roomName, displayName);

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participant.identity,
      name: participant.name,
      ttl: "2h",
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
    await requireServerUser();
    await roomService.deleteRoom(roomName);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Error deleting room:", error.message);
    throw error;
  }
}
