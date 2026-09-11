"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getDb, getCf, schema } from "@/db/client";
import { requireUser } from "@/lib/auth/dal";
import { AnnouncementSchema, type AnnouncementFormState } from "@/lib/validation/announcement";
import { ANNOUNCEMENT_STAGES, type AnnouncementStage } from "@/lib/types/announcements";
import { sendBulkEmail } from "@/lib/email/resend";

const EDITOR_ROLES = ["super_admin", "committee_admin"] as const;

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function uniqueSlug(month: string, hijriYear: string) {
  const db = await getDb();
  const base = slugify(`${month}-${hijriYear}`) || "announcement";
  let slug = base;
  let n = 2;
  for (;;) {
    const existing = await db
      .select({ id: schema.announcements.id })
      .from(schema.announcements)
      .where(eq(schema.announcements.slug, slug))
      .limit(1);
    if (existing.length === 0) return slug;
    slug = `${base}-${n}`;
    n += 1;
  }
}

async function logAudit(actorName: string, action: string, target: string) {
  const db = await getDb();
  await db.insert(schema.auditLogs).values({ id: crypto.randomUUID(), actorName, action, target });
}

export async function createAnnouncement(
  _prevState: AnnouncementFormState,
  formData: FormData
): Promise<AnnouncementFormState> {
  const user = await requireUser([...EDITOR_ROLES]);

  const parsed = AnnouncementSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }
  const data = parsed.data;

  const id = crypto.randomUUID();
  const slug = await uniqueSlug(data.month, data.hijriYear);

  let pdfKey: string | null = null;
  const pdfFile = formData.get("pdf");
  if (pdfFile instanceof File && pdfFile.size > 0) {
    if (pdfFile.size > 10 * 1024 * 1024) {
      return { error: "The PDF attachment must be under 10 MB." };
    }
    if (pdfFile.type && pdfFile.type !== "application/pdf") {
      return { error: "The attachment must be a PDF file." };
    }
    const { env } = await getCf();
    pdfKey = `announcements/${id}/statement.pdf`;
    await env.UPLOADS.put(pdfKey, await pdfFile.arrayBuffer(), {
      httpMetadata: { contentType: "application/pdf" },
    });
  }

  const db = await getDb();
  await db.insert(schema.announcements).values({
    id,
    slug,
    month: data.month,
    hijriYear: data.hijriYear,
    gregorianYear: data.gregorianYear,
    decision: data.decision,
    summary: data.summary,
    statement: data.statement,
    region: data.region,
    type: data.type,
    publicStatus: data.publicStatus,
    pdfKey,
    status: "Draft",
    createdByName: user.name,
  });

  await logAudit(user.name, "created a new announcement draft:", `${data.month} ${data.hijriYear}`);

  revalidatePath("/admin/dashboard/announcements");
  return { success: true };
}

export async function advanceAnnouncementStatus(id: string) {
  const user = await requireUser([...EDITOR_ROLES]);

  const db = await getDb();
  const rows = await db.select().from(schema.announcements).where(eq(schema.announcements.id, id)).limit(1);
  const announcement = rows[0];
  if (!announcement) throw new Error("Announcement not found.");

  const currentIdx = ANNOUNCEMENT_STAGES.indexOf(announcement.status as AnnouncementStage);
  const nextStage = ANNOUNCEMENT_STAGES[Math.min(currentIdx + 1, ANNOUNCEMENT_STAGES.length - 1)];

  const isPublishing = nextStage === "Published" && announcement.status !== "Published";

  await db
    .update(schema.announcements)
    .set({
      status: nextStage,
      publishedAt: isPublishing ? new Date() : announcement.publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(schema.announcements.id, id));

  await logAudit(user.name, `moved announcement to "${nextStage}":`, `${announcement.month} ${announcement.hijriYear}`);

  if (isPublishing) {
    const subscribers = await db.select({ email: schema.subscribers.email }).from(schema.subscribers);
    if (subscribers.length > 0) {
      const { sent, failed } = await sendBulkEmail({
        recipients: subscribers.map((s) => s.email),
        subject: `${announcement.decision}`,
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
            <p style="text-transform: uppercase; letter-spacing: 0.08em; font-size: 12px; color: #0f6b4a;">Official Statement &middot; ${announcement.type}</p>
            <h1 style="font-size: 20px; color: #0b1f3a;">${announcement.decision}</h1>
            <p style="font-size: 15px; line-height: 1.6; color: #1f2937;">${announcement.summary}</p>
            <p style="font-size: 13px; color: #6b7280;">Region: ${announcement.region}</p>
            <p style="margin-top: 24px;"><a href="${(await getCf()).env.SITE_URL}/announcements/${announcement.slug}" style="color: #0b1f3a; font-weight: 600;">Read the full announcement →</a></p>
          </div>
        `,
      });
      await logAudit(
        "System",
        `sent publish notification email (${sent} sent, ${failed} failed) for`,
        `${announcement.month} ${announcement.hijriYear}`
      );
    }
  }

  revalidatePath("/admin/dashboard/announcements");
  revalidatePath("/announcements");
  revalidatePath(`/announcements/${announcement.slug}`);
}
