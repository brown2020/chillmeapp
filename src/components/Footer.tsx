"use client";

import React, { useState, ChangeEvent, FormEvent, useCallback } from "react";
import { useAVToggle, useHMSActions } from "@100mslive/react-sdk";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageCircle,
  MessageCircleOff,
} from "lucide-react";

interface FooterProps {
  showChat: boolean;
  setShowChat: (showChat: boolean) => void;
}

export default function Footer({ showChat, setShowChat }: FooterProps) {
  const [messageDraft, setMessageDraft] = useState<string>("");
  const hmsActions = useHMSActions();
  const { isLocalAudioEnabled, isLocalVideoEnabled, toggleAudio, toggleVideo } =
    useAVToggle();

  const handleMessage = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (messageDraft) {
        await hmsActions.sendBroadcastMessage(messageDraft);
        setMessageDraft("");
      }
    },
    [messageDraft, hmsActions]
  );

  return (
    <div className="flex justify-between items-center m-3">
      <form onSubmit={handleMessage} className="flex">
        <input
          type="text"
          value={messageDraft}
          placeholder="Type comment here"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setMessageDraft(e.target.value)
          }
          className={`bg-black bg-opacity-40 text-white p-2 rounded ${
            showChat ? "block" : "hidden"
          }`}
          aria-label="Chat input"
        />
      </form>
      <div className="flex items-center">
        <button
          className="p-2 mx-1 bg-transparent"
          onClick={() => setShowChat(!showChat)}
          aria-pressed={showChat}
        >
          {showChat ? <MessageCircle /> : <MessageCircleOff />}
        </button>
        <button
          className="p-2 mx-1 bg-transparent"
          onClick={toggleAudio}
          aria-pressed={isLocalAudioEnabled}
        >
          {isLocalAudioEnabled ? <Mic /> : <MicOff />}
        </button>
        <button
          className="p-2 mx-1 bg-transparent"
          onClick={toggleVideo}
          aria-pressed={isLocalVideoEnabled}
        >
          {isLocalVideoEnabled ? <Video /> : <VideoOff />}
        </button>
      </div>
    </div>
  );
}
