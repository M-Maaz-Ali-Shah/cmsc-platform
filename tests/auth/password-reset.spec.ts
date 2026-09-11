import { test, expect } from "@playwright/test";
import { TEST_ADMIN_EMAIL } from "../test-constants";

// See TESTING.md — a full "receive the email, extract the token,
// complete the reset" round trip needs a test-inbox/email-capture
// mechanism this project doesn't have (Resend isn't configured in this
// environment, by design — see .dev.vars.example). What's covered here
// is everything observable without reading an email: the account-
// enumeration protection, and the invalid/expired-token rejection path.
test.use({ storageState: { cookies: [], origins: [] } });

const GENERIC_MESSAGE = "If an account exists with that email address, a password reset link has been sent.";

test("requesting a reset for a real account shows the generic message", async ({ page }) => {
  await page.goto("/admin/forgot-password");
  await page.getByLabel("Email address").fill(TEST_ADMIN_EMAIL);
  await page.getByRole("button", { name: "Send Reset Link" }).click();
  await expect(page.getByText(GENERIC_MESSAGE)).toBeVisible();
});

test("requesting a reset for an unknown email shows the exact same message (no account enumeration)", async ({
  page,
}) => {
  await page.goto("/admin/forgot-password");
  await page.getByLabel("Email address").fill("nobody-at-all@example.test");
  await page.getByRole("button", { name: "Send Reset Link" }).click();
  await expect(page.getByText(GENERIC_MESSAGE)).toBeVisible();
});

test("an invalid/garbage reset token is rejected with a generic error", async ({ page }) => {
  await page.goto("/admin/reset-password?token=this-token-was-never-issued-by-the-app");
  // "New password" is itself a substring of "Confirm new password", so
  // getByLabel is ambiguous here — the real input ids are stable and unambiguous.
  await page.locator("#rp-password").fill("SomeNewPassword123!");
  await page.locator("#rp-confirm").fill("SomeNewPassword123!");
  await page.getByRole("button", { name: "Reset Password" }).click();

  await expect(page.getByText("This reset link is invalid or has expired.", { exact: false })).toBeVisible();
});

test("mismatched password/confirmation is rejected before hitting the server logic", async ({ page }) => {
  await page.goto("/admin/reset-password?token=irrelevant-for-this-check");
  await page.locator("#rp-password").fill("FirstPassword123!");
  await page.locator("#rp-confirm").fill("DifferentPassword456!");
  await page.getByRole("button", { name: "Reset Password" }).click();

  await expect(page.getByText("Passwords do not match.")).toBeVisible();
});

test("missing token shows a helpful message instead of a broken form", async ({ page }) => {
  await page.goto("/admin/reset-password");
  await expect(page.getByText("Missing reset token.", { exact: false })).toBeVisible();
});
