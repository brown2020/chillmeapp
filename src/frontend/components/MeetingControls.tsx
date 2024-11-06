"use client";

import React from "react";
import { useMeeting } from "../hooks";
import { Button, Icons, ClickableTooltip } from "@frontend/components/ui";

export default function MeetingControls() {
  const { mediaStatus, setMediaStatus, isConnected } = useMeeting();

  const copyShareableUrl = async () => {
    await navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div className="grid grid-cols-3 gap-4 items-center">
      <div className="justify-self-start"></div>
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
      <div className="justify-self-end flex items-center">
        <ClickableTooltip content={"Link copied"}>
          <Button
            variant={"outline"}
            className="mr-2"
            onClick={copyShareableUrl}
          >
            <Icons.Share2 className="h-4 w-4" />
          </Button>
        </ClickableTooltip>

        {isConnected && <Button variant={"danger"}>End Stream</Button>}
      </div>
    </div>
  );
}
