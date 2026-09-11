export const ANNOUNCEMENT_STAGES = [
  "Draft",
  "Under Review",
  "Pending Approval",
  "Approved",
  "Published",
] as const;
export type AnnouncementStage = (typeof ANNOUNCEMENT_STAGES)[number];

export const ANNOUNCEMENT_TYPES = ["Month Start", "Eid", "General Notice"] as const;
export type AnnouncementType = (typeof ANNOUNCEMENT_TYPES)[number];

export const PUBLIC_STATUSES = ["Confirmed", "Sighted", "Not Sighted"] as const;
export type PublicStatus = (typeof PUBLIC_STATUSES)[number];

export const PUBLIC_STATUS_BADGE: Record<PublicStatus, "confirmed" | "sighted" | "notSighted"> = {
  Confirmed: "confirmed",
  Sighted: "sighted",
  "Not Sighted": "notSighted",
};

// Type-only imports — src/db/schema.ts has no "server-only" marker.
import type { schema } from "@/db/client";
export type AnnouncementRow = typeof schema.announcements.$inferSelect;
