# Security

What this app actually does for security, and where the code lives — so a
reviewer can check the claims against the source rather than take them on
faith. Written after implementing/verifying each item, not before.

## Authentication

- **Passwords**: PBKDF2-SHA256, 100,000 iterations, 256-bit output, unique
  16-byte random salt per user (`src/lib/auth/password.ts`). No native
  bindings, so it runs identically under `next dev` (Node) and the real
  Cloudflare Workers runtime — unlike bcrypt, which needs a native module.
- **Password comparison** is constant-time (`verifyPassword` in the same
  file) — no early-exit `===` on secret material.
- **Sessions** are signed JWTs (`jose`, HS256) in an `httpOnly`, `secure`,
  `sameSite: "lax"` cookie, 12-hour expiry (`src/lib/auth/session.ts`).
  The signing secret (`SESSION_SECRET`) is never in git — see
  [DEPLOY.md](./DEPLOY.md) step 5.
- **Session invalidation**: each user row carries a `sessionVersion`
  counter (migration `0004`). `requireUser()` (`src/lib/auth/dal.ts`)
  compares the JWT's embedded version against the current DB value on
  every request — bumping the column (done on password change/reset)
  invalidates every previously-issued token immediately, without needing
  a server-side session/token blocklist.
- **Password-reset and setup tokens** are high-entropy random values
  (`generateRandomToken`, 24 bytes) that are **never stored raw** — only
  their SHA-256 hash (`hashToken`), so a database read can't produce a
  usable reset link. Token comparison uses `timingSafeStringEqual`.
- **First-admin bootstrap** (`/admin/setup`) requires a separate
  `ADMIN_SETUP_TOKEN` secret and refuses to run a second time once a
  `super_admin` exists — see `src/app/actions/auth.ts` and DEPLOY.md
  step 8.

## Authorization (RBAC)

Five roles (`super_admin`, `committee_admin`, `reviewer`, `regional_rep`,
`observer` — `src/lib/auth/session.ts`). Every protected Server
Action/page calls `requireUser(allowedRoles?)` (`src/lib/auth/dal.ts`),
which is the actual enforcement boundary — it re-checks the DB user
(not just the JWT claims) and the caller's role on every call.

Next.js 16's Proxy (the renamed middleware) also does a fast, optimistic
cookie-presence redirect for UX, but it is **not** the security boundary
— it runs on an edge runtime that can't safely do the DB round-trip
`requireUser()` does, and is explicitly documented as such in
[DEPLOY.md](./DEPLOY.md)'s "Known limitations" section.

## Input validation

All form/Server Action input is validated with Zod schemas
(`src/lib/validation/*.ts`) server-side — never trusting client-side
validation alone.

- **URLs**: plain Zod `z.url()` accepts `javascript:`/`data:` schemes,
  which is a stored-XSS vector for any field later rendered as a link or
  `src`. `httpUrlSchema()` (`src/lib/validation/shared.ts`) restricts to
  `http:`/`https:` only, and is used for every user-supplied URL that
  gets rendered back out (media video URLs, settings social links —
  found and fixed during Phase 6's validation audit).
- **File uploads** (`src/app/actions/media.ts`, `documents.ts`,
  `sighting-reports.ts`, `committee.ts`): server-side MIME-type and
  size-limit checks before writing to R2, regardless of what the
  browser's `<input accept>` claims.

## Rate limiting

D1-backed fixed-window limiter (`src/lib/rate-limit.ts`), **not**
Cloudflare's native `ratelimits` binding — that binding's Durable
Object-backed state was verified during development, via a minimal
reproduction, to not persist across separate Server Action invocations
under the OpenNext Cloudflare adapter (it works from plain Route
Handlers, but every rate-limited entry point here — login, sighting
reports, contact, newsletter — is a Server Action). The `wrangler.jsonc`
comment next to the (unused for this purpose) `ratelimits` binding
records the same finding.

- Login: 5 attempts / 60s, keyed by email — blunts credential stuffing
  against one account without needing a CAPTCHA.
- Public forms (sighting reports, contact, newsletter signup): 5 / 60s,
  keyed by client IP (`src/lib/request-ip.ts`, reading Cloudflare's
  `CF-Connecting-IP`).
- Fails **open** on a D1 error (logs and allows the request) rather than
  taking the whole site down if the rate-limit table is briefly
  unavailable — a deliberate availability-over-strictness choice for a
  volunteer-run committee site with no other DDoS mitigation in front of
  it.

## HTTP security headers

Set for every response via `next.config.ts`'s `headers()`:
`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
`Referrer-Policy: strict-origin-when-cross-origin`,
`Permissions-Policy` (camera/microphone/geolocation all denied), and a
`Content-Security-Policy` (`default-src 'self'`, `frame-ancestors
'none'`, `base-uri 'self'`, `form-action 'self'`).

**Known gap, documented rather than hidden**: the CSP's `script-src` and
`style-src` include `'unsafe-inline'`. Next.js injects inline hydration
data (`__next_f`) and there's no nonce plumbing wired through the
OpenNext Cloudflare adapter yet. A nonce-based CSP without
`unsafe-inline` is the natural next hardening step, but shipping a CSP
that silently breaks hydration would be worse than this baseline — see
the comment above `SECURITY_HEADERS` in `next.config.ts`.

## Audit logging

Every meaningful admin mutation (publish/unpublish, create/update/delete
across announcements, committee, regions, calendar, documents, media,
settings, team accounts, notifications, contact-message status,
newsletter) writes a row to `audit_log` (migration `0000`, schema in
`src/db/schema.ts`) recording who did what to which record and when,
visible at **Dashboard → Audit Logs** (`super_admin` only).

## Known limitations (honest, not hidden)

- No CAPTCHA on public forms — rate limiting is the only bot mitigation.
- No 2FA/MFA on admin accounts.
- No forced password rotation or complexity meter beyond a minimum
  length check — see the relevant Zod schema in `src/lib/validation/`.
- `npm audit` reports moderate-severity findings in `esbuild`/
  `drizzle-kit`'s **dev-only** dependency chain (build/migration
  tooling). These never ship in the deployed Worker bundle — see
  DEPLOY.md's "Known limitations" section for the same note.
- The CSP `unsafe-inline` gap above.

## Reporting a vulnerability

This is a committee-run site with no dedicated security contact
infrastructure. If you find a vulnerability, contact a Super Admin
directly (see the site's `/contact` page) rather than filing a public
issue, until a fix ships.
