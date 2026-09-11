import { defineConfig, devices } from "@playwright/test";

/**
 * Runs against the real Cloudflare Workers runtime (wrangler dev), not
 * `next dev` — real D1, real R2, real JWT signing, matching how the rest
 * of this project has been verified all along. See DEPLOY.md for the
 * local D1/R2 setup this expects (migrations applied, .dev.vars present).
 *
 * Uses the system-installed Chrome (channel: "chrome") rather than
 * Playwright's own bundled Chromium, since this environment can't reach
 * the Playwright CDN to download browser binaries — see TESTING.md.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false, // shared D1/R2 state — tests build their own unique data instead of isolating per-worker
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  globalSetup: "./tests/global-setup.ts",
  use: {
    baseURL: "http://127.0.0.1:8788",
    trace: "retain-on-failure",
    storageState: "./tests/.auth/admin.json",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
  ],
  // No `webServer` block: starting `wrangler dev` needs a shell-specific
  // build+run sequence (see TESTING.md) that isn't portable across the
  // shells Playwright's own process spawner would use here. Start it
  // yourself first (`npm run cf:build && npx wrangler dev --port 8788`),
  // then run `npx playwright test` against it — exactly how every phase
  // in this project has been verified all along.
});
