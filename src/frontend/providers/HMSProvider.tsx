"use client";

import * as React from "react";
import { HMSRoomProvider } from "@100mslive/react-sdk";

export function HMSProvider({
  children,
  ...props
}: {
  children: React.ReactNode;
}) {
  return <HMSRoomProvider {...props}>{children}</HMSRoomProvider>;
}
