"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import VideoPlayer from "@/frontend/components/VideoPlayer";
import { getRecordingPlaybackUrl } from "@/backend/services/recording";

function RecordingContent() {
  const searchParams = useSearchParams();
  const recordingPath = searchParams.get("path");
  const [videoSource, setVideoSource] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!recordingPath) {
      window.location.replace("/");
      return;
    }

    let cancelled = false;
    getRecordingPlaybackUrl(recordingPath)
      .then((url) => {
        if (!cancelled) setVideoSource(url);
      })
      .catch(() => {
        if (!cancelled) setError("This recording is unavailable.");
      });

    return () => {
      cancelled = true;
    };
  }, [recordingPath]);

  if (error) {
    return (
      <p role="alert" className="p-6 text-destructive">
        {error}
      </p>
    );
  }

  if (!videoSource) {
    return null;
  }

  const videoJsOptions = {
    autoplay: true,
    controls: true,
    responsive: true,
    fluid: true,
    loop: true,
    poster: "",
    aspectRatio: "16:6",
    sources: [
      {
        src: videoSource,
        type: "video/mp4",
      },
    ],
  };

  return <VideoPlayer options={videoJsOptions} />;
}

const Page = () => {
  return (
    <Suspense fallback={null}>
      <RecordingContent />
    </Suspense>
  );
};

export default Page;
