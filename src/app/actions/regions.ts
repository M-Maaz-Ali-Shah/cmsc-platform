"use server";

import { eq, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getDb, schema } from "@/db/client";
import { requireUser } from "@/lib/auth/dal";
import { RegionSchema, type RegionFormState } from "@/lib/validation/region";

const MANAGER_ROLES = ["super_admin", "committee_admin"] as const;

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function logAudit(actorName: string, action: string, target: string) {
  const db = await getDb();
  await db.insert(schema.auditLogs).values({ id: crypto.randomUUID(), actorName, action, target });
}

export async function createRegion(
  _prevState: RegionFormState,
  formData: FormData
): Promise<RegionFormState> {
  const user = await requireUser([...MANAGER_ROLES]);

  const parsed = RegionSchema.safeParse({
    name: formData.get("name"),
    group: formData.get("group"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }
  const { name, group } = parsed.data;

  const db = await getDb();
  let id = slugify(name);
  const existing = await db.select({ id: schema.regions.id }).from(schema.regions).where(eq(schema.regions.id, id)).limit(1);
  if (existing.length > 0) {
    return { error: "A region with that name already exists." };
  }
  if (!id) id = crypto.randomUUID();

  const [{ value: maxOrder }] = await db.select({ value: max(schema.regions.sortOrder) }).from(schema.regions);

  await db.insert(schema.regions).values({
    id,
    name,
    group,
    status: "Awaiting Representative",
    sortOrder: (maxOrder ?? 0) + 1,
  });

  await logAudit(user.name, "added a new region:", name);
  revalidatePath("/admin/dashboard/regions");
  revalidatePath("/regions");
}

export async function assignRegionRepresentative(regionId: string, userId: string | null) {
  const actor = await requireUser([...MANAGER_ROLES]);

  const db = await getDb();
  const rows = await db.select().from(schema.regions).where(eq(schema.regions.id, regionId)).limit(1);
  const region = rows[0];
  if (!region) throw new Error("Region not found.");

  await db
    .update(schema.regions)
    .set({ representativeUserId: userId, status: userId ? "Active" : "Awaiting Representative" })
    .where(eq(schema.regions.id, regionId));

  await logAudit(
    actor.name,
    userId ? "assigned a representative to" : "unassigned the representative from",
    region.name
  );

  revalidatePath("/admin/dashboard/regions");
  revalidatePath("/regions");
}

export async function deleteRegion(regionId: string) {
  const actor = await requireUser([...MANAGER_ROLES]);
  const db = await getDb();
  const rows = await db.select({ name: schema.regions.name }).from(schema.regions).where(eq(schema.regions.id, regionId)).limit(1);
  const region = rows[0];
  if (!region) return;

  await db.delete(schema.regions).where(eq(schema.regions.id, regionId));
  await logAudit(actor.name, "removed the region:", region.name);

  revalidatePath("/admin/dashboard/regions");
  revalidatePath("/regions");
}
