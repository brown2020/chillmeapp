"use server";

import { RoomServiceClient, AccessToken, VideoGrant } from "livekit-server-sdk";
import { generateUniqueRoomCode } from "@/utils/roomCodeGenerator";

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

export async function createRoom(
  shouldRecord: boolean,
): Promise<CreateRoomResult> {
  try {
    const roomName = generateUniqueRoomCode();

    const room = await roomService.createRoom({
      name: roomName,
      emptyTimeout: 10 * 60, // 10 minutes
      maxParticipants: 20,
      metadata: JSON.stringify({ recording: shouldRecord }),
    });

    return {
      room: {
        id: room.name,
        name: room.name,
        created_at: new Date().toISOString(),
        metadata: room.metadata,
      },
    };
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Error creating room:", error.message);
    return {
      error: error?.message || "An error occurred while creating the room",
    };
  }
}

export async function getAccessToken(
  roomName: string,
  participantIdentity: string,
  isHost: boolean,
) {
  try {
    if (!roomName) throw new Error("Missing roomName");
    if (!participantIdentity) throw new Error("Missing participantIdentity");

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantIdentity,
      ttl: "2h",
    });

    const grant: VideoGrant = {
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true, // For chat
      roomAdmin: isHost, // Host can manage participants
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
    await roomService.deleteRoom(roomName);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Error deleting room:", error.message);
    throw error;
  }
}
