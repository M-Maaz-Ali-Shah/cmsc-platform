import { hijriMonths, type BadgeStatus } from "./mock-data";

export interface CalendarMonthEntry {
  month: string;
  hijriYear: string;
  astronomicalEstimate: string;
  officialStatus: BadgeStatus;
  officialLabel: string;
  officialDate: string | null;
  announcementSlug: string | null;
}

const statusCycle: { status: BadgeStatus; label: string }[] = [
  { status: "published", label: "Announced" },
  { status: "published", label: "Announced" },
  { status: "published", label: "Announced" },
  { status: "published", label: "Announced" },
  { status: "sighted", label: "Sighted" },
  { status: "sighted", label: "Sighted" },
  { status: "sighted", label: "Sighted" },
  { status: "awaiting", label: "Current Month" },
  { status: "review", label: "Under Review" },
  { status: "notSighted", label: "Upcoming" },
  { status: "notSighted", label: "Upcoming" },
  { status: "notSighted", label: "Upcoming" },
];

const estimates = [
  "3 Jul 2025",
  "1 Aug 2025",
  "31 Aug 2025",
  "29 Sep 2025",
  "29 Oct 2025",
  "27 Nov 2025",
  "27 Dec 2025",
  "25 Jan 2026",
  "24 Feb 2026",
  "25 Mar 2026",
  "24 Apr 2026",
  "23 May 2026",
];

const slugs: (string | null)[] = [
  null,
  null,
  null,
  null,
  "jumada-al-awwal-1447",
  "jumada-al-thani-1448",
  "rajab-1448",
  null,
  null,
  null,
  null,
  null,
];

export const calendarEntries: CalendarMonthEntry[] = hijriMonths.map((month, i) => ({
  month,
  hijriYear: "1448 AH",
  astronomicalEstimate: estimates[i],
  officialStatus: statusCycle[i].status,
  officialLabel: statusCycle[i].label,
  officialDate: statusCycle[i].status === "notSighted" ? null : estimates[i],
  announcementSlug: slugs[i],
}));
