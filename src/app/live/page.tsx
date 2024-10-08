"use client";

import React from "react";

import JoinForm from "@/components/JoinForm";
import LayoutWrapper from "@/components/LayoutWrapper";

export default function LiveMain() {
  return (
    <>
      <LayoutWrapper>
        <div className="camera-preview">
          <video autoPlay height={200} />
        </div>
        <JoinForm />
      </LayoutWrapper>
    </>
  );
}
