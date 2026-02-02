"use client";

import * as React from "react";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";

const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL!;

interface LiveKitRoomWrapperProps {
  children: React.ReactNode;
  token: string;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

/**
 * Wrapper component for active LiveKit room sessions.
 * Use this to wrap components that need access to the room context.
 */
export function LiveKitRoomWrapper({
  children,
  token,
  onConnected,
  onDisconnected,
}: LiveKitRoomWrapperProps) {
  return (
    <LiveKitRoom
      serverUrl={serverUrl}
      token={token}
      connect={true}
      video={true}
      audio={true}
      onConnected={onConnected}
      onDisconnected={onDisconnected}
    >
      <RoomAudioRenderer />
      {children}
    </LiveKitRoom>
  );
}

/**
 * Simple provider for app-wide LiveKit context.
 * The actual room connection happens in LiveKitRoomWrapper.
 */
export function LiveKitProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
