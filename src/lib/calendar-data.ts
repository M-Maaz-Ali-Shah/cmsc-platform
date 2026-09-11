// Shared types and status mapping for Islamic calendar display.
// Calendar entries themselves always come from the `calendar_entries` D1
// table (see src/db/schema.ts) — nothing here is sample content.

export type BadgeStatus =
  | "awaiting"
  | "review"
  | "sighted"
  | "notSighted"
  | "confirmed"
  | "published";

export interface CalendarMonthEntry {
  month: string;
  hijriYear: string;
  astronomicalEstimate: string;
  officialStatus: BadgeStatus;
  officialLabel: string;
  officialDate: string | null;
  announcementSlug: string | null;
}

/** Maps the `calendar_entries.official_status` DB value to a Badge variant + label. */
export const CALENDAR_STATUS_MAP: Record<string, { status: BadgeStatus; label: string }> = {
  Announced: { status: "published", label: "Announced" },
  Sighted: { status: "sighted", label: "Sighted" },
  "Current Month": { status: "awaiting", label: "Current Month" },
  "Under Review": { status: "review", label: "Under Review" },
  Upcoming: { status: "notSighted", label: "Upcoming" },
};
