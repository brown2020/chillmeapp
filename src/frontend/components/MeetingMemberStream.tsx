import { Icons } from "@frontend/components/ui";
import { useMeeting } from "../hooks";
import { useEffect, useRef, useMemo } from "react";
import {
  useVideo,
  useHMSStore,
  selectLocalPeer,
  selectDominantSpeaker,
} from "@100mslive/react-sdk";

interface Props {
  memberType: "self";
  height: string;
}

const MeetingMemberStream = ({ memberType, height }: Props) => {
  const localPeer = useHMSStore(selectLocalPeer);
  const dominantSpeaker = useHMSStore(selectDominantSpeaker);
  const latestDominantSpeakerRef = useRef(dominantSpeaker);
  console.log(memberType);

  const activeSpeaker = useMemo(() => {
    return latestDominantSpeakerRef.current || localPeer;
  }, [localPeer]);

  const { videoRef } = useVideo({
    trackId: activeSpeaker?.videoTrack ?? "",
  });

  const personIconRef = useRef<HTMLDivElement>(null);
  const { mediaStatus } = useMeeting();

  useEffect(() => {
    if (!personIconRef.current) return;
    personIconRef.current.style.display = mediaStatus.video ? "none" : "flex";
  }, [mediaStatus.video]);

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
        className="absolute inset-0 flex items-center justify-center"
      >
        <Icons.CircleUser width={100} height={100} className="text-gray-500" />
      </div>
    </div>
  );
};

export default MeetingMemberStream;
