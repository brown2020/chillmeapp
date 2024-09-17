"use client";

import React, { useEffect, useState } from "react";
import { HMSRoomProvider } from "@100mslive/react-sdk";

export const ClientOnly: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set to true only after the component has mounted in the browser
    setIsClient(true);
  }, []);

  // Render nothing on the server, only render after client-side check is true
  if (!isClient) {
    return null;
  }

  return <HMSRoomProvider>{children}</HMSRoomProvider>;
};
