import { count, desc } from "drizzle-orm";
import { ShieldCheck } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Pagination, parsePageParam } from "@/components/admin/pagination";
import { getDb, schema } from "@/db/client";
import { requireUser } from "@/lib/auth/dal";

const PAGE_SIZE = 25;

export default async function AdminAuditLogsPage({ searchParams }: PageProps<"/admin/dashboard/audit-logs">) {
  await requireUser();
  const params = await searchParams;
  const page = parsePageParam(params.page);

  const db = await getDb();
  const [auditLogs, [{ value: total }]] = await Promise.all([
    db
      .select()
      .from(schema.auditLogs)
      .orderBy(desc(schema.auditLogs.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ value: count() }).from(schema.auditLogs),
  ]);

  return (
    <div>
      <p className="mb-5 flex items-center gap-2 max-w-2xl text-sm text-ink-500">
        <ShieldCheck className="size-4 shrink-0 text-emerald-700" aria-hidden />
        A running record of who created, reviewed, approved, and published
        content across the dashboard.
      </p>
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border-subtle text-left text-xs uppercase tracking-wide text-ink-500">
              <th className="px-4 py-3 font-semibold">Actor</th>
              <th className="px-4 py-3 font-semibold">Action</th>
              <th className="px-4 py-3 font-semibold">Target</th>
              <th className="px-4 py-3 font-semibold">When</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((log) => (
              <tr key={log.id} className="border-b border-border-subtle last:border-0 hover:bg-paper-muted">
                <td className="px-4 py-3 font-semibold text-navy-900">{log.actorName}</td>
                <td className="px-4 py-3 text-ink-700">{log.action}</td>
                <td className="px-4 py-3 text-ink-700">{log.target}</td>
                <td className="px-4 py-3 text-ink-500">
                  {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(log.createdAt)}
                </td>
              </tr>
            ))}
            {auditLogs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-ink-500">
                  No activity recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} basePath="/admin/dashboard/audit-logs" />
      </Card>
    </div>
  );
}
