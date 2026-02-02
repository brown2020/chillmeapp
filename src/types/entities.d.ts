/**
 * Meeting entity representing a LiveKit room session
 */
interface Meeting {
  id: string;
  name: string;
  created_at: string;
  metadata?: string;
}

/**
 * Meeting snapshot from Firestore with additional metadata
 */
interface MeetingSnapShot {
  id: string;
  name: string;
  broadcaster: string;
  created_at: { seconds: number };
  session_duration?: number;
  recording_info?: {
    enabled: boolean;
    is_recording_ready?: boolean;
    recording_storage_path?: string;
  };
}

/**
 * LiveKit webhook event for room finished
 */
interface LiveKitRoomWebhook {
  name: string;
  sid: string;
  creationTime: number;
  metadata: string;
  numParticipants: number;
  numPublishers: number;
  activeRecording: boolean;
}

/**
 * LiveKit webhook event for egress (recording) completed
 */
interface LiveKitEgressWebhook {
  egressId: string;
  roomId: string;
  roomName: string;
  status: number;
  file?: {
    filename: string;
    startedAt: number;
    endedAt: number;
    duration: number;
    size: number;
    location: string;
  };
}

export type {
  Meeting,
  MeetingSnapShot,
  LiveKitRoomWebhook,
  LiveKitEgressWebhook,
};
