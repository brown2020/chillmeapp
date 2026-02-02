"use client";

import { useEffect, useRef } from "react";
import MeetingControls from "./MeetingControls";
import MeetingMemberStream from "./MeetingMemberStream";
import MeetingChatWidget from "./MeetingChatWidget";
import clsx from "clsx";
import { useMeeting } from "@frontend/hooks";

export default function Livestream() {
  const { peers, localPeer, dominantSpeaker, showChatWidget } = useMeeting();
  const latestDominantSpeakerRef = useRef(dominantSpeaker);
  const meetingPeers = peers;

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
    if (dominantSpeaker && dominantSpeaker.identity !== localPeer?.id) {
      latestDominantSpeakerRef.current = dominantSpeaker;
    }
  }, [dominantSpeaker, localPeer]);

  return (
    <div className="grid grid-cols-12 gap-5">
      <div
        className={clsx(
          showChatWidget ? "col-span-12 lg:col-span-9" : "col-span-12",
        )}
      >
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
                    key={peer.id || index}
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
        <div className="hidden lg:block lg:col-span-3">
          <MeetingChatWidget />
        </div>
      )}
    </div>
  );
}
