#!/usr/bin/env node
// Seeds structural reference data (regions) that the rest of the app
// depends on — NOT fake committee members, contacts, or sighting reports.
// Per the project's content rule, we never invent real people or
// religious-ruling content, so this script intentionally stops at
// geography: everything else (committee members, announcements, calendar
// entries) is meant to be entered for real through the admin dashboard
// once the first Super Admin account exists (see /admin/setup).

import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const mode = process.argv.includes("--remote") ? "--remote" : "--local";

const regions = [
  ["england", "England", "Great Britain", 0],
  ["scotland", "Scotland", "Great Britain", 1],
  ["wales", "Wales", "Great Britain", 2],
  ["northern-ireland", "Northern Ireland", "Great Britain", 3],
  ["ireland", "Republic of Ireland", "Europe", 4],
  ["france", "France", "Europe", 5],
  ["germany", "Germany", "Europe", 6],
  ["netherlands", "Netherlands", "Europe", 7],
  ["belgium", "Belgium", "Europe", 8],
];

function sqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

const statements = regions.map(
  ([id, name, group, sortOrder]) =>
    `INSERT OR IGNORE INTO regions (id, name, "group", status, sort_order) VALUES (${sqlString(
      id
    )}, ${sqlString(name)}, ${sqlString(group)}, 'Awaiting Representative', ${sortOrder});`
);

const sql = statements.join("\n") + "\n";

const dir = mkdtempSync(join(tmpdir(), "cmsc-seed-"));
const file = join(dir, "seed.sql");
writeFileSync(file, sql, "utf8");

console.log(`Seeding ${regions.length} regions (${mode.replace("--", "")})…`);

const result = spawnSync(
  "npx",
  ["wrangler", "d1", "execute", "cmsc-platform-db", mode, "--file", file],
  { stdio: "inherit" }
);

rmSync(dir, { recursive: true, force: true });

if (result.status !== 0) {
  console.error("Seeding failed.");
  process.exit(result.status ?? 1);
}

console.log("Done. Regions seeded.");
console.log(
  "Next: create your Super Admin account at /admin/setup?token=YOUR_ADMIN_SETUP_TOKEN, then add real committee members, announcements, and calendar entries from the dashboard."
);
