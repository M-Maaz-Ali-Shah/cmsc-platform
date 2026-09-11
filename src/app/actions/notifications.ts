"use server";

import { desc } from "drizzle-orm";

import { getDb, schema } from "@/db/client";
import { requireUser } from "@/lib/auth/dal";
import { sendEmail } from "@/lib/email/resend";
import {
  NOTIFICATION_TYPES,
  NOTIFICATION_SETTINGS_DEFAULTS,
  type NotificationType,
  type NotificationSettings,
} from "@/lib/validation/notifications";

const MANAGER_ROLES = ["super_admin", "committee_admin"] as const;
const SETTING_KEY_PREFIX = "notify_";

async function logAudit(actorName: string, action: string, target: string) {
  const db = await getDb();
  await db.insert(schema.auditLogs).values({ id: crypto.randomUUID(), actorName, action, target });
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const db = await getDb();
  const rows = await db.select().from(schema.websiteSettings);
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  const read = (key: string, fallback: boolean) => {
    const raw = map[`${SETTING_KEY_PREFIX}${key}`];
    return raw === undefined ? fallback : raw === "true";
  };

  const settings = { masterEnabled: read("master", NOTIFICATION_SETTINGS_DEFAULTS.masterEnabled) } as NotificationSettings;
  for (const type of NOTIFICATION_TYPES) {
    settings[type] = read(type, NOTIFICATION_SETTINGS_DEFAULTS[type]);
  }
  return settings;
}

export type NotificationSettingsFormState = { error?: string } | { success: true } | undefined;

export async function updateNotificationSettings(
  _prevState: NotificationSettingsFormState,
  formData: FormData
): Promise<NotificationSettingsFormState> {
  const user = await requireUser([...MANAGER_ROLES]);
  const db = await getDb();

  const entries: [string, string][] = [
    [`${SETTING_KEY_PREFIX}master`, formData.get("masterEnabled") ? "true" : "false"],
    ...NOTIFICATION_TYPES.map((type): [string, string] => [
      `${SETTING_KEY_PREFIX}${type}`,
      formData.get(type) ? "true" : "false",
    ]),
  ];

  for (const [key, value] of entries) {
    await db
      .insert(schema.websiteSettings)
      .values({ key, value })
      .onConflictDoUpdate({ target: schema.websiteSettings.key, set: { value } });
  }

  await logAudit(user.name, "updated", "notification settings");
  return { success: true };
}

export interface NotificationLogEntry {
  id: string;
  type: string;
  recipient: string;
  status: string;
  relatedEntity: string | null;
  failureReason: string | null;
  createdAt: Date;
  sentAt: Date | null;
}

export async function listNotificationLog(limit = 50): Promise<NotificationLogEntry[]> {
  await requireUser([...MANAGER_ROLES]);
  const db = await getDb();
  return db.select().from(schema.notificationLog).orderBy(desc(schema.notificationLog.createdAt)).limit(limit);
}

/**
 * Central entry point for every outbound notification in the app. Checks
 * the master switch + the specific type's switch, sends (or skips) via
 * Resend, and always logs the outcome — recipient + status only, never the
 * email body, per the "don't store sensitive email content" requirement.
 *
 * Always best-effort: a failed or skipped notification never throws, so it
 * never rolls back the action that triggered it (submitting a report,
 * publishing an announcement, etc.).
 */
export async function sendNotification({
  type,
  recipient,
  subject,
  html,
  relatedEntity,
}: {
  type: NotificationType;
  recipient: string | null | undefined;
  subject: string;
  html: string;
  relatedEntity?: string;
}): Promise<void> {
  const db = await getDb();

  if (!recipient) {
    // No recipient configured (e.g. no support email set in Settings yet)
    // — still log it as "skipped" rather than silently no-op'ing. This is
    // exactly the gap the docstring above promises never happens: without
    // this, a fresh deployment where nobody has visited Settings yet would
    // drop every contact/sighting notification with zero trace anywhere,
    // which looks indistinguishable from the notification system being
    // silently broken. Found via the Playwright suite's first real run
    // against a genuinely fresh D1 (no seeded settings) in GitHub Actions
    // CI — every prior local run had a support email already configured
    // in `.wrangler` state left over from manual testing, which hid this.
    await db.insert(schema.notificationLog).values({
      id: crypto.randomUUID(),
      type,
      recipient: "(none configured)",
      status: "skipped",
      relatedEntity: relatedEntity ?? null,
      failureReason: "No recipient configured — set a support email under Dashboard → Settings.",
    });
    return;
  }

  const settings = await getNotificationSettings();

  if (!settings.masterEnabled || !settings[type]) {
    await db.insert(schema.notificationLog).values({
      id: crypto.randomUUID(),
      type,
      recipient,
      status: "skipped",
      relatedEntity: relatedEntity ?? null,
    });
    return;
  }

  const result = await sendEmail({ to: recipient, subject, html });

  await db.insert(schema.notificationLog).values({
    id: crypto.randomUUID(),
    type,
    recipient,
    status: result.ok ? "sent" : "failed",
    relatedEntity: relatedEntity ?? null,
    failureReason: result.ok ? null : (result.error ?? "Unknown error"),
    sentAt: result.ok ? new Date() : null,
  });
}

/**
 * Same as sendNotification but for the one inherently-bulk case
 * (announcement publish → every subscriber): Resend's batch API reports
 * aggregate sent/failed counts, not per-recipient results, so this logs one
 * summary row rather than one row per subscriber.
 */
export async function logBulkNotification({
  type,
  recipientSummary,
  sent,
  failed,
  relatedEntity,
  skipped = false,
}: {
  type: NotificationType;
  recipientSummary: string;
  sent: number;
  failed: number;
  relatedEntity?: string;
  skipped?: boolean;
}): Promise<void> {
  const db = await getDb();
  const status = skipped ? "skipped" : failed === 0 ? "sent" : sent === 0 ? "failed" : "sent";
  await db.insert(schema.notificationLog).values({
    id: crypto.randomUUID(),
    type,
    recipient: recipientSummary,
    status,
    relatedEntity: relatedEntity ?? null,
    failureReason: !skipped && failed > 0 ? `${failed} of ${sent + failed} recipient(s) failed` : null,
    sentAt: !skipped && sent > 0 ? new Date() : null,
  });
}

export async function isNotificationEnabled(type: NotificationType): Promise<boolean> {
  const settings = await getNotificationSettings();
  return settings.masterEnabled && settings[type];
}
