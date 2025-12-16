"use client";

import React, { useCallback, useEffect, useRef } from "react";
import Livestream from "@/frontend/components/Livestream";
import { useMeeting } from "@/frontend/hooks";
import { useAuthStore } from "@/frontend/zustand/useAuthStore";

type RoomClientProps = {
  roomId: string;
};

export default function RoomClient({ roomId }: RoomClientProps) {
  const { joinRoom, leaveMeeting, isConnected } = useMeeting();
  const { user } = useAuthStore();
  const hasJoinAttemptedRef = useRef(false);

  const handleUnload = useCallback(() => {
    if (isConnected) {
      leaveMeeting();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  useEffect(() => {
    if (!roomId) return;
    if (hasJoinAttemptedRef.current) return;
    hasJoinAttemptedRef.current = true;
    joinRoom(roomId, user?.displayName || "User", user?.uid || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [handleUnload]);

  return <Livestream />;
}
