/**
 * Small in-memory rate limiter for the API routes that cost us something per
 * call (the ML embedding service, the ESV API on our key).
 *
 * Fixed window per key. On Vercel each function instance keeps its own map,
 * so the limit is per instance rather than global — that's fine here, the
 * point is to stop one client hammering a route in a loop, not to meter
 * usage precisely.
 */

type Window = { count: number; resetAt: number };

const buckets = new Map<string, Window>();

// Don't let the map grow forever on a long-lived instance.
const MAX_KEYS = 5000;

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  /** seconds until the window resets — goes in Retry-After */
  retryAfter: number;
};

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now()
): RateLimitResult {
  let w = buckets.get(key);
  if (!w || w.resetAt <= now) {
    if (buckets.size >= MAX_KEYS) sweep(now);
    w = { count: 0, resetAt: now + windowMs };
    buckets.set(key, w);
  }
  w.count++;
  const retryAfter = Math.max(1, Math.ceil((w.resetAt - now) / 1000));
  return {
    ok: w.count <= limit,
    remaining: Math.max(0, limit - w.count),
    retryAfter,
  };
}

function sweep(now: number) {
  for (const [k, w] of buckets) {
    if (w.resetAt <= now) buckets.delete(k);
  }
  // Still full of live windows — drop the oldest half rather than refuse.
  if (buckets.size >= MAX_KEYS) {
    let n = 0;
    for (const k of buckets.keys()) {
      buckets.delete(k);
      if (++n >= MAX_KEYS / 2) break;
    }
  }
}

/** Client address from the proxy headers Vercel sets, else "unknown". */
export function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** The 429 body + headers every limited route sends. */
export function tooManyRequests(r: RateLimitResult): Response {
  return Response.json(
    { error: "too many requests — slow down a little" },
    {
      status: 429,
      headers: { "Retry-After": String(r.retryAfter), "Cache-Control": "no-store" },
    }
  );
}

/** Test helper. */
export function _resetRateLimits() {
  buckets.clear();
}
