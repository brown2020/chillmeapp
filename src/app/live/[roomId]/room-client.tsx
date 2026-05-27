"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Livestream from "@/frontend/components/Livestream";
import GuestJoinForm from "@/frontend/components/Forms/GuestJoinForm";
import { getJoinToken } from "@/frontend/hooks/useMeeting";
import { useAuthStore } from "@/frontend/zustand/useAuthStore";
import { LiveKitRoomWrapper } from "@/frontend/providers/LiveKitProvider";
import { getMeetingJoinRequirements } from "@/backend/services/meeting";
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
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [requirementsLoaded, setRequirementsLoaded] = useState(false);
  const hasAutoJoinedRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const loadRequirements = async () => {
      try {
        const requirements = await getMeetingJoinRequirements(roomId);
        if (isMounted) {
          setPasswordRequired(requirements.passwordRequired);
        }
      } catch (loadError) {
        if (!isMounted) return;
        const message =
          loadError instanceof Error
            ? loadError.message
            : "Unable to load meeting details";
        setError(message);
      } finally {
        if (isMounted) {
          setRequirementsLoaded(true);
        }
      }
    };

    void loadRequirements();

    return () => {
      isMounted = false;
    };
  }, [roomId]);

  const joinMeeting = useCallback(
    async (displayName: string, roomPassword?: string) => {
      if (!roomId || isJoining) return;

      setIsJoining(true);
      setError(null);

      try {
        const joinToken = await getJoinToken(roomId, displayName, roomPassword);
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
    if (
      !requirementsLoaded ||
      passwordRequired ||
      !roomId ||
      !user ||
      token ||
      isJoining ||
      hasAutoJoinedRef.current
    ) {
      return;
    }

    hasAutoJoinedRef.current = true;
    void joinMeeting(user.displayName || "User");
  }, [
    roomId,
    user,
    token,
    isJoining,
    joinMeeting,
    passwordRequired,
    requirementsLoaded,
  ]);

  const handleDisconnected = useCallback(() => {
    router.push(user ? "/live" : "/");
  }, [router, user]);

  if (isAuthenticating || !requirementsLoaded) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const shouldShowJoinForm = !token && (!user || passwordRequired);

  if (shouldShowJoinForm) {
    return (
      <GuestJoinForm
        roomId={roomId}
        onJoin={joinMeeting}
        isJoining={isJoining}
        error={error}
        passwordRequired={passwordRequired}
        defaultDisplayName={user?.displayName || ""}
        showDisplayNameField={!user}
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
