import type { Page, Locator } from "@playwright/test";

/**
 * Finds the tightest-fitting `div` that contains both `text` and a
 * matching descendant, and returns that descendant — e.g. "the Edit
 * button inside whichever card has this label". A plain
 * `.locator('div', { hasText }).first()` instead returns the outermost
 * matching ancestor (every wrapping div up to the page root also
 * "contains" that text), which is too broad and can match 5+ elements.
 */
export function buttonInCardWithText(page: Page, text: string, buttonName: string | RegExp): Locator {
  return page
    .locator("div")
    .filter({ hasText: text })
    .filter({ has: page.getByRole("button", { name: buttonName }) })
    .last()
    .getByRole("button", { name: buttonName });
}
