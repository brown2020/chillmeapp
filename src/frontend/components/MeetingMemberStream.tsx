import { Icons } from "@frontend/components/ui";
import { useEffect, useRef, useMemo } from "react";
import {
  useVideo,
  useHMSStore,
  selectLocalPeer,
  selectDominantSpeaker,
  selectIsPeerVideoEnabled,
  HMSPeer,
} from "@100mslive/react-sdk";

interface Props {
  height: string;
  peer: HMSPeer;
}

const MeetingMemberStream = ({ peer, height }: Props) => {
  const localPeer = useHMSStore(selectLocalPeer);
  const dominantSpeaker = useHMSStore(selectDominantSpeaker);
  const latestDominantSpeakerRef = useRef(dominantSpeaker);
  const peerVideoEnabled = useHMSStore(selectIsPeerVideoEnabled(peer.id));

  const activeSpeaker = useMemo(() => {
    return latestDominantSpeakerRef.current || localPeer;
  }, [localPeer]);

  const { videoRef } = useVideo({
    trackId: peer.videoTrack,
  });

  const personIconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!personIconRef.current) return;
    personIconRef.current.style.display = peerVideoEnabled ? "none" : "flex";
  }, [peerVideoEnabled, personIconRef]);

  return (
    <div
      className={`relative w-full border border-slate-800 bg-slate-700 rounded-xl 
        ${activeSpeaker?.id === dominantSpeaker?.id ? "ring-4 ring-blue-500" : ""}
      `}
      style={{ height }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full rounded-xl object-cover"
        style={{
          transform: "scaleX(-1)",
        }}
      />

      <div
        ref={personIconRef}
        className="absolute inset-0 flex items-center flex-col justify-center"
      >
        <Icons.CircleUser width={100} height={100} className="text-gray-500" />
        <p className="mt-2 text-gray-300">
          {peer.isLocal ? "You" : peer.name || "Guest"}
        </p>
      </div>
    </div>
  );
};

export default MeetingMemberStream;
