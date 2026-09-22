"use server";

import {
  hashMeetingPassword,
  isMeetingPasswordProtected,
  normalizeMeetingPassword,
} from "@/utils/meeting-password";
import { requireServerUser } from "@/backend/services/server-auth";
import { getMeetingInfoInternal } from "@/backend/services/meeting-admin";
import { adminDb as db } from "@/backend/lib/firebase";

interface SaveMeetingSessionInput {
  id: string;
  name: string;
  created_at: string;
  recordingEnabled?: boolean;
  password?: string;
}

const getMeetingInfo = async (
  roomId: string,
): Promise<MeetingSession | null> => {
  await requireServerUser();
  return getMeetingInfoInternal(roomId);
};

const saveMeetingSession = async (input: SaveMeetingSessionInput) => {
  const { uid } = await requireServerUser();

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

  await db.collection("meeting_sessions").add(meetingDoc);
};

const getMeetingJoinRequirements = async (
  roomId: string,
): Promise<{ passwordRequired: boolean }> => {
  await requireServerUser();
  const meeting = await getMeetingInfoInternal(roomId);
  if (!meeting) {
    throw new Error("Meeting not found");
  }
  return {
    passwordRequired: isMeetingPasswordProtected(meeting),
  };
};

export { getMeetingInfo, saveMeetingSession, getMeetingJoinRequirements };
