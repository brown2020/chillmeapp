// app/[room]/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import JoinForm from "@/components/JoinForm";
import { selectIsConnectedToRoom, useHMSStore } from "@100mslive/react-sdk";

export default function RoomPage({ params }: { params: { room: string } }) {
  const router = useRouter();
  const isConnected = useHMSStore(selectIsConnectedToRoom);

  if (isConnected) {
    router.push("/");
    return null;
  }

  // Extract the room parameter from the dynamic route segment
  const { room } = params;

  // Pass both role and initialRoom to JoinForm
  return <JoinForm role="guest" initialRoom={room || ""} />;
}
