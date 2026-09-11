import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth/session";

/**
 * Clears a stale session cookie and redirects to login. Exists because a
 * Server Component (where requireUser() runs) cannot itself mutate
 * cookies — only a Server Action or Route Handler can — and redirecting
 * straight to /admin/login without clearing the cookie first creates a
 * loop: proxy.ts's cookie-only check still sees a validly-*signed* JWT
 * (its signature is fine; only its embedded sessionVersion is stale, or
 * the user has since been deactivated) and bounces the request straight
 * back to /admin/dashboard, which redirects to login again, forever.
 */
export async function GET(req: Request) {
  await deleteSession();
  return NextResponse.redirect(new URL("/admin/login", req.url));
}
