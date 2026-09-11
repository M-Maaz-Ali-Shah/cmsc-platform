"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { getDb, getCf, schema } from "@/db/client";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, deleteSession, type Role } from "@/lib/auth/session";
import { checkRateLimit, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";
import { timingSafeStringEqual } from "@/lib/auth/password";
import {
  LoginSchema,
  SetupSchema,
  type LoginFormState,
  type SetupFormState,
} from "@/lib/validation/auth";

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
  });

  redirect("/admin/dashboard");
}
