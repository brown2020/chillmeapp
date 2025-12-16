"use server";
// import * as dotenv from "dotenv";
import * as HMS from "@100mslive/server-sdk"; // Correct wildcard import
import { generateUniqueRoomCode } from "@/utils/roomCodeGenerator";

// dotenv.config();

const app_secret = process.env["LIVE100MS_APP_SECRET"]!;
const app_access_key = process.env["LIVE100MS_APP_ACCESS_KEY"]!;

// Log environment variables to ensure they are loaded correctly
console.log("Environment variables loaded:");
console.log("APP_SECRET:", app_secret ? "Loaded" : "Missing");
console.log("APP_ACCESS_KEY:", app_access_key ? "Loaded" : "Missing");

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
    // Create room codes for all roles so we can discover the actual role names
    // configured in the 100ms template for this room.
    const roomCodes = await hms.roomCodes.create(room.id);
    console.log(
      "Created room codes for roles:",
      roomCodes.map((c) => c.role),
    );
    return { room, roomCodes };
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
  try {
    if (!roomId) throw new Error("Missing roomId");
    if (!role) throw new Error("Missing role");
    const appToken = await hms.auth.getAuthToken({ roomId, role, userId });
    return { appToken };
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Error generating auth token:", {
      message: error?.message,
      roomId,
      role,
      hasUserId: Boolean(userId),
    });
    throw error;
  }
}
