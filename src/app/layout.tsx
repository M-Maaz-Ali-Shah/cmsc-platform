import type { Metadata } from "next";

// Self-hosted fonts (bundled locally — no runtime request to Google Fonts).
import "@fontsource-variable/inter";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource/noto-naskh-arabic/arabic-400.css";
import "@fontsource/noto-naskh-arabic/arabic-700.css";
import "@fontsource/noto-nastaliq-urdu/arabic-400.css";
import "@fontsource/noto-nastaliq-urdu/arabic-700.css";

import "./globals.css";
import { getCf } from "@/db/client";

const SITE_NAME = "Central Moon Sighting Committee";
const SITE_DESCRIPTION =
  "Official moon-sighting announcements, reports and Islamic calendar information for communities across Great Britain and Europe.";

// generateMetadata (not a static `export const metadata`) because
// metadataBase needs the real SITE_URL, which — like every other
// Cloudflare binding/var in this app — is only available via getCf() at
// request time, not at module-evaluation time.
export async function generateMetadata(): Promise<Metadata> {
  const { env } = await getCf();
  const siteUrl = env.SITE_URL || "https://example.org";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${SITE_NAME} — Great Britain & Europe`,
      template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    openGraph: {
      siteName: SITE_NAME,
      type: "website",
      locale: "en_GB",
      // No `images` here deliberately — there's no real designed
      // Open Graph share image asset in this project yet (only generic
      // framework placeholder SVGs in /public). Pointing this at a
      // fabricated/placeholder image would be worse than omitting it;
      // see DEPLOY.md for adding a real one before launch.
    },
    twitter: {
      card: "summary",
    },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" dir="ltr" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-paper text-ink-900">
        {children}
      </body>
    </html>
  );
}
