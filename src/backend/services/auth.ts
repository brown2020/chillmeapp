"use server";

import { adminAuth } from "@backend/lib/firebase";
import { UserRecord } from "firebase-admin/auth";
import { toPlainObject } from "@/utils/common";

const getUserById = async (uid: string) => {
  const result = await adminAuth.getUser(uid);
  return toPlainObject<UserRecord>(result);
};

export { getUserById };
