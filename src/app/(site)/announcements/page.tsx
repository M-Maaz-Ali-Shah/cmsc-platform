import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";

import { PageBanner } from "@/components/layout/page-banner";
import { Container } from "@/components/ui/container";
import { ArchiveBrowser } from "@/components/announcements/archive-browser";
import { getDb, schema } from "@/db/client";

// Always reflect the current published set — never cache a build-time
// snapshot of what may be a frequently-changing table.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Announcements Archive",
  description:
    "Search and browse official moon-sighting announcements published by the Central Moon Sighting Committee GB & EU.",
};

// ArchiveBrowser does its own client-side search/month/year/type filtering
// and its own "load more" pagination over whatever it's given, so this
// can't switch to server-side offset pagination without either breaking
// that filtering or duplicating it server-side. A committee publishes at
// most a few dozen announcements a year, so a generous bound (not "no
// limit at all") is the pragmatic middle ground — comfortably covers
// decades of history while still not being truly unbounded.
const MAX_ARCHIVE_ROWS = 500;

export default async function AnnouncementsPage() {
  const db = await getDb();
  const announcements = await db
    .select()
    .from(schema.announcements)
    .where(eq(schema.announcements.status, "Published"))
    .orderBy(desc(schema.announcements.publishedAt))
    .limit(MAX_ARCHIVE_ROWS);

  return (
    <>
      <PageBanner
        crumb="Announcements"
        eyebrow="Archive"
        title="Announcements Archive"
        description="Search official committee announcements by month, Hijri year, or type."
      />
      <section className="py-14 sm:py-16">
        <Container>
          {announcements.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border-subtle p-10 text-center text-sm text-ink-500">
              No announcements have been published yet. Check back soon.
            </p>
          ) : (
            <ArchiveBrowser announcements={announcements} />
          )}
        </Container>
      </section>
    </>
  );
}
