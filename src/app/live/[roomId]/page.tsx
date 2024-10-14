// app/[roomId]/page.tsx
"use client";

import React, { useCallback, useEffect } from "react";
import {
  selectIsConnectedToRoom,
  useHMSActions,
  useHMSStore,
} from "@100mslive/react-sdk";
import Livestream from "@/frontend/components/Livestream";
import useMeeting from "@/frontend/hooks/useMeeting";
import { useAuthStore } from "@/frontend/zustand/useAuthStore";

export default function RoomPage({ params }: { params: { roomId: string } }) {
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const hmsActions = useHMSActions();
  const { joinRoom } = useMeeting();
  const { authDisplayName } = useAuthStore();

  // Extract the room parameter from the dynamic route segment
  const { roomId } = params;

  // Memoized cleanup function
  const handleUnload = useCallback(() => {
    if (isConnected) {
      hmsActions.leave();
    }
  }, [hmsActions, isConnected]);

  useEffect(() => {
    const role = "broadcaster";
    joinRoom(roomId, role, authDisplayName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set log level and handle leaving the room on component unmount
  useEffect(() => {
    hmsActions.setLogLevel(4);

    // Add event listener for window unload
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      handleUnload(); // Ensure room is left on component unmount
    };
  }, [hmsActions, handleUnload]);

  // Pass both role and initialRoom to JoinForm
  return <Livestream />;
}
