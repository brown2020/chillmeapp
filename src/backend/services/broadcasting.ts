"use server";
import * as HMS from "@100mslive/server-sdk"; // Correct wildcard import
import { generateUniqueRoomCode } from "@/utils/roomCodeGenerator";

const app_secret = process.env["LIVE100MS_APP_SECRET"]!;
const app_access_key = process.env["LIVE100MS_APP_ACCESS_KEY"]!;

// Initialize the SDK with credentials
const hms = new HMS.SDK(app_access_key, app_secret);

export async function createRoom(shouldRecord: boolean) {
  try {
    const room = await hms.rooms.create({
      name: generateUniqueRoomCode(),
      recording_info: {
        enabled: shouldRecord,
      },
    });
    return { room }; // Ensure you return the room ID correctly
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Error creating room:", error);
    return {
      error: error?.message || "An error occurred while creating the room",
    };
  }
}

export async function getAppToken(
  roomId: string,
  userId: string,
  role: string,
) {
  const appToken = await hms.auth.getAuthToken({ roomId, role, userId });
  return { appToken };
}
