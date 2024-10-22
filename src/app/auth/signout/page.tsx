"use client";
import { useEffect } from "react";
import { useAuth } from "@/frontend/hooks";

const Signout = () => {
  const { setLoggedOutState } = useAuth();

  useEffect(() => {
    setLoggedOutState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default Signout;
