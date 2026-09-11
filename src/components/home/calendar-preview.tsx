import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const months = [
  { hijri: "Muharram", status: "published" as const },
  { hijri: "Safar", status: "published" as const },
  { hijri: "Rabi' I", status: "published" as const },
  { hijri: "Rabi' II", status: "published" as const },
  { hijri: "Jumada I", status: "published" as const },
  { hijri: "Jumada II", status: "published" as const },
  { hijri: "Rajab", status: "sighted" as const },
  { hijri: "Sha'ban", status: "awaiting" as const },
  { hijri: "Ramadan", status: "review" as const },
  { hijri: "Shawwal", status: "notSighted" as const },
  { hijri: "Dhu al-Qa'dah", status: "notSighted" as const },
  { hijri: "Dhu al-Hijjah", status: "notSighted" as const },
];

const statusLabel: Record<string, string> = {
  published: "Announced",
  sighted: "Sighted",
  awaiting: "Current",
  review: "Under Review",
  notSighted: "Upcoming",
};

export function CalendarPreview() {
  return (
    <section className="border-y border-border-subtle bg-paper-muted py-16 sm:py-20">
      <Container>
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
              1448 AH
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

        <Card className="grid grid-cols-2 gap-px overflow-hidden bg-border-subtle sm:grid-cols-3 lg:grid-cols-6">
          {months.map((m) => (
            <div key={m.hijri} className="bg-surface p-4">
              <p className="text-sm font-semibold text-navy-900">{m.hijri}</p>
              <Badge variant={m.status} className="mt-2">
                {statusLabel[m.status]}
              </Badge>
            </div>
          ))}
        </Card>
      </Container>
    </section>
  );
}
