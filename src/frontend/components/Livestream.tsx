"use client";

import { useEffect, useRef } from "react";
import {
  selectPeers,
  useHMSStore,
  selectDominantSpeaker,
  selectLocalPeer,
} from "@100mslive/react-sdk";
import MeetingControls from "./MeetingControls";
import MeetingMemberStream from "./MeetingMemberStream";
import clsx from "clsx";

export default function Livestream() {
  const peers = useHMSStore(selectPeers);
  const localPeer = useHMSStore(selectLocalPeer);
  const dominantSpeaker = useHMSStore(selectDominantSpeaker);
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
    if (dominantSpeaker && dominantSpeaker !== localPeer) {
      latestDominantSpeakerRef.current = dominantSpeaker;
    }
  }, [dominantSpeaker, localPeer]);

  return (
    <div className="flex flex-col w-full justify-between h-[80vh]">
      <div
        className={clsx(`grid gap-4 mt-2`)}
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
  );
}
