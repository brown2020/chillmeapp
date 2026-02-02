"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@frontend/zustand/useAuthStore";

const PUBLIC_ROUTES = [
  "/",
  "/auth/signin",
  "/auth/signup",
  "/auth/signout",
  "/auth/forgot-password",
  "/auth/verify-email",
  "/terms",
  "/privacy",
];

// Timeout to prevent infinite loading if Firebase doesn't respond
const AUTH_TIMEOUT_MS = 5000;

const AuthGuard: React.FC<{ children: React.ReactNode | null }> = ({
  children,
}) => {
  const router = useRouter();
  const routePath = usePathname();
  const { checkAuthState, isAuthenticating, user } = useAuth();
  const setIsAuthenticating = useAuthStore(
    (state) => state.setIsAuthenticating,
  );
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Simplified - no need for useMemo for simple checks
  const isPublicRoute = PUBLIC_ROUTES.includes(routePath);
  const isAuthRoute = routePath.startsWith("/auth/");

  useEffect(() => {
    const unsubscribe = checkAuthState();

    // Set a timeout to stop waiting for auth if it takes too long
    timeoutRef.current = setTimeout(() => {
      console.warn("Auth timeout - Firebase did not respond in time");
      setIsAuthenticating(false);
    }, AUTH_TIMEOUT_MS);

    return () => {
      unsubscribe();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clear timeout when auth completes to prevent it from firing after auth is done
  useEffect(() => {
    if (!isAuthenticating && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [isAuthenticating]);

  useEffect(() => {
    if (!isAuthenticating) {
      if (user?.uid && isAuthRoute) {
        router.replace("/live");
      } else if (!user?.uid && !isPublicRoute) {
        router.replace("/auth/signin");
      }
    }
  }, [isAuthenticating, user, isPublicRoute, isAuthRoute, router]);

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

  // Allow public routes for everyone
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Allow authenticated users on protected routes
  if (user?.uid) {
    return <>{children}</>;
  }

  // Return null during redirect
  return null;
};

export default AuthGuard;
