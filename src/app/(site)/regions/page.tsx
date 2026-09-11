import type { Metadata } from "next";
import { asc, count, countDistinct, inArray } from "drizzle-orm";
import { MapPin, Users, FileText } from "lucide-react";

import { PageBanner } from "@/components/layout/page-banner";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDb, schema } from "@/db/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "GB & EU Regions",
  description:
    "Regional coverage network for the Central Moon Sighting Committee across Great Britain and Europe.",
};

interface RegionDisplay {
  id: string;
  name: string;
  group: string;
  status: string;
  representativeName: string | null;
  observerCount: number;
  reportCount: number;
}

async function getRegions(): Promise<RegionDisplay[]> {
  const db = await getDb();
  const [regions, reportStats] = await Promise.all([
    db.select().from(schema.regions).orderBy(asc(schema.regions.group), asc(schema.regions.sortOrder)),
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

  return regions.map((r) => {
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
      representativeName: r.representativeUserId ? (repNames[r.representativeUserId] ?? null) : null,
      observerCount,
      reportCount,
    };
  });
}

export default async function RegionsPage() {
  const regions = await getRegions();
  const gb = regions.filter((r) => r.group === "Great Britain");
  const eu = regions.filter((r) => r.group === "Europe");

  return (
    <>
      <PageBanner
        crumb="Regions"
        eyebrow="Our Network"
        title="GB & EU Regional Coverage"
        description="The committee coordinates observers and regional representatives across Great Britain and continental Europe. Regions can be added or updated by administrators without any code changes."
      />

      <section className="py-14 sm:py-16">
        <Container>
          {regions.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border-subtle p-10 text-center text-sm text-ink-500">
              No regions have been configured yet.
            </p>
          ) : (
            <>
              <CoverageDiagram gbCount={gb.length} euCount={eu.length} />
              <div className="mt-14 grid gap-10 lg:grid-cols-2">
                <RegionGroup title="Great Britain" items={gb} />
                <RegionGroup title="Europe" items={eu} />
              </div>
              <p className="mt-10 text-center text-xs text-ink-500">
                Observer and report figures reflect sighting reports
                submitted to date and update automatically.
              </p>
            </>
          )}
        </Container>
      </section>
    </>
  );
}

function RegionGroup({ title, items }: { title: string; items: RegionDisplay[] }) {
  return (
    <div>
      <h2 className="font-heading text-xl font-bold text-navy-900">{title}</h2>
      <div className="mt-5 space-y-4">
        {items.map((r) => (
          <Card key={r.id} className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-2 font-heading text-base font-bold text-navy-900">
                <MapPin className="size-4 text-emerald-700" aria-hidden />
                {r.name}
              </p>
              <Badge variant={r.status === "Active" ? "emerald" : "neutral"}>{r.status}</Badge>
            </div>
            <p className="mt-2 text-sm text-ink-500">
              Regional representative:{" "}
              <span className="text-ink-700">{r.representativeName ?? "Awaiting representative"}</span>
            </p>
            <div className="mt-3 flex gap-6 text-xs text-ink-500">
              <span className="flex items-center gap-1.5">
                <Users className="size-3.5" aria-hidden />
                {r.observerCount} observers
              </span>
              <span className="flex items-center gap-1.5">
                <FileText className="size-3.5" aria-hidden />
                {r.reportCount} reports
              </span>
            </div>
          </Card>
        ))}
        {items.length === 0 && <p className="text-sm text-ink-400">No regions in this group yet.</p>}
      </div>
    </div>
  );
}

function CoverageDiagram({ gbCount, euCount }: { gbCount: number; euCount: number }) {
  return (
    <Card className="overflow-hidden bg-navy-950 p-8 text-white sm:p-10">
      <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto_1fr]">
        <NodeColumn label="Great Britain" count={gbCount} align="right" />
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-500 text-navy-950">
            <MapPin className="size-7" aria-hidden />
          </div>
          <p className="text-center text-xs font-semibold uppercase tracking-wide text-gold-400">
            Central Committee
          </p>
        </div>
        <NodeColumn label="Europe" count={euCount} align="left" />
      </div>
    </Card>
  );
}

function NodeColumn({
  label,
  count,
  align,
}: {
  label: string;
  count: number;
  align: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "flex flex-col items-end gap-3" : "flex flex-col items-start gap-3"}>
      <p className="text-sm font-semibold uppercase tracking-wide text-white/60">{label}</p>
      <div className="flex flex-wrap gap-2" style={{ justifyContent: align === "right" ? "flex-end" : "flex-start" }}>
        {Array.from({ length: count }).map((_, i) => (
          <span key={i} className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden />
        ))}
      </div>
      <p className="text-xs text-white/40">{count} regions active</p>
    </div>
  );
}
