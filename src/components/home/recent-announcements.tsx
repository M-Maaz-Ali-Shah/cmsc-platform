import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";

import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge, type badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

const announcements: {
  month: string;
  year: string;
  decision: string;
  date: string;
  status: BadgeVariant;
  statusLabel: string;
}[] = [
  {
    month: "Ramadan",
    year: "1448 AH",
    decision: "Crescent sighted — Ramadan begins 20 Aug 2026",
    date: "19 Aug 2026",
    status: "confirmed",
    statusLabel: "Confirmed",
  },
  {
    month: "Sha'ban",
    year: "1448 AH",
    decision: "Crescent not sighted — month extended to 30 days",
    date: "20 Jul 2026",
    status: "notSighted",
    statusLabel: "Not Sighted",
  },
  {
    month: "Rajab",
    year: "1448 AH",
    decision: "Crescent sighted — Rajab confirmed",
    date: "21 Jun 2026",
    status: "sighted",
    statusLabel: "Sighted",
  },
];

export function RecentAnnouncements() {
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

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {announcements.map((item) => (
            <Card key={item.month} className="flex flex-col">
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                    {item.month} &middot; {item.year}
                  </p>
                </div>
                <Badge variant={item.status}>{item.statusLabel}</Badge>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-4">
                <p className="text-sm font-medium leading-relaxed text-navy-900">
                  {item.decision}
                </p>
                <div className="flex items-center justify-between border-t border-border-subtle pt-4 text-xs text-ink-500">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" aria-hidden />
                    {item.date}
                  </span>
                  <Link
                    href="/announcements"
                    className="font-semibold text-navy-800 hover:underline"
                  >
                    Read more →
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
