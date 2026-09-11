import * as z from "zod";
import { httpUrlSchema } from "./shared";

export const SettingsSchema = z.object({
  siteName: z.string().trim().min(2).max(200),
  supportEmail: z.email({ error: "Enter a valid email address." }).optional().or(z.literal("")),
  facebookUrl: httpUrlSchema().optional().or(z.literal("")),
  youtubeUrl: httpUrlSchema().optional().or(z.literal("")),
  defaultLanguage: z.enum(["en", "ur", "ar"]),
  timezone: z.string().trim().min(2).max(100),
});

export type SettingsFormState = { error?: string; success?: true } | undefined;

export const SETTINGS_DEFAULTS = {
  siteName: "Central Moon Sighting Committee GB & EU",
  supportEmail: "",
  facebookUrl: "",
  youtubeUrl: "",
  defaultLanguage: "en" as const,
  timezone: "Europe/London",
};

export type SettingsValues = typeof SETTINGS_DEFAULTS;
