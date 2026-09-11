"use server";

import { eq, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getDb, schema } from "@/db/client";
import { requireUser } from "@/lib/auth/dal";
import { CalendarEntrySchema, type CalendarEntryFormState } from "@/lib/validation/calendar-entry";

const MANAGER_ROLES = ["super_admin", "committee_admin"] as const;

async function logAudit(actorName: string, action: string, target: string) {
  const db = await getDb();
  await db.insert(schema.auditLogs).values({ id: crypto.randomUUID(), actorName, action, target });
}

export async function createCalendarEntry(
  _prevState: CalendarEntryFormState,
  formData: FormData
): Promise<CalendarEntryFormState> {
  const user = await requireUser([...MANAGER_ROLES]);

  const parsed = CalendarEntrySchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }
  const data = parsed.data;

  const db = await getDb();
  const [{ value: maxOrder }] = await db.select({ value: max(schema.calendarEntries.sortOrder) }).from(schema.calendarEntries);

  await db.insert(schema.calendarEntries).values({
    id: crypto.randomUUID(),
    hijriMonth: data.hijriMonth,
    hijriYear: data.hijriYear,
    astronomicalEstimate: data.astronomicalEstimate || null,
    officialStatus: data.officialStatus,
    officialDate: data.officialDate || null,
    announcementSlug: data.announcementSlug || null,
    sortOrder: (maxOrder ?? 0) + 1,
  });

  await logAudit(user.name, "added a calendar entry:", `${data.hijriMonth} ${data.hijriYear}`);
  revalidatePath("/admin/dashboard/calendar");
  revalidatePath("/calendar");
}

export async function updateCalendarEntryStatus(id: string, officialStatus: string, officialDate: string | null) {
  const user = await requireUser([...MANAGER_ROLES]);
  const db = await getDb();
  const rows = await db.select({ hijriMonth: schema.calendarEntries.hijriMonth, hijriYear: schema.calendarEntries.hijriYear }).from(schema.calendarEntries).where(eq(schema.calendarEntries.id, id)).limit(1);
  const entry = rows[0];
  if (!entry) throw new Error("Entry not found.");

  await db
    .update(schema.calendarEntries)
    .set({ officialStatus, officialDate })
    .where(eq(schema.calendarEntries.id, id));

  await logAudit(user.name, `updated calendar status to "${officialStatus}" for`, `${entry.hijriMonth} ${entry.hijriYear}`);
  revalidatePath("/admin/dashboard/calendar");
  revalidatePath("/calendar");
}

export async function deleteCalendarEntry(id: string) {
  const user = await requireUser([...MANAGER_ROLES]);
  const db = await getDb();
  const rows = await db.select({ hijriMonth: schema.calendarEntries.hijriMonth, hijriYear: schema.calendarEntries.hijriYear }).from(schema.calendarEntries).where(eq(schema.calendarEntries.id, id)).limit(1);
  const entry = rows[0];
  if (!entry) return;

  await db.delete(schema.calendarEntries).where(eq(schema.calendarEntries.id, id));
  await logAudit(user.name, "removed the calendar entry:", `${entry.hijriMonth} ${entry.hijriYear}`);
  revalidatePath("/admin/dashboard/calendar");
  revalidatePath("/calendar");
}
