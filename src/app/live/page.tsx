"use client";

import React from "react";

import CreateMeetingForm from "@/frontend/components/Forms/CreateMeetingForm";
import LayoutWrapper from "@/frontend/components/LayoutWrapper";
import BannerImgOne from "@frontend/assets/banner.png";
import Image from "next/image";

export default function LiveMain() {
  return (
    <>
      <LayoutWrapper>
        <div className="md:w grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-5 p-4 text-white camera-preview w-full">
            <CreateMeetingForm />
          </div>
          <div className="col-span-12 md:col-span-7 p-4 text-white text-center">
            <Image
              src={BannerImgOne}
              alt="meeting-image"
              className="w-full m-auto"
            />
            <h1 className="text-xl font-bold">Start a meeting real quick</h1>
          </div>
        </div>

        {/* <div className="flex flex-col md:flex-row w-full">
          <div className="camera-preview md:w-1/2">
            <video autoPlay height="{200}"></video>
            <JoinForm />
          </div>
          <div className="bg-green-500 p-4 md:w-1/2">Column 2</div>
        </div> */}
      </LayoutWrapper>
    </>
  );
}
