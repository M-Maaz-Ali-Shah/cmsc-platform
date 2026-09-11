import type { MetadataRoute } from "next";
import { desc, eq } from "drizzle-orm";

import { getDb, getCf, schema } from "@/db/client";

export const dynamic = "force-dynamic";

const STATIC_PAGES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/moon-sighting", priority: 0.8, changeFrequency: "daily" },
  { path: "/announcements", priority: 0.9, changeFrequency: "daily" },
  { path: "/calendar", priority: 0.7, changeFrequency: "weekly" },
  { path: "/how-moon-sighting-works", priority: 0.5, changeFrequency: "monthly" },
  { path: "/report-sighting", priority: 0.6, changeFrequency: "monthly" },
  { path: "/observers", priority: 0.4, changeFrequency: "monthly" },
  { path: "/committee", priority: 0.5, changeFrequency: "monthly" },
  { path: "/regions", priority: 0.5, changeFrequency: "monthly" },
  { path: "/documents", priority: 0.5, changeFrequency: "weekly" },
  { path: "/media", priority: 0.4, changeFrequency: "weekly" },
  { path: "/contact", priority: 0.4, changeFrequency: "yearly" },
  { path: "/privacy-policy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms-of-use", priority: 0.2, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { env } = await getCf();
  const siteUrl = env.SITE_URL || "https://example.org";

  const db = await getDb();
  // Only published announcements — drafts/pending approval are never
  // publicly reachable, so they must never be indexable either.
  const publishedAnnouncements = await db
    .select({ slug: schema.announcements.slug, updatedAt: schema.announcements.updatedAt, publishedAt: schema.announcements.publishedAt })
    .from(schema.announcements)
    .where(eq(schema.announcements.status, "Published"))
    .orderBy(desc(schema.announcements.publishedAt));

  return [
    ...STATIC_PAGES.map((page) => ({
      url: `${siteUrl}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...publishedAnnouncements.map((a) => ({
      url: `${siteUrl}/announcements/${a.slug}`,
      lastModified: a.updatedAt ?? a.publishedAt ?? new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
