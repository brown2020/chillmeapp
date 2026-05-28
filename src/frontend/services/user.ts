"use server";

import { adminDb } from "@/backend/lib/firebase";
import {
  requireServerUser,
  UnauthorizedError,
} from "@/backend/services/server-auth";

const findUserById = async (uid: string): Promise<UserSnapshot | null> => {
  try {
    await requireServerUser();
    const doc = await adminDb.collection("users").doc(uid).get();
    if (!doc.exists) {
      return null;
    }
    return doc.data() as UserSnapshot;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new Error("You must be signed in to view user details.");
    }
    throw error;
  }
};

export { findUserById };
