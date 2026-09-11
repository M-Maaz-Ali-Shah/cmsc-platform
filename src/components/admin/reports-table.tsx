"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ImageIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { ReportStatusBadge } from "@/components/admin/report-status-badge";
import { REPORT_STATUSES, type SightingReportRow } from "@/lib/types/reports";

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export function ReportsTable({
  reports,
  reviewerNames,
}: {
  reports: SightingReportRow[];
  reviewerNames: Record<string, string>;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");

  const filtered = reports.filter((r) => {
    if (status !== "all" && r.status !== status) return false;
    if (
      query &&
      !`${r.reportRef} ${r.observerName} ${r.city} ${r.country}`.toLowerCase().includes(query.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-300" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by ID, observer, or location…"
            className="h-10 w-full rounded-md border border-border-subtle bg-surface pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-gold-600"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-10 rounded-md border border-border-subtle bg-surface px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-gold-600"
        >
          <option value="all">All statuses</option>
          {REPORT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <Card className="mt-4 overflow-x-auto p-0">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-border-subtle text-left text-xs uppercase tracking-wide text-ink-500">
              <th className="px-4 py-3 font-semibold">Report ID</th>
              <th className="px-4 py-3 font-semibold">Observer</th>
              <th className="px-4 py-3 font-semibold">Location</th>
              <th className="px-4 py-3 font-semibold">Submitted</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Reviewer</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-border-subtle last:border-0 hover:bg-paper-muted">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/dashboard/reports/${r.reportRef}`}
                    className="flex items-center gap-1.5 font-semibold text-navy-800 hover:underline"
                  >
                    {r.reportRef}
                    {r.photoKey && <ImageIcon className="size-3.5 text-ink-300" aria-label="Has photo" />}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-700">{r.observerName}</td>
                <td className="px-4 py-3 text-ink-700">
                  {r.city}, {r.country}
                </td>
                <td className="px-4 py-3 text-ink-500">{formatDateTime(r.submittedAt)}</td>
                <td className="px-4 py-3">
                  <ReportStatusBadge status={r.status as (typeof REPORT_STATUSES)[number]} />
                </td>
                <td className="px-4 py-3 text-ink-500">
                  {r.reviewerId ? (reviewerNames[r.reviewerId] ?? "Unknown reviewer") : "Unassigned"}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-500">
                  No reports match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
