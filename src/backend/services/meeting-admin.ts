import { adminDb as db } from "@/backend/lib/firebase";
import {
  hashMeetingPassword,
  normalizeMeetingPassword,
} from "@/utils/meeting-password";

interface UpdatePayload {
  room_id: string;
  session_duration?: number;
  recording_info?: {
    enabled: boolean;
    is_recording_ready: boolean;
    recording_storage_path: string;
  };
}

export interface SaveMeetingSessionInput {
  id: string;
  name: string;
  created_at: string;
  recordingEnabled?: boolean;
  password?: string;
}

/** Creates the host's meeting row. Fails if that room id was already saved. */
export async function saveMeetingSessionForHost(
  uid: string,
  input: SaveMeetingSessionInput,
) {
  if (!/^[a-z0-9-]{1,64}$/.test(input.id)) {
    throw new Error("Invalid meeting id");
  }

  const meetingDoc: Record<string, unknown> = {
    id: input.id,
    name: input.name,
    broadcaster: uid,
    created_at: input.created_at,
  };

  if (input.recordingEnabled) {
    meetingDoc.recording_info = {
      enabled: true,
      is_recording_ready: false,
    };
  }

  if (input.password?.trim()) {
    normalizeMeetingPassword(input.password);
    meetingDoc.password_protected = true;
    meetingDoc.password_hash = hashMeetingPassword(input.password);
  }

  await db.collection("meeting_sessions").doc(input.id).create(meetingDoc);
}

/**
 * Prefer the document whose id is the room id. Older rows used auto-ids and
 * are only used when that canonical document does not exist.
 */
async function findMeetingDocument(roomId: string) {
  if (!roomId || roomId.length > 256) return null;

  const direct = await db.collection("meeting_sessions").doc(roomId).get();
  if (direct.exists) return direct;

  const snap = await db
    .collection("meeting_sessions")
    .where("id", "==", roomId)
    .limit(1)
    .get();
  return snap.empty ? null : snap.docs[0];
}

/** Server-only helper for LiveKit webhook updates (not a client server action). */
export async function updateMeeting(payload: UpdatePayload): Promise<boolean> {
  const doc = await findMeetingDocument(payload.room_id);
  if (!doc) {
    return false;
  }
  const docRef = doc.ref;
  const fieldsToUpdate: Omit<UpdatePayload, "room_id"> = {};

  if (payload.session_duration !== undefined) {
    fieldsToUpdate.session_duration = payload.session_duration;
  }

  if (payload.recording_info) {
    fieldsToUpdate.recording_info = payload.recording_info;
  }

  await docRef.update(fieldsToUpdate);
  return true;
}

export async function getMeetingInfoInternal(
  roomId: string,
): Promise<MeetingSession | null> {
  const snap = await findMeetingDocument(roomId);
  if (!snap) return null;
  const data = snap.data();
  return data ? (structuredClone(data) as MeetingSession) : null;
}
