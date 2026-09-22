"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@frontend/zustand/useAuthStore";
import {
  isAuthRoute,
  isGuestJoinRoute,
  isPublicRoute,
  normalizePathname,
} from "@/utils/auth-routes";

const AUTH_TIMEOUT_MS = 5000;

function safeInternalPath(candidate: string | null, fallback: string): string {
  if (
    candidate &&
    candidate.startsWith("/") &&
    !candidate.startsWith("//") &&
    !candidate.includes("://")
  ) {
    return candidate;
  }
  return fallback;
}

const AuthGuard: React.FC<{ children: React.ReactNode | null }> = ({
  children,
}) => {
  const routePath = normalizePathname(usePathname());
  const searchParams = useSearchParams();
  const { checkAuthState, isAuthenticating, user } = useAuth();
  const setIsAuthenticating = useAuthStore(
    (state) => state.setIsAuthenticating,
  );
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isPublic = isPublicRoute(routePath) || isGuestJoinRoute(routePath);
  const isAuth = isAuthRoute(routePath);

  useEffect(() => {
    const unsubscribe = checkAuthState();

    timeoutRef.current = setTimeout(() => {
      setIsAuthenticating(false);
    }, AUTH_TIMEOUT_MS);

    return () => {
      unsubscribe();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // Mount-once: checkAuthState closes over stable store setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isAuthenticating && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [isAuthenticating]);

  useEffect(() => {
    if (isAuthenticating) return;

    if (user?.uid && isAuth && routePath !== "/auth/signout") {
      const next = safeInternalPath(searchParams.get("callbackUrl"), "/live");
      window.location.replace(next);
      return;
    }

    if (!user?.uid && !isPublic) {
      const signInUrl = `/auth/signin?callbackUrl=${encodeURIComponent(routePath)}`;
      window.location.replace(signInUrl);
    }
  }, [isAuthenticating, user, isPublic, isAuth, routePath, searchParams]);

  if (isAuthenticating) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isPublic) {
    return <>{children}</>;
  }

  if (user?.uid) {
    return <>{children}</>;
  }

  return null;
};

export default AuthGuard;
