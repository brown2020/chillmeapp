"use client";

import React, { useEffect } from "react";
import {
  selectIsConnectedToRoom,
  useHMSActions,
  useHMSStore,
} from "@100mslive/react-sdk";
import dynamic from "next/dynamic";

interface HomePageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

// Dynamically import the JoinForm and Livestream components
const JoinForm = dynamic(() => import("@/components/JoinForm"), { ssr: false });
const Livestream = dynamic(() => import("@/components/Livestream"), {
  ssr: false,
});

export default function HomePage({ searchParams }: HomePageProps) {
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const hmsActions = useHMSActions();
  const room = (searchParams.room as string) || ""; // Extract 'room' from searchParams

  // Set the log level and handle leaving the room on component unmount
  useEffect(() => {
    hmsActions.setLogLevel(4);

    // Cleanup function to leave the room when the component unmounts
    const handleUnload = () => {
      if (isConnected) {
        hmsActions.leave();
      }
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      handleUnload(); // Ensure room is left even when the component unmounts
    };
  }, [hmsActions, isConnected]);

  // Show Livestream if connected, otherwise show JoinForm with initial room value
  return isConnected ? (
    <Livestream />
  ) : (
    <JoinForm role="broadcaster" initialRoom={room} />
  );
}
