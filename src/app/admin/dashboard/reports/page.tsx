import { desc, inArray } from "drizzle-orm";

import { ReportsTable } from "@/components/admin/reports-table";
import { getDb, schema } from "@/db/client";

export default async function AdminReportsPage() {
  const db = await getDb();
  const reports = await db
    .select()
    .from(schema.sightingReports)
    .orderBy(desc(schema.sightingReports.submittedAt));

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
