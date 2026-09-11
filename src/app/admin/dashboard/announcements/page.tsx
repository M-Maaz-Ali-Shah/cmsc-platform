import { count, desc } from "drizzle-orm";

import { AnnouncementsManager } from "@/components/admin/announcements-manager";
import { Pagination, parsePageParam } from "@/components/admin/pagination";
import { getDb, schema } from "@/db/client";
import { requireUser } from "@/lib/auth/dal";

const PAGE_SIZE = 20;

export default async function AdminAnnouncementsPage({
  searchParams,
}: PageProps<"/admin/dashboard/announcements">) {
  const user = await requireUser();
  const params = await searchParams;
  const page = parsePageParam(params.page);

  const db = await getDb();
  const [announcements, [{ value: total }]] = await Promise.all([
    db
      .select()
      .from(schema.announcements)
      .orderBy(desc(schema.announcements.updatedAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ value: count() }).from(schema.announcements),
  ]);

  return (
    <div className="space-y-4">
      <AnnouncementsManager
        announcements={announcements}
        canEdit={["super_admin", "committee_admin"].includes(user.role)}
      />
      <Pagination page={page} pageSize={PAGE_SIZE} total={total} basePath="/admin/dashboard/announcements" />
    </div>
  );
}
