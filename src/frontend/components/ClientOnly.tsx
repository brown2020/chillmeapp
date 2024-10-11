"use client";

import React from "react";
import { HMSRoomProvider } from "@100mslive/react-sdk";

export const ClientOnly: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <HMSRoomProvider>{children}</HMSRoomProvider>;
};
