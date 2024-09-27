"use server";
// import * as dotenv from "dotenv";
import * as HMS from "@100mslive/server-sdk"; // Correct wildcard import
import config from "@/config";

// dotenv.config();

const app_secret = process.env["LIVE100MS_APP_SECRET"]!;
const app_access_key = process.env["LIVE100MS_APP_ACCESS_KEY"]!;

// Log environment variables to ensure they are loaded correctly
console.log("Environment variables loaded:");
console.log("APP_SECRET:", app_secret ? "Loaded" : "Missing");
console.log("APP_ACCESS_KEY:", app_access_key ? "Loaded" : "Missing");

// Initialize the SDK with credentials
const hms = new HMS.SDK(app_access_key, app_secret);

export async function createRoom(roomName: string, shouldRecord: boolean) {
  console.log(config);
  console.log("Attempting to create a room with name:", roomName);
  try {
    const room = await hms.rooms.create({
      name: roomName,
      recording_info: {
        enabled: shouldRecord,
        /*   upload_info: {
          type: "gs",
          location: config.firebaseConfig.storageBucket as string,
          options: {
            region: "asia-south1",
          },
          credentials: {
            key: config.firebaseConfig.storageBucket as string,
            secret: config.firebaseConfig.appId as string,
          },
        }, */
      },
    });
    console.log("Room created successfully:", { room });
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
  console.log("Attempting to get app token with parameters:", {
    roomId,
    userId,
    role,
  });
  try {
    const appToken = await hms.auth.getAuthToken({ roomId, role, userId });
    console.log("App token generated successfully"); // Remove sensitive token from the log
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
