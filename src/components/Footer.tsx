// app/components/Footer.tsx
"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
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

  const handleMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (messageDraft) {
      await hmsActions.sendBroadcastMessage(messageDraft);
      setMessageDraft("");
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessageDraft(e.target.value);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-between items-center m-3">
      <form onSubmit={handleMessage} className="flex">
        <input
          type="text"
          value={messageDraft}
          placeholder="Type comment here"
          onChange={handleInputChange}
          className={`bg-black bg-opacity-40 text-white p-2 rounded ${
            showChat ? "block" : "hidden"
          }`}
        />
      </form>
      <div className="flex items-center">
        <button
          className="p-2 mx-1 bg-transparent"
          onClick={() => setShowChat(!showChat)}
        >
          {showChat ? <MessageCircle /> : <MessageCircleOff />}
        </button>
        <button className="p-2 mx-1 bg-transparent" onClick={toggleAudio}>
          {isLocalAudioEnabled ? <Mic /> : <MicOff />}
        </button>
        <button className="p-2 mx-1 bg-transparent" onClick={toggleVideo}>
          {isLocalVideoEnabled ? <Video /> : <VideoOff />}
        </button>
      </div>
    </div>
  );
}
