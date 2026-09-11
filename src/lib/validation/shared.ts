import * as z from "zod";

/**
 * A URL restricted to http/https. Plain `z.url()` accepts any syntactically
 * valid URL — including `javascript:`/`data:` schemes — and several places
 * in this app render admin-entered URLs as a plain `<a href>` (footer
 * social links, media gallery video links) without further sanitizing the
 * scheme. Use this instead of `z.url()` for anything that ends up in an
 * href, so a malicious/compromised admin account can't plant a stored-XSS
 * payload via a `javascript:` "URL".
 */
export function httpUrlSchema(message = "Enter a valid URL.") {
  return z.url({ error: message }).refine(
    (val) => {
      // `new URL()` throws on anything it can't parse — and Zod v4 runs
      // every check in the chain regardless of whether an earlier one
      // (the z.url() base check above) already failed, so this refine
      // still runs even on input like `""` that isn't a URL at all. An
      // uncaught throw here becomes a raw, unhandled TypeError that
      // crashes the whole request with a 500 instead of a normal
      // validation error — caught for real by submitting the Settings
      // form with a blank optional URL field (the common, default case)
      // against a genuinely fresh D1 via Playwright; every earlier local
      // test of this schema happened to already have a non-empty value
      // in that field, which hid it.
      try {
        return /^https?:$/.test(new URL(val).protocol);
      } catch {
        return false;
      }
    },
    { error: message }
  );
}
