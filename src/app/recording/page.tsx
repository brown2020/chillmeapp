"use client";

import React, { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import VideoPlayer from "@/frontend/components/VideoPlayer";

function RecordingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoSourceEncoded = searchParams.get("source");

  useEffect(() => {
    if (!videoSourceEncoded) {
      router.replace("/");
    }
  }, [router, videoSourceEncoded]);

  if (!videoSourceEncoded) {
    return null;
  }

  let videoSource: string;
  try {
    videoSource = atob(videoSourceEncoded);
  } catch {
    router.replace("/");
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
