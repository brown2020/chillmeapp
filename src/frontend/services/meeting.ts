"use server";

import { adminDb } from "@/backend/lib/firebase";
import { listHostPastMeetings } from "@/backend/services/past-meetings";
import {
  requireServerUser,
  UnauthorizedError,
} from "@/backend/services/server-auth";
import type { PastMeetingsResult } from "@/types/entities";

/**
 * Lists the signed-in host's completed meetings. The uid comes from the
 * verified session cookie, never from the caller, so one user cannot list
 * another user's meetings.
 */
export async function getPastMeetings(): Promise<PastMeetingsResult> {
  try {
    const { uid } = await requireServerUser();
    const meetings = await listHostPastMeetings(adminDb, uid);
    return { status: "ok", meetings };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return { status: "error", reason: "unauthenticated" };
    }
    console.error(
      "Failed to list past meetings:",
      error instanceof Error ? error.message : error,
    );
    return { status: "error", reason: "unavailable" };
  }
}
