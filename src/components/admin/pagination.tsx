import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  /** Base path, e.g. "/admin/dashboard/audit-logs" — other query params (filters) are preserved. */
  basePath: string;
  searchParams?: Record<string, string | undefined>;
}

export function Pagination({ page, pageSize, total, basePath, searchParams = {} }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const hrefFor = (p: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) params.set(key, value);
    }
    params.set("page", String(p));
    return `${basePath}?${params.toString()}`;
  };

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle px-4 py-3 text-sm">
      <p className="text-ink-500">
        Showing <span className="font-semibold text-navy-900">{start}–{end}</span> of{" "}
        <span className="font-semibold text-navy-900">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link
            href={hrefFor(page - 1)}
            className="flex items-center gap-1 rounded-md border border-border-subtle px-3 py-1.5 text-xs font-semibold text-navy-800 hover:bg-paper-muted"
          >
            <ChevronLeft className="size-3.5" aria-hidden />
            Previous
          </Link>
        ) : (
          <span className="flex items-center gap-1 rounded-md border border-border-subtle px-3 py-1.5 text-xs font-semibold text-ink-300">
            <ChevronLeft className="size-3.5" aria-hidden />
            Previous
          </span>
        )}
        <span className="px-2 text-xs text-ink-500">
          Page {page} of {totalPages}
        </span>
        {page < totalPages ? (
          <Link
            href={hrefFor(page + 1)}
            className="flex items-center gap-1 rounded-md border border-border-subtle px-3 py-1.5 text-xs font-semibold text-navy-800 hover:bg-paper-muted"
          >
            Next
            <ChevronRight className="size-3.5" aria-hidden />
          </Link>
        ) : (
          <span className="flex items-center gap-1 rounded-md border border-border-subtle px-3 py-1.5 text-xs font-semibold text-ink-300">
            Next
            <ChevronRight className="size-3.5" aria-hidden />
          </span>
        )}
      </div>
    </div>
  );
}

/** Parses a `page` search param into a safe positive integer, defaulting to 1. */
export function parsePageParam(value: string | string[] | undefined): number {
  const raw = typeof value === "string" ? parseInt(value, 10) : 1;
  return Number.isFinite(raw) && raw > 0 ? raw : 1;
}
