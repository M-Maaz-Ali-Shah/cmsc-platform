import { test, expect } from "@playwright/test";
import { queryD1 } from "../helpers/d1";

test.use({ storageState: { cookies: [], origins: [] } });

test("a valid message is stored and shows a success confirmation", async ({ page }) => {
  const email = `pw-contact-${Date.now()}@example.test`;
  await page.goto("/contact");
  await page.getByLabel("Full Name").fill("Playwright Contact Tester");
  await page.getByRole("textbox", { name: "Email" }).fill(email);
  await page.getByLabel("Subject").fill("Playwright test message");
  await page.getByLabel("Message").fill("This is a test message submitted by the automated test suite.");
  await page.getByRole("button", { name: "Send Message" }).click();

  await expect(page.getByText("Message sent")).toBeVisible();

  const rows = await queryD1(`SELECT subject, is_read FROM contact_messages WHERE email = '${email}'`);
  expect(rows).toHaveLength(1);
  expect(rows[0].subject).toBe("Playwright test message");
  expect(rows[0].is_read).toBe(0);
});

test("the honeypot field silently rejects a submission without storing it", async ({ page }) => {
  const email = `pw-contact-honeypot-${Date.now()}@example.test`;
  await page.goto("/contact");
  await page.getByLabel("Full Name").fill("Spambot");
  await page.getByRole("textbox", { name: "Email" }).fill(email);
  await page.getByLabel("Subject").fill("spam");
  await page.getByLabel("Message").fill("spam spam spam spam spam");
  await page.locator('input[name="website"]').fill("http://spambot.example");
  await page.getByRole("button", { name: "Send Message" }).click();

  await expect(page.getByText("Submission could not be processed", { exact: false })).toBeVisible();

  const rows = await queryD1(`SELECT id FROM contact_messages WHERE email = '${email}'`);
  expect(rows).toHaveLength(0);
});
