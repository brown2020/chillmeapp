type MeetingSession = {
  app_id: string;
  broadcaster: string;
  created_at: Date;
  customer: string;
  customer_id: string;
  description: string;
  enabled: boolean;
  id: string;
  large_room: boolean;
  name: string;
  recording_info: {
    [key: string]: unknown;
  };
  region: string;
  template: string;
  template_id: string;
  updated_at: Date;
  room_codes?: Array<{
    code: string;
    role: string;
    enabled: boolean;
  }>;
  is_recording_ready?: boolean; // Optional as it is present in only one instance
  recording_storage_path?: string; // Optional for the same reason
  room_id?: string; // Optional as it is present in only one instance
  session_duration?: number; // Optional as it is present in only one instance
};

type MeetingSessions = MeetingSession[];
