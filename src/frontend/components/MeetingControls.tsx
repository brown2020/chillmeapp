"use client";

import React from "react";
import { useMeeting } from "../hooks";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@frontend/components/ui";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MoreVertical,
  Share2,
} from "lucide-react";

export default function MeetingControls() {
  const {
    mediaStatus,
    toggleVideo,
    toggleAudio,
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
          onClick={toggleAudio}
        >
          {!mediaStatus.audio ? (
            <MicOff className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>

        <Button
          size="icon"
          variant={mediaStatus.video ? "outline" : "danger"}
          onClick={toggleVideo}
          className="mr-2"
        >
          {!mediaStatus.video ? (
            <VideoOff className="h-4 w-4" />
          ) : (
            <Video className="h-4 w-4" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant={"outline"} className="outline-none">
              <MoreVertical className="h-4 w-4" />
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
              <Share2 className="h-4 w-4 mr-2" /> Copy Meeting URL
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {isConnected && localPeerRole?.name === "host" ? (
              <DropdownMenuItem
                onClick={endMeeting}
                className="text-destructive focus:text-destructive"
              >
                End Meeting and Leave
              </DropdownMenuItem>
            ) : isConnected ? (
              <DropdownMenuItem
                onClick={leaveMeeting}
                className="text-destructive focus:text-destructive"
              >
                Leave Meeting
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="justify-self-end flex items-center"></div>
    </div>
  );
}
