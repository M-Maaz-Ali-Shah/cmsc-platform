import Link from "next/link";
import { asc, desc, eq, count, countDistinct } from "drizzle-orm";
import {
  CalendarClock,
  CheckCircle2,
  FileSearch,
  Megaphone,
  Users,
  Inbox,
  ArrowRight,
} from "lucide-react";

import { StatTile } from "@/components/admin/stat-tile";
import { MagnitudeBars, StatusBreakdown } from "@/components/admin/charts";
import { ReportStatusBadge } from "@/components/admin/report-status-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDb, schema } from "@/db/client";
import type { ReportStatus } from "@/lib/types/reports";

export default async function AdminOverviewPage() {
  const db = await getDb();
  const [sightingReports, auditLogsRows, latestAnnouncement, regions, reportStats, observerTotal, calendarRows] =
    await Promise.all([
      db.select().from(schema.sightingReports).orderBy(desc(schema.sightingReports.submittedAt)),
      db.select().from(schema.auditLogs).orderBy(desc(schema.auditLogs.createdAt)).limit(5),
      db
        .select({ month: schema.announcements.month, hijriYear: schema.announcements.hijriYear, publicStatus: schema.announcements.publicStatus })
        .from(schema.announcements)
        .where(eq(schema.announcements.status, "Published"))
        .orderBy(desc(schema.announcements.publishedAt))
        .limit(1),
      db.select().from(schema.regions).orderBy(asc(schema.regions.sortOrder)),
      db
        .select({ region: schema.sightingReports.region, reportCount: count() })
        .from(schema.sightingReports)
        .groupBy(schema.sightingReports.region),
      db.select({ value: countDistinct(schema.sightingReports.email) }).from(schema.sightingReports),
      db.select().from(schema.calendarEntries).orderBy(asc(schema.calendarEntries.sortOrder)),
    ]);
  const latest = latestAnnouncement[0];
  const upcomingCycle = calendarRows.find((r) => r.officialStatus === "Under Review") ?? null;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todays = sightingReports.filter((r) => r.submittedAt >= startOfToday);
  const pending = sightingReports.filter((r) => r.status === "Submitted" || r.status === "Received");
  const underReview = sightingReports.filter(
    (r) => r.status === "Under Review" || r.status === "Contact Verification"
  );
  const confirmed = sightingReports.filter(
    (r) => r.status === "Accepted" || r.status === "Included in Decision"
  );

  const totalObservers = observerTotal[0]?.value ?? 0;
  const byRegion = regions
    .map((r) => ({
      name: r.name,
      reports: reportStats.find((s) => s.region.toLowerCase() === r.name.toLowerCase())?.reportCount ?? 0,
    }))
    .sort((a, b) => b.reports - a.reports)
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={Inbox} label="Today's Reports" value={String(todays.length)} />
        <StatTile icon={FileSearch} label="Pending Reports" value={String(pending.length)} />
        <StatTile icon={FileSearch} label="Under Review" value={String(underReview.length)} />
        <StatTile icon={CheckCircle2} label="Confirmed Reports" value={String(confirmed.length)} />
        <StatTile icon={Users} label="Observers to Date" value={String(totalObservers)} />
        <StatTile
          icon={CalendarClock}
          label="Upcoming Sighting"
          value={upcomingCycle?.astronomicalEstimate ?? "Not scheduled"}
          hint={upcomingCycle ? `${upcomingCycle.hijriMonth} ${upcomingCycle.hijriYear}` : undefined}
        />
        <StatTile
          icon={Megaphone}
          label="Latest Announcement"
          value={latest ? `${latest.month} ${latest.hijriYear}` : "None published"}
          hint={latest ? latest.publicStatus : undefined}
        />
        <StatTile
          icon={Users}
          label="Active Regions"
          value={String(regions.filter((r) => r.status === "Active").length)}
          hint={`of ${regions.length} total`}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <MagnitudeBars
          title="Reports by Region (this cycle)"
          data={byRegion.map((r) => ({ label: r.name, value: r.reports }))}
        />
        <StatusBreakdown
          title="Report Status Breakdown"
          data={[
            { label: "Confirmed", value: confirmed.length },
            { label: "Under Review", value: underReview.length },
            { label: "Awaiting", value: pending.length },
            { label: "Rejected", value: sightingReports.filter((r) => r.status === "Rejected").length },
          ]}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <p className="font-heading text-base font-bold text-navy-900">Latest Sighting Reports</p>
            <Link href="/admin/dashboard/reports" className="flex items-center gap-1 text-xs font-semibold text-navy-800 hover:underline">
              View all <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-border-subtle">
            {sightingReports.slice(0, 5).map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-semibold text-navy-900">{r.reportRef}</p>
                  <p className="text-xs text-ink-500">
                    {r.observerName} &middot; {r.city}, {r.country}
                  </p>
                </div>
                <ReportStatusBadge status={r.status as ReportStatus} />
              </li>
            ))}
            {sightingReports.length === 0 && (
              <p className="py-4 text-sm text-ink-400">No sighting reports submitted yet.</p>
            )}
          </ul>
        </Card>

        <Card className="p-6">
          <p className="font-heading text-base font-bold text-navy-900">Recent Activity</p>
          <ul className="mt-4 space-y-4">
            {auditLogsRows.map((log) => (
              <li key={log.id} className="text-sm">
                <p className="text-ink-700">
                  <span className="font-semibold text-navy-900">{log.actorName}</span> {log.action}{" "}
                  <span className="font-medium text-navy-900">{log.target}</span>
                </p>
                <p className="text-xs text-ink-300">
                  {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(log.createdAt)}
                </p>
              </li>
            ))}
            {auditLogsRows.length === 0 && <p className="text-sm text-ink-400">No activity yet.</p>}
          </ul>
          <Button asChild variant="link" className="mt-2 px-0">
            <Link href="/admin/dashboard/audit-logs">View full audit log →</Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}
