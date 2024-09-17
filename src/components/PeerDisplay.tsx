// app/components/PeerDisplay.tsx
"use client";

import React from "react";
import { useVideo, HMSPeer } from "@100mslive/react-sdk";

interface PeerDisplayProps {
  peer: HMSPeer; // Use the HMSPeer type from @100mslive/react-sdk for the peer prop
}

const PeerDisplay: React.FC<PeerDisplayProps> = ({ peer }) => {
  const { videoRef } = useVideo({
    trackId: peer.videoTrack ?? "", // Ensure trackId is a string
  });

  return (
    <div className="m-2.5">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-[150px] h-[150px] object-cover rounded-[20px]"
      />
      <div className="text-center">
        {peer.name} {peer.isLocal ? "(You)" : ""}
      </div>
    </div>
  );
};

export default PeerDisplay;
