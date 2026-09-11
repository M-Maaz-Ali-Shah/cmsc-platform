import { NextResponse } from "next/server";

import { getCf } from "@/db/client";

// Prefixes that are safe to expose without authentication — content that is
// meant to be public once attached to a published announcement. Everything
// else in the UPLOADS bucket (sighting-report photos, evidence, etc.) stays
// behind /api/files, which requires an admin session.
const PUBLIC_PREFIXES = ["announcements/", "committee/", "documents/", "media/"];

// Resizing is opt-in via ?w= and only ever applied here, on the public
// route — never on /api/files, which serves sighting-report evidence and
// must always return the untouched original. A fixed allowlist (rather
// than trusting an arbitrary client-supplied width) keeps the set of
// derivative sizes — and therefore Cloudflare's edge cache — small.
const ALLOWED_WIDTHS = [64, 128, 256, 512, 1024];
const RESIZABLE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function GET(req: Request, ctx: RouteContext<"/api/public-files/[...key]">) {
  const { key: keySegments } = await ctx.params;
  if (!keySegments || keySegments.length === 0 || keySegments.some((s) => s === ".." || s === ".")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const key = keySegments.join("/");

  if (!PUBLIC_PREFIXES.some((prefix) => key.startsWith(prefix))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { env } = await getCf();
  const object = await env.UPLOADS.get(key);
  if (!object) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const contentType = object.httpMetadata?.contentType ?? "";
  const requestedWidth = Number(new URL(req.url).searchParams.get("w"));
  const canResize = RESIZABLE_TYPES.has(contentType) && ALLOWED_WIDTHS.includes(requestedWidth);

  // Object keys already embed a random id per upload (see the actions
  // that write them — sighting-reports.ts, documents.ts, media.ts,
  // committee.ts), so a given key's content never changes; safe to mark
  // immutable rather than just a max-age.
  const cacheControl = "public, max-age=31536000, immutable";

  // Buffer once so both the transform attempt and a fallback on failure
  // have their own fresh ReadableStream — object.body itself can only be
  // read once, so reusing it after a failed/partial transform read would
  // hand the fallback response a dead stream.
  const bytes = await object.arrayBuffer();

  if (canResize) {
    try {
      const result = await env.IMAGES.input(new Response(bytes).body!)
        .transform({ width: requestedWidth, fit: "scale-down" })
        .output({ format: contentType as "image/jpeg" | "image/png" | "image/webp" });
      return result.response({ headers: { "cache-control": cacheControl } });
    } catch (err) {
      // Fall through to the original on any transform failure (e.g. a
      // corrupt/unsupported file some old upload path let through) —
      // serving the original is always better than a broken image.
      console.error("[public-files] image transform failed, serving original:", err);
    }
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", cacheControl);

  return new Response(bytes, { headers });
}
