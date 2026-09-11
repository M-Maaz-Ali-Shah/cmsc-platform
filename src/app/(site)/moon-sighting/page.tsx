import type { Metadata } from "next";
import Link from "next/link";
import { Check, FileSearch, MapPin, ScrollText, Send, ShieldCheck, Telescope } from "lucide-react";

import { PageBanner } from "@/components/layout/page-banner";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { regions } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Moon Sighting",
  description:
    "Current moon-sighting status for the Central Moon Sighting Committee GB & EU, including the live review pipeline and regional reporting summary.",
};

const steps = [
  { label: "Reports Submitted", icon: Send, state: "done" as const, count: 24 },
  { label: "Under Review", icon: FileSearch, state: "current" as const, count: 9 },
  { label: "Committee Decision", icon: ScrollText, state: "upcoming" as const, count: 0 },
  { label: "Announcement Published", icon: ShieldCheck, state: "upcoming" as const, count: 0 },
];

export default function MoonSightingPage() {
  const topRegions = [...regions].sort((a, b) => b.reports - a.reports).slice(0, 6);

  return (
    <>
      <PageBanner
        crumb="Moon Sighting"
        eyebrow="Live Status"
        title="Moon Sighting"
        description="A real-time view of where the committee's review process stands for the current lunar cycle, and how reports are distributed across our regional network."
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
                  Sha&rsquo;ban 1448 AH &rarr; Ramadan 1448 AH
                </h2>
                <Badge variant="awaiting">Awaiting Sighting</Badge>
              </div>
              <p className="mt-2 max-w-2xl text-sm text-ink-500">
                This tracker reflects the committee&rsquo;s internal process for the
                current cycle. It is informational and does not itself
                constitute a religious ruling.
              </p>

              <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {steps.map((step, i) => (
                  <li key={step.label}>
                    <Card
                      className={
                        step.state === "current"
                          ? "border-gold-500 bg-gold-50 p-5"
                          : step.state === "done"
                          ? "border-emerald-700/20 bg-emerald-50 p-5"
                          : "p-5"
                      }
                    >
                      <div
                        className={
                          "flex h-9 w-9 items-center justify-center rounded-full " +
                          (step.state === "current"
                            ? "bg-gold-500 text-navy-950"
                            : step.state === "done"
                            ? "bg-emerald-700 text-white"
                            : "bg-paper-muted text-ink-300")
                        }
                      >
                        {step.state === "done" ? (
                          <Check className="size-4" />
                        ) : (
                          <step.icon className="size-4" />
                        )}
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
                  27 Aug 2026, after Maghrib
                </p>
              </div>
              <div className="border-t border-border-subtle pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Reporting regions this cycle
                </p>
                <ul className="mt-3 space-y-2">
                  {topRegions.map((r) => (
                    <li key={r.name} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-ink-700">
                        <MapPin className="size-3.5 text-ink-300" aria-hidden />
                        {r.name}
                      </span>
                      <span className="font-semibold text-navy-900">{r.reports} reports</span>
                    </li>
                  ))}
                </ul>
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
