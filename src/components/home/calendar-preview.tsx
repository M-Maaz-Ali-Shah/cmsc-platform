import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BadgeStatus } from "@/lib/calendar-data";

interface CalendarPreviewProps {
  entries: { hijri: string; variant: BadgeStatus; label: string }[];
}

export function CalendarPreview({ entries }: CalendarPreviewProps) {
  return (
    <section className="border-y border-border-subtle bg-paper-muted py-16 sm:py-20">
      <Container>
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
              Islamic Calendar
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold text-navy-900 sm:text-3xl">
              Islamic Calendar
            </h2>
            <p className="mt-2 max-w-xl text-sm text-ink-500">
              Astronomical predictions are shown for information only and are
              clearly distinguished from official committee announcements.
            </p>
          </div>
          <Link
            href="/calendar"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-800 underline-offset-4 hover:underline"
          >
            View full calendar
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        {entries.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border-subtle bg-surface p-10 text-center text-sm text-ink-500">
            No calendar entries have been configured yet.
          </p>
        ) : (
          <Card className="grid grid-cols-2 gap-px overflow-hidden bg-border-subtle sm:grid-cols-3 lg:grid-cols-6">
            {entries.map((m, i) => (
              <div key={`${m.hijri}-${i}`} className="bg-surface p-4">
                <p className="text-sm font-semibold text-navy-900">{m.hijri}</p>
                <Badge variant={m.variant} className="mt-2">
                  {m.label}
                </Badge>
              </div>
            ))}
          </Card>
        )}
      </Container>
    </section>
  );
}
