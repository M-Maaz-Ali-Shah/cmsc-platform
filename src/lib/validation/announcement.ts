import * as z from "zod";
import { ANNOUNCEMENT_TYPES, PUBLIC_STATUSES } from "@/lib/types/announcements";

export const AnnouncementSchema = z.object({
  month: z.string().trim().min(2, { error: "Enter the Islamic month." }).max(50),
  hijriYear: z.string().trim().min(2, { error: "Enter the Hijri year, e.g. 1448 AH." }).max(20),
  gregorianYear: z.string().trim().min(4, { error: "Enter the Gregorian year." }).max(20),
  decision: z.string().trim().min(5, { error: "Enter the decision headline." }).max(300),
  summary: z.string().trim().min(5, { error: "Enter a short summary." }).max(600),
  statement: z.string().trim().min(20, { error: "Enter the full official statement." }).max(8000),
  region: z.string().trim().min(2).max(200),
  type: z.enum(ANNOUNCEMENT_TYPES, { error: "Select an announcement type." }),
  publicStatus: z.enum(PUBLIC_STATUSES, { error: "Select the public status badge." }),
});

export type AnnouncementFormState = { error?: string; success?: true } | undefined;
