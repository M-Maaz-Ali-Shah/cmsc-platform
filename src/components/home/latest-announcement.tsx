import Link from "next/link";
import { Download, FileText, MapPin, Clock } from "lucide-react";

import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PUBLIC_STATUS_BADGE, type AnnouncementRow, type PublicStatus } from "@/lib/types/announcements";

interface LatestAnnouncementProps {
  announcement: AnnouncementRow | null;
}

export function LatestAnnouncement({ announcement }: LatestAnnouncementProps) {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
              Official Communication
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold text-navy-900 sm:text-3xl">
              Latest Official Announcement
            </h2>
          </div>
          <Link
            href="/announcements"
            className="text-sm font-semibold text-navy-800 underline-offset-4 hover:underline"
          >
            View archive →
          </Link>
        </div>

        {!announcement ? (
          <div className="rounded-2xl border border-dashed border-border-subtle p-10 text-center text-sm text-ink-500">
            No announcements have been published yet. Check back soon.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border-subtle bg-navy-950 text-white shadow-xl">
            <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant={PUBLIC_STATUS_BADGE[announcement.publicStatus as PublicStatus]}>
                    {announcement.publicStatus}
                  </Badge>
                </div>
                <h3 className="mt-4 font-heading text-2xl font-bold sm:text-3xl">
                  {announcement.decision}
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
                  {announcement.summary}
                </p>

                <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/60">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-gold-400" aria-hidden />
                    <span>
                      Published{" "}
                      {announcement.publishedAt
                        ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(
                            announcement.publishedAt
                          )
                        : "date pending"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-gold-400" aria-hidden />
                    <span>{announcement.region}</span>
                  </div>
                </dl>
              </div>

              <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
                <Button asChild variant="gold" size="lg">
                  <Link href={`/announcements/${announcement.slug}`}>
                    <FileText className="size-4" aria-hidden />
                    Read Full Announcement
                  </Link>
                </Button>
                {announcement.pdfKey && (
                  <Button asChild variant="outlineLight" size="lg">
                    <Link href={`/api/public-files/${announcement.pdfKey}`}>
                      <Download className="size-4" aria-hidden />
                      Download PDF
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
