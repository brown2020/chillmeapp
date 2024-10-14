import { db, storage } from "@/frontend/lib/firebase";
import { Meeting, MeetingSnapShot } from "@/types/entities";
import { addDoc, getDocs, query, collection, where } from "firebase/firestore";
import { getDownloadURL, ref as storageRef } from "firebase/storage";

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
  const results = querySnapshot.docs
    .map((doc) => {
      const data = doc.data() as MeetingSnapShot;
      if (data?.session_duration) return data;
    })
    .filter(Boolean);
  return results as MeetingSnapShot[];
};

const fetchRecording = async (storagePath: string) => {
  const pathReference = storageRef(storage, storagePath);
  const file = await getDownloadURL(pathReference);
  return file;
};

export { saveMeeting, listUserMeetings, fetchRecording };
