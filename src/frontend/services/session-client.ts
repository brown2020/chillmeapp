async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 8000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function syncSessionCookie(idToken: string): Promise<void> {
  const response = await fetchWithTimeout("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error("Failed to sync session cookie");
  }
}

export async function clearSessionCookie(): Promise<void> {
  try {
    await fetchWithTimeout("/api/auth/session", {
      method: "DELETE",
      credentials: "same-origin",
    });
  } catch (error) {
    console.warn(
      "[auth] session-clear:",
      error instanceof Error ? error.name : "unknown",
    );
  }
}
