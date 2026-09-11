"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getDb, schema } from "@/db/client";
import { requireUser } from "@/lib/auth/dal";
import { ContactSchema, NewsletterSchema, type ContactFormState, type NewsletterFormState } from "@/lib/validation/contact";

export async function submitContactMessage(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  if (formData.get("website")) {
    return { error: "Submission could not be processed. Please try again." };
  }

  const parsed = ContactSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }
  const data = parsed.data;

  const db = await getDb();
  await db.insert(schema.contactMessages).values({
    id: crypto.randomUUID(),
    name: data.name,
    email: data.email.toLowerCase().trim(),
    subject: data.subject,
    message: data.message,
    isRead: false,
  });

  revalidatePath("/admin/dashboard/contact-messages");
  return { success: true };
}

export async function subscribeNewsletter(
  _prevState: NewsletterFormState,
  formData: FormData
): Promise<NewsletterFormState> {
  if (formData.get("website")) {
    return { error: "Submission could not be processed." };
  }

  const parsed = NewsletterSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid email address." };
  }
  const email = parsed.data.email.toLowerCase().trim();

  const db = await getDb();
  const existing = await db.select({ id: schema.subscribers.id }).from(schema.subscribers).where(eq(schema.subscribers.email, email)).limit(1);
  if (existing.length === 0) {
    await db.insert(schema.subscribers).values({ id: crypto.randomUUID(), email });
  }

  return { success: true };
}

const MANAGER_ROLES = ["super_admin", "committee_admin"] as const;

async function logAudit(actorName: string, action: string, target: string) {
  const db = await getDb();
  await db.insert(schema.auditLogs).values({ id: crypto.randomUUID(), actorName, action, target });
}

export async function setContactMessageRead(id: string, isRead: boolean) {
  await requireUser([...MANAGER_ROLES]);
  const db = await getDb();
  await db.update(schema.contactMessages).set({ isRead }).where(eq(schema.contactMessages.id, id));
  revalidatePath("/admin/dashboard/contact-messages");
}

export async function deleteContactMessage(id: string) {
  const user = await requireUser([...MANAGER_ROLES]);
  const db = await getDb();
  const rows = await db.select({ subject: schema.contactMessages.subject }).from(schema.contactMessages).where(eq(schema.contactMessages.id, id)).limit(1);
  const msg = rows[0];
  await db.delete(schema.contactMessages).where(eq(schema.contactMessages.id, id));
  if (msg) await logAudit(user.name, "deleted the contact message:", msg.subject);
  revalidatePath("/admin/dashboard/contact-messages");
}
