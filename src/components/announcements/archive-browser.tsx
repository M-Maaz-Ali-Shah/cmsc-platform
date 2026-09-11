"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Download, Search } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PUBLIC_STATUS_BADGE, type AnnouncementRow, type PublicStatus } from "@/lib/types/announcements";

const PAGE_SIZE = 4;

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(value);
}

export function ArchiveBrowser({ announcements }: { announcements: AnnouncementRow[] }) {
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState("all");
  const [year, setYear] = useState("all");
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);

  const months = useMemo(
    () => Array.from(new Set(announcements.map((a) => a.month))),
    [announcements]
  );
  const years = useMemo(
    () => Array.from(new Set(announcements.map((a) => a.hijriYear))),
    [announcements]
  );
  const types = useMemo(
    () => Array.from(new Set(announcements.map((a) => a.type))),
    [announcements]
  );

  const filtered = announcements.filter((a) => {
    if (month !== "all" && a.month !== month) return false;
    if (year !== "all" && a.hijriYear !== year) return false;
    if (type !== "all" && a.type !== type) return false;
    if (query && !`${a.month} ${a.decision}`.toLowerCase().includes(query.toLowerCase()))
      return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function resetPage() {
    setPage(1);
  }

  return (
    <div>
      <div className="grid gap-3 rounded-xl border border-border-subtle bg-surface p-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-300" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              resetPage();
            }}
            placeholder="Search announcements…"
            aria-label="Search announcements"
            className="h-10 w-full rounded-md border border-border-subtle bg-paper pl-9 pr-3 text-sm outline-none placeholder:text-ink-300 focus-visible:ring-2 focus-visible:ring-gold-600"
          />
        </div>
        <FilterSelect
          label="Islamic month"
          value={month}
          onChange={(v) => {
            setMonth(v);
            resetPage();
          }}
          options={months}
        />
        <FilterSelect
          label="Hijri year"
          value={year}
          onChange={(v) => {
            setYear(v);
            resetPage();
          }}
          options={years}
        />
        <FilterSelect
          label="Type"
          value={type}
          onChange={(v) => {
            setType(v);
            resetPage();
          }}
          options={types}
        />
      </div>

      <p className="mt-4 text-sm text-ink-500">
        {filtered.length} announcement{filtered.length === 1 ? "" : "s"} found
      </p>

      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        {visible.map((a) => (
          <Card key={a.slug} className="flex flex-col">
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                {a.month} &middot; {a.hijriYear}
              </p>
              <Badge variant={PUBLIC_STATUS_BADGE[a.publicStatus as PublicStatus]}>{a.publicStatus}</Badge>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between gap-4">
              <div>
                <p className="text-sm font-semibold leading-snug text-navy-900">{a.decision}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{a.summary}</p>
              </div>
              <div className="flex items-center justify-between border-t border-border-subtle pt-4 text-xs text-ink-500">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" aria-hidden />
                  {a.publishedAt ? formatDate(a.publishedAt) : "—"}
                </span>
                <div className="flex items-center gap-4">
                  {a.pdfKey && (
                    <a
                      href={`/api/public-files/${a.pdfKey}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 font-semibold text-navy-800 hover:underline"
                    >
                      <Download className="size-3.5" aria-hidden />
                      PDF
                    </a>
                  )}
                  <Link href={`/announcements/${a.slug}`} className="font-semibold text-navy-800 hover:underline">
                    Read announcement →
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {visible.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-border-subtle p-10 text-center text-sm text-ink-500">
            No announcements match your filters.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              size="sm"
              variant={p === currentPage ? "default" : "outline"}
              onClick={() => setPage(p)}
              aria-current={p === currentPage ? "page" : undefined}
            >
              {p}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-md border border-border-subtle bg-paper px-3 text-sm text-ink-700 outline-none focus-visible:ring-2 focus-visible:ring-gold-600"
      >
        <option value="all">All {label.toLowerCase()}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
