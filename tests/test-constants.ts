/**
 * Fixed test-only credentials. This suite is meant to run against a
 * throwaway local/CI D1 instance (see TESTING.md) — never point it at a
 * real production database, since global-setup will actually create this
 * account there if one doesn't already exist.
 */
// Overridable via env so this suite can adopt whichever admin account
// already exists on the target D1 (the setup flow refuses to create a
// second super_admin — see global-setup.ts) instead of only working
// against a completely empty database.
export const TEST_ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || "playwright-admin@example.test";
export const TEST_ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || "PlaywrightTestPassword123!";
export const TEST_ADMIN_NAME = "Playwright Test Admin";

/** Reads ADMIN_SETUP_TOKEN from the environment, falling back to parsing
 * .dev.vars directly — Playwright's Node process doesn't inherit wrangler's
 * own env loading. */
export async function getAdminSetupToken(): Promise<string> {
  if (process.env.ADMIN_SETUP_TOKEN) return process.env.ADMIN_SETUP_TOKEN;

  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  try {
    const raw = await fs.readFile(path.join(process.cwd(), ".dev.vars"), "utf8");
    const match = raw.match(/^ADMIN_SETUP_TOKEN=(.*)$/m);
    if (match) return match[1].trim();
  } catch {
    // .dev.vars not present — fall through to the error below.
  }
  throw new Error(
    "ADMIN_SETUP_TOKEN not found in the environment or .dev.vars. Copy .dev.vars.example to .dev.vars first."
  );
}
