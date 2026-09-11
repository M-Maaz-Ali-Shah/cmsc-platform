import type { MetadataRoute } from "next";
import { getCf } from "@/db/client";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { env } = await getCf();
  const siteUrl = env.SITE_URL || "https://example.org";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Admin area, auth flows, and the newsletter action pages are
      // real functionality, not indexable content. API routes serve
      // files/data, not pages.
      disallow: ["/admin/", "/newsletter/", "/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
