import * as z from "zod";
import { httpUrlSchema } from "./shared";

export const MEDIA_CATEGORIES = ["Moon Sightings", "Committee", "Events", "Announcements", "Community"] as const;
export const MEDIA_TYPES = ["photo", "video"] as const;

export const MediaSchema = z.object({
  title: z.string().trim().min(2, { error: "Enter a title." }).max(200),
  category: z.enum(MEDIA_CATEGORIES, { error: "Select a category." }),
  type: z.enum(MEDIA_TYPES, { error: "Select photo or video." }),
  videoUrl: httpUrlSchema("Video URL must start with http:// or https://.").optional().or(z.literal("")),
});

export type MediaFormState = { error?: string } | undefined;
