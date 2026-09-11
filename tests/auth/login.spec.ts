import { test, expect } from "@playwright/test";
import { TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD } from "../test-constants";

// These specifically test the unauthenticated login form, so they must
// not reuse the suite's default logged-in storage state.
test.use({ storageState: { cookies: [], origins: [] } });

test("valid credentials sign in and land on the dashboard", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email address").fill(TEST_ADMIN_EMAIL);
  await page.getByLabel("Password").fill(TEST_ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  await expect(page.getByText("TODAY'S REPORTS", { exact: false })).toBeVisible();
});

test("wrong password shows a generic error, not 'wrong password'", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email address").fill(TEST_ADMIN_EMAIL);
  await page.getByLabel("Password").fill("definitely-not-the-right-password");
  await page.getByRole("button", { name: "Sign In" }).click();

  // Generic message — never confirms the account exists.
  await expect(page.getByText("Incorrect email or password.")).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("unknown email shows the exact same generic error", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email address").fill("nobody-with-this-email@example.test");
  await page.getByLabel("Password").fill("whatever-password");
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page.getByText("Incorrect email or password.")).toBeVisible();
});
