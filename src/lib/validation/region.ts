import * as z from "zod";

export const REGION_GROUPS = ["Great Britain", "Europe"] as const;

export const RegionSchema = z.object({
  name: z.string().trim().min(2, { error: "Enter the region or country name." }).max(100),
  group: z.enum(REGION_GROUPS, { error: "Select Great Britain or Europe." }),
});

export type RegionFormState = { error?: string } | undefined;
