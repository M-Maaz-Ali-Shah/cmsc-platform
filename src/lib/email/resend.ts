import "server-only";
import { Resend } from "resend";

import { getCf } from "@/db/client";

/**
 * Returns a configured Resend client, or null if RESEND_API_KEY hasn't been
 * set yet. Email sending is always best-effort and never blocks the action
 * that triggered it (e.g. publishing an announcement still succeeds even if
 * no Resend account has been configured, or a send fails).
 */
export async function getResendClient(): Promise<{ client: Resend; from: string } | null> {
  const { env } = await getCf();
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) return null;
  const from = env.RESEND_FROM_EMAIL || "Central Moon Sighting Committee <onboarding@resend.dev>";
  return { client: new Resend(apiKey), from };
}

/**
 * Sends a single email. Best-effort like sendBulkEmail — never throws,
 * returns whether it actually sent so callers can log/branch on it.
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; error?: string }> {
  const resend = await getResendClient();
  if (!resend) {
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }
  try {
    const { error } = await resend.client.emails.send({ from: resend.from, to, subject, html });
    if (error) {
      console.error("[email] send failed:", error);
      return { ok: false, error: error.message ?? "Unknown error" };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[email] send threw:", err);
    return { ok: false, error: message };
  }
}

const BATCH_SIZE = 100; // Resend's batch send API accepts up to 100 emails per call.

/**
 * Sends the same subject/html to every address in `recipients`, chunked
 * into batches. Best-effort: logs and continues on a failed batch rather
 * than throwing, since a notification failure should never roll back a
 * publish/approval action.
 */
export async function sendBulkEmail({
  recipients,
  subject,
  html,
}: {
  recipients: string[];
  subject: string;
  html: string;
}): Promise<{ sent: number; failed: number }> {
  if (recipients.length === 0) return { sent: 0, failed: 0 };

  const resend = await getResendClient();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not configured — skipping email send.");
    return { sent: 0, failed: recipients.length };
  }

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const chunk = recipients.slice(i, i + BATCH_SIZE);
    try {
      const { error } = await resend.client.batch.send(
        chunk.map((to) => ({ from: resend.from, to, subject, html }))
      );
      if (error) {
        failed += chunk.length;
        console.error("[email] batch send failed:", error);
      } else {
        sent += chunk.length;
      }
    } catch (err) {
      failed += chunk.length;
      console.error("[email] batch send threw:", err);
    }
  }

  return { sent, failed };
}
