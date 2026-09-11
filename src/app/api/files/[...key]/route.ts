import { NextResponse } from "next/server";

import { getCf } from "@/db/client";
import { verifySession } from "@/lib/auth/dal";

/**
 * Streams a private object out of the R2 UPLOADS bucket (sighting-report
 * photos/evidence, and later documents/media). Admin-only — these are not
 * public URLs. Uses the cookie-only session check (verifySession) rather
 * than requireUser() since a redirect() here would be the wrong UX for an
 * <img>/<a> request; an invalid/missing session just gets a 401/404.
 */
export async function GET(_req: Request, ctx: RouteContext<"/api/files/[...key]">) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key: keySegments } = await ctx.params;
  if (!keySegments || keySegments.length === 0 || keySegments.some((s) => s === ".." || s === ".")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const key = keySegments.join("/");

  const { env } = await getCf();
  const object = await env.UPLOADS.get(key);
  if (!object) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "private, max-age=300");

  return new Response(object.body, { headers });
}
