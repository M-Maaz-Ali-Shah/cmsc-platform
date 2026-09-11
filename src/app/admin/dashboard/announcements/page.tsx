import { desc } from "drizzle-orm";

import { AnnouncementsManager } from "@/components/admin/announcements-manager";
import { getDb, schema } from "@/db/client";
import { requireUser } from "@/lib/auth/dal";

export default async function AdminAnnouncementsPage() {
  const user = await requireUser();
  const db = await getDb();
  const announcements = await db
    .select()
    .from(schema.announcements)
    .orderBy(desc(schema.announcements.updatedAt));

  return (
    <AnnouncementsManager
      announcements={announcements}
      canEdit={["super_admin", "committee_admin"].includes(user.role)}
    />
  );
}
