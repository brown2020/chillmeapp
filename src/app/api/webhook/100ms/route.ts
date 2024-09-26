import { type NextRequest } from "next/server";
import { uploadRecordingToStorage } from "@/backend/services/storage";

type EventTypes = "recording.success";

interface RecordingMeta {
  URL: string;
  account_id: string;
  app_id: string;
  chat_recording_path: string;
  chat_recording_presigned_url: string;
  duration: number;
  location: string;
  recording_path: string;
  recording_presigned_url: string;
  room_id: string;
  room_name: string;
  session: string;
  session_id: string;
  session_started_at: string;
  session_stopped_at: string;
  size: number;
  template_id: string;
}

interface IncomingData {
  type: EventTypes;
  data: RecordingMeta;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as IncomingData;
  if (body.type === "recording.success") {
    const recordingFileUrl = body.data.recording_presigned_url;
    const destinationPath = `recordings/`;
    await uploadRecordingToStorage(recordingFileUrl, destinationPath);
  }
  return Response.json({ status: "ok" });
}
