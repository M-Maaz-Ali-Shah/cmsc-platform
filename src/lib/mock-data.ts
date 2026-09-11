// Demo / placeholder data for the frontend prototype.
// No real committee members, scholars, rulings, or contact details are
// represented here — everything is clearly fictional and will be replaced
// once the committee provides verified content and a real backend exists.

export type BadgeStatus =
  | "awaiting"
  | "review"
  | "sighted"
  | "notSighted"
  | "confirmed"
  | "published";

export interface Announcement {
  slug: string;
  month: string;
  hijriYear: string;
  gregorianYear: string;
  decision: string;
  summary: string;
  statement: string;
  publishedAt: string;
  region: string;
  status: BadgeStatus;
  statusLabel: string;
  type: "Month Start" | "Eid" | "General Notice";
}

export const announcements: Announcement[] = [
  {
    slug: "ramadan-1448",
    month: "Ramadan",
    hijriYear: "1448 AH",
    gregorianYear: "2026",
    decision: "Crescent sighted — Ramadan begins 20 August 2026",
    summary:
      "Following verified sighting reports from our regional network, the committee has confirmed the start of Ramadan.",
    statement:
      "Following verified sighting reports received from across our regional network and review by committee scholars, the Central Moon Sighting Committee GB & EU has confirmed the sighting of the crescent moon marking the beginning of Ramadan 1448 AH. Muslims across Great Britain and Europe following this announcement should begin the fast of Ramadan from Thursday, 20 August 2026.",
    publishedAt: "19 Aug 2026, 21:40 BST",
    region: "Great Britain & Europe",
    status: "confirmed",
    statusLabel: "Confirmed",
    type: "Month Start",
  },
  {
    slug: "shaban-1448",
    month: "Sha'ban",
    hijriYear: "1448 AH",
    gregorianYear: "2026",
    decision: "Crescent not sighted — Sha'ban extended to 30 days",
    summary:
      "No credible sighting reports were received on the 29th; Sha'ban was completed as a 30-day month.",
    statement:
      "The committee received no credible reports of the crescent moon on the evening of the 29th of Sha'ban across the regions covered. In accordance with established practice, Sha'ban 1448 AH has been completed as a thirty-day month.",
    publishedAt: "20 Jul 2026, 21:15 BST",
    region: "Great Britain & Europe",
    status: "notSighted",
    statusLabel: "Not Sighted",
    type: "Month Start",
  },
  {
    slug: "rajab-1448",
    month: "Rajab",
    hijriYear: "1448 AH",
    gregorianYear: "2026",
    decision: "Crescent sighted — Rajab confirmed",
    summary: "Verified sighting reports were received and reviewed by committee scholars.",
    statement:
      "The Central Moon Sighting Committee GB & EU confirms the sighting of the crescent moon marking the beginning of Rajab 1448 AH, based on verified reports from observers in our regional network.",
    publishedAt: "21 Jun 2026, 21:05 BST",
    region: "Great Britain & Europe",
    status: "sighted",
    statusLabel: "Sighted",
    type: "Month Start",
  },
  {
    slug: "jumada-al-thani-1448",
    month: "Jumada al-Thani",
    hijriYear: "1448 AH",
    gregorianYear: "2026",
    decision: "Crescent sighted — Jumada al-Thani confirmed",
    summary: "Standard monthly confirmation following regional observation reports.",
    statement:
      "The committee confirms the sighting of the crescent moon marking the beginning of Jumada al-Thani 1448 AH.",
    publishedAt: "23 May 2026, 20:52 BST",
    region: "Great Britain & Europe",
    status: "sighted",
    statusLabel: "Sighted",
    type: "Month Start",
  },
  {
    slug: "eid-ul-fitr-1447",
    month: "Shawwal",
    hijriYear: "1447 AH",
    gregorianYear: "2026",
    decision: "Eid-ul-Fitr announced for 1447 AH",
    summary: "Official Eid-ul-Fitr announcement following the sighting of the Shawwal crescent.",
    statement:
      "The Central Moon Sighting Committee GB & EU is pleased to announce that Eid-ul-Fitr 1447 AH will be observed following confirmation of the Shawwal crescent.",
    publishedAt: "29 Mar 2026, 21:30 BST",
    region: "Great Britain & Europe",
    status: "confirmed",
    statusLabel: "Confirmed",
    type: "Eid",
  },
  {
    slug: "jumada-al-awwal-1447",
    month: "Jumada al-Awwal",
    hijriYear: "1447 AH",
    gregorianYear: "2025",
    decision: "Crescent sighted — Jumada al-Awwal confirmed",
    summary: "Standard monthly confirmation following regional observation reports.",
    statement:
      "The committee confirms the sighting of the crescent moon marking the beginning of Jumada al-Awwal 1447 AH.",
    publishedAt: "22 Nov 2025, 20:40 GMT",
    region: "Great Britain & Europe",
    status: "sighted",
    statusLabel: "Sighted",
    type: "Month Start",
  },
];

export interface RegionEntry {
  name: string;
  group: "Great Britain" | "Europe";
  representative: string;
  observers: number;
  reports: number;
  status: "Active" | "Awaiting Representative";
}

export const regions: RegionEntry[] = [
  { name: "England", group: "Great Britain", representative: "Pending confirmation", observers: 42, reports: 18, status: "Active" },
  { name: "Scotland", group: "Great Britain", representative: "Pending confirmation", observers: 11, reports: 4, status: "Active" },
  { name: "Wales", group: "Great Britain", representative: "Pending confirmation", observers: 7, reports: 2, status: "Active" },
  { name: "Ireland", group: "Europe", representative: "Pending confirmation", observers: 9, reports: 3, status: "Active" },
  { name: "France", group: "Europe", representative: "Pending confirmation", observers: 15, reports: 6, status: "Active" },
  { name: "Germany", group: "Europe", representative: "Pending confirmation", observers: 13, reports: 5, status: "Active" },
  { name: "Belgium", group: "Europe", representative: "Awaiting representative", observers: 4, reports: 1, status: "Awaiting Representative" },
  { name: "Netherlands", group: "Europe", representative: "Pending confirmation", observers: 6, reports: 2, status: "Active" },
  { name: "Spain", group: "Europe", representative: "Awaiting representative", observers: 3, reports: 0, status: "Awaiting Representative" },
  { name: "Italy", group: "Europe", representative: "Awaiting representative", observers: 2, reports: 0, status: "Awaiting Representative" },
  { name: "Austria", group: "Europe", representative: "Awaiting representative", observers: 1, reports: 0, status: "Awaiting Representative" },
];

export interface CommitteeRole {
  role: string;
  region: string;
}

export const committeeRoles: CommitteeRole[] = [
  { role: "Chairman", region: "Great Britain & Europe" },
  { role: "Secretary", region: "Great Britain & Europe" },
  { role: "Islamic Scholar", region: "Great Britain" },
  { role: "Islamic Scholar", region: "Europe" },
  { role: "Astronomical Adviser", region: "Great Britain & Europe" },
  { role: "Regional Representative", region: "England" },
  { role: "Regional Representative", region: "France" },
  { role: "Regional Representative", region: "Germany" },
];

export interface DocumentEntry {
  title: string;
  category: "Announcement" | "Guideline" | "Statement" | "Report";
  date: string;
  description: string;
}

export const documents: DocumentEntry[] = [
  {
    title: "Ramadan 1448 AH — Official Announcement",
    category: "Announcement",
    date: "19 Aug 2026",
    description: "Full official statement confirming the start of Ramadan 1448 AH.",
  },
  {
    title: "Moon-Sighting Reporting Guidelines",
    category: "Guideline",
    date: "02 Jan 2026",
    description: "Guidance for observers on submitting accurate, verifiable sighting reports.",
  },
  {
    title: "Committee Verification Procedure",
    category: "Statement",
    date: "15 Nov 2025",
    description: "An overview of how the committee reviews and verifies sighting reports.",
  },
  {
    title: "Annual Summary Report 1447 AH",
    category: "Report",
    date: "20 Aug 2025",
    description: "A summary of moon-sighting activity and announcements across 1447 AH.",
  },
];

export const hijriMonths = [
  "Muharram",
  "Safar",
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  "Jumada al-Awwal",
  "Jumada al-Thani",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhu al-Qa'dah",
  "Dhu al-Hijjah",
];
