import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/backend/lib/firebase";
import {
  createSessionCookie,
  revokeSessionCookie,
} from "@/backend/services/server-auth";
import { getSessionCookieName, isSameOriginRequest } from "@/utils/auth-routes";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 5,
};

function rejectCrossOrigin(request: NextRequest) {
  if (
    !isSameOriginRequest(request.headers.get("origin"), request.nextUrl.origin)
  ) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  return null;
}

export async function POST(request: NextRequest) {
  const originError = rejectCrossOrigin(request);
  if (originError) return originError;

  try {
    const body = (await request.json()) as { idToken?: string };
    const idToken = body.idToken;

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    await adminAuth.verifyIdToken(idToken);
    const sessionCookie = await createSessionCookie(idToken);
    const response = NextResponse.json({ status: "ok" });
    response.cookies.set(getSessionCookieName(), sessionCookie, cookieOptions);
    return response;
  } catch (error) {
    console.error("Session creation failed:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(request: NextRequest) {
  const originError = rejectCrossOrigin(request);
  if (originError) return originError;

  const sessionCookie = request.cookies.get(getSessionCookieName())?.value;
  if (sessionCookie) {
    try {
      await revokeSessionCookie(sessionCookie);
    } catch (error) {
      console.error(
        "Session revoke failed:",
        error instanceof Error ? error.message : "unknown",
      );
    }
  }

  const response = NextResponse.json({ status: "ok" });
  response.cookies.set(getSessionCookieName(), "", {
    ...cookieOptions,
    maxAge: 0,
  });
  return response;
}
