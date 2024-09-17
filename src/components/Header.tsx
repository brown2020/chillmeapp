"use client";

import React, { useState, useCallback } from "react";
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
import logo from "@/app/assets/logo.png";
import { Share2Icon } from "lucide-react";

// Extract reusable constants
const INVITATION_BASE_URL = "https://chill.me/";

interface HeaderProps {
  peer: HMSPeer;
}

export default function Header({ peer }: HeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const room: HMSRoom | null = useHMSStore(selectRoom);
  const hmsActions = useHMSActions();
  const { error, resetError, unblockAudio } = useAutoplayError();

  // Handlers using useCallback for memoization
  const handleModalOpen = useCallback(() => setIsModalOpen(true), []);
  const handleModalClose = useCallback(() => setIsModalOpen(false), []);
  const handleLeave = useCallback(() => hmsActions.leave(), [hmsActions]);
  const handleAllowAudio = useCallback(() => {
    unblockAudio();
    resetError();
  }, [unblockAudio, resetError]);

  return (
    <header className="flex justify-between m-3 items-center">
      <button
        type="button"
        className="bg-transparent"
        onClick={handleModalOpen}
      >
        <div className="flex gap-1 justify-center items-center rounded-md border-2 py-1 px-2 hover:bg-slate-100 hover:text-black">
          <Share2Icon size={32} />
          Invite
        </div>
      </button>

      <button className="bg-black bg-opacity-30 text-white rounded px-4 py-2">
        {peer.name} {peer.isLocal ? "(You)" : ""}
      </button>

      {isConnected && (
        <button
          id="leave-btn"
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          onClick={handleLeave}
        >
          End Stream
        </button>
      )}

      {isModalOpen && (
        <Modal roomName={room?.name} onClose={handleModalClose} />
      )}

      {error && <ErrorMessage onAllowAudio={handleAllowAudio} />}
    </header>
  );
}

// Modal component with improved styling for text visibility
const Modal: React.FC<{ roomName?: string; onClose: () => void }> = ({
  roomName,
  onClose,
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
    id="exampleModal"
    tabIndex={-1}
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
  >
    <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
      <div className="border-b p-4 flex justify-between items-center">
        <h5 className="text-lg font-semibold text-black" id="exampleModalLabel">
          Livestream: {roomName}
        </h5>
        <button
          type="button"
          className="text-black"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <div className="p-4 text-black">
        <p>Invitation Link</p>
        <p>
          {INVITATION_BASE_URL}
          {roomName}
        </p>
      </div>
    </div>
  </div>
);

// Error message component for reuse
const ErrorMessage: React.FC<{ onAllowAudio: () => void }> = ({
  onAllowAudio,
}) => (
  <div className="fixed bg-black bg-opacity-50 w-3/4 p-4 rounded mx-auto text-white top-1/3 z-50">
    <h5 className="text-lg font-semibold">Audio Autoplay</h5>
    <p className="text-sm mb-4">
      The browser wants us to get a confirmation for playing the Audio. Please
      allow audio to proceed.
    </p>
    <button
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      onClick={onAllowAudio}
    >
      Allow Audio
    </button>
  </div>
);
