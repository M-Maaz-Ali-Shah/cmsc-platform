import { desc } from "drizzle-orm";

import { ContactMessagesManager } from "@/components/admin/contact-messages-manager";
import { getDb, schema } from "@/db/client";
import { requireUser } from "@/lib/auth/dal";

export default async function AdminContactMessagesPage() {
  const user = await requireUser();
  const db = await getDb();
  const messages = await db.select().from(schema.contactMessages).orderBy(desc(schema.contactMessages.createdAt));

  return (
    <ContactMessagesManager messages={messages} canEdit={["super_admin", "committee_admin"].includes(user.role)} />
  );
}
