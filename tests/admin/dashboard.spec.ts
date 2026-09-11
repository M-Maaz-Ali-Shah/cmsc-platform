import { test, expect } from "@playwright/test";

test("the dashboard renders real stats and every nav item", async ({ page }) => {
  await page.goto("/admin/dashboard");

  await expect(page.getByText("TODAY'S REPORTS")).toBeVisible();
  await expect(page.getByText("OBSERVERS TO DATE")).toBeVisible();

  for (const label of ["Announcements", "Sighting Reports", "Website Content", "Notifications", "Subscribers", "Audit Logs"]) {
    await expect(page.getByRole("link", { name: label })).toBeVisible();
  }
});

test("audit log pagination gracefully handles an out-of-range page", async ({ page }) => {
  await page.goto("/admin/dashboard/audit-logs?page=999");
  await expect(page.getByText("No activity recorded yet.")).toBeVisible();
});
