"use client";

import { useEffect, useState } from "react";
import MeetingCard from "./MeetingCard";
import { listUserMeetings } from "@/frontend/services/meeting";
import { useAuthStore } from "@/frontend/zustand/useAuthStore";
import { MeetingSnapShot } from "@/types/entities";

const PastMeetings = () => {
  const authStore = useAuthStore();
  const [meetingsData, setMeetingsData] = useState<MeetingSnapShot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userId = authStore.user?.uid;
    if (!userId) return;

    (async () => {
      try {
        const data = await listUserMeetings(userId);
        setMeetingsData(data);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [authStore.user?.uid]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading meetings...</p>
      </div>
    );
  }

  if (meetingsData.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">No past meetings yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full">
      {meetingsData.map((d) => (
        <MeetingCard key={d.id} data={d} />
      ))}
    </div>
  );
};

export default PastMeetings;
