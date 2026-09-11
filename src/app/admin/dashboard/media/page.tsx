import { desc } from "drizzle-orm";

import { MediaManager } from "@/components/admin/media-manager";
import { getDb, schema } from "@/db/client";
import { requireUser } from "@/lib/auth/dal";

export default async function AdminMediaPage() {
  const user = await requireUser();
  const db = await getDb();
  const items = await db.select().from(schema.media).orderBy(desc(schema.media.createdAt));

  return <MediaManager items={items} canEdit={["super_admin", "committee_admin"].includes(user.role)} />;
}
