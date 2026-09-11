/// <reference types="@cloudflare/workers-types" />

// Augments the global CloudflareEnv interface (declared by @opennextjs/cloudflare)
// with this app's own bindings, vars, and secrets.
declare global {
  interface CloudflareEnv {
    // Bindings (wrangler.jsonc)
    DB: D1Database;
    UPLOADS: R2Bucket;

    // Vars (wrangler.jsonc "vars", or .dev.vars locally)
    SITE_URL: string;
    RESEND_FROM_EMAIL: string;

    // Secrets (`wrangler secret put NAME`, or .dev.vars locally — never committed)
    RESEND_API_KEY?: string;
    SESSION_SECRET: string;
    ADMIN_SETUP_TOKEN?: string;
  }
}

export {};
