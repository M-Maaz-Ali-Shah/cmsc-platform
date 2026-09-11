import { test, expect } from "@playwright/test";

// Photo uploads need a real file picker interaction this test environment
// can't drive (see TESTING.md) — covered here via the video path instead,
// which only needs a URL.
test("a new video media item appears in the public media library", async ({ page }) => {
  const title = `Playwright Test Video ${Date.now()}`;

  await page.goto("/admin/dashboard/media");
  await page.getByRole("button", { name: "Add Media" }).click();
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Category").selectOption("Events");
  await page.getByLabel("Type").selectOption("video");
  await page.getByLabel("Video URL").fill("https://example.com/test-video");
  await page.getByRole("button", { name: "Add Media" }).click();

  await expect(page.getByText(title)).toBeVisible();

  await page.goto("/media");
  await expect(page.getByText(title)).toBeVisible();
});
