import { asc } from "drizzle-orm";

import { CommitteeManager } from "@/components/admin/committee-manager";
import { getDb, schema } from "@/db/client";
import { requireUser } from "@/lib/auth/dal";

export default async function AdminCommitteePage() {
  const user = await requireUser();
  const db = await getDb();
  const members = await db.select().from(schema.committeeMembers).orderBy(asc(schema.committeeMembers.sortOrder));

  return <CommitteeManager members={members} canEdit={["super_admin", "committee_admin"].includes(user.role)} />;
}
