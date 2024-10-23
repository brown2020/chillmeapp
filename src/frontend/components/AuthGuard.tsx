"use client";
import { useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

const AuthGuard: React.FC<{ children: React.ReactNode | null }> = ({
  children,
}) => {
  const router = useRouter();
  const routePath = usePathname();
  const { checkAuthState, isAuthenticating, user } = useAuth();

  const isUnprotectedRoute = useMemo(
    () => routePath.includes("signin") || routePath.includes("signup"),
    [routePath],
  );

  useEffect(() => {
    const unsubscribe = checkAuthState();
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log("Hook updated");
    if (!isAuthenticating) {
      if (user?.uid && isUnprotectedRoute) {
        router.replace("/live"); // Redirect logged-in users from unprotected route
      } else if (!user?.uid && !isUnprotectedRoute) {
        router.replace("/auth/signin"); // Redirect guests from protected routes
      }
    }
  }, [isAuthenticating, user, isUnprotectedRoute, router]);

  if (isAuthenticating) {
    return <h1>Loading user...</h1>;
  }

  // Render children only if user state and route permissions are valid
  if (
    (user?.uid && !isUnprotectedRoute) ||
    (!user?.uid && isUnprotectedRoute)
  ) {
    return <>{children}</>;
  }

  // Return null during redirect to avoid unnecessary render flicker
  return null;
};

export default AuthGuard;
