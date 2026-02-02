"use client";

import React, { useCallback, useEffect, useState } from "react";
import Livestream from "@/frontend/components/Livestream";
import { getJoinToken } from "@/frontend/hooks/useMeeting";
import { useAuthStore } from "@/frontend/zustand/useAuthStore";
import { LiveKitRoomWrapper } from "@/frontend/providers/LiveKitProvider";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/frontend/hooks/useToast";

type RoomClientProps = {
  roomId: string;
};

export default function RoomClient({ roomId }: RoomClientProps) {
  const { user } = useAuthStore();
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Get the join token when component mounts
  useEffect(() => {
    if (!roomId || !user) return;

    const fetchToken = async () => {
      try {
        setIsLoading(true);
        const joinToken = await getJoinToken(
          roomId,
          user.displayName || "User",
          user.uid,
        );
        setToken(joinToken);
      } catch (err) {
        const error = err as Error;
        console.error("Error joining room:", error);
        setError(error.message || "Failed to join room");
        toast({
          title: "Error joining room",
          description: error.message || "Failed to join the meeting",
          variant: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchToken();
  }, [roomId, user]);

  const handleConnected = useCallback(() => {
    console.log("Connected to LiveKit room");
  }, []);

  const handleDisconnected = useCallback(() => {
    console.log("Disconnected from LiveKit room");
    router.push("/");
  }, [router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Joining meeting...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => router.push("/live")}
            className="text-primary underline"
          >
            Back to meetings
          </button>
        </div>
      </div>
    );
  }

  // Show nothing if no token yet
  if (!token) {
    return null;
  }

  // Render the LiveKit room
  return (
    <LiveKitRoomWrapper
      token={token}
      onConnected={handleConnected}
      onDisconnected={handleDisconnected}
    >
      <Livestream />
    </LiveKitRoomWrapper>
  );
}
