import { count, desc } from "drizzle-orm";

import { DocumentsManager } from "@/components/admin/documents-manager";
import { Pagination, parsePageParam } from "@/components/admin/pagination";
import { getDb, schema } from "@/db/client";
import { requireUser } from "@/lib/auth/dal";

const PAGE_SIZE = 20;

export default async function AdminDocumentsPage({ searchParams }: PageProps<"/admin/dashboard/documents">) {
  const user = await requireUser();
  const params = await searchParams;
  const page = parsePageParam(params.page);

  const db = await getDb();
  const [documents, [{ value: total }]] = await Promise.all([
    db
      .select()
      .from(schema.documents)
      .orderBy(desc(schema.documents.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ value: count() }).from(schema.documents),
  ]);

  return (
    <div className="space-y-4">
      <DocumentsManager documents={documents} canEdit={["super_admin", "committee_admin"].includes(user.role)} />
      <Pagination page={page} pageSize={PAGE_SIZE} total={total} basePath="/admin/dashboard/documents" />
    </div>
  );
}
