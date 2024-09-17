// app/components/JoinForm.tsx
"use client";

import React, { useState } from "react";
import { useHMSActions } from "@100mslive/react-sdk";
import { createRoom, getAppToken } from "@/serverActions/100msLiveActions";

interface JoinFormProps {
  role: string;
  initialRoom: string;
}

// Adjust the interface to directly use string for roomId
interface CreateRoomResponse {
  roomId?: string; // Changed to string to match the expected return type
  error?: string;
}

interface ManagementToken {
  token: string;
}

interface TokenResponse {
  appToken?: ManagementToken;
  error?: string;
}

const createNewRoom = async (roomName: string): Promise<string | undefined> => {
  console.log(`Attempting to create a new room with name: ${roomName}`);
  try {
    const response: CreateRoomResponse = await createRoom(roomName);
    if (response.roomId) {
      console.log(`Room created successfully with ID: ${response.roomId}`);
      return response.roomId;
    } else {
      console.error(`Error creating room: ${response.error}`);
      return undefined;
    }
  } catch (error) {
    console.error("Unexpected error while creating room:", error);
    return undefined;
  }
};

const getNewAppToken = async (
  roomId: string,
  userId: string,
  role: string
): Promise<string | undefined> => {
  console.log(
    `Attempting to get an app token for Room ID: ${roomId}, User ID: ${userId}, Role: ${role}`
  );
  try {
    const response: TokenResponse = await getAppToken(roomId, userId, role);
    if (response.appToken) {
      console.log("App token generated successfully:", response.appToken.token);
      return response.appToken.token;
    } else {
      console.error(`Error getting app token: ${response.error}`);
      return undefined;
    }
  } catch (error) {
    console.error("Unexpected error while getting app token:", error);
    return undefined;
  }
};

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with values:", inputValues);

    const roomId = await createNewRoom(inputValues.room);

    if (roomId) {
      console.log(
        `Room ID received: ${roomId}, attempting to get app token...`
      );
      const appToken = await getNewAppToken(roomId, "user", role);

      if (appToken) {
        console.log("App token received, joining room...");
        hmsActions.join({
          userName: inputValues.name,
          authToken: appToken,
        });
      } else {
        console.error("Problem joining room: Failed to get app token.");
        setError("Problem joining room");
      }
    } else {
      console.error("Problem creating room: Failed to get room ID.");
      setError("Problem creating room");
    }
  };

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
      <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
        Join
      </button>
      {error && (
        <p className="bg-red-500 text-white p-2 mt-2 rounded">{error}</p>
      )}
    </form>
  );
};

export default JoinForm;
