import * as z from "zod";

export const DOCUMENT_CATEGORIES = ["Announcement", "Guideline", "Statement", "Report"] as const;

export const DocumentSchema = z.object({
  title: z.string().trim().min(2, { error: "Enter a document title." }).max(200),
  category: z.enum(DOCUMENT_CATEGORIES, { error: "Select a category." }),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  date: z.string().trim().min(1, { error: "Select a publish date." }),
});

export type DocumentFormState = { error?: string } | undefined;
