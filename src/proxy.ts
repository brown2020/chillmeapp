import { NextRequest, NextResponse } from "next/server";
import { verifySessionCookieValue } from "@/backend/services/server-auth";
import {
  buildSignInUrl,
  getSessionCookieName,
  isAuthRoute,
  isProtectedRoute,
  isPublicApiRoute,
  isPublicRoute,
  normalizePathname,
} from "@/utils/auth-routes";

function shouldSkipProxy(pathname: string): boolean {
  return (
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|woff2?)$/i.test(pathname)
  );
}

export async function proxy(request: NextRequest) {
  const pathname = normalizePathname(request.nextUrl.pathname);

  if (shouldSkipProxy(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    if (isPublicApiRoute(pathname)) {
      return NextResponse.next();
    }

    const sessionCookie = request.cookies.get(getSessionCookieName())?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await verifySessionCookieValue(sessionCookie);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(getSessionCookieName())?.value;
  const session = sessionCookie
    ? await verifySessionCookieValue(sessionCookie)
    : null;
  const isAuthenticated = Boolean(session);

  if (isPublicRoute(pathname)) {
    if (
      isAuthenticated &&
      isAuthRoute(pathname) &&
      pathname !== "/auth/signout"
    ) {
      return NextResponse.redirect(new URL("/live", request.url));
    }

    return NextResponse.next();
  }

  if (isProtectedRoute(pathname)) {
    if (!isAuthenticated) {
      const signInUrl = buildSignInUrl(request.url, pathname);
      const response = NextResponse.redirect(signInUrl);
      if (sessionCookie && !session) {
        response.cookies.set(getSessionCookieName(), "", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 0,
        });
      }
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
