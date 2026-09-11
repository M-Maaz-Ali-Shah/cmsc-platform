import { test, expect } from "@playwright/test";
import { queryD1 } from "../helpers/d1";
import { buttonInCardWithText } from "../helpers/ui";

test("a new committee member is hidden publicly until approved, then visible after approval", async ({ page }) => {
  const name = `Playwright Test Member ${Date.now()}`;

  await page.goto("/admin/dashboard/committee");
  await page.getByRole("button", { name: "Add Member" }).click();
  await page.getByLabel("Full name").fill(name);
  await page.getByLabel("Role / title").fill("Test Role");
  await page.getByLabel("Region").fill("Test Region");
  await page.getByRole("button", { name: "Add Member" }).click();

  await expect(page.getByText(name)).toBeVisible();
  await expect(page.getByText("Hidden")).toBeVisible();

  await page.goto("/committee");
  await expect(page.getByText(name)).not.toBeVisible();

  await page.goto("/admin/dashboard/committee");
  await buttonInCardWithText(page, name, "Publish").click();

  // Wait for THIS member's own row to flip to approved=1 before checking
  // the public page — the UI re-render alone isn't proof the mutation +
  // revalidatePath("/committee") has actually landed yet.
  await expect
    .poll(async () => {
      const rows = await queryD1(`SELECT approved FROM committee_members WHERE name = '${name}'`);
      return rows[0]?.approved;
    }, { timeout: 10_000 })
    .toBe(1);

  await page.goto("/committee");
  await expect(page.getByText(name)).toBeVisible();
});
