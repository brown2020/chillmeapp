"use client";

import React, { useEffect, useCallback, useState } from "react";
import {
  selectIsConnectedToRoom,
  useHMSActions,
  useHMSStore,
} from "@100mslive/react-sdk";

import Livestream from "@/frontend/components/Livestream";
import JoinForm from "@/frontend/components/JoinForm";
import TabGroup from "@/frontend/components/TabGroup";
import PastMeetings from "@/frontend/components/PastMeetings";

interface HomePageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const tabs = [
  {
    label: "Start Meeting",
    value: "start-meeting",
  },

  {
    label: "Past Meetings",
    value: "past-meetings",
  },
];

export default function LiveMain({ searchParams }: HomePageProps) {
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const hmsActions = useHMSActions();
  const room = (searchParams.room as string) || ""; // Extract 'room' from searchParams
  const tabState = useState(tabs[1].value);

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

  const renderTabContent = () => {
    if (tabState[0] === tabs[0].value) {
      return (
        <>
          {isConnected ? (
            <Livestream />
          ) : (
            <JoinForm role="broadcaster" initialRoom={room} />
          )}
        </>
      );
    } else {
      return <PastMeetings />;
    }
  };

  // Render Livestream if connected, otherwise render JoinForm
  return (
    <div className="flex flex-col items-center mx-auto mt-20 w-1/3 bg-black text-white p-6 rounded-lg gap-y-5">
      <TabGroup tabs={tabs} stateHandler={tabState} />
      {renderTabContent()}
    </div>
  );
}
