"use server";

import { getDb, schema } from "@/db/client";
import { requireUser } from "@/lib/auth/dal";
import { SETTINGS_DEFAULTS, SettingsSchema, type SettingsFormState, type SettingsValues } from "@/lib/validation/settings";

const MANAGER_ROLES = ["super_admin", "committee_admin"] as const;

export async function getSettings(): Promise<SettingsValues> {
  const db = await getDb();
  const rows = await db.select().from(schema.websiteSettings);
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    siteName: map.site_name ?? SETTINGS_DEFAULTS.siteName,
    supportEmail: map.support_email ?? SETTINGS_DEFAULTS.supportEmail,
    facebookUrl: map.facebook_url ?? SETTINGS_DEFAULTS.facebookUrl,
    youtubeUrl: map.youtube_url ?? SETTINGS_DEFAULTS.youtubeUrl,
    defaultLanguage: (map.default_language as SettingsValues["defaultLanguage"]) ?? SETTINGS_DEFAULTS.defaultLanguage,
    timezone: map.timezone ?? SETTINGS_DEFAULTS.timezone,
  };
}

export async function updateSettings(
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const user = await requireUser([...MANAGER_ROLES]);

  const parsed = SettingsSchema.safeParse({
    siteName: formData.get("siteName"),
    supportEmail: formData.get("supportEmail") ?? "",
    facebookUrl: formData.get("facebookUrl") ?? "",
    youtubeUrl: formData.get("youtubeUrl") ?? "",
    defaultLanguage: formData.get("defaultLanguage"),
    timezone: formData.get("timezone"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }
  const data = parsed.data;

  const db = await getDb();
  const entries: [string, string][] = [
    ["site_name", data.siteName],
    ["support_email", data.supportEmail || ""],
    ["facebook_url", data.facebookUrl || ""],
    ["youtube_url", data.youtubeUrl || ""],
    ["default_language", data.defaultLanguage],
    ["timezone", data.timezone],
  ];

  for (const [key, value] of entries) {
    await db
      .insert(schema.websiteSettings)
      .values({ key, value })
      .onConflictDoUpdate({ target: schema.websiteSettings.key, set: { value } });
  }

  await db.insert(schema.auditLogs).values({
    id: crypto.randomUUID(),
    actorName: user.name,
    action: "updated",
    target: "site settings",
  });

  return { success: true };
}
