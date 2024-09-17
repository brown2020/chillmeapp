"use client";

import React, { useState, useCallback } from "react";
import { useHMSActions } from "@100mslive/react-sdk";
import { createRoom, getAppToken } from "@/serverActions/100msLiveActions";

interface JoinFormProps {
  role: string;
  initialRoom: string;
}

const JoinForm: React.FC<JoinFormProps> = ({ role, initialRoom }) => {
  const hmsActions = useHMSActions();
  const [inputValues, setInputValues] = useState<{
    name: string;
    room: string;
  }>({
    name: "",
    room: initialRoom || "",
  });
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValues((prevValues) => ({
        ...prevValues,
        [e.target.name]: e.target.value,
      }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError(undefined); // Reset any previous error

      // Step 1: Create a new room
      const roomResponse = await createRoom(inputValues.room);
      if (roomResponse.error) {
        setError(`Problem creating room: ${roomResponse.error}`);
        setIsLoading(false);
        return;
      }

      const roomId = roomResponse.roomId; // Get the roomId from the response

      if (!roomId) {
        setError("Problem creating room: Room ID is undefined.");
        setIsLoading(false);
        return;
      }

      // Step 2: Get app token
      const tokenResponse = await getAppToken(roomId, "user", role);
      if (tokenResponse.error) {
        setError(`Problem joining room: ${tokenResponse.error}`);
        setIsLoading(false);
        return;
      }

      if (!tokenResponse.appToken) {
        setError("Problem joining room: App token is undefined.");
        setIsLoading(false);
        return;
      }

      // Step 3: Join the room
      hmsActions.join({
        userName: inputValues.name,
        authToken: tokenResponse.appToken.token,
      });

      setIsLoading(false);
    },
    [inputValues, role, hmsActions]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center mx-auto mt-20 w-1/2 bg-black text-white p-6 rounded-lg"
    >
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

      {role === "broadcaster" && (
        <input
          required
          value={inputValues.room.split(" ").join("")}
          onChange={handleInputChange}
          id="room"
          type="text"
          name="room"
          placeholder="Room"
          className="mb-3 p-2 border border-gray-600 rounded w-full bg-black text-white placeholder-gray-400"
        />
      )}

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