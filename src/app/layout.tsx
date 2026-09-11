import type { Metadata } from "next";

// Self-hosted fonts (bundled locally — no runtime request to Google Fonts).
import "@fontsource-variable/inter";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource/noto-naskh-arabic/arabic-400.css";
import "@fontsource/noto-naskh-arabic/arabic-700.css";
import "@fontsource/noto-nastaliq-urdu/arabic-400.css";
import "@fontsource/noto-nastaliq-urdu/arabic-700.css";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Central Moon Sighting Committee — Great Britain & Europe",
    template: "%s | Central Moon Sighting Committee",
  },
  description:
    "Official moon-sighting announcements, reports and Islamic calendar information for communities across Great Britain and Europe.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" dir="ltr" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-paper text-ink-900">
        {children}
      </body>
    </html>
  );
}
