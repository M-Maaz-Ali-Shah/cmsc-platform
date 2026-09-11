"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getDb, getCf, schema } from "@/db/client";
import { requireUser } from "@/lib/auth/dal";
import { checkRateLimitByIp, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";
import { sendNotification } from "@/app/actions/notifications";
import { getSettings } from "@/app/actions/settings";
import {
  SightingReportSchema,
  MAX_UPLOAD_BYTES,
  ALLOWED_PHOTO_TYPES,
  ALLOWED_EVIDENCE_TYPES,
  type SightingReportFormState,
} from "@/lib/validation/sighting-report";
import { REPORT_STATUSES, type ReportStatus } from "@/lib/types/reports";

function generateReportRef() {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `CMS-${year}-${random}`;
}

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
}

async function uploadIfPresent(
  bucket: R2Bucket,
  file: File | null,
  reportId: string,
  kind: "photo" | "evidence",
  allowedTypes: string[]
): Promise<{ key: string | null; error: string | null }> {
  if (!file || file.size === 0) return { key: null, error: null };

  if (file.size > MAX_UPLOAD_BYTES) {
    return { key: null, error: `${kind === "photo" ? "Photograph" : "Supporting evidence"} must be under 8 MB.` };
  }
  if (file.type && !allowedTypes.includes(file.type)) {
    return {
      key: null,
      error: `${kind === "photo" ? "Photograph" : "Supporting evidence"} must be a JPEG, PNG, WEBP${
        kind === "evidence" ? ", or PDF" : " or HEIC"
      } file.`,
    };
  }

  const key = `sighting-reports/${reportId}/${kind}-${Date.now()}-${sanitizeFilename(file.name || kind)}`;
  await bucket.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type || "application/octet-stream" },
  });
  return { key, error: null };
}

/**
 * Public action — no auth required. Anyone can submit a sighting report.
 * All input is re-validated server-side; nothing from the client is trusted.
 */
export async function submitSightingReport(
  _prevState: SightingReportFormState,
  formData: FormData
): Promise<SightingReportFormState> {
  // Honeypot: real visitors never fill this hidden field.
  if (formData.get("website")) {
    return { error: "Submission could not be processed. Please try again." };
  }

  const { allowed } = await checkRateLimitByIp("forms", "sighting-report");
  if (!allowed) {
    return { error: RATE_LIMIT_MESSAGE };
  }

  const parsed = SightingReportSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }
  const data = parsed.data;

  const photoFile = formData.get("photo");
  const evidenceFile = formData.get("evidence");

  const { env } = await getCf();
  const db = await getDb();

  const reportId = crypto.randomUUID();

  const photoResult = await uploadIfPresent(
    env.UPLOADS,
    photoFile instanceof File ? photoFile : null,
    reportId,
    "photo",
    ALLOWED_PHOTO_TYPES
  );
  if (photoResult.error) return { error: photoResult.error };

  const evidenceResult = await uploadIfPresent(
    env.UPLOADS,
    evidenceFile instanceof File ? evidenceFile : null,
    reportId,
    "evidence",
    ALLOWED_EVIDENCE_TYPES
  );
  if (evidenceResult.error) return { error: evidenceResult.error };

  let reportRef = generateReportRef();
  let attempts = 0;
  for (;;) {
    try {
      await db.insert(schema.sightingReports).values({
        id: reportId,
        reportRef,
        observerName: data.fullName,
        email: data.email.toLowerCase().trim(),
        phone: data.phone || null,
        country: data.country,
        city: data.city,
        region: data.region,
        observationDate: data.observationDate,
        observationTime: data.observationTime,
        location: data.location,
        weather: data.weather,
        visibility: data.visibility,
        moonObserved: data.moonObserved === "yes",
        method: data.method,
        direction: data.direction || null,
        altitude: data.altitude ? Number(data.altitude) : null,
        duration: data.duration ? Number(data.duration) : null,
        description: data.description || null,
        photoKey: photoResult.key,
        evidenceKey: evidenceResult.key,
        status: "Submitted",
        consent: true,
      });
      break;
    } catch (err) {
      attempts += 1;
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("UNIQUE") && attempts < 5) {
        reportRef = generateReportRef();
        continue;
      }
      throw err;
    }
  }

  revalidatePath("/admin/dashboard/reports");
  revalidatePath("/admin/dashboard");

  const settings = await getSettings();
  await sendNotification({
    type: "sighting_new",
    recipient: settings.supportEmail || null,
    subject: `New sighting report — ${reportRef}`,
    html: `<p>A new sighting report (${reportRef}) was submitted from ${data.city}, ${data.country}.</p><p>Review it in the admin dashboard.</p>`,
    relatedEntity: reportRef,
  });

  return { success: true, reportRef };
}

const MUTATING_ROLES = ["super_admin", "committee_admin", "reviewer"] as const;

async function logAudit(actorName: string, action: string, target: string) {
  const db = await getDb();
  await db.insert(schema.auditLogs).values({
    id: crypto.randomUUID(),
    actorName,
    action,
    target,
  });
}

export async function updateReportStatus(reportRef: string, status: ReportStatus) {
  const user = await requireUser([...MUTATING_ROLES]);
  if (!REPORT_STATUSES.includes(status)) {
    throw new Error("Invalid status.");
  }

  const db = await getDb();
  const rows = await db
    .select({ email: schema.sightingReports.email })
    .from(schema.sightingReports)
    .where(eq(schema.sightingReports.reportRef, reportRef))
    .limit(1);

  await db
    .update(schema.sightingReports)
    .set({ status, updatedAt: new Date() })
    .where(eq(schema.sightingReports.reportRef, reportRef));

  await logAudit(user.name, `changed report status to "${status}" for`, reportRef);

  await sendNotification({
    type: "sighting_status",
    recipient: rows[0]?.email ?? null,
    subject: `Update on your sighting report ${reportRef}`,
    html: `<p>The status of your sighting report (${reportRef}) has changed to: <strong>${status}</strong>.</p>`,
    relatedEntity: reportRef,
  });

  revalidatePath(`/admin/dashboard/reports/${reportRef}`);
  revalidatePath("/admin/dashboard/reports");
  revalidatePath("/admin/dashboard");
}

export async function assignReviewer(reportRef: string, reviewerId: string | null) {
  const user = await requireUser([...MUTATING_ROLES]);

  const db = await getDb();
  await db
    .update(schema.sightingReports)
    .set({ reviewerId, updatedAt: new Date() })
    .where(eq(schema.sightingReports.reportRef, reportRef));

  if (reviewerId) {
    const reviewerRows = await db
      .select({ email: schema.users.email })
      .from(schema.users)
      .where(eq(schema.users.id, reviewerId))
      .limit(1);
    await sendNotification({
      type: "reviewer_assigned",
      recipient: reviewerRows[0]?.email ?? null,
      subject: `You've been assigned to review report ${reportRef}`,
      html: `<p>You have been assigned as reviewer for sighting report ${reportRef}. Sign in to the admin dashboard to review it.</p>`,
      relatedEntity: reportRef,
    });
  }

  await logAudit(
    user.name,
    reviewerId ? "assigned a reviewer to" : "unassigned the reviewer from",
    reportRef
  );

  revalidatePath(`/admin/dashboard/reports/${reportRef}`);
  revalidatePath("/admin/dashboard/reports");
}

export async function addReportNote(reportRef: string, note: string) {
  const user = await requireUser([...MUTATING_ROLES]);
  const trimmed = note.trim();
  if (!trimmed) throw new Error("Note cannot be empty.");
  if (trimmed.length > 2000) throw new Error("Note is too long.");

  const db = await getDb();
  const rows = await db
    .select({ id: schema.sightingReports.id })
    .from(schema.sightingReports)
    .where(eq(schema.sightingReports.reportRef, reportRef))
    .limit(1);
  const report = rows[0];
  if (!report) throw new Error("Report not found.");

  await db.insert(schema.reportNotes).values({
    id: crypto.randomUUID(),
    reportId: report.id,
    authorName: user.name,
    note: trimmed,
  });

  await logAudit(user.name, "added an internal note to", reportRef);

  revalidatePath(`/admin/dashboard/reports/${reportRef}`);
}
