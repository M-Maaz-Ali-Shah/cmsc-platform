"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { getDb, getCf, schema } from "@/db/client";
import { hashPassword, verifyPassword, generateRandomToken, hashToken, timingSafeStringEqual } from "@/lib/auth/password";
import { createSession, deleteSession, type Role } from "@/lib/auth/session";
import { checkRateLimit, checkRateLimitByIp, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email/resend";
import {
  LoginSchema,
  SetupSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  type LoginFormState,
  type SetupFormState,
  type ForgotPasswordFormState,
  type ResetPasswordFormState,
} from "@/lib/validation/auth";

async function logAudit(actorName: string, action: string, target: string) {
  const db = await getDb();
  await db.insert(schema.auditLogs).values({ id: crypto.randomUUID(), actorName, action, target });
}

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
// Always the same message whether or not the email matches an account, and
// whether the reset request succeeded internally — never reveal account
// existence. See requestPasswordReset() below.
const RESET_REQUESTED_MESSAGE =
  "If an account exists with that email address, a password reset link has been sent.";
const RESET_INVALID_MESSAGE = "This reset link is invalid or has expired. Request a new one.";

// Generic message on purpose — never reveal whether the email exists.
const INVALID_CREDENTIALS = "Incorrect email or password.";

export async function login(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Enter a valid email address and password." };
  }

  const { email, password } = parsed.data;
  const next = formData.get("next");
  const normalizedEmail = email.toLowerCase().trim();

  const { allowed } = await checkRateLimit("auth", `login:${normalizedEmail}`);
  if (!allowed) {
    return { error: RATE_LIMIT_MESSAGE };
  }

  const db = await getDb();
  const rows = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, normalizedEmail))
    .limit(1);
  const user = rows[0];

  if (!user || !user.active) {
    return { error: INVALID_CREDENTIALS };
  }

  const ok = await verifyPassword(password, user.passwordHash, user.passwordSalt);
  if (!ok) {
    return { error: INVALID_CREDENTIALS };
  }

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role as Role,
    sessionVersion: user.sessionVersion,
  });

  const dest =
    typeof next === "string" && next.startsWith("/admin/dashboard") ? next : "/admin/dashboard";
  redirect(dest);
}

export async function logout() {
  await deleteSession();
  redirect("/admin/login");
}

/**
 * One-time bootstrap: creates the first Super Admin account. Gated by
 * ADMIN_SETUP_TOKEN (a Cloudflare secret, never checked into git) AND by
 * refusing to run once any super_admin already exists — so this stays safe
 * to leave deployed rather than needing to be torn out after first use.
 */
export async function createFirstAdmin(
  _prevState: SetupFormState,
  formData: FormData
): Promise<SetupFormState> {
  const parsed = SetupSchema.safeParse({
    token: formData.get("token"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }
  const { token, name, email, password } = parsed.data;

  const { env } = await getCf();
  const expected = env.ADMIN_SETUP_TOKEN;
  if (!expected) {
    return {
      error:
        "ADMIN_SETUP_TOKEN is not configured on the server. Set it in .dev.vars locally or `wrangler secret put ADMIN_SETUP_TOKEN` in production.",
    };
  }
  if (!timingSafeStringEqual(token, expected)) {
    return { error: "Invalid setup token." };
  }

  const db = await getDb();
  const existingAdmins = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.role, "super_admin"))
    .limit(1);
  if (existingAdmins.length > 0) {
    return {
      error:
        "A Super Admin account already exists. Ask an existing Super Admin to create your account from the Team section of the dashboard.",
    };
  }

  const normalizedEmail = email.toLowerCase().trim();
  const dupe = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, normalizedEmail))
    .limit(1);
  if (dupe.length > 0) {
    return { error: "An account with that email already exists." };
  }

  const { hash, salt } = await hashPassword(password);
  const userId = crypto.randomUUID();

  await db.insert(schema.users).values({
    id: userId,
    email: normalizedEmail,
    passwordHash: hash,
    passwordSalt: salt,
    name,
    role: "super_admin",
    active: true,
  });

  await createSession({
    userId,
    email: normalizedEmail,
    name,
    role: "super_admin",
    sessionVersion: 0,
  });

  redirect("/admin/dashboard");
}

/**
 * Step 1 of self-service password reset. Always returns the same generic
 * success message regardless of whether the email matches an account —
 * never reveal account existence to the caller. Rate-limited by email to
 * blunt automated reset-request spam against a single address.
 */
export async function requestPasswordReset(
  _prevState: ForgotPasswordFormState,
  formData: FormData
): Promise<ForgotPasswordFormState> {
  const parsed = ForgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid email address." };
  }
  const normalizedEmail = parsed.data.email.toLowerCase().trim();

  const { allowed } = await checkRateLimit("auth", `reset-request:${normalizedEmail}`);
  if (!allowed) {
    // Still the generic message — a rate-limit-specific error would itself
    // confirm to an attacker that requests against this email are being
    // processed at all.
    return { success: true };
  }

  const db = await getDb();
  const rows = await db.select().from(schema.users).where(eq(schema.users.email, normalizedEmail)).limit(1);
  const user = rows[0];

  if (user && user.active) {
    // Invalidate any previous outstanding tokens for this user before
    // issuing a new one, so only the most recent reset link is valid.
    await db.delete(schema.passwordResetTokens).where(eq(schema.passwordResetTokens.userId, user.id));

    const rawToken = generateRandomToken(32);
    const tokenHash = await hashToken(rawToken);
    await db.insert(schema.passwordResetTokens).values({
      tokenHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    });

    const { env } = await getCf();
    const resetUrl = `${env.SITE_URL}/admin/reset-password?token=${rawToken}`;
    // Sent directly via sendEmail, NOT through the toggle-gated
    // sendNotification() in app/actions/notifications.ts — a password
    // reset is a security-critical transactional email that must always
    // attempt to send, regardless of the admin-configurable notification
    // preferences that govern informational emails.
    await sendEmail({
      to: user.email,
      subject: "Reset your Central Moon Sighting Committee password",
      html: `<p>Hi ${user.name},</p><p>A password reset was requested for your account. This link expires in 1 hour and can only be used once:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you didn't request this, you can safely ignore this email — your password will not change.</p>`,
    });

    await logAudit(user.email, "requested a password reset for", user.email);
  }

  return { success: true };
}

/**
 * Step 2: validates the token (by hash — the raw token is never stored)
 * and, if valid, sets the new password. One-time use: the token (and any
 * sibling tokens for the same user) are invalidated whether or not this
 * call succeeds, so a token can't be replayed. Also bumps sessionVersion
 * so any other active session for this user is signed out — see
 * requireUser() in dal.ts.
 */
export async function resetPassword(
  _prevState: ResetPasswordFormState,
  formData: FormData
): Promise<ResetPasswordFormState> {
  const parsed = ResetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }
  const { token, password } = parsed.data;

  // By IP rather than by token/email — this guards against brute-forcing
  // token guesses, which an attacker could otherwise attempt without ever
  // knowing which account they're targeting.
  const { allowed } = await checkRateLimitByIp("auth", "reset-complete");
  if (!allowed) {
    return { error: RATE_LIMIT_MESSAGE };
  }

  const db = await getDb();
  const tokenHash = await hashToken(token);
  const rows = await db
    .select()
    .from(schema.passwordResetTokens)
    .where(eq(schema.passwordResetTokens.tokenHash, tokenHash))
    .limit(1);
  const resetRow = rows[0];

  if (!resetRow || resetRow.usedAt || resetRow.expiresAt.getTime() < Date.now()) {
    return { error: RESET_INVALID_MESSAGE };
  }

  const userRows = await db.select().from(schema.users).where(eq(schema.users.id, resetRow.userId)).limit(1);
  const user = userRows[0];
  if (!user || !user.active) {
    return { error: RESET_INVALID_MESSAGE };
  }

  const { hash, salt } = await hashPassword(password);
  await db
    .update(schema.users)
    .set({ passwordHash: hash, passwordSalt: salt, sessionVersion: user.sessionVersion + 1 })
    .where(eq(schema.users.id, user.id));

  // One-time use: invalidate this token and any other outstanding ones for
  // the same user (e.g. from an earlier request that was never completed).
  await db.delete(schema.passwordResetTokens).where(eq(schema.passwordResetTokens.userId, user.id));

  await logAudit(user.email, "reset their password", user.email);

  return { success: true };
}
