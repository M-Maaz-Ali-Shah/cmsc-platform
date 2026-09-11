"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, Sparkles, ShieldCheck } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CalendarMonthEntry } from "@/lib/calendar-data";

export function CalendarExplorer({ entries }: { entries: CalendarMonthEntry[] }) {
  const [view, setView] = useState<"yearly" | "monthly">("yearly");
  const [selected, setSelected] = useState(entries[7]?.month ?? entries[0].month);

  const selectedEntry = entries.find((e) => e.month === selected) ?? entries[0];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex rounded-lg border border-border-subtle bg-surface p-1">
          {(["yearly", "monthly"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-semibold capitalize transition-colors",
                view === v ? "bg-navy-900 text-white" : "text-ink-500 hover:text-navy-900"
              )}
            >
              {v} view
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs text-ink-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-gold-500" aria-hidden />
            Astronomical estimate
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-700" aria-hidden />
            Official announcement
          </span>
        </div>
      </div>

      {view === "yearly" ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <button
              key={entry.month}
              onClick={() => {
                setSelected(entry.month);
                setView("monthly");
              }}
              className="text-left"
            >
              <Card className="h-full p-5 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-heading text-base font-bold text-navy-900">{entry.month}</p>
                  <Badge variant={entry.officialStatus}>{entry.officialLabel}</Badge>
                </div>
                <p className="mt-1 text-xs text-ink-500">{entry.hijriYear}</p>
                <div className="mt-4 space-y-2 text-xs">
                  <p className="flex items-center gap-1.5 text-ink-500">
                    <Sparkles className="size-3.5 text-gold-600" aria-hidden />
                    Estimate: {entry.astronomicalEstimate}
                  </p>
                  <p className="flex items-center gap-1.5 text-ink-500">
                    <ShieldCheck className="size-3.5 text-emerald-700" aria-hidden />
                    {entry.officialDate ? `Confirmed: ${entry.officialDate}` : "Not yet decided"}
                  </p>
                </div>
              </Card>
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
          <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {entries.map((entry) => (
              <button
                key={entry.month}
                onClick={() => setSelected(entry.month)}
                className={cn(
                  "shrink-0 rounded-md px-4 py-2.5 text-left text-sm font-medium transition-colors lg:shrink",
                  selected === entry.month
                    ? "bg-navy-900 text-white"
                    : "bg-surface text-ink-700 hover:bg-paper-muted border border-border-subtle"
                )}
              >
                {entry.month}
              </button>
            ))}
          </div>

          <Card className="p-7 sm:p-9">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-heading text-2xl font-bold text-navy-900">
                {selectedEntry.month}
              </h2>
              <Badge variant={selectedEntry.officialStatus}>{selectedEntry.officialLabel}</Badge>
            </div>
            <p className="mt-1 text-sm text-ink-500">{selectedEntry.hijriYear}</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-gold-500/30 bg-gold-50 p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gold-800">
                  <Sparkles className="size-3.5" aria-hidden />
                  Astronomical Estimate
                </p>
                <p className="mt-1 font-heading text-lg font-bold text-navy-900">
                  {selectedEntry.astronomicalEstimate}
                </p>
                <p className="mt-1 text-xs text-ink-500">
                  Informational only — not a religious ruling.
                </p>
              </div>
              <div className="rounded-lg border border-emerald-700/20 bg-emerald-50 p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-800">
                  <ShieldCheck className="size-3.5" aria-hidden />
                  Official Committee Decision
                </p>
                <p className="mt-1 font-heading text-lg font-bold text-navy-900">
                  {selectedEntry.officialDate ?? "Pending"}
                </p>
                {selectedEntry.announcementSlug ? (
                  <Link
                    href={`/announcements/${selectedEntry.announcementSlug}`}
                    className="mt-1 inline-block text-xs font-semibold text-emerald-800 underline underline-offset-2"
                  >
                    Read official announcement →
                  </Link>
                ) : (
                  <p className="mt-1 text-xs text-ink-500">Awaiting committee announcement.</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 rounded-lg bg-paper-muted p-4 text-xs text-ink-500">
              <CalendarDays className="size-4 shrink-0 text-ink-300" aria-hidden />
              Gregorian dates shown are approximate until confirmed by an
              official announcement.
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
