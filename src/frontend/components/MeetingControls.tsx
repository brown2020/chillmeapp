"use client";

import React from "react";
import { useMeeting } from "../hooks";
import {
  Button,
  Icons,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@frontend/components/ui";

export default function MeetingControls() {
  const {
    mediaStatus,
    setMediaStatus,
    isConnected,
    endMeeting,
    localPeerRole,
    leaveMeeting,
    setShowChatWidget,
    showChatWidget,
  } = useMeeting();

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
          className="mr-2"
        >
          {!mediaStatus.video ? (
            <Icons.VideoOff className="h-4 w-4" />
          ) : (
            <Icons.Video className="h-4 w-4" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            <Button size="icon" variant={"outline"}>
              <Icons.MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Meeting Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {showChatWidget ? (
              <DropdownMenuItem onClick={() => setShowChatWidget(false)}>
                Hide Chat
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => setShowChatWidget(true)}>
                View Chat
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={copyShareableUrl}>
              <Icons.Share2 className="h-4 w-4" /> Copy Meeting URL
            </DropdownMenuItem>
            <DropdownMenuItem>
              {isConnected && localPeerRole?.name == "host" ? (
                <Button onClick={endMeeting} variant={"danger"}>
                  End Meeting and Leave
                </Button>
              ) : isConnected ? (
                <Button onClick={leaveMeeting} variant={"danger"}>
                  Leave Meeting
                </Button>
              ) : null}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="justify-self-end flex items-center"></div>
    </div>
  );
}
