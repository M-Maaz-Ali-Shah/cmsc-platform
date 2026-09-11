import { test, expect } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

test("robots.txt disallows admin/newsletter/api and points at the sitemap", async ({ request }) => {
  const response = await request.get("/robots.txt");
  expect(response.status()).toBe(200);
  const body = await response.text();
  expect(body).toContain("Disallow: /admin/");
  expect(body).toContain("Disallow: /api/");
  expect(body).toContain("Sitemap:");
});

test("sitemap.xml is valid XML and includes core public pages", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const body = await response.text();
  expect(body).toContain("<?xml");
  expect(body).toContain("<urlset");
  expect(body).toContain("/announcements</loc>");
  expect(body).toContain("/committee</loc>");
  // Must never list admin/newsletter action pages as indexable content.
  expect(body).not.toContain("/admin/");
  expect(body).not.toContain("/newsletter/");
});

test("a public page carries a canonical link and Open Graph metadata", async ({ page }) => {
  await page.goto("/committee");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/committee$/);
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute(
    "content",
    "Central Moon Sighting Committee"
  );
});
