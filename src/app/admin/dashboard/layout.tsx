import { count, inArray } from "drizzle-orm";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { requireUser, ROLE_LABELS } from "@/lib/auth/dal";
import type { Role } from "@/lib/auth/session";
import { getDb, schema } from "@/db/client";

export default async function DashboardLayout({ children }: LayoutProps<"/admin/dashboard">) {
  // Real, DB-backed protection — src/proxy.ts only does an optimistic
  // cookie check before this runs. See src/lib/auth/dal.ts.
  const user = await requireUser();

  const db = await getDb();
  const [{ value: pendingReportsCount }] = await db
    .select({ value: count() })
    .from(schema.sightingReports)
    .where(inArray(schema.sightingReports.status, ["Submitted", "Received"]));

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed h-screen w-64">
          <AdminSidebar pendingReportsCount={pendingReportsCount} />
        </div>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <AdminTopbar
          userName={user.name}
          userRoleLabel={ROLE_LABELS[user.role as Role]}
          pendingReportsCount={pendingReportsCount}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
