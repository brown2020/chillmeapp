"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Livestream from "@/frontend/components/Livestream";
import GuestJoinForm from "@/frontend/components/Forms/GuestJoinForm";
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
  const { user, isAuthenticating } = useAuthStore();
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const hasAutoJoinedRef = useRef(false);
  const router = useRouter();

  const joinMeeting = useCallback(
    async (displayName: string) => {
      if (!roomId || isJoining) return;

      setIsJoining(true);
      setError(null);

      try {
        const joinToken = await getJoinToken(roomId, displayName);
        setToken(joinToken);
      } catch (err) {
        const joinError = err as Error;
        const message = joinError.message || "Failed to join the meeting";
        setError(message);
        toast({
          title: "Error joining room",
          description: message,
          variant: "error",
        });
      } finally {
        setIsJoining(false);
      }
    },
    [roomId, isJoining],
  );

  useEffect(() => {
    if (!roomId || !user || token || isJoining || hasAutoJoinedRef.current) {
      return;
    }

    hasAutoJoinedRef.current = true;
    void joinMeeting(user.displayName || "User");
  }, [roomId, user, token, isJoining, joinMeeting]);

  const handleDisconnected = useCallback(() => {
    router.push(user ? "/live" : "/");
  }, [router, user]);

  if (isAuthenticating) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && !token) {
    return (
      <GuestJoinForm
        roomId={roomId}
        onJoin={joinMeeting}
        isJoining={isJoining}
        error={error}
      />
    );
  }

  if (error && !token) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] px-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <p className="text-red-500" role="alert">
            {error}
          </p>
          <button
            type="button"
            onClick={() => router.push(user ? "/live" : "/")}
            className="text-primary underline"
          >
            {user ? "Back to meetings" : "Back to home"}
          </button>
        </div>
      </div>
    );
  }

  if (isJoining || (!token && user)) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Joining meeting...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return null;
  }

  return (
    <LiveKitRoomWrapper token={token} onDisconnected={handleDisconnected}>
      <Livestream />
    </LiveKitRoomWrapper>
  );
}
