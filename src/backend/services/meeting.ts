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
  const docRef = doc.docs[0].ref;
  const updateResult = await docRef.update(payload as Partial<UpdatePayload>);
  return updateResult;
};

export { updateMeeting };
