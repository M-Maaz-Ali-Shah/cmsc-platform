import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq, inArray, asc } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";

import { ReportDetailPanel } from "@/components/admin/report-detail-panel";
import { getDb, schema } from "@/db/client";
import { requireUser } from "@/lib/auth/dal";

export default async function AdminReportDetailPage(
  props: PageProps<"/admin/dashboard/reports/[id]">
) {
  const { id: reportRef } = await props.params;
  const currentUser = await requireUser();

  const db = await getDb();
  const rows = await db
    .select()
    .from(schema.sightingReports)
    .where(eq(schema.sightingReports.reportRef, reportRef))
    .limit(1);
  const report = rows[0];
  if (!report) notFound();

  const notes = await db
    .select()
    .from(schema.reportNotes)
    .where(eq(schema.reportNotes.reportId, report.id))
    .orderBy(asc(schema.reportNotes.createdAt));

  const reviewers = await db
    .select({ id: schema.users.id, name: schema.users.name, role: schema.users.role })
    .from(schema.users)
    .where(and(inArray(schema.users.role, ["super_admin", "committee_admin", "reviewer"]), eq(schema.users.active, true)));

  return (
    <div>
      <Link
        href="/admin/dashboard/reports"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-800 hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to Sighting Reports
      </Link>
      <ReportDetailPanel
        report={report}
        notes={notes}
        reviewers={reviewers}
        currentUserName={currentUser.name}
        canEdit={["super_admin", "committee_admin", "reviewer"].includes(currentUser.role)}
      />
    </div>
  );
}
