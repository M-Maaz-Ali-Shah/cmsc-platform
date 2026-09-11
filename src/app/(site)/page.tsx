import { asc, desc, eq } from "drizzle-orm";

import { Hero } from "@/components/home/hero";
import { CurrentMonth } from "@/components/home/current-month";
import { LatestAnnouncement } from "@/components/home/latest-announcement";
import { StatusTracker } from "@/components/home/status-tracker";
import { ReportCta } from "@/components/home/report-cta";
import { Regions } from "@/components/home/regions";
import { HowItWorks } from "@/components/home/how-it-works";
import { RecentAnnouncements } from "@/components/home/recent-announcements";
import { CommitteePreview } from "@/components/home/committee-preview";
import { CalendarPreview } from "@/components/home/calendar-preview";
import { MediaPreview } from "@/components/home/media-preview";
import { Newsletter } from "@/components/home/newsletter";
import { getDb, schema } from "@/db/client";
import { CALENDAR_STATUS_MAP } from "@/lib/calendar-data";
import { getPublishedContent } from "@/app/actions/content";

export const dynamic = "force-dynamic";

const REVIEW_STATUSES = ["Received", "Under Review", "Contact Verification"];
const DECIDED_STATUSES = ["Accepted", "Rejected", "Included in Decision"];

export default async function Home() {
  const db = await getDb();
  const [reports, calendarRows, publishedAnnouncements, regionsRows, mediaRows, hero] = await Promise.all([
    db.select().from(schema.sightingReports),
    db.select().from(schema.calendarEntries).orderBy(asc(schema.calendarEntries.sortOrder)),
    db
      .select()
      .from(schema.announcements)
      .where(eq(schema.announcements.status, "Published"))
      .orderBy(desc(schema.announcements.publishedAt))
      .limit(4),
    db.select().from(schema.regions).orderBy(asc(schema.regions.sortOrder)),
    db.select().from(schema.media).orderBy(desc(schema.media.createdAt)).limit(4),
    getPublishedContent("homepage-hero", {
      title: "Central Moon Sighting Committee",
      description:
        "Official moon-sighting announcements, reports and Islamic calendar information for communities across Great Britain and Europe.",
    }),
  ]);

  const current = calendarRows.find((r) => r.officialStatus === "Current Month") ?? null;
  const upcoming = calendarRows.find((r) => r.officialStatus === "Under Review") ?? null;
  const currentBadge = current ? CALENDAR_STATUS_MAP[current.officialStatus] : null;

  const reportTotal = reports.length;
  const reportReviewed = reports.filter(
    (r) => REVIEW_STATUSES.includes(r.status) || DECIDED_STATUSES.includes(r.status)
  ).length;
  const reportDecided = reports.filter((r) => DECIDED_STATUSES.includes(r.status)).length;
  const reportIncluded = reports.filter((r) => r.status === "Included in Decision").length;

  const latestAnnouncement = publishedAnnouncements[0] ?? null;
  const recentAnnouncements = publishedAnnouncements.slice(0, 3);

  return (
    <>
      <Hero regionsCovered={regionsRows.length} title={hero.title} description={hero.description} />
      <CurrentMonth
        current={
          current
            ? {
                hijriMonth: current.hijriMonth,
                hijriYear: current.hijriYear,
                statusVariant: currentBadge?.status ?? "notSighted",
                statusLabel: currentBadge?.label ?? current.officialStatus,
                estimate: current.astronomicalEstimate,
              }
            : null
        }
        upcoming={upcoming ? { hijriMonth: upcoming.hijriMonth, hijriYear: upcoming.hijriYear } : null}
      />
      <LatestAnnouncement announcement={latestAnnouncement} />
      <StatusTracker
        steps={[
          { label: "Reports Submitted", count: reportTotal },
          { label: "Under Review", count: reportReviewed },
          { label: "Committee Decision", count: reportDecided },
          { label: "Included in Announcement", count: reportIncluded },
        ]}
        upcomingEstimate={upcoming?.astronomicalEstimate ?? current?.astronomicalEstimate ?? null}
        upcomingLabel={upcoming ? `${upcoming.hijriMonth} ${upcoming.hijriYear}` : null}
      />
      <ReportCta />
      <Regions regions={regionsRows.map((r) => ({ name: r.name, group: r.group }))} />
      <HowItWorks />
      <RecentAnnouncements announcements={recentAnnouncements} />
      <CommitteePreview />
      <CalendarPreview
        entries={calendarRows.map((r) => ({
          hijri: r.hijriMonth,
          variant: CALENDAR_STATUS_MAP[r.officialStatus]?.status ?? "notSighted",
          label: CALENDAR_STATUS_MAP[r.officialStatus]?.label ?? r.officialStatus,
        }))}
      />
      <MediaPreview
        items={mediaRows.map((m) => ({ id: m.id, type: m.type, title: m.title }))}
      />
      <Newsletter />
    </>
  );
}
