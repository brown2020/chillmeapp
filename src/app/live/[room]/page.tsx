// app/[room]/page.tsx
"use client";

import React from "react";
import JoinForm from "@/components/JoinForm";
import { selectIsConnectedToRoom, useHMSStore } from "@100mslive/react-sdk";
import Livestream from "@/components/Livestream";

export default function RoomPage({ params }: { params: { room: string } }) {
  const isConnected = useHMSStore(selectIsConnectedToRoom);

  // Extract the room parameter from the dynamic route segment
  const { room } = params;

  // Pass both role and initialRoom to JoinForm
  return isConnected ? (
    <Livestream />
  ) : (
    <JoinForm role="guest" initialRoom={room} />
  );
}
