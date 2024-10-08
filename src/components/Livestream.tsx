"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import {
  selectPeers,
  useHMSStore,
  selectDominantSpeaker,
  selectLocalPeer,
  useVideo,
} from "@100mslive/react-sdk";

import Footer from "./Footer";
import Header from "./Header";
import PeerDisplay from "./PeerDisplay";
import ChatView from "./ChatView";

export default function Livestream() {
  const [showChat, setShowChat] = useState(true);
  const peers = useHMSStore(selectPeers);
  const localPeer = useHMSStore(selectLocalPeer);
  const dominantSpeaker = useHMSStore(selectDominantSpeaker);
  const latestDominantSpeakerRef = useRef(dominantSpeaker);

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

  const { videoRef } = useVideo({
    trackId: activeSpeaker?.videoTrack ?? "",
  });

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
    <div className="relative flex flex-col w-full h-container-custom">
      {/* Background Video */}
      <div className="absolute inset-0 flex flex-col h-full">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      </div>
      {/* Foreground Content */}
      <div className="relative flex flex-col h-full">
        {/* Header */}
        {activeSpeaker && <Header peer={activeSpeaker} />}
        {/* Main Content */}
        <div className="flex flex-row h-full overflow-hidden">
          {/* Chat View */}
          {showChat && <ChatView />}

          {/* Peer Displays */}
          <div className="flex flex-col max-h-[80%] overflow-y-scroll fixed right-0 top-[70px] mt-[70px] mr-[10px] mb-[70px]">
            {renderPeers()}
          </div>
        </div>
        {/* Footer */}
        <Footer showChat={showChat} setShowChat={setShowChat} />
      </div>
    </div>
  );
}
