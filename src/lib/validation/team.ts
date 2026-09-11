import * as z from "zod";

export const TEAM_ROLES = ["committee_admin", "reviewer", "regional_rep", "observer"] as const;
export type TeamRole = (typeof TEAM_ROLES)[number];

export const CreateTeamAccountSchema = z.object({
  name: z.string().trim().min(2, { error: "Enter a full name." }).max(200),
  email: z.email({ error: "Enter a valid email address." }),
  role: z.enum(TEAM_ROLES, { error: "Select a role." }),
  regionId: z.string().trim().max(100).optional().or(z.literal("")),
});

export type CreateTeamAccountState =
  | { error?: string }
  | { success: true; email: string; tempPassword: string }
  | undefined;
