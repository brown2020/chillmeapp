"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import VideoPlayer from "@/frontend/components/VideoPlayer";

function RecordingContent() {
  const searchParams = useSearchParams();
  const videoSourceEncoded = searchParams.get("source");
  const [videoSource, setVideoSource] = useState<string | null>(null);

  useEffect(() => {
    if (!videoSourceEncoded) {
      window.location.replace("/");
      return;
    }

    try {
      setVideoSource(atob(videoSourceEncoded));
    } catch {
      window.location.replace("/");
    }
  }, [videoSourceEncoded]);

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
