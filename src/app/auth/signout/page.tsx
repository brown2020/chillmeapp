"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/frontend/hooks";
import { Loader2 } from "lucide-react";

const Signout = () => {
  const { setLoggedOutState } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      await setLoggedOutState();
      router.push("/auth/signin");
    };
    performLogout();
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
