# Testing

A real Playwright suite, run against the actual Cloudflare Workers runtime
(`wrangler dev`) — real D1, real R2, real JWT signing — not `next dev`,
matching how every phase of this project was manually verified during
development.

## Running the suite

1. Start the app under Wrangler (same as manual verification/DEPLOY.md):

   ```bash
   npm run cf:build
   npx wrangler d1 migrations apply cmsc-platform-db --local   # first time only
   npx wrangler dev --port 8788
   ```

2. In a second terminal:

   ```bash
   npx playwright test
   ```

Playwright's config (`playwright.config.ts`) targets `http://127.0.0.1:8788`
and does **not** auto-start the server for you — `wrangler dev` needs a
build+run sequence that isn't portable across the shells Playwright's own
process spawner would use. Start it yourself first.

### Chrome, not Playwright's bundled Chromium

`playwright.config.ts` uses `channel: "chrome"` (your system-installed
Chrome) rather than Playwright's own downloaded Chromium binary. This
environment couldn't reach Playwright's CDN to download one; if yours
can, `npx playwright install chromium` and removing `channel: "chrome"`
works too. Either way, install Chrome (or edit the config to use Edge —
`channel: "msedge"` — if you don't have Chrome) before running the suite.

### Test admin account

`tests/global-setup.ts` logs in with a fixed test admin
(`tests/test-constants.ts`), creating it via the real `/admin/setup`
bootstrap flow if no super_admin exists yet on the target D1. If a
*different* super_admin already exists (e.g. you bootstrapped one
manually first), point the suite at it instead:

```bash
TEST_ADMIN_EMAIL=you@example.com TEST_ADMIN_PASSWORD=yourpassword npx playwright test
```

Setup refuses to create a second super_admin (by design — see
`src/app/actions/auth.ts`), so the suite reuses whichever one it can log
into rather than always creating a fresh one.

**Run this against a throwaway local D1, never production.** Tests
create real rows (sighting reports, committee members, announcements,
etc.) with `Playwright`/`pw-`-prefixed names so they're easy to spot and
clean up, but nothing in this suite is written to be safe against a real
database.

## What isn't covered, and why

- **Full password-reset and newsletter-confirmation round trips.** Both
  flows email the user a token; completing them end-to-end needs the
  actual token, which this app deliberately never exposes anywhere
  retrievable (it's hashed before storage). Verifying the *complete*
  loop black-box needs a test-inbox/email-capture mechanism (e.g. a
  Resend test mode, or an SMTP capture server) that this project doesn't
  have — Resend isn't configured in this environment by design (see
  `.dev.vars.example`). What's covered instead: account-enumeration
  protection, invalid/expired-token rejection, and (during development)
  a full manual round trip using a temporary debug log to read the
  token out of the server console — see the Phase 5/7 commit messages.
- **File uploads** (committee photos, media photos, PDF documents).
  Setting a real `<input type="file">` value isn't something this
  environment's browser-automation tooling can drive. The upload code
  path itself (type/size validation, R2 write, public/private key
  separation) was verified manually during development — see the
  Phase 6/8 commit messages, and the direct `wrangler r2 object put` +
  byte-level dimension check in the Phase 8 image-optimization commit.
- **Rate limiting.** Proven to work correctly (Phase 2/5 commit
  messages document a real reproduction, fix, and verification with a
  temporarily-lowered limit), but not re-asserted here — an automated
  test that deliberately trips a 5-requests-per-60-seconds limit is
  either slow (wait out real time) or flaky (race against exact
  timing), and every other test in this suite would then need to avoid
  sharing that same limit's key.

## Adding tests

Match the existing structure: one directory per feature area
(`tests/<area>/*.spec.ts`), real assertions against actual outcomes —
D1 state via `tests/helpers/d1.ts`, not just "the page didn't 404".
