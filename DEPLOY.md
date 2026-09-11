# Deploying CMSC Platform to Cloudflare (free tier)

This app is a real, database-backed Next.js site — not a static prototype. It
runs on **Cloudflare Workers** (via the OpenNext adapter), stores data in
**Cloudflare D1** (SQLite), and stores uploaded files (sighting-report
photos, committee photos, documents, media) in **Cloudflare R2**. Everything
below fits inside Cloudflare's free tier for a committee-sized site. Outgoing
email (publish notifications, contact-form receipts) uses **Resend**, which
also has a free tier.

Nobody but you can create your Cloudflare account, your GitHub repo, or your
production secrets — this guide walks through every step so you (or anyone
on the committee with basic technical comfort) can do it in about 30–45
minutes.

---

## 0. What you'll need

- A free [Cloudflare account](https://dash.cloudflare.com/sign-up).
- A free [GitHub account](https://github.com) and a new empty repository to
  push this project to.
- A free [Resend account](https://resend.com) (optional but recommended —
  the site works without it, it just won't send emails).
- Node.js 20+ and `git` installed on your computer, OR you can do all of
  this from a Cloudflare Workers Builds environment (see step 6).

---

## 1. Push this project to GitHub

From inside this project folder:

```bash
git remote add origin https://github.com/<your-org-or-username>/<your-repo>.git
git push -u origin main
```

(The project already has two commits: the initial scaffold and the full
backend build. `.gitignore` already excludes `node_modules`, `.next`,
`.open-next`, `.wrangler`, and `.dev.vars` — your secrets are never
committed.)

---

## 2. Install Wrangler and log in

```bash
npm install
npx wrangler login
```

This opens a browser window to authorize the Wrangler CLI against your
Cloudflare account.

---

## 3. Create the D1 database

```bash
npx wrangler d1 create cmsc-platform-db
```

This prints a `database_id`. Open `wrangler.jsonc` and replace the
placeholder:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "cmsc-platform-db",
    "database_id": "REPLACE_WITH_YOUR_D1_DATABASE_ID",   // <- paste it here
    "migrations_dir": "drizzle"
  }
]
```

Then apply the schema:

```bash
npm run db:migrate:remote
```

Seed the reference data (this only inserts the 9 geographic regions the site
organizes around — England, Scotland, Wales, Northern Ireland, Republic of
Ireland, France, Germany, Netherlands, Belgium. It deliberately does **not**
invent any committee members, contacts, or announcements — those get added
for real once you're logged into the admin dashboard):

```bash
npm run seed:remote
```

---

## 4. Create the R2 buckets

Two buckets are needed — one for real uploaded files, one used internally by
the Next.js caching layer:

```bash
npx wrangler r2 bucket create cmsc-platform-uploads
npx wrangler r2 bucket create cmsc-platform-opennext-cache
```

The bucket names in `wrangler.jsonc` already match these — no further
editing needed unless you chose different names.

---

## 5. Set production secrets

These are never committed to git — they're pushed straight to Cloudflare:

```bash
# A long random string used to sign session cookies. Generate one with:
#   node -e "console.log(crypto.randomUUID()+crypto.randomUUID())"
npx wrangler secret put SESSION_SECRET

# A one-time secret that unlocks the /admin/setup page (used once, to create
# your first Super Admin account — see step 8). Any random string works.
npx wrangler secret put ADMIN_SETUP_TOKEN

# From https://resend.com → API Keys. Leave this step out entirely if you
# don't want email yet — the site works fine without it, it just logs
# emails to the console instead of sending them.
npx wrangler secret put RESEND_API_KEY
```

Also update the two non-secret values in `wrangler.jsonc` under `"vars"`
once you know your real production URL and sending address:

```jsonc
"vars": {
  "SITE_URL": "https://your-site.your-subdomain.workers.dev",
  "RESEND_FROM_EMAIL": "Central Moon Sighting Committee <announcements@yourdomain.org>"
}
```

(`SITE_URL` is used to build the "Read the full announcement" link inside
publish-notification emails. `RESEND_FROM_EMAIL` must be an address on a
domain you've verified in Resend — see the note in step 9. Until you verify
a domain, leave it as the default `onboarding@resend.dev` sandbox address,
which only delivers to your own verified Resend account email.)

---

## 6. Deploy

**Option A — deploy from your own machine:**

```bash
npm run cf:deploy
```

This runs the OpenNext build and then `wrangler deploy`. Wrangler will print
your live `*.workers.dev` URL when it finishes.

**Option B — connect GitHub for automatic deploys on every push** (this is
the "GitHub live pages" workflow):

1. In the Cloudflare dashboard, go to **Workers & Pages** and look for the
   option to connect a Git repository (Cloudflare calls this **Workers
   Builds**; the exact label may shift slightly as Cloudflare updates its
   dashboard, but it's under Workers & Pages → your Worker → **Settings** →
   **Builds**, or offered when creating a new Worker "from a Git
   repository").
2. Authorize Cloudflare's GitHub App and pick the repo you pushed in step 1.
3. Set the build command to `npm run cf:build` and the deploy command to
   `npx opennextjs-cloudflare deploy` (or simply `npm run cf:deploy`, which
   does both).
4. Add the same three secrets from step 5 in the Worker's **Settings →
   Variables and Secrets** panel (Wrangler-set secrets from your machine do
   not automatically appear here — Cloudflare Builds runs in its own
   environment).
5. From then on, every `git push` to your main branch triggers a fresh
   build and deploy automatically — no local Wrangler needed.

Either way, once deployed, update `SITE_URL` in `wrangler.jsonc` (or the
Worker's dashboard variables) to match the real deployed URL, then redeploy
once so the email links are correct.

---

## 7. Custom domain (optional)

In the Cloudflare dashboard, open your Worker → **Settings → Domains &
Routes → Add Custom Domain**, and follow the prompts. If your domain's DNS
is already on Cloudflare this is a one-click process; otherwise you'll be
walked through changing your nameservers or adding a CNAME.

---

## 8. Create your first Super Admin account

Once the site is live, visit:

```
https://your-site.workers.dev/admin/setup?token=YOUR_ADMIN_SETUP_TOKEN
```

(the token is the value you set for `ADMIN_SETUP_TOKEN` in step 5). Fill in
your name, email, and password. This page **only works once** — it refuses
to create a second Super Admin once one exists, so nobody else can use it
even if they discover the token. After creating your account, you can
rotate/remove the `ADMIN_SETUP_TOKEN` secret if you like; it's no longer
needed after this step.

From the dashboard, your Super Admin account can then:

- Create additional team accounts (Committee Admin, Reviewer, Regional
  Representative, Observer) from **Dashboard → Team** or the relevant
  Regions/Observers pages — each new account gets a one-time temporary
  password shown once on screen, which the new user should change
  immediately after their first login (there's no self-service "change
  password" screen yet — see Known Limitations below).
- Add real committee members, regions, calendar entries, documents, and
  media — the public site shows nothing here until you add it for real,
  by design (see the content policy note below).

### Roles

| Role | Label | Typical use |
|---|---|---|
| `super_admin` | Super Admin | Full access, only one created via `/admin/setup` |
| `committee_admin` | Committee Admin | Day-to-day content management |
| `reviewer` | Reviewer | Reviews/annotates sighting reports |
| `regional_rep` | Regional Representative | Tied to one region |
| `observer` | Observer | Field observer, lowest-privilege account |

---

## 9. Email sending notes (Resend)

- Without a verified domain, Resend's sandbox address
  (`onboarding@resend.dev`) can only deliver to the email address on your
  own Resend account — fine for testing, not for real subscriber
  announcements.
- To actually email your newsletter subscribers and contact-form senders,
  verify a domain you own under **Resend → Domains** (adds a few DNS
  records), then set `RESEND_FROM_EMAIL` to an address on that domain.
- If `RESEND_API_KEY` is left unset, publish/contact actions still succeed —
  the app logs what it would have sent instead of failing the request.

---

## 10. Verifying the deployment

A quick smoke test after any deploy:

1. Visit the homepage and a few public pages (`/announcements`, `/calendar`,
   `/regions`, `/committee`, `/contact`) — should load with live (possibly
   empty) data, not errors.
2. Submit the "Report a Sighting" form with a test photo — confirm it
   appears under **Dashboard → Reports**.
3. Log into `/admin/login` and confirm the dashboard loads.
4. Submit the contact form and confirm it appears under **Dashboard →
   Contact Messages**.

---

## Known limitations / honest caveats

- **Team-account passwords are one-time-reveal, not emailed.** Creating a
  Regional Rep or Observer account shows a temporary password once on
  screen for you to relay to them. There's no "forgot password" or
  self-service reset flow yet — if someone loses access, a Super Admin or
  Committee Admin needs to create a fresh account or update the DB directly.
- **Next.js 16's "Proxy" (formerly middleware) runs on the Node.js runtime
  by default**, and the OpenNext Cloudflare adapter will print a warning
  about "experimental" Node.js middleware support during build. This is
  expected — it's a known, documented interaction between Next 16 and the
  Cloudflare adapter, not a bug introduced here. Route-level protection
  (`requireUser()` in `src/lib/auth/dal.ts`) is the real security boundary;
  the Proxy-level check is only a fast optimistic redirect.
- **No real committee members, scholars, or contact details are pre-loaded
  anywhere in this codebase.** This is intentional, per the project's
  content policy: the site never invents or presents placeholder people or
  astronomical estimates as if they were real official rulings. Every
  "empty state" you'll see (Committee, Regions, Calendar, Documents, Media)
  is honest and waiting for your committee's real data, entered through the
  admin dashboard.
- **`npm audit` reports a handful of moderate-severity findings** in
  `esbuild`/`drizzle-kit`'s dev-only dependency chain. These tools only run
  at build/migration time on your machine or in CI — they are never part of
  the deployed Worker — so they don't affect the live site's exposure.

---

## Local development

```bash
cp .dev.vars.example .dev.vars   # then fill in SESSION_SECRET / ADMIN_SETUP_TOKEN
npm install
npm run db:migrate:local
npm run seed:local
npm run dev
```

Visit `http://localhost:3000`, and `http://localhost:3000/admin/setup?token=...`
(using the token from your local `.dev.vars`) to create a local admin
account.

To test against the *actual* Cloudflare Workers runtime locally (recommended
before any real deploy, since it catches things Node's dev server won't):

```bash
npm run cf:preview
```

This builds with OpenNext and runs the real `wrangler dev` (workerd), the
same runtime Cloudflare uses in production.
