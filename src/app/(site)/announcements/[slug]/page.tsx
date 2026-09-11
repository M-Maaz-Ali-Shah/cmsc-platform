import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq, ne } from "drizzle-orm";
import { CalendarDays, Download, MapPin, Share2 } from "lucide-react";

import { PageBanner } from "@/components/layout/page-banner";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDb, schema } from "@/db/client";
import { PUBLIC_STATUS_BADGE, type PublicStatus } from "@/lib/types/announcements";

export const dynamic = "force-dynamic";

async function getPublishedBySlug(slug: string) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(schema.announcements)
    .where(and(eq(schema.announcements.slug, slug), eq(schema.announcements.status, "Published")))
    .limit(1);
  return rows[0] ?? null;
}

export async function generateMetadata(
  props: PageProps<"/announcements/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const item = await getPublishedBySlug(slug);
  if (!item) return {};
  return {
    title: `${item.month} ${item.hijriYear} — ${item.publicStatus}`,
    description: item.summary,
  };
}

export default async function AnnouncementDetailPage(
  props: PageProps<"/announcements/[slug]">
) {
  const { slug } = await props.params;
  const item = await getPublishedBySlug(slug);
  if (!item) notFound();

  const db = await getDb();
  const related = await db
    .select()
    .from(schema.announcements)
    .where(and(eq(schema.announcements.status, "Published"), ne(schema.announcements.slug, item.slug)))
    .orderBy(desc(schema.announcements.publishedAt))
    .limit(3);

  return (
    <>
      <PageBanner
        crumb={`${item.month} ${item.hijriYear}`}
        eyebrow={`${item.type} · ${item.hijriYear}`}
        title={item.decision}
        description={item.summary}
      >
        <Badge variant={PUBLIC_STATUS_BADGE[item.publicStatus as PublicStatus]} className="text-sm">
          {item.publicStatus}
        </Badge>
      </PageBanner>

      <section className="py-14 sm:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
            <div>
              <Card className="p-7 sm:p-9">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                  Official Statement
                </p>
                <p className="mt-4 text-base leading-relaxed text-ink-700">{item.statement}</p>

                <div className="mt-8 grid gap-4 border-t border-border-subtle pt-6 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-ink-500">Published</p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-navy-900">
                      <CalendarDays className="size-4 text-ink-300" aria-hidden />
                      {item.publishedAt
                        ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(item.publishedAt)
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-500">Region</p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-navy-900">
                      <MapPin className="size-4 text-ink-300" aria-hidden />
                      {item.region}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-500">Type</p>
                    <p className="mt-1 text-sm font-semibold text-navy-900">{item.type}</p>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  {item.pdfKey && (
                    <Button asChild variant="emerald">
                      <a href={`/api/public-files/${item.pdfKey}`} target="_blank" rel="noreferrer">
                        <Download className="size-4" aria-hidden />
                        Download PDF
                      </a>
                    </Button>
                  )}
                  <Button variant="outline">
                    <Share2 className="size-4" aria-hidden />
                    Share
                  </Button>
                </div>
              </Card>
            </div>

            <aside>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
                More announcements
              </p>
              <div className="mt-4 space-y-4">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/announcements/${r.slug}`}
                    className="block rounded-lg border border-border-subtle bg-surface p-4 transition-colors hover:bg-paper-muted"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                        {r.month} &middot; {r.hijriYear}
                      </p>
                      <Badge variant={PUBLIC_STATUS_BADGE[r.publicStatus as PublicStatus]}>{r.publicStatus}</Badge>
                    </div>
                    <p className="mt-2 text-sm font-medium text-navy-900">{r.decision}</p>
                  </Link>
                ))}
                {related.length === 0 && (
                  <p className="text-sm text-ink-400">No other announcements published yet.</p>
                )}
              </div>
              <Button asChild variant="link" className="mt-4 px-0">
                <Link href="/announcements">View full archive →</Link>
              </Button>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
