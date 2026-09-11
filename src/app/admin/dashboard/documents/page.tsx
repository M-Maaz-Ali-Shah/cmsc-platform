import { desc } from "drizzle-orm";

import { DocumentsManager } from "@/components/admin/documents-manager";
import { getDb, schema } from "@/db/client";
import { requireUser } from "@/lib/auth/dal";

export default async function AdminDocumentsPage() {
  const user = await requireUser();
  const db = await getDb();
  const documents = await db.select().from(schema.documents).orderBy(desc(schema.documents.createdAt));

  return <DocumentsManager documents={documents} canEdit={["super_admin", "committee_admin"].includes(user.role)} />;
}
