import { chromium, type FullConfig } from "@playwright/test";
import { TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD, TEST_ADMIN_NAME, getAdminSetupToken } from "./test-constants";

/**
 * Ensures a known test Super Admin account exists (creating it via the
 * real /admin/setup bootstrap flow if this is a fresh D1), then saves an
 * authenticated storage state that every test in this suite reuses —
 * standard Playwright pattern for "log in once, reuse everywhere" rather
 * than re-logging in inside every single test.
 */
export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL ?? "http://127.0.0.1:8788";
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage();

  // Try logging in first — if this test admin already exists from a
  // previous run against a persistent local D1, don't try to create it
  // again (the setup flow correctly refuses once any super_admin exists).
  await page.goto(`${baseURL}/admin/login`);
  await page.getByLabel("Email address").fill(TEST_ADMIN_EMAIL);
  await page.getByLabel("Password").fill(TEST_ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Sign In" }).click();

  const loggedIn = await page
    .waitForURL(`${baseURL}/admin/dashboard`, { timeout: 5_000 })
    .then(() => true)
    .catch(() => false);

  if (!loggedIn) {
    const token = await getAdminSetupToken();
    await page.goto(`${baseURL}/admin/setup?token=${token}`);

    // A super_admin might already exist (just not with our test email) —
    // the setup page then shows an error state instead of the form.
    const hasForm = await page.getByLabel("Full name").isVisible().catch(() => false);
    if (!hasForm) {
      throw new Error(
        "Could not log in as the test admin, and /admin/setup refused to create one (a different super_admin already exists). " +
          "Run this suite against a fresh local D1 — see TESTING.md."
      );
    }

    await page.getByLabel("Full name").fill(TEST_ADMIN_NAME);
    await page.getByLabel("Email address").fill(TEST_ADMIN_EMAIL);
    await page.getByLabel("Password").fill(TEST_ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Create Super Admin account" }).click();
    await page.waitForURL(`${baseURL}/admin/dashboard`, { timeout: 10_000 });
  }

  await page.context().storageState({ path: "tests/.auth/admin.json" });
  await browser.close();
}
