import type { Metadata } from "next";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { Check, FileSearch, MapPin, ScrollText, Send, ShieldCheck, Telescope } from "lucide-react";

import { PageBanner } from "@/components/layout/page-banner";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDb, schema } from "@/db/client";
import { CALENDAR_STATUS_MAP } from "@/lib/calendar-data";
import { getPublishedContent } from "@/app/actions/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Moon Sighting",
  description:
    "Current moon-sighting status for the Central Moon Sighting Committee GB & EU, including the live review pipeline and regional reporting summary.",
};

const REVIEW_STATUSES = ["Received", "Under Review", "Contact Verification"];
const DECIDED_STATUSES = ["Accepted", "Rejected", "Included in Decision"];

export default async function MoonSightingPage() {
  const db = await getDb();
  const [reports, calendarRows, intro] = await Promise.all([
    db.select().from(schema.sightingReports),
    db.select().from(schema.calendarEntries).orderBy(asc(schema.calendarEntries.sortOrder)),
    getPublishedContent("moon-sighting-intro", {
      text: "A real-time view of where the committee's review process stands, and how sighting reports are distributed across our regional network.",
    }),
  ]);

  const total = reports.length;
  const reviewed = reports.filter(
    (r) => REVIEW_STATUSES.includes(r.status) || DECIDED_STATUSES.includes(r.status)
  ).length;
  const decided = reports.filter((r) => DECIDED_STATUSES.includes(r.status)).length;
  const included = reports.filter((r) => r.status === "Included in Decision").length;

  const steps = [
    { label: "Reports Submitted", icon: Send, count: total },
    { label: "Under Review", icon: FileSearch, count: reviewed },
    { label: "Committee Decision", icon: ScrollText, count: decided },
    { label: "Included in Announcement", icon: ShieldCheck, count: included },
  ];

  const regionCounts = new Map<string, number>();
  for (const r of reports) {
    regionCounts.set(r.region, (regionCounts.get(r.region) ?? 0) + 1);
  }
  const topRegions = [...regionCounts.entries()]
    .map(([name, reportCount]) => ({ name, reportCount }))
    .sort((a, b) => b.reportCount - a.reportCount)
    .slice(0, 6);

  const current = calendarRows.find((r) => r.officialStatus === "Current Month") ?? null;
  const upcoming = calendarRows.find((r) => r.officialStatus === "Under Review") ?? null;
  const currentBadge = current ? CALENDAR_STATUS_MAP[current.officialStatus] : null;
  const sightingWindow = upcoming?.astronomicalEstimate ?? current?.astronomicalEstimate ?? null;

  return (
    <>
      <PageBanner
        crumb="Moon Sighting"
        eyebrow="Live Status"
        title="Moon Sighting"
        description={intro.text}
      >
        <Button asChild variant="gold" size="lg">
          <Link href="/report-sighting">Report a Sighting</Link>
        </Button>
      </PageBanner>

      <section className="py-14 sm:py-16">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-heading text-xl font-bold text-navy-900">
                  {current
                    ? `${current.hijriMonth} ${current.hijriYear}${
                        upcoming ? ` → ${upcoming.hijriMonth} ${upcoming.hijriYear}` : ""
                      }`
                    : "No active sighting cycle"}
                </h2>
                {currentBadge && <Badge variant={currentBadge.status}>{currentBadge.label}</Badge>}
              </div>
              <p className="mt-2 max-w-2xl text-sm text-ink-500">
                This tracker reflects the committee&rsquo;s review process to
                date. It is informational and does not itself constitute a
                religious ruling.
              </p>

              <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {steps.map((step, i) => (
                  <li key={step.label}>
                    <Card className={i === 0 ? "border-emerald-700/20 bg-emerald-50 p-5" : "p-5"}>
                      <div
                        className={
                          "flex h-9 w-9 items-center justify-center rounded-full " +
                          (i === 0 ? "bg-emerald-700 text-white" : "bg-paper-muted text-ink-300")
                        }
                      >
                        {i === 0 ? <Check className="size-4" /> : <step.icon className="size-4" />}
                      </div>
                      <p className="mt-3 text-sm font-semibold text-navy-900">
                        {i + 1}. {step.label}
                      </p>
                      <p className="mt-1 font-heading text-2xl font-bold text-navy-900">
                        {step.count}
                      </p>
                      <p className="text-xs text-ink-500">reports</p>
                    </Card>
                  </li>
                ))}
              </ol>
            </div>

            <Card className="flex flex-col gap-5 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Sighting window
                </p>
                <p className="mt-1 flex items-center gap-2 font-heading text-lg font-bold text-navy-900">
                  <Telescope className="size-5 text-emerald-700" aria-hidden />
                  {sightingWindow ?? "Not yet estimated"}
                </p>
              </div>
              <div className="border-t border-border-subtle pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Reporting regions to date
                </p>
                {topRegions.length === 0 ? (
                  <p className="mt-3 text-sm text-ink-400">No sighting reports submitted yet.</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {topRegions.map((r) => (
                      <li key={r.name} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5 text-ink-700">
                          <MapPin className="size-3.5 text-ink-300" aria-hidden />
                          {r.name}
                        </span>
                        <span className="font-semibold text-navy-900">{r.reportCount} reports</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <Button asChild variant="outline" className="mt-auto">
                <Link href="/regions">View full regional breakdown</Link>
              </Button>
            </Card>
          </div>
        </Container>
      </section>

      <section className="border-t border-border-subtle bg-paper-muted py-14 sm:py-16">
        <Container className="grid gap-6 lg:grid-cols-3">
          <Card className="p-6">
            <CardHeader className="p-0">
              <CardTitle>Not an official ruling</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-3">
              <p className="text-sm leading-relaxed text-ink-500">
                Submission of a sighting report does not itself constitute an
                official moon-sighting declaration. Only a published
                announcement from the committee represents an official
                decision.
              </p>
            </CardContent>
          </Card>
          <Card className="p-6">
            <CardHeader className="p-0">
              <CardTitle>How reports are used</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-3">
              <p className="text-sm leading-relaxed text-ink-500">
                Reviewers verify observer details and evidence before reports
                are presented to committee scholars for a decision. See{" "}
                <Link href="/how-moon-sighting-works" className="font-medium text-navy-800 underline-offset-4 hover:underline">
                  how moon sighting works
                </Link>
                .
              </p>
            </CardContent>
          </Card>
          <Card className="p-6">
            <CardHeader className="p-0">
              <CardTitle>Astronomical estimates</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-3">
              <p className="text-sm leading-relaxed text-ink-500">
                Calculated visibility estimates are shown on the{" "}
                <Link href="/calendar" className="font-medium text-navy-800 underline-offset-4 hover:underline">
                  Islamic Calendar
                </Link>{" "}
                for information only and are never presented as an official
                decision.
              </p>
            </CardContent>
          </Card>
        </Container>
      </section>
    </>
  );
}
