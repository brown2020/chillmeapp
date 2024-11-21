import { type NextRequest } from "next/server";
import { uploadRecordingToStorage } from "@/backend/services/storage";
import { updateMeeting, getMeetingInfo } from "@/backend/services/meeting";
import {
  WebhookRecordingMeta,
  WebhookSessionCloseMeta,
} from "@/types/entities";
import { deductUserCredits } from "@/backend/services/user";

type EventTypes = "recording.success" | "session.close.success";

interface EventBody {
  type: EventTypes;
  data: unknown;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as EventBody;

  console.log(body);

  if (body.type === "session.close.success") {
    const bodyJson = body.data as WebhookSessionCloseMeta;
    const meetingInfo = await getMeetingInfo(bodyJson.room_id);
    if (!meetingInfo) {
      return;
    }
    const seconds =
      (new Date(meetingInfo.last_credit_deduction_at as Date).getTime() -
        Date.now()) /
      1000;

    await deductUserCredits(
      meetingInfo?.broadcaster as string,
      meetingInfo?.id as string,
      seconds,
    );
    await updateMeeting({
      room_id: bodyJson.room_id,
      session_duration: bodyJson.session_duration,
    });
    console.log("Session closed");
  }

  if (body.type === "recording.success") {
    const bodyJson = body.data as WebhookRecordingMeta;
    const recordingFileUrl = bodyJson.recording_presigned_url;
    const destinationPath = `recordings/`;
    const uploadResult = await uploadRecordingToStorage(
      recordingFileUrl,
      destinationPath,
    );
    await updateMeeting({
      room_id: bodyJson.room_id,
      recording_info: {
        enabled: true,
        is_recording_ready: true,
        recording_storage_path: uploadResult.metadata.name as string,
      },
    });
    console.log("Recording uploaded");
  }

  return Response.json({ status: "ok" });
}
