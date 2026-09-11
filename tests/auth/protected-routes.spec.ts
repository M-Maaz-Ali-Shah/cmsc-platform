import { test, expect } from "@playwright/test";

test.describe("unauthenticated", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("visiting the dashboard redirects to login with a return path", async ({ page }) => {
    await page.goto("/admin/dashboard/reports");
    await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin%2Fdashboard%2Freports/);
  });

  test("visiting a nested admin page also redirects to login", async ({ page }) => {
    await page.goto("/admin/dashboard/settings");
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});

test("authenticated session reaches the dashboard directly", async ({ page }) => {
  // Uses the suite's default logged-in storage state (see global-setup.ts).
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  await expect(page.getByRole("link", { name: "Sighting Reports" })).toBeVisible();
});

test("an already-authenticated session visiting /admin/login bounces to the dashboard", async ({ page }) => {
  await page.goto("/admin/login");
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
});
