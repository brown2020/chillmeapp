"use client";

import React, { useState, useCallback, useEffect } from "react";
import { createRoom } from "@/frontend/services/broadcasting";
import { saveMeeting } from "@/frontend/services/meeting";
import { useAuthStore } from "@/frontend/zustand/useAuthStore";
import { useRouter } from "next/navigation";
import { Button, Switch, Icons } from "@chill-ui";
import clsx from "clsx";

const CreateMeetingForm: React.FC = () => {
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [shouldRecord, setShouldRecord] = useState<boolean>(false);
  const [mediaStatus, setMediaStatus] = React.useState<{
    audio: boolean;
    video: boolean;
  }>({
    audio: true,
    video: true,
  });
  const [stream, setStream] = useState<MediaStream | null>(null);

  const authStore = useAuthStore();
  const router = useRouter();

  const startWebcamStream = () => {
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
  };

  const stopWebcamStream = useCallback(() => {
    console.log("Stopping webcam stream");
    if (stream) {
      console.log("Stream found");
      stream.getTracks().forEach((track) => {
        track.stop();
      });
    }
  }, [stream]);

  const toggleVideoStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        if (track.kind == "video") {
          track.enabled = mediaStatus.video;
        }
      });
    }
  }, [mediaStatus.video, stream]);

  useEffect(() => {
    toggleVideoStream();
  }, [mediaStatus.video, toggleVideoStream]);

  useEffect(() => {
    startWebcamStream();
    return stopWebcamStream;
  }, [stopWebcamStream]);

  const toggleMediaTrack = (type: "audio" | "video") => {
    setMediaStatus((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
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
      console.log("Room created with id ", roomId);
      await saveMeeting(authStore.user?.uid as string, roomResponse.room);
      router.push(`/live/${roomId}`);
    },
    [authStore.user?.uid as string, router],
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
        className="border border-slate-700 rounded-xl"
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
