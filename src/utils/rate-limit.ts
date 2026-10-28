export class RateLimitError extends Error {
  constructor(message = "Too many attempts. Try again later.") {
    super(message);
    this.name = "RateLimitError";
  }
}

const hits = new Map<string, number[]>();

export function resetRateLimits(): void {
  hits.clear();
}

/** Best-effort limiter. Each server instance keeps its own window. */
export function assertWithinRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): void {
  const recent = (hits.get(key) ?? []).filter(
    (timestamp) => now - timestamp < windowMs,
  );
  if (recent.length >= limit) {
    hits.set(key, recent);
    throw new RateLimitError();
  }
  recent.push(now);
  hits.set(key, recent);
}
