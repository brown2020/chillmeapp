import { db } from "@/frontend/lib/firebase";
import { MeetingSnapShot } from "@/types/entities";
import { getDocs, query, collection, where, orderBy } from "firebase/firestore";

const listUserMeetings = async (uid: string) => {
  const q = query(
    collection(db, "meeting_sessions"),
    where("broadcaster", "==", uid),
    orderBy("created_at", "desc"),
  );
  const querySnapshot = await getDocs(q);
  const results = querySnapshot.docs
    .map((doc) => {
      const raw = {
        ...doc.data(),
      } as MeetingSnapShot & {
        password_hash?: string;
        password_protected?: boolean;
      };
      if (typeof raw.session_duration !== "number") return;
      delete raw.password_hash;
      delete raw.password_protected;
      return raw;
    })
    .filter(Boolean);
  return results as MeetingSnapShot[];
};

export { listUserMeetings };
