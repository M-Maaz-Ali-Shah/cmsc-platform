# Backup, export & rollback

This app's only state lives in two places: **Cloudflare D1** (all
structured data — reports, announcements, committee, users, etc.) and
**Cloudflare R2** (uploaded files — photos, documents, media). Neither is
backed up automatically by anything in this repo; both need action from
whoever administers the Cloudflare account.

## D1: exporting a backup

```bash
npx wrangler d1 export cmsc-platform-db --remote --output backup-$(date +%Y%m%d).sql
```

This dumps the full production database (schema + data) as SQL. Run it
on whatever cadence your committee is comfortable with (e.g. before any
manual DB surgery, or on a periodic schedule you set up yourself — this
repo doesn't include a scheduled backup job). Store the `.sql` file
somewhere other than this repo — **never commit a real data export to
git**, since it will contain real names, emails, and sighting reports.

To restore from one of these exports into a **fresh** database (e.g.
disaster recovery, or standing up a staging copy):

```bash
npx wrangler d1 execute cmsc-platform-db --remote --file backup-20260101.sql
```

### D1 Time Travel (point-in-time recovery)

Cloudflare D1 keeps an automatic point-in-time recovery log (typically a
30-day window) independent of any manual export above — this is a
Cloudflare platform feature, not something this codebase configures.

```bash
# See available restore points
npx wrangler d1 time-travel info cmsc-platform-db

# Restore to a specific point (irreversible for anything written after it —
# read the confirmation prompt carefully)
npx wrangler d1 time-travel restore cmsc-platform-db --timestamp=<ISO-8601-timestamp>
```

Use Time Travel for "something broke in the last N days, roll the whole
DB back" recovery. Use a manual `d1 export` (above) for anything you want
to keep indefinitely, since Time Travel's window is limited and rolling.

## R2: backing up uploaded files

Wrangler doesn't have a single "export this whole bucket" command. R2 is
S3-API-compatible, so the practical approach is an S3-compatible sync
tool pointed at R2's S3 endpoint (`https://<account_id>.r2.cloudflarestorage.com`)
with R2 API credentials (Cloudflare dashboard → R2 → **Manage R2 API
Tokens**):

```bash
# One-time setup: configure rclone (https://rclone.org) with an R2 remote
rclone config   # choose "Amazon S3" -> "Cloudflare R2", paste your R2 API token

# Then sync a bucket down to a local (or another cloud) location
rclone sync r2remote:cmsc-platform-uploads ./backup-uploads
```

Only the `cmsc-platform-uploads` bucket holds real content (sighting
report photos, committee photos, documents, media); the second bucket
(`cmsc-platform-opennext-cache`) is disposable Next.js cache data that
never needs backing up — it's safe to delete and let it repopulate.

## Rollback strategy

- **Application code**: this is a normal git repository — `git revert` or
  redeploying an older commit (`git checkout <sha> && npm run cf:deploy`,
  or re-running the GitHub Actions/Cloudflare Git-integration deploy
  against an earlier commit) rolls the *code* back. This does **not**
  roll back the database — see below.
- **Database schema**: migrations live in `drizzle/*.sql` and are
  applied in order (`npm run db:migrate:remote`). Drizzle's migration
  files here are additive/forward-only (no down-migrations were
  written) — a schema rollback means either restoring a pre-migration
  D1 export/Time Travel point (above), or hand-writing a reverse SQL
  migration for the specific change if data must be preserved. Check
  what a given migration actually changed before assuming either
  approach is safe — e.g. migration `0005` (newsletter double opt-in)
  added nullable columns, safe to leave in place even if you roll app
  code back; migration `0001` (rate limit buckets) added a whole table
  that's safe to ignore if unused.
- **A bad deploy that's breaking production right now**: fastest fix is
  redeploying the last-known-good commit (see above); D1/R2 data is
  almost never the cause of a broken deploy and doesn't need touching
  for this case.
- **Secrets**: `wrangler secret put <NAME>` has no built-in history —
  keep your own record (e.g. a password manager entry) of when secrets
  were last rotated, since Wrangler can't tell you the previous value.

## What to back up before a risky change

Before running a new migration against production, or any manual
`wrangler d1 execute` against real data:

1. `npx wrangler d1 export cmsc-platform-db --remote --output pre-change-backup.sql`
2. Note the current time, so you have a Time Travel restore point as a
   second fallback.
3. Make the change.
4. Spot-check the site (same smoke test as DEPLOY.md step 10).
