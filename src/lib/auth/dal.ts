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
    redirect("/admin/login");
  }

  const db = await getDb();
  const rows = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, session.userId))
    .limit(1);
  const user = rows[0];

  if (!user || !user.active) {
    redirect("/admin/login");
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
