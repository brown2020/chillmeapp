"use client";
import { useEffect } from "react";
import { useAuth } from "@/frontend/hooks";
import { Loader2 } from "lucide-react";

const Signout = () => {
  const { setLoggedOutState } = useAuth();

  useEffect(() => {
    let cancelled = false;
    const performLogout = async () => {
      try {
        await Promise.race([
          setLoggedOutState(),
          new Promise((resolve) => setTimeout(resolve, 5000)),
        ]);
      } catch (error) {
        console.warn(
          "[auth] sign-out:",
          error instanceof Error ? error.message : "unknown",
        );
      } finally {
        if (!cancelled) {
          window.location.replace("/auth/signin");
        }
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
