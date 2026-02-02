"use server";

import { adminDb } from "@/backend/lib/firebase";

const findUserById = async (uid: string): Promise<UserSnapshot | null> => {
  const doc = await adminDb.collection("users").doc(uid).get();
  if (!doc.exists) {
    return null;
  }
  return doc.data() as UserSnapshot;
};

export { findUserById };
