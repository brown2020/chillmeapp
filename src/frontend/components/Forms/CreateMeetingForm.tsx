"use client";

import React, { useState, useCallback, useEffect } from "react";
import { createRoom } from "@/backend/services/broadcasting";
import { saveMeeting } from "@/frontend/services/meeting";
import { useAuthStore } from "@/frontend/zustand/useAuthStore";
import { useRouter } from "next/navigation";
import { Button, Switch, Icons } from "@chill-ui";
import { useMeeting } from "@frontend/hooks";
import clsx from "clsx";

type MediaType = "audio" | "video";

let stream: MediaStream | null = null;

const setStream = (mstream: MediaStream | null) => {
  stream = mstream;
};

const CreateMeetingForm: React.FC = () => {
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [shouldRecord, setShouldRecord] = useState<boolean>(false);
  const { mediaStatus, setMediaStatus } = useMeeting();

  const authStore = useAuthStore();
  const router = useRouter();

  const startWebcamStream = useCallback(() => {
    if (!mediaStatus.video) {
      return;
    }
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        // audio: true,
      })
      .then((stream) => {
        setStream(stream);
        const videoElem = document.querySelector("video");
        if (videoElem) {
          videoElem.srcObject = stream;
        }
      });
  }, [mediaStatus.video]);

  const stopWebcamStream = useCallback(() => {
    if (stream) {
      const tracks = stream.getVideoTracks();
      tracks.map((track) => {
        track.stop();
      });
      setStream(null);
    }
  }, []);

  const toggleVideoStream = useCallback(() => {
    if (stream) {
      const videoElem = document.querySelector("video");

      stream.getTracks().forEach((track) => {
        if (track.kind == "video") {
          if (videoElem) {
            videoElem.srcObject = mediaStatus.video ? stream : null;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMediaTrack = (type: MediaType) => {
    setMediaStatus({
      [type]: !mediaStatus[type],
    });
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError(undefined); // Reset any previous error

      // Step 1: Create a new room
      const roomResponse = await createRoom(shouldRecord);
      if (!roomResponse.room || roomResponse.error) {
        setError(`Problem creating room: ${roomResponse.error}`);
        setIsLoading(false);
        return;
      }

      const roomId = roomResponse.room?.id; // Get the roomId from the response

      if (!roomId) {
        setError("Problem creating room: Room ID is undefined.");
        setIsLoading(false);
        return;
      }
      await saveMeeting(authStore.user?.uid as string, roomResponse.room);
      router.push(`/live/${roomId}`);
    },
    [authStore.user?.uid, router, shouldRecord],
  );

  const _renderMeetingControls = () => {
    return (
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
            <Icons.MicOff className="h-4 w-4" />
          ) : (
            <Icons.MicIcon className="h-4 w-4" />
          )}
        </Button>

        <Button
          size="icon"
          variant={mediaStatus.video ? "outline" : "danger"}
          onClick={() => toggleMediaTrack("video")}
        >
          {!mediaStatus.video ? (
            <Icons.VideoOff className="h-4 w-4" />
          ) : (
            <Icons.Video className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  };

  return (
    <>
      <video
        autoPlay
        className="border border-slate-800 bg-slate-700 rounded-xl"
        style={{
          transform: "scaleX(-1)",
          height: 300,
          width: "900px",
          objectFit: "cover",
        }}
      ></video>
      {_renderMeetingControls()}
      <form
        onSubmit={handleSubmit}
        className="w-full flex gap-y-3 flex-col mt-4"
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
