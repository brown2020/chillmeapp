import type { DocumentData, Firestore } from "firebase-admin/firestore";
import type { MeetingSnapShot } from "@/types/entities";

function toIsoCreatedAt(value: unknown): string | null {
  if (typeof value === "string") {
    return Number.isNaN(Date.parse(value)) ? null : value;
  }
  if (value && typeof value === "object") {
    if ("toDate" in value && typeof value.toDate === "function") {
      const date: unknown = value.toDate();
      return date instanceof Date && !Number.isNaN(date.getTime())
        ? date.toISOString()
        : null;
    }
    if ("seconds" in value && typeof value.seconds === "number") {
      return new Date(value.seconds * 1000).toISOString();
    }
  }
  return null;
}

function toPastMeeting(
  uid: string,
  data: DocumentData,
): MeetingSnapShot | null {
  if (typeof data.session_duration !== "number") return null;
  const createdAt = toIsoCreatedAt(data.created_at);
  if (typeof data.id !== "string" || !createdAt) return null;

  const meeting: MeetingSnapShot = {
    id: data.id,
    name: typeof data.name === "string" ? data.name : data.id,
    broadcaster: uid,
    created_at: createdAt,
    session_duration: data.session_duration,
  };

  const recording = data.recording_info;
  if (recording && typeof recording === "object") {
    meeting.recording_info = {
      enabled: recording.enabled === true,
      is_recording_ready: recording.is_recording_ready === true,
      ...(typeof recording.recording_storage_path === "string"
        ? { recording_storage_path: recording.recording_storage_path }
        : {}),
    };
  }

  return meeting;
}

/**
 * Completed meetings hosted by `uid`, newest first. Password fields never
 * leave the server. Sorting happens here so the query needs only the
 * automatic single-field index on `broadcaster`.
 */
export async function listHostPastMeetings(
  db: Firestore,
  uid: string,
): Promise<MeetingSnapShot[]> {
  if (!uid) return [];

  const snapshot = await db
    .collection("meeting_sessions")
    .where("broadcaster", "==", uid)
    .get();

  return snapshot.docs
    .map((doc) => toPastMeeting(uid, doc.data()))
    .filter((meeting): meeting is MeetingSnapShot => meeting !== null)
    .sort(
      (a, b) =>
        Date.parse(String(b.created_at)) - Date.parse(String(a.created_at)),
    );
}
