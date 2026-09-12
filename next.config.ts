import type { NextConfig } from "next";

// Baseline security headers. CSP intentionally allows 'unsafe-inline' for
// script/style — Next.js injects inline hydration data (__next_f) and we
// have no nonce plumbing through the OpenNext Cloudflare adapter yet; a
// stricter nonce-based CSP is a reasonable future hardening step, but
// shipping a CSP that silently breaks hydration is worse than this baseline.
//
// script-src also allows 'unsafe-eval' in development only — React/Turbopack's
// dev-mode debugging (reconstructing stack traces across environments) calls
// eval(), which this CSP otherwise blocks with a console warning ("React will
// never use eval() in production mode", per React's own message — confirming
// it's dev-only and safe to allow here without weakening the deployed site).
const isDev = process.env.NODE_ENV === "development";

const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;

// Enables access to Cloudflare bindings (D1, R2, ...) via getCloudflareContext()
// while running the regular `next dev` server, not just under `wrangler dev`.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
