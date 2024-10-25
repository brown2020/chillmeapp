"use client";

import { useEffect, useRef, useMemo } from "react";
import {
  selectPeers,
  useHMSStore,
  selectDominantSpeaker,
  selectLocalPeer,
} from "@100mslive/react-sdk";
import MeetingControls from "./MeetingControls";
import PeerDisplay from "./PeerDisplay";
import MeetingMemberStream from "./MeetingMemberStream";

export default function Livestream() {
  const peers = useHMSStore(selectPeers);
  const localPeer = useHMSStore(selectLocalPeer);
  const dominantSpeaker = useHMSStore(selectDominantSpeaker);
  const latestDominantSpeakerRef = useRef(dominantSpeaker);
  const meetingPeers = new Array(3).fill("");

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

  // Memoize the active speaker value
  const activeSpeaker = useMemo(() => {
    return latestDominantSpeakerRef.current || localPeer;
  }, [localPeer]);

  // Track changes in the dominant speaker
  useEffect(() => {
    if (dominantSpeaker && dominantSpeaker !== localPeer) {
      latestDominantSpeakerRef.current = dominantSpeaker;
    }
  }, [dominantSpeaker, localPeer]);

  // Extracted function to render peers
  const renderPeers = () =>
    peers.map((peer) => (
      <div key={peer.id}>
        {peer.id !== activeSpeaker?.id && (
          <div className="flex flex-col">
            <PeerDisplay peer={peer} />
          </div>
        )}
      </div>
    )); // No extra semicolon here

  return (
    <div className="flex flex-col w-full justify-between h-[80vh]">
      <div className={`grid gap-4 p-4 grid-cols-${calcColumns()}`}>
        {meetingPeers.map((peer, index) => (
          <MeetingMemberStream
            key={index}
            memberType={peer.type}
            height={calcHeight()}
          />
        ))}
      </div>

      <div className="flex-col">
        <div className="flex flex-row overflow-hidden">
          <div className="flex flex-col overflow-y-scroll fixed right-0 top-[70px] mt-[70px] mr-[10px] mb-[70px]">
            {renderPeers()}
          </div>
        </div>
      </div>
      <MeetingControls />
    </div>
  );
}
