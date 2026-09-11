import { test, expect } from "@playwright/test";

// Uploading a document needs a real file picker interaction this test
// environment can't drive (see TESTING.md) — the create/delete admin
// flow was verified manually during development instead. What's covered
// here is the public page's honest-empty-state behavior, matching the
// pattern already regression-tested on the homepage
// (tests/public/homepage.spec.ts).
test.use({ storageState: { cookies: [], origins: [] } });

test("the public documents page renders without error and shows real content or an honest empty state", async ({
  page,
}) => {
  const response = await page.goto("/documents");
  expect(response?.status()).toBe(200);

  const hasEmptyState = await page.getByText("No documents", { exact: false }).isVisible().catch(() => false);
  const hasRealDocument = await page
    .locator("a[href*='/api/public-files/documents/']")
    .first()
    .isVisible()
    .catch(() => false);

  expect(hasEmptyState || hasRealDocument).toBe(true);
});
