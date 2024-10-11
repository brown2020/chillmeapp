import { useEffect, useState } from "react";
import MeetingCard from "./MeetingCard";
import { listUserMeetings } from "@/frontend/services/meeting";
import { useAuthStore } from "@/frontend/zustand/useAuthStore";
import { MeetingSnapShot } from "@/types/entities";

const PastMeetings = () => {
  const authStore = useAuthStore();
  const [meetingsData, setMeetingsData] = useState<MeetingSnapShot[]>([]);

  useEffect(() => {
    (async () => {
      const data = await listUserMeetings(authStore.uid);
      setMeetingsData(data);
    })();
  }, [authStore.uid]);

  return meetingsData.map((d) => <MeetingCard key={d.doc_id} data={d} />);
};

export default PastMeetings;
