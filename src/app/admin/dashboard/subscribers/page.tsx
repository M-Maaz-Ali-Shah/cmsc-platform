import { count, desc } from "drizzle-orm";

import { SubscribersManager } from "@/components/admin/subscribers-manager";
import { Pagination, parsePageParam } from "@/components/admin/pagination";
import { getDb, schema } from "@/db/client";
import { requireUser } from "@/lib/auth/dal";

const PAGE_SIZE = 25;

export default async function AdminSubscribersPage({ searchParams }: PageProps<"/admin/dashboard/subscribers">) {
  const user = await requireUser();
  const params = await searchParams;
  const page = parsePageParam(params.page);

  const db = await getDb();
  const [subscribers, [{ value: total }]] = await Promise.all([
    db
      .select()
      .from(schema.subscribers)
      .orderBy(desc(schema.subscribers.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ value: count() }).from(schema.subscribers),
  ]);

  return (
    <div className="space-y-4">
      <p className="max-w-2xl text-sm text-ink-500">
        Everyone who has subscribed to announcement emails. Pending
        subscribers haven&rsquo;t confirmed their email address yet and won&rsquo;t
        receive anything until they do.
      </p>
      <SubscribersManager
        subscribers={subscribers}
        canEdit={["super_admin", "committee_admin"].includes(user.role)}
      />
      <Pagination page={page} pageSize={PAGE_SIZE} total={total} basePath="/admin/dashboard/subscribers" />
    </div>
  );
}
