import { type NextRequest } from "next/server";
import { WebhookReceiver } from "livekit-server-sdk";
import {
  getMeetingInfoInternal,
  updateMeeting,
} from "@/backend/services/meeting-admin";
import { uploadRecordingToStorage } from "@/backend/services/storage";
import { isLiveKitEgressEnabled } from "@/utils/egress-config";
import {
  buildRecordingObjectPath,
  extractEgressDownloadUrl,
} from "@/utils/recording-paths";

const receiver = new WebhookReceiver(
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!,
);

async function verifyLiveKitWebhookSignature(body: string, authHeader: string) {
  return receiver.receive(body, authHeader);
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const authHeader = request.headers.get("Authorization");

  if (!authHeader) {
    return Response.json(
      { status: "error", message: "Missing authorization header" },
      { status: 401 },
    );
  }

  let event;
  try {
    event = await verifyLiveKitWebhookSignature(body, authHeader);
  } catch (error) {
    console.error(
      "LiveKit webhook signature rejected:",
      error instanceof Error ? error.message : "unknown",
    );
    return Response.json(
      { status: "error", message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
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

          const updated = await updateMeeting({
            room_id: room.name,
            session_duration: sessionDuration,
          });
          if (!updated) {
            console.error("LiveKit room_finished for unknown room:", room.name);
          }
        }
        break;
      }

      case "egress_ended": {
        // Acknowledge so LiveKit does not retry. Nothing was recorded.
        if (!isLiveKitEgressEnabled()) {
          break;
        }

        const egress = event.egressInfo;
        if (!egress?.roomName) {
          break;
        }

        const meeting = await getMeetingInfoInternal(egress.roomName);
        if (!meeting) {
          console.error(
            "LiveKit egress_ended for unknown room:",
            egress.roomName,
          );
          break;
        }

        const existingInfo = meeting.recording_info as
          | {
              is_recording_ready?: boolean;
              recording_storage_path?: string;
            }
          | undefined;
        if (
          existingInfo?.is_recording_ready &&
          existingInfo.recording_storage_path
        ) {
          break;
        }

        const downloadUrl = extractEgressDownloadUrl({
          location: egress.fileResults?.[0]?.location,
          filename: egress.fileResults?.[0]?.filename,
        });
        const storagePath = egress.egressId
          ? buildRecordingObjectPath(egress.roomName, egress.egressId)
          : null;

        if (!downloadUrl || !storagePath) {
          console.error(
            "Egress completed without a usable recording for room:",
            egress.roomName,
          );
          break;
        }

        await uploadRecordingToStorage(downloadUrl, storagePath);
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
