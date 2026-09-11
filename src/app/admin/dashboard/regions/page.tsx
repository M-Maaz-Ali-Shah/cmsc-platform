import { asc, count, countDistinct, eq, inArray } from "drizzle-orm";

import { RegionsManager, type RegionWithStats } from "@/components/admin/regions-manager";
import { getDb, schema } from "@/db/client";
import { requireUser } from "@/lib/auth/dal";

export default async function AdminRegionsPage() {
  const user = await requireUser();
  const db = await getDb();

  const [regions, regionalReps, reportStats] = await Promise.all([
    db.select().from(schema.regions).orderBy(asc(schema.regions.group), asc(schema.regions.sortOrder)),
    db
      .select({ id: schema.users.id, name: schema.users.name, email: schema.users.email })
      .from(schema.users)
      .where(eq(schema.users.role, "regional_rep")),
    db
      .select({
        region: schema.sightingReports.region,
        country: schema.sightingReports.country,
        reportCount: count(),
        observerCount: countDistinct(schema.sightingReports.email),
      })
      .from(schema.sightingReports)
      .groupBy(schema.sightingReports.region, schema.sightingReports.country),
  ]);

  const repIds = regions.map((r) => r.representativeUserId).filter((id): id is string => !!id);
  const repNames: Record<string, string> = {};
  if (repIds.length > 0) {
    const reps = await db
      .select({ id: schema.users.id, name: schema.users.name })
      .from(schema.users)
      .where(inArray(schema.users.id, repIds));
    for (const r of reps) repNames[r.id] = r.name;
  }

  // Matches sighting reports to a region by name, case-insensitively, against
  // either the free-text "region" or "country" field the observer entered —
  // there's no foreign key between them, so this is a best-effort mapping.
  const regionsWithStats: RegionWithStats[] = regions.map((r) => {
    const nameLower = r.name.toLowerCase();
    let reportCount = 0;
    let observerCount = 0;
    for (const stat of reportStats) {
      if (stat.region.toLowerCase() === nameLower || stat.country.toLowerCase() === nameLower) {
        reportCount += stat.reportCount;
        observerCount += stat.observerCount;
      }
    }
    return {
      id: r.id,
      name: r.name,
      group: r.group,
      status: r.status,
      representativeUserId: r.representativeUserId,
      representativeName: r.representativeUserId ? (repNames[r.representativeUserId] ?? "Unknown") : null,
      reportCount,
      observerCount,
    };
  });

  return (
    <RegionsManager
      regions={regionsWithStats}
      regionalReps={regionalReps}
      canEdit={["super_admin", "committee_admin"].includes(user.role)}
    />
  );
}
