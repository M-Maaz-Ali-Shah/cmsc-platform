import { test, expect } from "@playwright/test";

test("a new region is created and immediately visible on the public regions page", async ({ page }) => {
  const name = `PwTestRegion${Date.now()}`;

  await page.goto("/admin/dashboard/regions");
  await page.getByLabel("Country / region name").fill(name);
  await page.getByLabel("Group").selectOption("Europe");
  await page.getByRole("button", { name: "Add Region" }).click();

  await expect(page.getByText(name)).toBeVisible();

  await page.goto("/regions");
  await expect(page.getByText(name)).toBeVisible();
  await expect(page.getByText("Awaiting Representative", { exact: false }).first()).toBeVisible();
});
