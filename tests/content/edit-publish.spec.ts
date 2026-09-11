import { test, expect } from "@playwright/test";
import { buttonInCardWithText } from "../helpers/ui";

test("editing a content block's draft does not affect the public site until published", async ({ page }) => {
  const uniqueText = `Playwright test intro ${Date.now()}`;

  await page.goto("/admin/dashboard/content");
  await buttonInCardWithText(page, "Committee Page Intro", "Edit").click();

  await expect(page.getByText("Editing: Committee Page Intro")).toBeVisible();
  await page.getByLabel("Text").fill(uniqueText);
  await page.getByRole("button", { name: "Save Draft" }).click();
  await expect(page.getByText("Draft saved.")).toBeVisible();

  // Not live yet.
  await page.goto("/committee");
  await expect(page.getByText(uniqueText)).not.toBeVisible();

  // Publish it.
  await page.goto("/admin/dashboard/content");
  await buttonInCardWithText(page, "Committee Page Intro", "Edit").click();
  await page.getByRole("button", { name: /^Publish/ }).click();
  await expect(page.getByText("live on the public site now", { exact: false })).toBeVisible();

  await page.goto("/committee");
  await expect(page.getByText(uniqueText)).toBeVisible();
});

// Unauthorized access to /admin/dashboard/content specifically is covered
// generically by tests/auth/protected-routes.spec.ts (every dashboard
// route shares the same requireUser() gate) — not repeated here.
