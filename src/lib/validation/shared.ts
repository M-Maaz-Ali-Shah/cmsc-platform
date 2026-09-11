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
  return z.url({ error: message }).refine((val) => /^https?:$/.test(new URL(val).protocol), {
    error: message,
  });
}
