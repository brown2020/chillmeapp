"use client";
import { useEffect, useRef } from "react";
import { useAuth } from "@/frontend/hooks";
import { Loader2 } from "lucide-react";

const Signout = () => {
  const { setLoggedOutState } = useAuth();
  const logoutStarted = useRef(false);

  useEffect(() => {
    if (logoutStarted.current) return;
    logoutStarted.current = true;

    const performLogout = async () => {
      try {
        await setLoggedOutState();
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (error) {
        console.warn(
          "[auth] sign-out:",
          error instanceof Error ? error.message : "unknown",
        );
      } finally {
        window.location.replace("/auth/signin");
      }
    };

    void performLogout();
    // Run once — setLoggedOutState identity changes each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
