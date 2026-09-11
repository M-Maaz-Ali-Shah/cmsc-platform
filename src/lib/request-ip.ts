import "server-only";

import { headers } from "next/headers";

/**
 * Best-effort client IP for rate-limiting/audit purposes only — never use
 * this for authorization decisions. On Cloudflare, `CF-Connecting-IP` is
 * set by the edge and cannot be spoofed by the client; we fall back to
 * `X-Forwarded-For` for local `next dev`/`next start` previews where that
 * header isn't present.
 */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const cf = h.get("cf-connecting-ip");
  if (cf) return cf;
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return "unknown";
}
