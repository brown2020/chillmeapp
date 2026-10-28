"use server";

import { adminBucket } from "@/backend/lib/firebase";
import { getMeetingInfoInternal } from "@/backend/services/meeting-admin";
import {
  requireServerUser,
  UnauthorizedError,
} from "@/backend/services/server-auth";
import {
  isSafeRecordingPath,
  roomIdFromRecordingPath,
} from "@/utils/recording-paths";

const PLAYBACK_TTL_MS = 4 * 60 * 60 * 1000;

function storedRecordingPath(meeting: MeetingSession | null): string | null {
  const info = meeting?.recording_info as
    { recording_storage_path?: unknown } | undefined;
  return typeof info?.recording_storage_path === "string"
    ? info.recording_storage_path
    : null;
}

export async function getRecordingPlaybackUrl(
  storagePath: string,
): Promise<string> {
  try {
    const { uid } = await requireServerUser();
    const roomId = roomIdFromRecordingPath(storagePath);
    const meeting = roomId ? await getMeetingInfoInternal(roomId) : null;
    if (
      !isSafeRecordingPath(storagePath) ||
      !meeting ||
      meeting.broadcaster !== uid ||
      storedRecordingPath(meeting) !== storagePath
    ) {
      throw new Error("Recording not found");
    }

    const [url] = await adminBucket.file(storagePath).getSignedUrl({
      action: "read",
      expires: Date.now() + PLAYBACK_TTL_MS,
    });
    return url;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new Error("You must be signed in to watch recordings.");
    }
    if (error instanceof Error && error.message === "Recording not found") {
      throw error;
    }
    console.error("Recording playback failed");
    throw new Error("Recording not found");
  }
}
