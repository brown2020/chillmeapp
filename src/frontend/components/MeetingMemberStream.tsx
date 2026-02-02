"use client";

import { CircleUser } from "lucide-react";
import { VideoTrack } from "@livekit/components-react";
import { Track, Participant } from "livekit-client";
import clsx from "clsx";

interface Props {
  height: string;
  peer: {
    id: string;
    name: string;
    isLocal: boolean;
    isSpeaking?: boolean;
    participant: Participant;
  };
  totalPeers: number;
}

const MeetingMemberStream = ({ peer, height, totalPeers }: Props) => {
  const { participant } = peer;
  const videoPublication = participant.getTrackPublication(Track.Source.Camera);
  const isVideoEnabled =
    videoPublication?.isSubscribed && !videoPublication.isMuted;

  return (
    <div
      className={clsx(
        `relative border border-slate-800 bg-slate-700 rounded-xl overflow-hidden`,
        peer.isSpeaking && "ring-4 ring-blue-500",
        totalPeers === 1 ? "w-6/12 m-auto" : "w-full",
      )}
      style={{ height }}
    >
      {isVideoEnabled && videoPublication?.track ? (
        <VideoTrack
          trackRef={{
            participant,
            publication: videoPublication,
            source: Track.Source.Camera,
          }}
          className="w-full h-full object-cover"
          style={{
            transform: "scaleX(-1)",
          }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center flex-col justify-center">
          <CircleUser width={100} height={100} className="text-gray-500" />
          <p className="mt-2 text-gray-300">
            {peer.isLocal ? "You" : peer.name || "Guest"}
          </p>
        </div>
      )}

      <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm text-white">
        {peer.isLocal ? "You" : peer.name || "Guest"}
      </div>
    </div>
  );
};

export default MeetingMemberStream;
