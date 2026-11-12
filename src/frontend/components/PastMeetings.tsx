"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MeetingCard from "./MeetingCard";
import { getPastMeetings } from "@/frontend/services/meeting";
import { useAuthStore } from "@/frontend/zustand/useAuthStore";
import { Button, buttonVariants } from "@chill-ui";
import type { MeetingSnapShot } from "@/types/entities";

type LoadFailure = "unauthenticated" | "unavailable" | "offline";

type ViewState =
  | { kind: "loading" }
  | { kind: "ready"; meetings: MeetingSnapShot[] }
  | { kind: "error"; reason: LoadFailure };

const FAILURE_COPY: Record<LoadFailure, { title: string; detail: string }> = {
  unauthenticated: {
    title: "Your session has expired.",
    detail: "Sign in again to see your past meetings.",
  },
  offline: {
    title: "You appear to be offline.",
    detail: "Check your connection, then try again.",
  },
  unavailable: {
    title: "We couldn't load your past meetings.",
    detail: "This is usually temporary. Please try again.",
  },
};

function isOffline() {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

const PastMeetings = () => {
  const userId = useAuthStore((state) => state.user?.uid);
  const [view, setView] = useState<ViewState>({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!userId) return;

    let isMounted = true;

    getPastMeetings()
      .then((result) => {
        if (!isMounted) return;
        setView(
          result.status === "ok"
            ? { kind: "ready", meetings: result.meetings }
            : { kind: "error", reason: result.reason },
        );
      })
      .catch(() => {
        if (!isMounted) return;
        setView({
          kind: "error",
          reason: isOffline() ? "offline" : "unavailable",
        });
      });

    return () => {
      isMounted = false;
    };
  }, [userId, attempt]);

  const retry = () => {
    setView({ kind: "loading" });
    setAttempt((count) => count + 1);
  };

  if (view.kind === "error") {
    const copy = FAILURE_COPY[view.reason];
    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center gap-3 py-12 text-center"
      >
        <p className="font-medium text-foreground">{copy.title}</p>
        <p className="text-muted-foreground">{copy.detail}</p>
        {view.reason === "unauthenticated" ? (
          <Link href="/auth/signout" className={buttonVariants()}>
            Sign in again
          </Link>
        ) : (
          <Button type="button" onClick={retry}>
            Try again
          </Button>
        )}
      </div>
    );
  }

  if (view.kind === "loading") {
    return (
      <div className="flex items-center justify-center py-12">
        <p role="status" className="text-muted-foreground">
          Loading meetings...
        </p>
      </div>
    );
  }

  if (view.meetings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <p className="font-medium text-foreground">No past meetings yet.</p>
        <p className="text-muted-foreground">
          Meetings you host appear here after they end.
        </p>
        <Link href="/live" className={buttonVariants({ variant: "outline" })}>
          Start a meeting
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full">
      {view.meetings.map((meeting) => (
        <MeetingCard key={meeting.id} data={meeting} />
      ))}
    </div>
  );
};

export default PastMeetings;
