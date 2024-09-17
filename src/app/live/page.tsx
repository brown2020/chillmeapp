"use client";

import React, { useEffect, useCallback } from "react";
import {
  selectIsConnectedToRoom,
  useHMSActions,
  useHMSStore,
} from "@100mslive/react-sdk";

import Livestream from "@/components/Livestream";
import JoinForm from "@/components/JoinForm";

interface HomePageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

// // Dynamically import the JoinForm and Livestream components
// const JoinForm = dynamic(() => import("@/components/JoinForm"), { ssr: false });
// const Livestream = dynamic(() => import("@/components/Livestream"), {
//   ssr: false,
// });

export default function LiveMain({ searchParams }: HomePageProps) {
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const hmsActions = useHMSActions();
  const room = (searchParams.room as string) || ""; // Extract 'room' from searchParams

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

  // Render Livestream if connected, otherwise render JoinForm
  return isConnected ? (
    <Livestream />
  ) : (
    <JoinForm role="broadcaster" initialRoom={room} />
  );
}
