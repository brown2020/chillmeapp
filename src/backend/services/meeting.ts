"use server";

import { getMeetingInfoInternal } from "@/backend/services/meeting-admin";
import { isMeetingPasswordProtected } from "@/utils/meeting-password";

/** Public lookup used by guest join. Returns only whether a password is required. */
export async function getMeetingJoinRequirements(
  roomId: string,
): Promise<{ passwordRequired: boolean }> {
  if (!roomId || roomId.length > 64) {
    throw new Error("Meeting not found");
  }

  const meeting = await getMeetingInfoInternal(roomId);
  if (!meeting) {
    throw new Error("Meeting not found");
  }

  return {
    passwordRequired: isMeetingPasswordProtected(meeting),
  };
}
