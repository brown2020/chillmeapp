"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { createRoom } from "@/frontend/services/broadcasting";
import { saveMeeting } from "@/frontend/services/meeting";
import { useAuthStore } from "@/frontend/zustand/useAuthStore";
import { useRouter } from "next/navigation";

const JoinForm: React.FC = () => {
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const checkBoxRef = useRef<HTMLInputElement>(null);
  const authStore = useAuthStore();
  const [inputValues, setInputValues] = useState<{
    name: string;
  }>({
    name: authStore?.authDisplayName || "",
  });
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

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValues((prevValues) => ({
        ...prevValues,
        [e.target.name]: e.target.value,
      }));
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError(undefined); // Reset any previous error

      const shouldRecord = checkBoxRef.current?.checked || false;

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
      await saveMeeting(authStore.uid, roomResponse.room);
      router.push(`/live/${roomId}`);
    },
    [authStore.uid, router],
  );

  return (
    <form onSubmit={handleSubmit} className="w-full flex gap-y-3 flex-col">
      <h2 className="text-2xl mb-4 text-white">Stream</h2>

      <input
        required
        value={inputValues.name}
        onChange={handleInputChange}
        id="name"
        type="text"
        name="name"
        placeholder="Your name"
        className="mb-3 p-2 border border-gray-600 rounded w-full bg-black text-white placeholder-gray-400"
      />

      <div className="self-start">
        <input
          type="checkbox"
          id="record-session"
          value="true"
          ref={checkBoxRef}
        />
        <label htmlFor="record-session"> Record Session</label>
      </div>

      <button
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        disabled={isLoading}
      >
        {isLoading ? "Joining..." : "Join"}
      </button>

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
