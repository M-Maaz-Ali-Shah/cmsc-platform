import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";

import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PUBLIC_STATUS_BADGE, type AnnouncementRow, type PublicStatus } from "@/lib/types/announcements";

interface RecentAnnouncementsProps {
  announcements: AnnouncementRow[];
}

export function RecentAnnouncements({ announcements }: RecentAnnouncementsProps) {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
              Archive
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold text-navy-900 sm:text-3xl">
              Recent Announcements
            </h2>
          </div>
          <Link
            href="/announcements"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-800 underline-offset-4 hover:underline"
          >
            Browse full archive
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        {announcements.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border-subtle p-10 text-center text-sm text-ink-500">
            No announcements have been published yet.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {announcements.map((item) => (
              <Card key={item.id} className="flex flex-col">
                <CardHeader className="flex-row items-start justify-between space-y-0">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                      {item.month} &middot; {item.hijriYear}
                    </p>
                  </div>
                  <Badge variant={PUBLIC_STATUS_BADGE[item.publicStatus as PublicStatus]}>
                    {item.publicStatus}
                  </Badge>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between gap-4">
                  <p className="text-sm font-medium leading-relaxed text-navy-900">
                    {item.decision}
                  </p>
                  <div className="flex items-center justify-between border-t border-border-subtle pt-4 text-xs text-ink-500">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="size-3.5" aria-hidden />
                      {item.publishedAt
                        ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(item.publishedAt)
                        : "—"}
                    </span>
                    <Link
                      href={`/announcements/${item.slug}`}
                      className="font-semibold text-navy-800 hover:underline"
                    >
                      Read more →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
