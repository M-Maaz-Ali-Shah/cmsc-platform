import "server-only";

import { eq, sql } from "drizzle-orm";

import { getDb, schema } from "@/db/client";
import { getClientIp } from "@/lib/request-ip";

export type RateLimitBucket = "auth" | "forms";

const LIMITS: Record<RateLimitBucket, { limit: number; periodSeconds: number }> = {
  // Login attempts, keyed by "auth:login:<email>" — guards against
  // credential-stuffing / brute force on a specific account.
  auth: { limit: 5, periodSeconds: 60 },
  // Public form submissions (sighting reports, contact, newsletter),
  // keyed by "forms:<action>:<ip>".
  forms: { limit: 5, periodSeconds: 60 },
};

/**
 * Fixed-window rate limiter backed by D1 (see the `rate_limit_buckets`
 * table in src/db/schema.ts).
 *
 * This is D1-backed rather than using Cloudflare's native Workers
 * "ratelimits" binding (Durable Object-backed) because that binding was
 * verified, via a minimal reproduction during development, to NOT persist
 * state across separate Next.js Server Action invocations under the
 * OpenNext Cloudflare adapter + wrangler dev — every request appeared to
 * start a fresh counter, so it never actually enforced anything. It worked
 * correctly from plain Route Handlers, just not Server Actions, which is
 * what every rate-limited entry point in this app is. D1 is already proven
 * reliable from Server Actions throughout this app, so this reuses it
 * instead of introducing a binding that silently doesn't work here.
 */
export async function checkRateLimit(
  bucket: RateLimitBucket,
  identity: string
): Promise<{ allowed: boolean }> {
  const { limit, periodSeconds } = LIMITS[bucket];
  const key = `${bucket}:${identity}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - (now % periodSeconds);

  const db = await getDb();

  try {
    // Atomic upsert: start a fresh window (count=1) unless the existing row
    // is already in the *current* window, in which case increment it.
    await db
      .insert(schema.rateLimitBuckets)
      .values({ key, windowStart, count: 1 })
      .onConflictDoUpdate({
        target: schema.rateLimitBuckets.key,
        set: {
          windowStart,
          count: sql`CASE WHEN ${schema.rateLimitBuckets.windowStart} = ${windowStart} THEN ${schema.rateLimitBuckets.count} + 1 ELSE 1 END`,
        },
      });

    const rows = await db
      .select({ count: schema.rateLimitBuckets.count })
      .from(schema.rateLimitBuckets)
      .where(eq(schema.rateLimitBuckets.key, key))
      .limit(1);
    const count = rows[0]?.count ?? 1;

    // Opportunistic cleanup of stale buckets so the table doesn't grow
    // unbounded — cheap, best-effort, run on a small fraction of requests.
    if (Math.random() < 0.02) {
      const staleBefore = windowStart - periodSeconds;
      db.run(sql`DELETE FROM rate_limit_buckets WHERE window_start < ${staleBefore}`).catch(() => {});
    }

    return { allowed: count <= limit };
  } catch (err) {
    console.error(`[rate-limit] check failed for "${key}" — allowing request:`, err);
    return { allowed: true };
  }
}

/** Convenience helper: rate-limit by client IP under a given action name. */
export async function checkRateLimitByIp(
  bucket: RateLimitBucket,
  action: string
): Promise<{ allowed: boolean }> {
  const ip = await getClientIp();
  return checkRateLimit(bucket, `${action}:${ip}`);
}

export const RATE_LIMIT_MESSAGE = "Too many requests. Please wait a minute and try again.";
