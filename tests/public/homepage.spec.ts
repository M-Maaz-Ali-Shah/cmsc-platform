import { test, expect } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

test("homepage renders real sections with honest empty states, not fabricated data", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Central Moon Sighting Committee", exact: false })).toBeVisible();

  // These exact strings only render when the underlying D1 query found
  // nothing — see src/app/(site)/page.tsx and the components it feeds.
  // Their presence (on a fresh/empty local D1) is itself the regression
  // test for the fabricated-content bugs fixed earlier in this project.
  await expect(page.getByText("Reports Submitted")).toBeVisible();
  await expect(page.getByText("Under Review")).toBeVisible();
});

test("public nav reaches every top-level page without a 404 or 500", async ({ page }) => {
  const paths = [
    "/moon-sighting",
    "/announcements",
    "/calendar",
    "/committee",
    "/regions",
    "/observers",
    "/documents",
    "/media",
    "/contact",
    "/report-sighting",
    "/how-moon-sighting-works",
    "/privacy-policy",
    "/terms-of-use",
  ];
  for (const path of paths) {
    const response = await page.goto(path);
    expect(response?.status(), `${path} should return 200`).toBe(200);
  }
});
