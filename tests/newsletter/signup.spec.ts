import { test, expect } from "@playwright/test";
import { queryD1 } from "../helpers/d1";

test.use({ storageState: { cookies: [], origins: [] } });

// A full confirm/unsubscribe round trip needs the real token emailed to
// the subscriber — this project has no test-inbox/email-capture
// mechanism (Resend isn't configured in this environment by design), so
// that part of the flow was verified manually during development (see
// the Phase 7 commit message) rather than here. What IS covered:
// signup creates a pending row, duplicate signup doesn't create a second
// one, and invalid input is rejected.

test("signing up creates a pending (unconfirmed) subscription", async ({ page }) => {
  const email = `pw-newsletter-${Date.now()}@example.test`;
  await page.goto("/");
  await page.getByPlaceholder("you@example.com").fill(email);
  await page.getByRole("button", { name: "Get Updates" }).click();

  await expect(page.getByText("check your inbox to confirm", { exact: false })).toBeVisible();

  const rows = await queryD1(`SELECT confirmed FROM subscribers WHERE email = '${email}'`);
  expect(rows).toHaveLength(1);
  expect(rows[0].confirmed).toBe(0);
});

test("signing up twice with the same email does not create a duplicate row", async ({ page }) => {
  const email = `pw-newsletter-dupe-${Date.now()}@example.test`;

  for (let i = 0; i < 2; i++) {
    await page.goto("/");
    await page.getByPlaceholder("you@example.com").fill(email);
    await page.getByRole("button", { name: "Get Updates" }).click();
    await expect(page.getByText("check your inbox to confirm", { exact: false })).toBeVisible();
  }

  const rows = await queryD1(`SELECT id FROM subscribers WHERE email = '${email}'`);
  expect(rows).toHaveLength(1);
});

test("an invalid email address is rejected", async ({ page }) => {
  await page.goto("/");
  const input = page.getByPlaceholder("you@example.com");
  await input.fill("not-an-email");
  await page.getByRole("button", { name: "Get Updates" }).click();
  // Native type="email" validation blocks submission client-side.
  await expect(page.getByText("check your inbox to confirm", { exact: false })).not.toBeVisible();
});
