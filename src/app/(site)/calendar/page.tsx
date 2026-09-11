import type { Metadata } from "next";
import { asc } from "drizzle-orm";

import { PageBanner } from "@/components/layout/page-banner";
import { Container } from "@/components/ui/container";
import { CalendarExplorer } from "@/components/calendar/calendar-explorer";
import type { CalendarMonthEntry } from "@/lib/calendar-data";
import type { BadgeStatus } from "@/lib/mock-data";
import { getDb, schema } from "@/db/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Islamic Calendar",
  description:
    "The Islamic calendar with astronomical crescent-visibility estimates shown alongside official committee announcements.",
};

const STATUS_MAP: Record<string, { status: BadgeStatus; label: string }> = {
  Announced: { status: "published", label: "Announced" },
  Sighted: { status: "sighted", label: "Sighted" },
  "Current Month": { status: "awaiting", label: "Current Month" },
  "Under Review": { status: "review", label: "Under Review" },
  Upcoming: { status: "notSighted", label: "Upcoming" },
};

export default async function CalendarPage() {
  const db = await getDb();
  const rows = await db.select().from(schema.calendarEntries).orderBy(asc(schema.calendarEntries.sortOrder));

  const entries: CalendarMonthEntry[] = rows.map((r) => ({
    month: r.hijriMonth,
    hijriYear: r.hijriYear,
    astronomicalEstimate: r.astronomicalEstimate ?? "Not yet estimated",
    officialStatus: STATUS_MAP[r.officialStatus]?.status ?? "notSighted",
    officialLabel: STATUS_MAP[r.officialStatus]?.label ?? r.officialStatus,
    officialDate: r.officialDate,
    announcementSlug: r.announcementSlug,
  }));

  return (
    <>
      <PageBanner
        crumb="Calendar"
        eyebrow="Islamic Calendar"
        title="Islamic Calendar"
        description="Astronomical predictions are shown for information only and are clearly distinguished from official committee announcements."
      />
      <section className="py-14 sm:py-16">
        <Container>
          {entries.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border-subtle p-10 text-center text-sm text-ink-500">
              No calendar entries have been configured yet.
            </p>
          ) : (
            <CalendarExplorer entries={entries} />
          )}
        </Container>
      </section>
    </>
  );
}
