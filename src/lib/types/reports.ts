// Single source of truth for sighting-report status values — mirrors the
// free-text `status` column in src/db/schema.ts (SQLite has no native enum).

export const REPORT_STATUSES = [
  "Submitted",
  "Received",
  "Under Review",
  "Contact Verification",
  "Accepted",
  "Rejected",
  "Included in Decision",
] as const;

export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const REPORT_METHODS = ["Naked eye", "Optical aid (binoculars/telescope)", "Both"] as const;
export type ReportMethod = (typeof REPORT_METHODS)[number];

// Type-only import — src/db/schema.ts has no "server-only" marker, so this
// stays safe to import from Client Components.
import type { schema } from "@/db/client";
export type SightingReportRow = typeof schema.sightingReports.$inferSelect;
export type ReportNoteRow = typeof schema.reportNotes.$inferSelect;
