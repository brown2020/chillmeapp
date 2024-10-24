"use client";

import React, { useState, ChangeEvent, FormEvent, useCallback } from "react";
import { useHMSActions } from "@100mslive/react-sdk";

import { useMeeting } from "../hooks";
import { Button, Icons } from "@frontend/components/ui";

interface FooterProps {
  showChat: boolean;
  setShowChat: (showChat: boolean) => void;
}

export default function Footer({ showChat }: FooterProps) {
  const [messageDraft, setMessageDraft] = useState<string>("");
  const hmsActions = useHMSActions();
  const { mediaStatus, setMediaStatus, isConnected } = useMeeting();

  const handleMessage = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (messageDraft) {
        await hmsActions.sendBroadcastMessage(messageDraft);
        setMessageDraft("");
      }
    },
    [messageDraft, hmsActions],
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
        <Button
          variant={mediaStatus.audio ? "outline" : "danger"}
          size="icon"
          className={"mr-2"}
          onClick={() => setMediaStatus({ audio: !mediaStatus.audio })}
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
          onClick={() => setMediaStatus({ video: !mediaStatus.video })}
        >
          {!mediaStatus.video ? (
            <Icons.VideoOff className="h-4 w-4" />
          ) : (
            <Icons.Video className="h-4 w-4" />
          )}
        </Button>
      </div>
      {isConnected && <Button variant={"danger"}>End Stream</Button>}
    </div>
  );
}
