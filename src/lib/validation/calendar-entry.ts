import * as z from "zod";

export const OFFICIAL_STATUSES = ["Announced", "Sighted", "Current Month", "Under Review", "Upcoming"] as const;

export const CalendarEntrySchema = z.object({
  hijriMonth: z.string().trim().min(2, { error: "Enter the Hijri month name." }).max(50),
  hijriYear: z.string().trim().min(2, { error: "Enter the Hijri year." }).max(20),
  astronomicalEstimate: z.string().trim().max(100).optional().or(z.literal("")),
  officialStatus: z.enum(OFFICIAL_STATUSES, { error: "Select a status." }),
  officialDate: z.string().trim().max(100).optional().or(z.literal("")),
  announcementSlug: z.string().trim().max(200).optional().or(z.literal("")),
});

export type CalendarEntryFormState = { error?: string } | undefined;
