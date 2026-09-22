import { adminDb as db } from "@/backend/lib/firebase";

interface UpdatePayload {
  room_id: string;
  session_duration?: number;
  recording_info?: {
    enabled: boolean;
    is_recording_ready: boolean;
    recording_storage_path: string;
  };
}

/** Server-only helper for LiveKit webhook updates (not a client server action). */
export async function updateMeeting(payload: UpdatePayload) {
  const doc = await db
    .collection("meeting_sessions")
    .where("id", "==", payload.room_id)
    .limit(1)
    .get();
  if (doc.empty) {
    throw new Error(`Meeting not found with room_id: ${payload.room_id}`);
  }
  const docRef = doc.docs[0].ref;
  const fieldsToUpdate: Omit<UpdatePayload, "room_id"> = {};

  if (payload.session_duration !== undefined) {
    fieldsToUpdate.session_duration = payload.session_duration;
  }

  if (payload.recording_info) {
    fieldsToUpdate.recording_info = payload.recording_info;
  }

  return docRef.update(fieldsToUpdate);
}

export async function getMeetingInfoInternal(
  roomId: string,
): Promise<MeetingSession | null> {
  const snap = await db
    .collection("meeting_sessions")
    .where("id", "==", roomId)
    .limit(1)
    .get();
  if (snap.empty) {
    return null;
  }
  const data = snap.docs[0]?.data();
  return data ? (structuredClone(data) as MeetingSession) : null;
}
