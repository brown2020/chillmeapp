import * as HMS from "@100mslive/server-sdk"; // Correct wildcard import

type Meeting = HMS.Room.Object;

type MeetingSnapShot = Omit<Meeting, "created_at"> & {
  broadcaster: string;
  doc_id: string;
  created_at: { seconds: number };
  session_duration: number;
  recording_info?: {
    enabled: boolean;
    is_recording_ready: boolean;
    recording_storage_path: string;
  };
};

type TabGroupItem = {
  label: string;
  value: string;
};

interface WebhookRecordingMeta {
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

interface WebhookSessionCloseMeta {
  account_id: string;
  app_id: string;
  reason: string;
  room_id: string;
  room_name: string;
  session_duration: number;
  session_id: string;
  session_started_at: string;
  session_stopped_at: string;
  template_id: string;
}
