import { desc, inArray } from "drizzle-orm";

import { ReportsTable } from "@/components/admin/reports-table";
import { getDb, schema } from "@/db/client";

// ReportsTable does its own client-side search + status filtering across
// whatever it's given, so this can't switch to server-side offset
// pagination without either breaking that filtering or duplicating it
// server-side. A generous bound (not "no limit at all") is the pragmatic
// middle ground here.
const MAX_REPORTS_ROWS = 500;

export default async function AdminReportsPage() {
  const db = await getDb();
  const reports = await db
    .select()
    .from(schema.sightingReports)
    .orderBy(desc(schema.sightingReports.submittedAt))
    .limit(MAX_REPORTS_ROWS);

  const reviewerIds = [...new Set(reports.map((r) => r.reviewerId).filter((id): id is string => !!id))];
  const reviewerNames: Record<string, string> = {};
  if (reviewerIds.length > 0) {
    const reviewers = await db
      .select({ id: schema.users.id, name: schema.users.name })
      .from(schema.users)
      .where(inArray(schema.users.id, reviewerIds));
    for (const r of reviewers) reviewerNames[r.id] = r.name;
  }

  return (
    <div>
      <p className="mb-5 max-w-2xl text-sm text-ink-500">
        Review submitted sighting reports, verify observer details, and move
        reports through the committee decision workflow. Internal notes are
        never shown publicly.
      </p>
      <ReportsTable reports={reports} reviewerNames={reviewerNames} />
    </div>
  );
}
