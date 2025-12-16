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
      const data = await listUserMeetings(authStore.user?.uid as string);
      setMeetingsData(data);
    })();
  }, [authStore.user?.uid]);

  return (
    <div className="grid gap-3 grid-cols-4 w-full">
      {meetingsData.map((d) => (
        <MeetingCard key={d.id} data={d} />
      ))}
    </div>
  );
};

export default PastMeetings;
