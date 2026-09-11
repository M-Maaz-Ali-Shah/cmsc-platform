import { count, desc } from "drizzle-orm";

import { ContactMessagesManager } from "@/components/admin/contact-messages-manager";
import { Pagination, parsePageParam } from "@/components/admin/pagination";
import { getDb, schema } from "@/db/client";
import { requireUser } from "@/lib/auth/dal";

const PAGE_SIZE = 20;

export default async function AdminContactMessagesPage({
  searchParams,
}: PageProps<"/admin/dashboard/contact-messages">) {
  const user = await requireUser();
  const params = await searchParams;
  const page = parsePageParam(params.page);

  const db = await getDb();
  const [messages, [{ value: total }]] = await Promise.all([
    db
      .select()
      .from(schema.contactMessages)
      .orderBy(desc(schema.contactMessages.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ value: count() }).from(schema.contactMessages),
  ]);

  return (
    <div className="space-y-4">
      <ContactMessagesManager messages={messages} canEdit={["super_admin", "committee_admin"].includes(user.role)} />
      <Pagination page={page} pageSize={PAGE_SIZE} total={total} basePath="/admin/dashboard/contact-messages" />
    </div>
  );
}
