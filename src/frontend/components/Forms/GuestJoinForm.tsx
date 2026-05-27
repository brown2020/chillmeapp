"use client";

import { Button, Input } from "@chill-ui";
import Link from "next/link";
import { FormEvent, useState } from "react";

type GuestJoinFormProps = {
  roomId: string;
  onJoin: (displayName: string) => Promise<void>;
  isJoining: boolean;
  error: string | null;
};

export default function GuestJoinForm({
  roomId,
  onJoin,
  isJoining,
  error,
}: GuestJoinFormProps) {
  const [displayName, setDisplayName] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isJoining) return;

    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setValidationError("Please enter your name to join the meeting.");
      return;
    }

    if (trimmedName.length > 64) {
      setValidationError("Name must be 64 characters or fewer.");
      return;
    }

    setValidationError(null);
    await onJoin(trimmedName);
  };

  const visibleError = validationError || error;

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
      <div className="w-full max-w-md border border-border rounded-lg p-8 bg-card">
        <h1 className="text-2xl font-semibold text-center text-card-foreground">
          Join meeting
        </h1>
        <p className="mt-2 text-sm text-center text-muted-foreground">
          Enter your name to join room{" "}
          <span className="font-mono text-foreground">{roomId}</span>. No
          account required.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 flex flex-col gap-4"
          aria-label="Join meeting as guest"
        >
          <div>
            <label htmlFor="guest-display-name" className="sr-only">
              Your name
            </label>
            <Input
              id="guest-display-name"
              type="text"
              placeholder="Your name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              autoComplete="name"
              maxLength={64}
              disabled={isJoining}
              aria-describedby={visibleError ? "guest-join-error" : undefined}
            />
          </div>

          {visibleError ? (
            <p
              id="guest-join-error"
              className="text-sm text-red-500"
              role="alert"
            >
              {visibleError}
            </p>
          ) : null}

          <Button type="submit" disabled={isJoining} className="w-full">
            {isJoining ? "Joining..." : "Join meeting"}
          </Button>
        </form>

        <p className="mt-4 text-sm text-center text-muted-foreground">
          Have an account?{" "}
          <Link
            href={`/auth/signin?callbackUrl=${encodeURIComponent(`/live/${roomId}`)}`}
            className="text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
