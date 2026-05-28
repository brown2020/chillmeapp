"use server";

import { adminAuth } from "@backend/lib/firebase";
import { UserRecord } from "firebase-admin/auth";
import {
  requireServerUser,
  UnauthorizedError,
} from "@/backend/services/server-auth";

const getUserById = async (uid: string) => {
  try {
    await requireServerUser();
    const result = await adminAuth.getUser(uid);
    return JSON.parse(JSON.stringify(result)) as UserRecord;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new Error("You must be signed in to view user details.");
    }
    throw error;
  }
};

export { getUserById };
