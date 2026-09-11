# Central Moon Sighting Committee GB & EU — Platform

A full, database-backed website and admin platform for the Central Moon
Sighting Committee GB & EU, built on Next.js 16 and deployed to Cloudflare
(Workers + D1 + R2), with email via Resend.

## What's here

- **Public site**: homepage, moon sighting & how-it-works pages, an
  announcements archive with a full publish workflow, a public sighting
  report submission form (with photo upload), an Islamic calendar view,
  regions, committee, observers, documents, media, and contact/newsletter
  pages — all reading live data, never mock/placeholder content.
- **Admin dashboard**: role-based access (Super Admin, Committee Admin,
  Reviewer, Regional Representative, Observer) covering sighting report
  review, the announcements workflow, committee/region/calendar management,
  document & media uploads, contact-message inbox, audit logs, and site
  settings.
- **Real infrastructure**: Cloudflare D1 (SQLite via Drizzle ORM) for data,
  Cloudflare R2 for file storage, PBKDF2 + JWT session-based authentication,
  and Resend for outgoing email — all fitting inside Cloudflare's free tier.

## Getting started

See **[DEPLOY.md](./DEPLOY.md)** for the full setup guide — local
development, creating your Cloudflare D1 database and R2 buckets, setting
production secrets, deploying (including connecting GitHub for automatic
deploys), and creating your first admin account.

Quick local start once you've copied `.dev.vars.example` to `.dev.vars`:

```bash
npm install
npm run db:migrate:local
npm run seed:local
npm run dev
```

## Tech stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS ·
Drizzle ORM · Cloudflare D1 · Cloudflare R2 · Cloudflare Workers
(`@opennextjs/cloudflare`) · Resend · Zod · jose (JWT)

## Documentation

- **[DEPLOY.md](./DEPLOY.md)** — full setup and deployment guide,
  including a deployment checklist.
- **[TESTING.md](./TESTING.md)** — how to run the Playwright suite (36
  tests, run against the real Cloudflare Workers runtime), and what it
  deliberately doesn't cover.
- **[SECURITY.md](./SECURITY.md)** — what's actually implemented
  (authentication, RBAC, rate limiting, input validation, headers, audit
  logging) and the known gaps.
- **[BACKUP.md](./BACKUP.md)** — D1/R2 backup, D1 Time Travel, and
  rollback strategy.

CI (`.github/workflows/ci.yml`) runs typecheck, lint, build, and the full
Playwright suite against a real `wrangler dev` on every PR and push to
`main`; an optional job can also deploy — see DEPLOY.md's Option C.
