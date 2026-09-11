"use server";

import { eq, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getDb, getCf, schema } from "@/db/client";
import { requireUser } from "@/lib/auth/dal";
import { CommitteeMemberSchema, type CommitteeMemberFormState } from "@/lib/validation/committee-member";

const MANAGER_ROLES = ["super_admin", "committee_admin"] as const;

async function logAudit(actorName: string, action: string, target: string) {
  const db = await getDb();
  await db.insert(schema.auditLogs).values({ id: crypto.randomUUID(), actorName, action, target });
}

export async function createCommitteeMember(
  _prevState: CommitteeMemberFormState,
  formData: FormData
): Promise<CommitteeMemberFormState> {
  const user = await requireUser([...MANAGER_ROLES]);

  const parsed = CommitteeMemberSchema.safeParse({
    name: formData.get("name"),
    role: formData.get("role"),
    region: formData.get("region"),
    bio: formData.get("bio") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }
  const data = parsed.data;
  const id = crypto.randomUUID();

  let photoKey: string | null = null;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    if (photo.size > 5 * 1024 * 1024) return { error: "Photo must be under 5 MB." };
    if (photo.type && !["image/jpeg", "image/png", "image/webp"].includes(photo.type)) {
      return { error: "Photo must be a JPEG, PNG, or WEBP image." };
    }
    const { env } = await getCf();
    photoKey = `committee/${id}/photo.${photo.type === "image/png" ? "png" : photo.type === "image/webp" ? "webp" : "jpg"}`;
    await env.UPLOADS.put(photoKey, await photo.arrayBuffer(), { httpMetadata: { contentType: photo.type } });
  }

  const db = await getDb();
  const [{ value: maxOrder }] = await db.select({ value: max(schema.committeeMembers.sortOrder) }).from(schema.committeeMembers);

  await db.insert(schema.committeeMembers).values({
    id,
    name: data.name,
    role: data.role,
    region: data.region,
    bio: data.bio || null,
    photoKey,
    approved: false,
    sortOrder: (maxOrder ?? 0) + 1,
  });

  await logAudit(user.name, "added a committee member profile:", data.name);
  revalidatePath("/admin/dashboard/committee");
  revalidatePath("/committee");
}

export async function setCommitteeMemberApproved(id: string, approved: boolean) {
  const user = await requireUser([...MANAGER_ROLES]);
  const db = await getDb();
  const rows = await db.select({ name: schema.committeeMembers.name }).from(schema.committeeMembers).where(eq(schema.committeeMembers.id, id)).limit(1);
  const member = rows[0];
  if (!member) throw new Error("Member not found.");

  await db.update(schema.committeeMembers).set({ approved }).where(eq(schema.committeeMembers.id, id));
  await logAudit(user.name, approved ? "approved the committee profile for" : "hid the committee profile for", member.name);

  revalidatePath("/admin/dashboard/committee");
  revalidatePath("/committee");
}

export async function deleteCommitteeMember(id: string) {
  const user = await requireUser([...MANAGER_ROLES]);
  const db = await getDb();
  const rows = await db.select({ name: schema.committeeMembers.name }).from(schema.committeeMembers).where(eq(schema.committeeMembers.id, id)).limit(1);
  const member = rows[0];
  if (!member) return;

  await db.delete(schema.committeeMembers).where(eq(schema.committeeMembers.id, id));
  await logAudit(user.name, "removed the committee profile for", member.name);

  revalidatePath("/admin/dashboard/committee");
  revalidatePath("/committee");
}
