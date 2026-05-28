import { cookies } from "next/headers";
import { adminAuth } from "@/backend/lib/firebase";
import { getSessionCookieName } from "@/utils/auth-routes";

const SESSION_MAX_AGE_MS = 60 * 60 * 24 * 5 * 1000;

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export async function requireServerUser(): Promise<{ uid: string }> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(getSessionCookieName())?.value;

  if (!sessionCookie) {
    throw new UnauthorizedError();
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return { uid: decoded.uid };
  } catch {
    throw new UnauthorizedError("Invalid session");
  }
}

export async function createSessionCookie(idToken: string): Promise<string> {
  return adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_MAX_AGE_MS,
  });
}

export async function verifySessionCookieValue(
  sessionCookie: string,
): Promise<{ uid: string } | null> {
  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return { uid: decoded.uid };
  } catch {
    return null;
  }
}
