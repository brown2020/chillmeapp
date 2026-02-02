"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { createRoom } from "@/frontend/services/broadcasting";
import { saveMeeting } from "@/frontend/services/meeting";
import { useAuthStore } from "@/frontend/zustand/useAuthStore";
import { useRouter } from "next/navigation";
import { Button, Switch } from "@chill-ui";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import useMeetingStore from "@/frontend/zustand/useMeetingStore";
import clsx from "clsx";

type MediaType = "audio" | "video";

const CreateMeetingForm: React.FC = () => {
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [shouldRecord, setShouldRecord] = useState<boolean>(false);
  const { mediaStatus, setMediaStatus } = useMeetingStore();
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const authStore = useAuthStore();
  const router = useRouter();

  const startWebcamStream = useCallback(() => {
    if (!mediaStatus.video) {
      return;
    }
    navigator.mediaDevices
      .getUserMedia({
        video: true,
      })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error("Failed to access webcam:", err);
      });
  }, [mediaStatus.video]);

  const stopWebcamStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
  }, []);

  const toggleVideoStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        if (track.kind === "video") {
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStatus.video
              ? streamRef.current
              : null;
          }
          track.enabled = mediaStatus.video;
        }
      });
    } else {
      startWebcamStream();
    }
  }, [mediaStatus.video, startWebcamStream]);

  useEffect(() => {
    toggleVideoStream();
  }, [toggleVideoStream]);

  useEffect(() => {
    startWebcamStream();
    return () => {
      stopWebcamStream();
    };
  }, [startWebcamStream, stopWebcamStream]);

  const toggleMediaTrack = (type: MediaType) => {
    setMediaStatus({
      [type]: !mediaStatus[type],
    });
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError(undefined);

      const roomResponse = await createRoom(shouldRecord);
      if (!roomResponse.room || roomResponse.error) {
        setError(`Problem creating room: ${roomResponse.error}`);
        setIsLoading(false);
        return;
      }

      const roomId = roomResponse.room?.id;

      if (!roomId) {
        setError("Problem creating room: Room ID is undefined.");
        setIsLoading(false);
        return;
      }

      // Save meeting to Firestore
      await saveMeeting(authStore.user?.uid as string, {
        id: roomResponse.room.id,
        name: roomResponse.room.name,
        created_at: roomResponse.room.created_at,
      });

      router.push(`/live/${roomId}`);
    },
    [authStore.user?.uid, router, shouldRecord],
  );

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="border border-slate-800 bg-slate-700 rounded-xl w-full max-w-4xl"
        style={{
          transform: "scaleX(-1)",
          height: 300,
          objectFit: "cover",
        }}
      />
      <div
        className="mt-4 text-right"
        style={{
          position: "relative",
          right: "15px",
          bottom: "60px",
        }}
      >
        <Button
          variant={mediaStatus.audio ? "outline" : "danger"}
          size="icon"
          className={clsx("mr-2")}
          onClick={() => toggleMediaTrack("audio")}
        >
          {!mediaStatus.audio ? (
            <MicOff className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>

        <Button
          size="icon"
          variant={mediaStatus.video ? "outline" : "danger"}
          onClick={() => toggleMediaTrack("video")}
        >
          {!mediaStatus.video ? (
            <VideoOff className="h-4 w-4" />
          ) : (
            <Video className="h-4 w-4" />
          )}
        </Button>
      </div>
      <form
        onSubmit={handleSubmit}
        className="w-full flex gap-y-3 flex-col mt-4 max-w-4xl"
      >
        <div className="flex justify-between">
          <label htmlFor="record-session"> Record Session</label>
          <Switch
            id="record-session"
            onCheckedChange={(checked) => setShouldRecord(checked)}
          />
        </div>

        <Button disabled={isLoading}>
          {isLoading ? "Joining..." : "Join"}
        </Button>

        {error && (
          <p
            className="bg-red-500 text-white p-2 mt-2 rounded"
            aria-live="assertive"
          >
            {error}
          </p>
        )}
      </form>
    </>
  );
};

export default CreateMeetingForm;
