import { desc, eq, inArray } from "drizzle-orm";

import { ObserversManager, type ObserverAccount } from "@/components/admin/observers-manager";
import { getDb, schema } from "@/db/client";
import { requireUser } from "@/lib/auth/dal";

export default async function AdminObserversPage() {
  const user = await requireUser();
  const db = await getDb();

  const observerUsers = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.role, "observer"))
    .orderBy(desc(schema.users.createdAt));

  const regionIds = observerUsers.map((o) => o.regionId).filter((id): id is string => !!id);
  const regionNames: Record<string, string> = {};
  if (regionIds.length > 0) {
    const regionRows = await db
      .select({ id: schema.regions.id, name: schema.regions.name })
      .from(schema.regions)
      .where(inArray(schema.regions.id, regionIds));
    for (const r of regionRows) regionNames[r.id] = r.name;
  }

  const observers: ObserverAccount[] = observerUsers.map((o) => ({
    id: o.id,
    name: o.name,
    email: o.email,
    active: o.active,
    createdAt: o.createdAt,
    regionName: o.regionId ? (regionNames[o.regionId] ?? null) : null,
  }));

  return (
    <ObserversManager observers={observers} canEdit={["super_admin", "committee_admin"].includes(user.role)} />
  );
}
