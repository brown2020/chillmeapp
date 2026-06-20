import { type NextRequest } from "next/server";
import { WebhookReceiver } from "livekit-server-sdk";
import { updateMeeting } from "@/backend/services/meeting";
import { uploadRecordingToStorage } from "@/backend/services/storage";
import {
  extractEgressDownloadUrl,
  getRecordingDestinationFolder,
} from "@/utils/recording-paths";

const receiver = new WebhookReceiver(
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!,
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return Response.json(
        { status: "error", message: "Missing authorization header" },
        { status: 401 },
      );
    }

    const event = await receiver.receive(body, authHeader);

    switch (event.event) {
      case "room_finished": {
        const room = event.room;
        if (room) {
          const creationTime = room.creationTime
            ? Number(room.creationTime)
            : 0;
          const sessionDuration = creationTime
            ? Math.max(0, Math.floor(Date.now() / 1000 - creationTime))
            : 0;

          await updateMeeting({
            room_id: room.name,
            session_duration: sessionDuration,
          });
        }
        break;
      }

      case "egress_ended": {
        const egress = event.egressInfo;
        if (!egress?.roomName) {
          break;
        }

        const fileResult = egress.fileResults?.[0];
        const downloadUrl = extractEgressDownloadUrl({
          location: fileResult?.location,
          filename: fileResult?.filename,
        });

        if (!downloadUrl) {
          console.error(
            "Egress completed without a downloadable URL for room:",
            egress.roomName,
          );
          break;
        }

        const storagePath = await uploadRecordingToStorage(
          downloadUrl,
          getRecordingDestinationFolder(egress.roomName),
        );

        await updateMeeting({
          room_id: egress.roomName,
          recording_info: {
            enabled: true,
            is_recording_ready: true,
            recording_storage_path: storagePath,
          },
        });
        break;
      }

      case "participant_joined":
      case "participant_left":
        break;

      default:
        break;
    }

    return Response.json({ status: "ok" });
  } catch (error) {
    console.error("LiveKit webhook processing error:", error);
    return Response.json(
      { status: "error", message: "Internal server error" },
      { status: 500 },
    );
  }
}
