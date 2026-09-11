import { count, desc } from "drizzle-orm";

import { MediaManager } from "@/components/admin/media-manager";
import { Pagination, parsePageParam } from "@/components/admin/pagination";
import { getDb, schema } from "@/db/client";
import { requireUser } from "@/lib/auth/dal";

const PAGE_SIZE = 24;

export default async function AdminMediaPage({ searchParams }: PageProps<"/admin/dashboard/media">) {
  const user = await requireUser();
  const params = await searchParams;
  const page = parsePageParam(params.page);

  const db = await getDb();
  const [items, [{ value: total }]] = await Promise.all([
    db.select().from(schema.media).orderBy(desc(schema.media.createdAt)).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE),
    db.select({ value: count() }).from(schema.media),
  ]);

  return (
    <div className="space-y-4">
      <MediaManager items={items} canEdit={["super_admin", "committee_admin"].includes(user.role)} />
      <Pagination page={page} pageSize={PAGE_SIZE} total={total} basePath="/admin/dashboard/media" />
    </div>
  );
}
