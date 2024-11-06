"use server";

import { adminAuth } from "@backend/lib/firebase";
import { UserRecord } from "firebase-admin/auth";

const getUserById = async (uid: string) => {
  const result = await adminAuth.getUser(uid);
  return JSON.parse(JSON.stringify(result)) as UserRecord;
};

export { getUserById };
