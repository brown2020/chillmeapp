import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/backend/lib/firebase";
import { createSessionCookie } from "@/backend/services/server-auth";
import { getSessionCookieName } from "@/utils/auth-routes";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 5,
};

export async function POST(request: NextRequest) {
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

export async function DELETE() {
  const response = NextResponse.json({ status: "ok" });
  response.cookies.set(getSessionCookieName(), "", {
    ...cookieOptions,
    maxAge: 0,
  });
  return response;
}
