"use server";

import { adminAuth } from "@backend/lib/firebase";
import { UserRecord } from "firebase-admin/auth";
import _ from "lodash";

const getUserById = async (uid: string) => {
  const result = await adminAuth.getUser(uid);
  return _.toPlainObject(result) as UserRecord;
};

export { getUserById };
