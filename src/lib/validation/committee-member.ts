import * as z from "zod";

export const CommitteeMemberSchema = z.object({
  name: z.string().trim().min(2, { error: "Enter the member's full name." }).max(200),
  role: z.string().trim().min(2, { error: "Enter their role or title." }).max(200),
  region: z.string().trim().min(1, { error: "Enter their region." }).max(200),
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type CommitteeMemberFormState = { error?: string } | undefined;
