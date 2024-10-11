import { db } from "@/frontend/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const findUserById = async (uid: string) => {
  const q = doc(db, "users", uid);
  const result = await getDoc(q);
  return result.data() as UserSnapshot;
};

export { findUserById };
