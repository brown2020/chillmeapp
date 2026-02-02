import { type NextRequest } from "next/server";
import { WebhookReceiver } from "livekit-server-sdk";
import { updateMeeting } from "@/backend/services/meeting";

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

    console.log("Received LiveKit webhook event:", event.event);

    switch (event.event) {
      case "room_finished": {
        // Room has ended - update meeting with duration
        const room = event.room;
        if (room) {
          const creationTime = room.creationTime
            ? Number(room.creationTime)
            : 0;
          const sessionDuration = creationTime
            ? Math.floor((Date.now() / 1000 - creationTime) / 60)
            : 0;

          await updateMeeting({
            room_id: room.name,
            session_duration: sessionDuration,
          });
        }
        break;
      }

      case "egress_ended": {
        // Recording has completed
        const egress = event.egressInfo;
        if (egress) {
          // Check for file results in the egress info
          const fileResults = egress.fileResults?.[0];
          if (fileResults?.filename) {
            await updateMeeting({
              room_id: egress.roomName,
              recording_info: {
                enabled: true,
                is_recording_ready: true,
                recording_storage_path: fileResults.filename,
              },
            });
          }
        }
        break;
      }

      case "participant_joined": {
        console.log(
          `Participant ${event.participant?.identity} joined room ${event.room?.name}`,
        );
        break;
      }

      case "participant_left": {
        console.log(
          `Participant ${event.participant?.identity} left room ${event.room?.name}`,
        );
        break;
      }

      default:
        console.log("Unhandled webhook event:", event.event);
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
