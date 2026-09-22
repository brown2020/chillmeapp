"use client";
import { useEffect } from "react";
import { useAuth } from "@/frontend/hooks";
import { Loader2 } from "lucide-react";

const Signout = () => {
  const { setLoggedOutState } = useAuth();

  useEffect(() => {
    let cancelled = false;
    const performLogout = async () => {
      await setLoggedOutState();
      if (!cancelled) {
        window.location.assign("/auth/signin");
      }
    };
    void performLogout();
    return () => {
      cancelled = true;
    };
  }, [setLoggedOutState]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Signing out...</p>
      </div>
    </div>
  );
};

export default Signout;
