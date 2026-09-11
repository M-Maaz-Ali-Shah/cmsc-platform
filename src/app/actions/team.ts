"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getDb, schema } from "@/db/client";
import { requireUser } from "@/lib/auth/dal";
import { hashPassword, generateRandomToken } from "@/lib/auth/password";
import { CreateTeamAccountSchema, type CreateTeamAccountState } from "@/lib/validation/team";

const MANAGER_ROLES = ["super_admin", "committee_admin"] as const;

async function logAudit(actorName: string, action: string, target: string) {
  const db = await getDb();
  await db.insert(schema.auditLogs).values({ id: crypto.randomUUID(), actorName, action, target });
}

/**
 * Creates a dashboard account for a regional representative, observer, or
 * other team role. There's no email-invite flow yet (that needs a Resend
 * magic-link build of its own — see DEPLOY.md) so this generates a one-time
 * temporary password, shown ONCE in the UI for the admin to relay securely
 * out of band. The account holder should be told to change it after first
 * login once a "change password" flow exists.
 */
export async function createTeamAccount(
  _prevState: CreateTeamAccountState,
  formData: FormData
): Promise<CreateTeamAccountState> {
  const user = await requireUser([...MANAGER_ROLES]);

  const parsed = CreateTeamAccountSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    regionId: formData.get("regionId") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }
  const data = parsed.data;
  const email = data.email.toLowerCase().trim();

  const db = await getDb();
  const existing = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, email)).limit(1);
  if (existing.length > 0) {
    return { error: "An account with that email already exists." };
  }

  const tempPassword = generateRandomToken(9); // 18 hex chars — plenty of entropy, easy to relay
  const { hash, salt } = await hashPassword(tempPassword);
  const userId = crypto.randomUUID();

  await db.insert(schema.users).values({
    id: userId,
    email,
    passwordHash: hash,
    passwordSalt: salt,
    name: data.name,
    role: data.role,
    regionId: data.regionId || null,
    active: true,
  });

  await logAudit(user.name, `created a ${data.role.replace("_", " ")} account for`, `${data.name} (${email})`);

  revalidatePath("/admin/dashboard/regions");
  revalidatePath("/admin/dashboard/observers");

  return { success: true, email, tempPassword };
}

export async function setUserActive(userId: string, active: boolean) {
  const actor = await requireUser([...MANAGER_ROLES]);
  if (userId === actor.id && !active) {
    throw new Error("You cannot deactivate your own account.");
  }

  const db = await getDb();
  const rows = await db.select({ name: schema.users.name }).from(schema.users).where(eq(schema.users.id, userId)).limit(1);
  const target = rows[0];
  if (!target) throw new Error("Account not found.");

  await db.update(schema.users).set({ active }).where(eq(schema.users.id, userId));
  await logAudit(actor.name, active ? "reactivated the account for" : "deactivated the account for", target.name);

  revalidatePath("/admin/dashboard/regions");
  revalidatePath("/admin/dashboard/observers");
}
