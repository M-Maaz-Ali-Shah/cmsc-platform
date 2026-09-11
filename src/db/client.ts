import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "./schema";

/**
 * Returns a Drizzle client bound to the app's D1 database.
 * Call this inside server actions / route handlers only.
 */
export async function getDb() {
  const { env } = await getCloudflareContext({ async: true });
  return drizzle(env.DB, { schema });
}

/** Returns the full Cloudflare env (for R2, vars, secrets) alongside the db. */
export async function getCf() {
  const ctx = await getCloudflareContext({ async: true });
  return ctx;
}

export { schema };
