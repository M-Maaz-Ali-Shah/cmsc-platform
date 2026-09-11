export type ReportStatus =
  | "Submitted"
  | "Received"
  | "Under Review"
  | "Contact Verification"
  | "Accepted"
  | "Rejected"
  | "Included in Decision";

export interface SightingReport {
  id: string;
  observerName: string;
  country: string;
  city: string;
  date: string;
  time: string;
  moonObserved: boolean;
  method: "Naked eye" | "Optical aid" | "Both";
  weather: string;
  visibility: string;
  status: ReportStatus;
  reviewer: string | null;
  submittedAt: string;
  description: string;
  internalNotes: { author: string; note: string; at: string }[];
}

export const sightingReports: SightingReport[] = [
  {
    id: "CMS-2026-000124",
    observerName: "A. Rahman",
    country: "United Kingdom",
    city: "Leicester",
    date: "2026-08-19",
    time: "20:45",
    moonObserved: true,
    method: "Naked eye",
    weather: "Clear",
    visibility: "Good",
    status: "Included in Decision",
    reviewer: "Reviewer 2",
    submittedAt: "19 Aug 2026, 20:52",
    description: "Thin crescent visible low on the horizon shortly after sunset, clear skies.",
    internalNotes: [
      { author: "Reviewer 2", note: "Contacted observer, details consistent. Recommend accept.", at: "19 Aug 2026, 21:10" },
    ],
  },
  {
    id: "CMS-2026-000123",
    observerName: "S. Khan",
    country: "France",
    city: "Lyon",
    date: "2026-08-19",
    time: "21:02",
    moonObserved: true,
    method: "Optical aid",
    weather: "Partly cloudy",
    visibility: "Fair",
    status: "Included in Decision",
    reviewer: "Reviewer 1",
    submittedAt: "19 Aug 2026, 21:08",
    description: "Observed with binoculars through a gap in cloud cover.",
    internalNotes: [],
  },
  {
    id: "CMS-2026-000122",
    observerName: "M. Ahmed",
    country: "United Kingdom",
    city: "Glasgow",
    date: "2026-08-19",
    time: "20:38",
    moonObserved: false,
    method: "Naked eye",
    weather: "Cloudy",
    visibility: "Poor",
    status: "Accepted",
    reviewer: "Reviewer 1",
    submittedAt: "19 Aug 2026, 20:44",
    description: "Overcast conditions, no sighting possible.",
    internalNotes: [],
  },
  {
    id: "CMS-2026-000121",
    observerName: "Y. Ibrahim",
    country: "Germany",
    city: "Cologne",
    date: "2026-08-19",
    time: "21:15",
    moonObserved: true,
    method: "Naked eye",
    weather: "Clear",
    visibility: "Excellent",
    status: "Contact Verification",
    reviewer: "Reviewer 3",
    submittedAt: "19 Aug 2026, 21:20",
    description: "Clear sighting, first-time reporter — verifying contact details.",
    internalNotes: [
      { author: "Reviewer 3", note: "Attempting to reach observer by phone for verification.", at: "19 Aug 2026, 21:40" },
    ],
  },
  {
    id: "CMS-2026-000120",
    observerName: "H. Malik",
    country: "United Kingdom",
    city: "Birmingham",
    date: "2026-08-19",
    time: "20:50",
    moonObserved: true,
    method: "Naked eye",
    weather: "Clear",
    visibility: "Good",
    status: "Under Review",
    reviewer: "Reviewer 2",
    submittedAt: "19 Aug 2026, 20:58",
    description: "Brief sighting, moon set shortly after.",
    internalNotes: [],
  },
  {
    id: "CMS-2026-000119",
    observerName: "R. Bibi",
    country: "Netherlands",
    city: "Rotterdam",
    date: "2026-08-19",
    time: "21:05",
    moonObserved: false,
    method: "Naked eye",
    weather: "Hazy",
    visibility: "Poor",
    status: "Received",
    reviewer: null,
    submittedAt: "19 Aug 2026, 21:12",
    description: "Haze on the horizon prevented a clear view.",
    internalNotes: [],
  },
  {
    id: "CMS-2026-000118",
    observerName: "T. Hussain",
    country: "United Kingdom",
    city: "Bradford",
    date: "2026-08-19",
    time: "20:41",
    moonObserved: true,
    method: "Optical aid",
    weather: "Clear",
    visibility: "Good",
    status: "Submitted",
    reviewer: null,
    submittedAt: "19 Aug 2026, 20:46",
    description: "Newly submitted, not yet triaged.",
    internalNotes: [],
  },
  {
    id: "CMS-2026-000117",
    observerName: "Z. Farooq",
    country: "Belgium",
    city: "Antwerp",
    date: "2026-08-18",
    time: "20:55",
    moonObserved: false,
    method: "Naked eye",
    weather: "Rain",
    visibility: "Poor",
    status: "Rejected",
    reviewer: "Reviewer 1",
    submittedAt: "18 Aug 2026, 21:02",
    description: "Weather made observation impossible; report withdrawn by observer.",
    internalNotes: [
      { author: "Reviewer 1", note: "Observer confirmed by phone this was submitted in error.", at: "18 Aug 2026, 22:00" },
    ],
  },
];

export interface AnnouncementDraft {
  id: string;
  title: string;
  stage: "Draft" | "Under Review" | "Pending Approval" | "Approved" | "Published";
  preparedBy: string;
  updatedAt: string;
}

export const announcementDrafts: AnnouncementDraft[] = [
  {
    id: "draft-1",
    title: "Start of Ramadan 1448 AH",
    stage: "Published",
    preparedBy: "Committee Admin",
    updatedAt: "19 Aug 2026, 21:40",
  },
  {
    id: "draft-2",
    title: "Eid-ul-Fitr 1448 AH — draft",
    stage: "Draft",
    preparedBy: "Committee Admin",
    updatedAt: "20 Aug 2026, 09:12",
  },
];

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: string;
}

export const auditLogs: AuditLogEntry[] = [
  { id: "1", actor: "Committee Admin", action: "Published announcement", target: "Start of Ramadan 1448 AH", at: "19 Aug 2026, 21:40" },
  { id: "2", actor: "Super Admin", action: "Approved announcement", target: "Start of Ramadan 1448 AH", at: "19 Aug 2026, 21:38" },
  { id: "3", actor: "Reviewer 2", action: "Marked report accepted", target: "CMS-2026-000124", at: "19 Aug 2026, 21:15" },
  { id: "4", actor: "Reviewer 3", action: "Requested contact verification", target: "CMS-2026-000121", at: "19 Aug 2026, 21:20" },
  { id: "5", actor: "Reviewer 1", action: "Rejected report", target: "CMS-2026-000117", at: "18 Aug 2026, 22:05" },
  { id: "6", actor: "Regional Rep — France", action: "Added observer", target: "S. Khan (Lyon)", at: "12 Aug 2026, 10:22" },
];
