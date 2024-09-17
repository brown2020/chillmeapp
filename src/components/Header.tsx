// app/components/Header.tsx
"use client";

import React, { useState } from "react";
import {
  selectIsConnectedToRoom,
  selectRoom,
  useAutoplayError,
  useHMSActions,
  useHMSStore,
  HMSPeer,
  HMSRoom,
} from "@100mslive/react-sdk";
import Image from "next/image";
import logo from "@/app/assets/logo.png"; // Import the image

interface HeaderProps {
  peer: HMSPeer; // Using the HMSPeer type from @100mslive/react-sdk
}

export default function Header({ peer }: HeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const room: HMSRoom | null = useHMSStore(selectRoom); // Room could be null if not connected
  const hmsActions = useHMSActions();
  const { error, resetError, unblockAudio } = useAutoplayError();

  return (
    <header className="flex justify-between m-3 items-center">
      <button
        type="button"
        className="bg-transparent"
        onClick={() => setIsModalOpen(true)} // Open modal on click
      >
        {/* Use the Next.js Image component for optimization */}
        <Image src={logo} alt="logo" width={30} height={30} priority />
      </button>

      <button className="bg-black bg-opacity-30 text-white rounded px-4 py-2">
        {peer.name} {peer.isLocal ? "(You)" : ""}
      </button>

      {isConnected && (
        <button
          id="leave-btn"
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          onClick={() => hmsActions.leave()}
        >
          End Stream
        </button>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          id="exampleModal"
          tabIndex={-1}
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="border-b p-4 flex justify-between items-center">
              <h5 className="text-lg font-semibold" id="exampleModalLabel">
                Livestream: {room?.name}
              </h5>
              <button
                type="button"
                className="text-black"
                onClick={() => setIsModalOpen(false)} // Close modal on click
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <p>Invitation Link</p>
              <p>https://chill.me/{room?.name}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="fixed bg-black bg-opacity-50 w-3/4 p-4 rounded mx-auto text-white top-1/3 z-50">
          <h5 className="text-lg font-semibold">Audio Autoplay</h5>
          <p className="text-sm mb-4">
            The browser wants us to get a confirmation for playing the Audio.
            Please allow audio to proceed.
          </p>

          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => {
              unblockAudio();
              resetError();
            }}
          >
            Allow Audio
          </button>
        </div>
      )}
    </header>
  );
}
