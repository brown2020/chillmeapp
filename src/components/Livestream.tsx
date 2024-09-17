// app/components/Livestream.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  selectPeers,
  useHMSStore,
  selectDominantSpeaker,
  selectLocalPeer,
  useVideo,
} from "@100mslive/react-sdk";
import dynamic from "next/dynamic";
import Footer from "./Footer";
import Header from "./Header";
import PeerDisplay from "./PeerDisplay";

// Dynamically import ChatView to ensure it's only loaded on the client side
const ChatView = dynamic(() => import("./ChatView"), { ssr: false });

export default function Livestream() {
  const [showChat, setShowChat] = useState(true);
  const peers = useHMSStore(selectPeers);
  const localPeer = useHMSStore(selectLocalPeer);
  const dominantSpeaker = useHMSStore(selectDominantSpeaker);
  const latestDominantSpeakerRef = useRef(dominantSpeaker);

  // Track changes in the dominant speaker
  useEffect(() => {
    // Ensure browser-specific logic is only executed on the client side
    if (typeof window !== "undefined" && "IntersectionObserver" in window) {
      if (dominantSpeaker && dominantSpeaker !== localPeer) {
        latestDominantSpeakerRef.current = dominantSpeaker;
      }
    }
  }, [dominantSpeaker, localPeer]);

  const activeSpeaker = latestDominantSpeakerRef.current || localPeer;

  const { videoRef } = useVideo({
    trackId: activeSpeaker?.videoTrack ?? "", // Safely access videoTrack
  });

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Background Video */}
      <div className="absolute inset-0">
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
          {showChat && (
            <div className="flex-grow overflow-y-auto">
              <ChatView />
            </div>
          )}

          {/* Peer Displays */}
          <div className="flex flex-col max-h-[80%] overflow-y-scroll fixed right-0 top-[70px] mt-[70px] mr-[10px] mb-[70px]">
            {peers.map((peer) => (
              <div key={peer.id}>
                {peer.id !== activeSpeaker?.id && (
                  <div className="flex flex-col">
                    <PeerDisplay peer={peer} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <Footer showChat={showChat} setShowChat={setShowChat} />
      </div>
    </div>
  );
}
