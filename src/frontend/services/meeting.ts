import { db } from "@/config/firebase/firebaseClient";
import { Meeting, MeetingSnapShot } from "@/types/entities";
import { addDoc, getDocs, query, collection, where } from "firebase/firestore";

const saveMeeting = async (uid: string, payload: Meeting) => {
  const result = await addDoc(collection(db, "meeting_sessions"), {
    ...payload,
    broadcaster: uid,
  });
  return result;
};

const listUserMeetings = async (uid: string) => {
  const q = query(
    collection(db, "meeting_sessions"),
    where("broadcaster", "==", uid),
  );
  const querySnapshot = await getDocs(q);
  const results = querySnapshot.docs.map((doc) => {
    return {
      ...doc.data(),
      doc_id: doc.id,
    } as MeetingSnapShot;
  });
  console.log(results);
  return results;
};

export { saveMeeting, listUserMeetings };
