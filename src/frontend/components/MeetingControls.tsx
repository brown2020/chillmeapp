"use client";

import React from "react";

import { useMeeting } from "../hooks";
import { Button, Icons } from "@frontend/components/ui";

export default function MeetingControls() {
  const { mediaStatus, setMediaStatus, isConnected } = useMeeting();

  return (
    <div className="grid grid-cols-3 gap-4 items-center">
      <div className="justify-self-start">
        <p>Meeting</p>
      </div>
      <div className="justify-self-center">
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
      <div className="justify-self-end">
        {isConnected && <Button variant={"danger"}>End Stream</Button>}
      </div>
    </div>
  );
}
