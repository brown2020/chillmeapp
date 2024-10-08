"use client";
import React from "react";
import VideoPlayer from "@/components/VideoPlayer";
import { useSearchParams, redirect } from "next/navigation";

const Page = () => {
  const searchParams = useSearchParams();
  const videoSourceEncoded = searchParams.get("source");

  if (!videoSourceEncoded) {
    return redirect("/");
  }

  const videoSource = atob(videoSourceEncoded);

  const videoJsOptions = {
    autoplay: true,
    controls: true,
    responsive: true,
    fluid: true,
    loop: true,
    poster: "",
    sources: [
      {
        src: videoSource,
        type: "video/mp4",
      },
    ],
  };

  return (
    <>
      <VideoPlayer options={videoJsOptions} />
    </>
  );
};

export default Page;
