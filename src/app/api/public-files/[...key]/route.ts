import { NextResponse } from "next/server";

import { getCf } from "@/db/client";

// Prefixes that are safe to expose without authentication — content that is
// meant to be public once attached to a published announcement. Everything
// else in the UPLOADS bucket (sighting-report photos, evidence, etc.) stays
// behind /api/files, which requires an admin session.
const PUBLIC_PREFIXES = ["announcements/", "committee/", "documents/", "media/"];

export async function GET(_req: Request, ctx: RouteContext<"/api/public-files/[...key]">) {
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

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=3600");

  return new Response(object.body, { headers });
}
