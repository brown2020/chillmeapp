// app/[roomId]/page.tsx
"use client";

import React, { useCallback, useEffect } from "react";
import Livestream from "@/frontend/components/Livestream";
import { useMeeting } from "@/frontend/hooks";
import { useAuthStore } from "@/frontend/zustand/useAuthStore";

export default function RoomPage({ params }: { params: { roomId: string } }) {
  const { joinRoom, leaveMeeting, isConnected } = useMeeting();
  const { user } = useAuthStore();

  // Extract the room parameter from the dynamic route segment
  const { roomId } = params;

  // Memoized cleanup function
  const handleUnload = useCallback(() => {
    if (isConnected) {
      leaveMeeting();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  useEffect(() => {
    joinRoom(roomId, user?.displayName || "User", user?.uid || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set log level and handle leaving the room on component unmount
  useEffect(() => {
    // Add event listener for window unload
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      handleUnload(); // Ensure room is left on component unmount
    };
  }, [handleUnload]);

  // Pass both role and initialRoom to JoinForm
  return <Livestream />;
}
