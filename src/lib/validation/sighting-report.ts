import * as z from "zod";
import { REPORT_METHODS } from "@/lib/types/reports";

// Non-file fields only — the two file inputs (photo/evidence) are validated
// separately in the server action, since Zod's File support varies across
// runtimes and we need custom size/type checks either way.
export const SightingReportSchema = z.object({
  fullName: z.string().trim().min(2, { error: "Enter your full name." }).max(200),
  country: z.string().trim().min(1, { error: "Select a country." }),
  city: z.string().trim().min(1, { error: "Enter a city or town." }).max(200),
  region: z.string().trim().min(1, { error: "Enter a region." }).max(200),
  email: z.email({ error: "Enter a valid email address." }),
  phone: z.string().trim().max(50).optional().or(z.literal("")),

  observationDate: z.string().trim().min(1, { error: "Select the observation date." }),
  observationTime: z.string().trim().min(1, { error: "Select the observation time." }),
  location: z.string().trim().min(1, { error: "Describe the observation location." }).max(500),
  weather: z.string().trim().min(1, { error: "Select the weather conditions." }),
  visibility: z.string().trim().min(1, { error: "Select the visibility conditions." }),
  moonObserved: z.enum(["yes", "no"], { error: "Select whether the moon was observed." }),
  method: z.enum(REPORT_METHODS, { error: "Select a method of observation." }),
  direction: z.string().trim().max(100).optional().or(z.literal("")),
  altitude: z.string().trim().max(10).optional().or(z.literal("")),
  duration: z.string().trim().max(10).optional().or(z.literal("")),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  consent: z.literal("on", { error: "You must confirm the information is accurate." }),
  // Honeypot — real users never see or fill this field.
  website: z.string().max(0).optional().or(z.literal("")),
});

export type SightingReportFormState =
  | { error?: string; success?: false }
  | { success: true; reportRef: string }
  | undefined;

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB
export const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
export const ALLOWED_EVIDENCE_TYPES = [...ALLOWED_PHOTO_TYPES, "application/pdf"];
