"use client";

import React, { useState, useCallback, useEffect } from "react";
import { createRoom } from "@/frontend/services/broadcasting";
import { saveMeeting } from "@/frontend/services/meeting";
import { useAuthStore } from "@/frontend/zustand/useAuthStore";
import { useRouter } from "next/navigation";
import { Button, Switch } from "@chill-ui";

const JoinForm: React.FC = () => {
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [shouldRecord, setShouldRecord] = useState<boolean>(false);
  const authStore = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        // audio: true,
      })
      .then((stream) => {
        const videoElem = document.querySelector("video");
        if (videoElem) {
          videoElem.srcObject = stream;
        }
      });
  }, []);

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

  return (
    <form onSubmit={handleSubmit} className="w-full flex gap-y-3 flex-col mt-4">
      <div className="flex justify-between">
        <label htmlFor="record-session"> Record Session</label>
        <Switch
          id="record-session"
          onCheckedChange={(checked) => setShouldRecord(checked)}
        />
      </div>

      <Button disabled={isLoading}>{isLoading ? "Joining..." : "Join"}</Button>

      {error && (
        <p
          className="bg-red-500 text-white p-2 mt-2 rounded"
          aria-live="assertive"
        >
          {error}
        </p>
      )}
    </form>
  );
};

export default JoinForm;
