import { test, expect } from "@playwright/test";

test("a new calendar entry with 'Announced' status appears on the public calendar", async ({ page }) => {
  const month = `PwTestMonth${Date.now()}`;

  await page.goto("/admin/dashboard/calendar");
  await page.getByRole("button", { name: "Add Month" }).click();
  await page.getByLabel("Hijri month").fill(month);
  await page.getByLabel("Hijri year").fill("1448 AH");
  await page.getByLabel("Status").selectOption("Announced");
  await page.getByRole("button", { name: "Add Month" }).click();

  await expect(page.getByText(month)).toBeVisible();

  await page.goto("/calendar");
  await expect(page.getByText(month)).toBeVisible();
});
