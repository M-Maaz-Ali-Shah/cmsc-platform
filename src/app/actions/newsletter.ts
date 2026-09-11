"use server";

import { eq } from "drizzle-orm";

import { getDb, getCf, schema } from "@/db/client";
import { generateRandomToken, hashToken } from "@/lib/auth/password";
import { checkRateLimitByIp } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email/resend";
import { NewsletterSchema, type NewsletterFormState } from "@/lib/validation/contact";

const CONFIRM_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

async function sendConfirmationEmail(email: string, rawToken: string) {
  const { env } = await getCf();
  const confirmUrl = `${env.SITE_URL}/newsletter/confirm?token=${rawToken}`;
  await sendEmail({
    to: email,
    subject: "Confirm your subscription",
    html: `<p>Please confirm you'd like to receive announcement emails from the Central Moon Sighting Committee GB & EU:</p><p><a href="${confirmUrl}">${confirmUrl}</a></p><p>This link expires in 24 hours. If you didn't request this, you can ignore this email.</p>`,
  });
}

/**
 * Step 1 of double opt-in: stores a pending (unconfirmed) subscription and
 * emails a confirmation link. The subscriber row isn't included in any
 * announcement send until confirmNewsletterSubscription() runs — see the
 * `confirmed` filter in advanceAnnouncementStatus() (app/actions/announcements.ts).
 */
export async function subscribeNewsletter(
  _prevState: NewsletterFormState,
  formData: FormData
): Promise<NewsletterFormState> {
  if (formData.get("website")) {
    return { error: "Submission could not be processed." };
  }

  const { allowed } = await checkRateLimitByIp("forms", "newsletter");
  if (!allowed) {
    return { error: "Too many requests. Please wait a minute and try again." };
  }

  const parsed = NewsletterSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid email address." };
  }
  const email = parsed.data.email.toLowerCase().trim();

  const db = await getDb();
  const existing = await db.select().from(schema.subscribers).where(eq(schema.subscribers.email, email)).limit(1);
  const existingRow = existing[0];

  if (existingRow?.confirmed) {
    // Already an active subscriber — nothing to do, but don't say so
    // explicitly either; same success state as a fresh signup so this
    // can't be used to probe which addresses are already subscribed.
    return { success: true };
  }

  const rawToken = generateRandomToken(32);
  const tokenHash = await hashToken(rawToken);
  const expiresAt = new Date(Date.now() + CONFIRM_TOKEN_TTL_MS);

  if (existingRow) {
    // Pending-but-unconfirmed from an earlier attempt — refresh the token
    // rather than creating a duplicate row (email is unique anyway).
    await db
      .update(schema.subscribers)
      .set({ confirmTokenHash: tokenHash, confirmExpiresAt: expiresAt })
      .where(eq(schema.subscribers.id, existingRow.id));
  } else {
    await db.insert(schema.subscribers).values({
      id: crypto.randomUUID(),
      email,
      confirmed: false,
      confirmTokenHash: tokenHash,
      confirmExpiresAt: expiresAt,
      unsubscribeToken: generateRandomToken(16),
    });
  }

  await sendConfirmationEmail(email, rawToken);

  return { success: true };
}

export type ConfirmFormState = { error?: string } | { success: true } | undefined;

export async function confirmNewsletterSubscription(token: string): Promise<ConfirmFormState> {
  if (!token) return { error: "Missing confirmation token." };

  const db = await getDb();
  const tokenHash = await hashToken(token);
  const rows = await db.select().from(schema.subscribers).where(eq(schema.subscribers.confirmTokenHash, tokenHash)).limit(1);
  const row = rows[0];

  if (!row || !row.confirmExpiresAt || row.confirmExpiresAt.getTime() < Date.now()) {
    return { error: "This confirmation link is invalid or has expired. Please subscribe again." };
  }

  await db
    .update(schema.subscribers)
    .set({
      confirmed: true,
      confirmTokenHash: null,
      confirmExpiresAt: null,
      unsubscribeToken: row.unsubscribeToken ?? generateRandomToken(16),
    })
    .where(eq(schema.subscribers.id, row.id));

  return { success: true };
}

export type UnsubscribeFormState = { error?: string } | { success: true } | undefined;

export async function unsubscribeNewsletter(token: string): Promise<UnsubscribeFormState> {
  if (!token) return { error: "Missing unsubscribe token." };

  const db = await getDb();
  const rows = await db.select().from(schema.subscribers).where(eq(schema.subscribers.unsubscribeToken, token)).limit(1);
  const row = rows[0];
  if (!row) {
    return { error: "This unsubscribe link is invalid." };
  }

  await db.delete(schema.subscribers).where(eq(schema.subscribers.id, row.id));
  return { success: true };
}
