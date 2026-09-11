import { asc, eq } from "drizzle-orm";

import { CalendarManager } from "@/components/admin/calendar-manager";
import { getDb, schema } from "@/db/client";
import { requireUser } from "@/lib/auth/dal";

export default async function AdminCalendarPage() {
  const user = await requireUser();
  const db = await getDb();

  const [entries, publishedAnnouncements] = await Promise.all([
    db.select().from(schema.calendarEntries).orderBy(asc(schema.calendarEntries.sortOrder)),
    db
      .select({ slug: schema.announcements.slug })
      .from(schema.announcements)
      .where(eq(schema.announcements.status, "Published")),
  ]);

  return (
    <CalendarManager
      entries={entries}
      announcementSlugs={publishedAnnouncements.map((a) => a.slug)}
      canEdit={["super_admin", "committee_admin"].includes(user.role)}
    />
  );
}
