"use server";
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

const updateMeeting = async (payload: UpdatePayload) => {
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

  const updateResult = await docRef.update(fieldsToUpdate);
  return updateResult;
};

const getMeetingInfo = async (
  roomId: string,
): Promise<MeetingSession | null> => {
  const snap = await db
    .collection("meeting_sessions")
    .where("id", "==", roomId)
    .limit(1)
    .get();
  if (snap.empty) {
    return null;
  }
  const docs = snap.docs.map((doc) => doc.data());
  return docs.length > 0
    ? (JSON.parse(JSON.stringify(docs[0])) as MeetingSession)
    : null;
};

export { updateMeeting, getMeetingInfo };
