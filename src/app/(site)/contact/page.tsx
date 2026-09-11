import type { Metadata } from "next";
import { asc, eq, inArray } from "drizzle-orm";
import { Mail, MapPin } from "lucide-react";

import { PageBanner } from "@/components/layout/page-banner";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { FacebookGlyph, YoutubeGlyph } from "@/components/brand/social-icons";
import { ContactForm } from "@/components/contact/contact-form";
import { getSettings } from "@/app/actions/settings";
import { getPublishedContent } from "@/app/actions/content";
import { getDb, schema } from "@/db/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Central Moon Sighting Committee GB & EU.",
};

export default async function ContactPage() {
  const [settings, intro] = await Promise.all([
    getSettings(),
    getPublishedContent("contact-intro", {
      text: "Questions about a sighting, an announcement, or how to get involved? Reach us through the channels below.",
    }),
  ]);

  const db = await getDb();
  const activeRegions = await db
    .select()
    .from(schema.regions)
    .where(eq(schema.regions.status, "Active"))
    .orderBy(asc(schema.regions.sortOrder))
    .limit(4);
  const repIds = activeRegions.map((r) => r.representativeUserId).filter((id): id is string => !!id);
  const repNames: Record<string, string> = {};
  if (repIds.length > 0) {
    const reps = await db.select({ id: schema.users.id, name: schema.users.name }).from(schema.users).where(inArray(schema.users.id, repIds));
    for (const r of reps) repNames[r.id] = r.name;
  }

  return (
    <>
      <PageBanner
        crumb="Contact"
        eyebrow="Get in Touch"
        title="Contact"
        description={intro.text}
      />

      <section className="py-14 sm:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
            <div className="space-y-6">
              <Card className="p-6">
                <p className="flex items-center gap-2 font-heading text-base font-bold text-navy-900">
                  <Mail className="size-4 text-emerald-700" aria-hidden />
                  Official Email
                </p>
                {settings.supportEmail ? (
                  <a href={`mailto:${settings.supportEmail}`} className="mt-2 block text-sm font-medium text-navy-800 hover:underline">
                    {settings.supportEmail}
                  </a>
                ) : (
                  <p className="mt-2 text-sm text-ink-500">
                    Not yet configured — use the form to reach the committee.
                  </p>
                )}
              </Card>

              {(settings.facebookUrl || settings.youtubeUrl) && (
                <Card className="p-6">
                  <p className="font-heading text-base font-bold text-navy-900">Follow Us</p>
                  <div className="mt-3 flex items-center gap-3">
                    {settings.facebookUrl && (
                      <a
                        href={settings.facebookUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Official Facebook page"
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle text-ink-500 hover:border-emerald-700 hover:text-emerald-700"
                      >
                        <FacebookGlyph className="size-4" />
                      </a>
                    )}
                    {settings.youtubeUrl && (
                      <a
                        href={settings.youtubeUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Official YouTube channel"
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle text-ink-500 hover:border-emerald-700 hover:text-emerald-700"
                      >
                        <YoutubeGlyph className="size-4" />
                      </a>
                    )}
                  </div>
                </Card>
              )}

              <Card className="p-6">
                <p className="font-heading text-base font-bold text-navy-900">Regional Contacts</p>
                {activeRegions.length === 0 ? (
                  <p className="mt-3 text-sm text-ink-500">No active regions yet.</p>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {activeRegions.map((r) => (
                      <li key={r.id} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5 text-ink-700">
                          <MapPin className="size-3.5 text-ink-300" aria-hidden />
                          {r.name}
                        </span>
                        <span className="text-xs text-ink-500">
                          {r.representativeUserId ? (repNames[r.representativeUserId] ?? "Unknown") : "Awaiting representative"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>

            <Card className="p-7 sm:p-9">
              <h2 className="font-heading text-lg font-bold text-navy-900">Send a Message</h2>
              <div className="mt-6">
                <ContactForm />
              </div>
            </Card>
          </div>
        </Container>
      </section>
    </>
  );
}
