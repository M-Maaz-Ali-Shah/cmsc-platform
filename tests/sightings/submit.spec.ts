import { test, expect } from "@playwright/test";
import { queryD1 } from "../helpers/d1";

test.use({ storageState: { cookies: [], origins: [] } });

async function fillValidReport(page: import("@playwright/test").Page, email: string) {
  await page.goto("/report-sighting");
  await page.getByLabel("Full Name").fill("Playwright Test Observer");
  await page.getByLabel("Country").selectOption({ index: 1 });
  await page.getByLabel("City / Town").fill("Testville");
  await page.getByLabel("Region").fill("Test Region");
  await page.getByRole("textbox", { name: "Email" }).fill(email);
  await page.getByLabel("Observation date").fill("2026-08-19");
  await page.getByLabel("Observation time").fill("21:15");
  await page.getByLabel("Observation location").fill("Hilltop east of Testville");
  await page.getByLabel("Weather conditions").selectOption("Clear");
  await page.getByLabel("Visibility conditions").selectOption("Good");
  await page.getByLabel("Yes").check();
  await page.getByLabel("Method of observation").selectOption("Naked eye");
  await page.getByLabel(/confirm that the information provided/).check();
}

test("a valid submission succeeds and returns a report reference", async ({ page }) => {
  const email = `pw-sighting-${Date.now()}@example.test`;
  await fillValidReport(page, email);
  await page.getByRole("button", { name: /Submit/i }).click();

  await expect(page.getByText(/CMS-\d{4}-\d{6}/)).toBeVisible({ timeout: 15_000 });

  const rows = await queryD1(`SELECT report_ref, status FROM sighting_reports WHERE email = '${email}'`);
  expect(rows).toHaveLength(1);
  expect(rows[0].status).toBe("Submitted");
});

test("the honeypot field silently rejects a submission without creating a row", async ({ page }) => {
  const email = `pw-honeypot-${Date.now()}@example.test`;
  await fillValidReport(page, email);
  // The honeypot input is visually hidden but present in the DOM for bots
  // that fill every field — see sighting-report-form.tsx.
  await page.locator('input[name="website"]').fill("http://spambot.example");
  await page.getByRole("button", { name: /Submit/i }).click();

  await expect(page.getByText("Submission could not be processed", { exact: false })).toBeVisible();

  const rows = await queryD1(`SELECT id FROM sighting_reports WHERE email = '${email}'`);
  expect(rows).toHaveLength(0);
});

test("missing required fields are rejected client-side before any submission", async ({ page }) => {
  await page.goto("/report-sighting");
  await page.getByRole("button", { name: /Submit/i }).click();
  // Native HTML5 validation blocks the submit — still on the same page,
  // no success/error banner from the server yet.
  await expect(page).toHaveURL(/\/report-sighting/);
  await expect(page.getByText(/CMS-\d{4}-\d{6}/)).not.toBeVisible();
});
