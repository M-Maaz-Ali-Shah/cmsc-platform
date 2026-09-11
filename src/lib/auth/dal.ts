import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { getSessionFromCookies, type Role, type SessionPayload } from "./session";
import { getDb, schema } from "@/db/client";

/**
 * Verifies the session cookie only (no DB round-trip). Use for quick
 * "am I logged in" checks. Does NOT confirm the account is still active —
 * use getCurrentUser() before anything sensitive.
 */
export const verifySession = cache(async (): Promise<SessionPayload | null> => {
  return getSessionFromCookies();
});

/**
 * Verifies the session AND re-checks the user against the database
 * (still active, role unchanged). Redirects to /admin/login if invalid.
 * Memoized per request via React's cache().
 */
export const requireUser = cache(async (allowedRoles?: Role[]) => {
  const session = await verifySession();
  if (!session) {
    // Genuinely no cookie / a bad signature — plain /admin/login is fine,
    // proxy.ts's own cookie-only check will already have caught this for
    // any dashboard route, so this branch is normally unreachable there.
    redirect("/admin/login");
  }

  const db = await getDb();
  const rows = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, session.userId))
    .limit(1);
  const user = rows[0];

  // These two checks can be true even though the JWT's *signature* is
  // still perfectly valid (deactivated since login, or a password reset
  // bumped sessionVersion) — proxy.ts's cookie-only check can't tell the
  // difference and would otherwise bounce straight back to /admin/dashboard,
  // looping forever. Route through /admin/session-expired, a Route Handler
  // that can actually clear the stale cookie (a Server Component can't).
  if (!user || !user.active) {
    redirect("/admin/session-expired");
  }

  // A password reset bumps users.sessionVersion — any JWT issued before
  // that (which carries the old version) is rejected here even though the
  // signature itself is still valid, effectively logging out other
  // sessions. (session?.sessionVersion ?? 0) covers tokens issued before
  // this field existed.
  if ((session.sessionVersion ?? 0) !== user.sessionVersion) {
    redirect("/admin/session-expired");
  }

  if (allowedRoles && !allowedRoles.includes(user.role as Role)) {
    redirect("/admin/dashboard");
  }

  return user;
});

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  committee_admin: "Committee Admin",
  reviewer: "Reviewer",
  regional_rep: "Regional Representative",
  observer: "Observer",
};
