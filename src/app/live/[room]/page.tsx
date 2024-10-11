// app/[room]/page.tsx
"use client";

import React, { useCallback, useEffect } from "react";
import JoinForm from "@/frontend/components/JoinForm";
import {
  selectIsConnectedToRoom,
  useHMSActions,
  useHMSStore,
} from "@100mslive/react-sdk";
import Livestream from "@/frontend/components/Livestream";

export default function RoomPage({ params }: { params: { room: string } }) {
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const hmsActions = useHMSActions();

  // Extract the room parameter from the dynamic route segment
  const { room } = params;

  // Memoized cleanup function
  const handleUnload = useCallback(() => {
    if (isConnected) {
      hmsActions.leave();
    }
  }, [hmsActions, isConnected]);

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
  return isConnected ? (
    <Livestream />
  ) : (
    <JoinForm role="guest" initialRoom={room} />
  );
}
