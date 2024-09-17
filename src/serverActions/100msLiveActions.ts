// app/serverActions/100msLiveActions.ts
"use server";
import * as dotenv from "dotenv";
import * as HMS from "@100mslive/server-sdk"; // Correct wildcard import

dotenv.config();

const app_secret = process.env.APP_SECRET!;
const app_access_key = process.env.APP_ACCESS_KEY!;

// Log environment variables to ensure they are loaded correctly
console.log("Environment variables loaded:");
console.log("APP_SECRET:", app_secret ? "Loaded" : "Missing");
console.log("APP_ACCESS_KEY:", app_access_key ? "Loaded" : "Missing");

// Initialize the SDK with credentials

const hms = new HMS.SDK(app_access_key, app_secret);

export async function createRoom(roomName: string) {
  console.log("Attempting to create a room with name:", roomName);
  try {
    const room = await hms.rooms.create({ name: roomName });
    console.log("Room created successfully:", room);
    return { roomId: room.id }; // Ensure you return the room ID correctly
  } catch (error: unknown) {
    console.error("Error creating room:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "An error occurred while creating the room",
    };
  }
}

export async function getAppToken(
  roomId: string,
  userId: string,
  role: string
) {
  console.log("Attempting to get app token with parameters:", {
    roomId,
    userId,
    role,
  });
  try {
    const appToken = await hms.auth.getAuthToken({ roomId, role, userId });
    console.log("App token generated successfully:", appToken);
    return { appToken };
  } catch (error: unknown) {
    console.error("Error getting app token:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "An error occurred while getting the app token",
    };
  }
}
