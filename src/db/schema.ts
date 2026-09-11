import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// ---------- Auth ----------

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  passwordSalt: text("password_salt").notNull(),
  name: text("name").notNull(),
  // super_admin | committee_admin | reviewer | regional_rep | observer
  role: text("role").notNull(),
  regionId: text("region_id"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const passwordResetTokens = sqliteTable("password_reset_tokens", {
  tokenHash: text("token_hash").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  usedAt: integer("used_at", { mode: "timestamp" }),
});

// ---------- Regions ----------

export const regions = sqliteTable("regions", {
  id: text("id").primaryKey(), // slug, e.g. "england"
  name: text("name").notNull(),
  group: text("group").notNull(), // "Great Britain" | "Europe"
  representativeUserId: text("representative_user_id"),
  status: text("status").notNull().default("Awaiting Representative"),
  sortOrder: integer("sort_order").notNull().default(0),
});

// ---------- Committee ----------

export const committeeMembers = sqliteTable("committee_members", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  region: text("region").notNull(),
  bio: text("bio"),
  photoKey: text("photo_key"),
  approved: integer("approved", { mode: "boolean" }).notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ---------- Sighting reports ----------

export const sightingReports = sqliteTable("sighting_reports", {
  id: text("id").primaryKey(),
  reportRef: text("report_ref").notNull().unique(),

  observerName: text("observer_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  country: text("country").notNull(),
  city: text("city").notNull(),
  region: text("region").notNull(),

  observationDate: text("observation_date").notNull(),
  observationTime: text("observation_time").notNull(),
  location: text("location").notNull(),
  weather: text("weather").notNull(),
  visibility: text("visibility").notNull(),
  moonObserved: integer("moon_observed", { mode: "boolean" }).notNull(),
  method: text("method").notNull(),
  direction: text("direction"),
  altitude: integer("altitude"),
  duration: integer("duration"),
  description: text("description"),

  photoKey: text("photo_key"),
  evidenceKey: text("evidence_key"),

  // Submitted | Received | Under Review | Contact Verification | Accepted | Rejected | Included in Decision
  status: text("status").notNull().default("Submitted"),
  reviewerId: text("reviewer_id"),
  consent: integer("consent", { mode: "boolean" }).notNull(),

  submittedAt: integer("submitted_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const reportNotes = sqliteTable("report_notes", {
  id: text("id").primaryKey(),
  reportId: text("report_id")
    .notNull()
    .references(() => sightingReports.id, { onDelete: "cascade" }),
  authorName: text("author_name").notNull(),
  note: text("note").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ---------- Announcements ----------

export const announcements = sqliteTable("announcements", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  month: text("month").notNull(),
  hijriYear: text("hijri_year").notNull(),
  gregorianYear: text("gregorian_year").notNull(),
  decision: text("decision").notNull(),
  summary: text("summary").notNull(),
  statement: text("statement").notNull(),
  region: text("region").notNull().default("Great Britain & Europe"),
  // Month Start | Eid | General Notice
  type: text("type").notNull().default("Month Start"),
  // Draft | Under Review | Pending Approval | Approved | Published
  status: text("status").notNull().default("Draft"),
  // status shown on the public badge once published: Confirmed | Sighted | Not Sighted
  publicStatus: text("public_status").notNull().default("Confirmed"),
  pdfKey: text("pdf_key"),
  createdByName: text("created_by_name").notNull(),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ---------- Islamic calendar ----------

export const calendarEntries = sqliteTable("calendar_entries", {
  id: text("id").primaryKey(),
  hijriMonth: text("hijri_month").notNull(),
  hijriYear: text("hijri_year").notNull(),
  astronomicalEstimate: text("astronomical_estimate"),
  // Announced | Sighted | Current Month | Under Review | Upcoming
  officialStatus: text("official_status").notNull().default("Upcoming"),
  officialDate: text("official_date"),
  announcementSlug: text("announcement_slug"),
  sortOrder: integer("sort_order").notNull().default(0),
});

// ---------- Documents & media ----------

export const documents = sqliteTable("documents", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  date: text("date").notNull(),
  fileKey: text("file_key").notNull(),
  fileName: text("file_name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const media = sqliteTable("media", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  type: text("type").notNull(), // photo | video
  fileKey: text("file_key"),
  videoUrl: text("video_url"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ---------- Public interaction ----------

export const subscribers = sqliteTable("subscribers", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const contactMessages = sqliteTable("contact_messages", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ---------- Platform ----------

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  actorName: text("actor_name").notNull(),
  action: text("action").notNull(),
  target: text("target").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const websiteSettings = sqliteTable("website_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

// ---------- Website content (CMS) ----------
// Structured, field-based content only (never raw HTML) — each block's
// `fields` column is a small JSON object of plain strings, rendered as
// plain text/paragraphs by React (auto-escaped), so there is no stored-XSS
// surface here the way a rich-text/HTML editor would introduce.
export const contentBlocks = sqliteTable("content_blocks", {
  id: text("id").primaryKey(), // slug, e.g. "homepage-hero"
  label: text("label").notNull(), // human label shown in the admin list
  draftFields: text("draft_fields").notNull(), // JSON — the working copy
  publishedFields: text("published_fields"), // JSON — null until first published; what the public site reads
  updatedByName: text("updated_by_name").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  publishedAt: integer("published_at", { mode: "timestamp" }),
});

// ---------- Rate limiting ----------
// D1-backed (not the Cloudflare Workers "ratelimits" binding — see the note
// in wrangler.jsonc for why). Fixed-window counter per key, e.g.
// "login:<email>" or "contact:<ip>".
export const rateLimitBuckets = sqliteTable("rate_limit_buckets", {
  key: text("key").primaryKey(),
  windowStart: integer("window_start").notNull(), // unix seconds, start of the current fixed window
  count: integer("count").notNull().default(0),
});
