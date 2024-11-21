"use client";

import { useEffect, useRef, useState } from "react";
import MeetingControls from "./MeetingControls";
import MeetingMemberStream from "./MeetingMemberStream";
import MeetingChatWidget from "./MeetingChatWidget";
import clsx from "clsx";
import { useMeeting } from "@frontend/hooks";

const creditsDeductionIntervalSecs: number = 20;

export default function Livestream() {
  const {
    meetingNotification,
    peers,
    localPeer,
    dominantSpeaker,
    leaveMeeting,
    showChatWidget,
    handleCreditsDeduction,
  } = useMeeting();
  const latestDominantSpeakerRef = useRef(dominantSpeaker);
  const meetingPeers = peers;
  const [deductionStarted, setDeductionStarted] = useState<boolean>(false);

  useEffect(() => {
    if (meetingPeers.length === 1 && !deductionStarted) {
      console.log("We are deducting credits");
      setDeductionStarted(true);
      const intervalId = setInterval(() => {
        handleCreditsDeduction(creditsDeductionIntervalSecs);
      }, creditsDeductionIntervalSecs * 1000);

      // Clear the interval when the component unmounts or when `localPeer?.roleName` changes
      return () => clearInterval(intervalId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peers]);

  useEffect(() => {
    if (!meetingNotification) {
      return;
    }
    if (meetingNotification.type === "ROOM_ENDED") {
      leaveMeeting();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingNotification]);

  // Calculate columns based on peers count
  function calcColumns() {
    switch (true) {
      case meetingPeers.length === 1:
        return 1;
      case meetingPeers.length === 2:
        return 2;
      default:
        return 3;
    }
  }

  // Calculate height based on peers count
  function calcHeight() {
    switch (true) {
      case meetingPeers.length <= 3:
        return "70vh";
      case meetingPeers.length <= 4:
        return "50vh";
      default:
        return "33vh";
    }
  }

  // Track changes in the dominant speaker
  useEffect(() => {
    if (dominantSpeaker && dominantSpeaker !== localPeer) {
      latestDominantSpeakerRef.current = dominantSpeaker;
    }
  }, [dominantSpeaker, localPeer]);

  return (
    <div className="grid grid-cols-12 gap-5">
      <div className={clsx(showChatWidget ? "col-span-9" : "col-span-12")}>
        <div className="flex flex-col w-full justify-between h-[80vh]">
          <div
            className={clsx(`grid gap-4`)}
            style={{
              gridTemplateColumns: `repeat(${calcColumns()}, minmax(0, 1fr))`,
            }}
          >
            {meetingPeers.map((peer, index) => {
              if (peer) {
                return (
                  <MeetingMemberStream
                    key={index}
                    height={calcHeight()}
                    peer={peer}
                    totalPeers={peers.length}
                  />
                );
              }
            })}
          </div>
          <MeetingControls />
        </div>
      </div>
      {showChatWidget && (
        <div className="col-span-3">
          <MeetingChatWidget />
        </div>
      )}
    </div>
  );
}
