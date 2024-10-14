"use client";

import React from "react";

import JoinForm from "@/frontend/components/JoinForm";
import LayoutWrapper from "@/frontend/components/LayoutWrapper";

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
