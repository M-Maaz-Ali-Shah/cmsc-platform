import { test, expect } from "@playwright/test";

// Uses the suite's default authenticated storage state (see global-setup.ts).

test("a draft is invisible publicly until it's advanced all the way to Published", async ({ page }) => {
  const uniqueMonth = `PwTestMonth${Date.now()}`;
  const decision = `Playwright test decision ${Date.now()}`;

  await page.goto("/admin/dashboard/announcements");
  await page.getByRole("button", { name: "New Announcement" }).click();

  await page.getByLabel("Islamic month").fill(uniqueMonth);
  await page.getByLabel("Hijri year").fill("1448 AH");
  await page.getByLabel("Gregorian year").fill("2026");
  await page.getByLabel("Decision headline").fill(decision);
  await page.getByLabel("Short summary").fill("Playwright automated test summary.");
  await page.getByLabel("Official statement").fill("Playwright automated test official statement.");
  await page.getByRole("button", { name: "Save as Draft" }).click();

  await expect(page.getByText(decision)).toBeVisible();

  // Not reachable publicly yet — only Published announcements appear in
  // the archive (see src/app/(site)/announcements/page.tsx).
  await page.goto("/announcements");
  await expect(page.getByText(decision)).not.toBeVisible();

  // Draft -> Under Review -> Pending Approval -> Approved -> Published
  await page.goto("/admin/dashboard/announcements");
  for (let i = 0; i < 4; i++) {
    await page
      .locator("div", { hasText: decision })
      .getByRole("button", { name: /^Advance to/ })
      .first()
      .click();
    await page.waitForTimeout(500); // let the server action + revalidation settle
  }

  await expect(page.getByText("Published", { exact: true }).first()).toBeVisible();

  await page.goto("/announcements");
  await expect(page.getByText(decision)).toBeVisible();
});
