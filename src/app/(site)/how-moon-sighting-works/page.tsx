import type { Metadata } from "next";
import Link from "next/link";
import { Eye, FileEdit, Megaphone, Moon, Sunset, Users } from "lucide-react";

import { PageBanner } from "@/components/layout/page-banner";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How Moon Sighting Works",
  description:
    "An educational overview of crescent moon observation and how the Central Moon Sighting Committee GB & EU reviews reports and reaches decisions.",
  alternates: { canonical: "/how-moon-sighting-works" },
};

const stages = [
  {
    icon: Eye,
    title: "Observe",
    body:
      "After sunset (Maghrib) on the anticipated date, observers across Great Britain and Europe look toward the western horizon for the young crescent.",
  },
  {
    icon: FileEdit,
    title: "Report",
    body:
      "Whether or not the crescent is seen, observers can submit a report describing conditions, direction, and any supporting evidence.",
  },
  {
    icon: Users,
    title: "Review",
    body:
      "Trained reviewers check each report for consistency and, where needed, contact the observer to verify details before it reaches scholars.",
  },
  {
    icon: Megaphone,
    title: "Announce",
    body:
      "Once evidence has been weighed against astronomical data and committee guidelines, an authorised announcement is published publicly.",
  },
];

export default function HowMoonSightingWorksPage() {
  return (
    <>
      <PageBanner
        crumb="How Moon Sighting Works"
        eyebrow="Education"
        title="How Moon Sighting Works"
        description="Moon sighting (ru'yah al-hilal) is the practice of visually observing the new crescent moon to mark the start of an Islamic month. Here's how the committee turns individual observations into an official decision."
      />

      <section className="py-14 sm:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-heading text-2xl font-bold text-navy-900">
                Why the crescent is observed
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-700 sm:text-base">
                The Islamic calendar is lunar: each month begins with the
                sighting of the new crescent (hilal) shortly after sunset,
                low on the western horizon. Because the crescent is only
                visible for a short window and depends on weather, horizon
                clarity, and the moon&rsquo;s position, sightings are gathered
                from multiple locations rather than relying on a single
                observer.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-700 sm:text-base">
                Astronomical calculations can estimate when the crescent{" "}
                <em>may</em> become visible, and the committee publishes these
                as informational estimates on the{" "}
                <Link href="/calendar" className="font-medium text-navy-800 underline-offset-4 hover:underline">
                  Islamic Calendar
                </Link>
                . They are distinct from, and never substitute for, an actual
                verified sighting and official committee announcement.
              </p>
            </div>
            <HorizonDiagram />
          </div>
        </Container>
      </section>

      <section className="border-y border-border-subtle bg-navy-950 py-14 text-white sm:py-16">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-400">
              The Process
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold sm:text-3xl">
              From Observation to Announcement
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stages.map((stage, i) => (
              <div key={stage.title} className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
                <span className="font-heading text-4xl font-bold text-white/10">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="mt-2 flex h-10 w-10 items-center justify-center rounded-lg bg-gold-500/15 text-gold-400">
                  <stage.icon className="size-5" aria-hidden />
                </div>
                <h3 className="mt-4 font-heading text-lg font-bold">{stage.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{stage.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-16">
        <Container>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-7">
              <div className="flex items-center gap-2 text-emerald-700">
                <Sunset className="size-5" aria-hidden />
                <h3 className="font-heading text-lg font-bold text-navy-900">
                  When observations take place
                </h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-500">
                Observations are made after sunset on the 29th day of the
                current Islamic month. If the crescent is not sighted, the
                month is completed as 30 days and observation resumes the
                following evening.
              </p>
            </Card>
            <Card className="p-7">
              <div className="flex items-center gap-2 text-emerald-700">
                <Moon className="size-5" aria-hidden />
                <h3 className="font-heading text-lg font-bold text-navy-900">
                  A note on religious rulings
                </h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-500">
                The specific criteria used to evaluate and accept a sighting
                are set by the committee&rsquo;s scholars and are configurable
                by administrators rather than fixed in this website&rsquo;s code
                &mdash; this page describes the general process, not a
                specific ruling.
              </p>
            </Card>
          </div>
          <div className="mt-8 flex justify-center">
            <Button asChild size="lg">
              <Link href="/report-sighting">Report a Sighting</Link>
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}

function HorizonDiagram() {
  return (
    <Card className="overflow-hidden p-0">
      <svg viewBox="0 0 480 320" className="h-full w-full" role="img" aria-label="Diagram of the crescent moon low on the western horizon after sunset">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a1730" />
            <stop offset="55%" stopColor="#16305a" />
            <stop offset="100%" stopColor="#b28b26" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="hzGold" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#E4C878" />
            <stop offset="100%" stopColor="#B8912A" />
          </linearGradient>
          <mask id="diagCrescent">
            <rect width="480" height="320" fill="black" />
            <circle cx="330" cy="150" r="30" fill="white" />
            <circle cx="343" cy="140" r="24" fill="black" />
          </mask>
        </defs>
        <rect width="480" height="320" fill="url(#sky)" />
        <g fill="#F3E3B3">
          <circle cx="60" cy="50" r="1.6" />
          <circle cx="120" cy="30" r="1.2" />
          <circle cx="200" cy="60" r="1.6" />
          <circle cx="260" cy="35" r="1.2" />
          <circle cx="400" cy="55" r="1.4" />
          <circle cx="430" cy="90" r="1.2" />
        </g>
        <circle cx="330" cy="150" r="30" fill="url(#hzGold)" mask="url(#diagCrescent)" />
        {/* horizon line */}
        <path d="M0 230 L480 230" stroke="#D9B968" strokeOpacity="0.4" strokeWidth="1" />
        {/* skyline silhouette */}
        <path
          d="M0 232 L40 232 L40 205 L70 205 L70 232 L130 232 L130 190 L150 190 L150 170 L170 170 L170 232 L230 232 L230 215 L260 215 L260 232 L480 232 L480 320 L0 320 Z"
          fill="#060d1c"
        />
        <text x="240" y="270" textAnchor="middle" fill="#ffffff" opacity="0.55" fontSize="13" fontFamily="ui-sans-serif, system-ui">
          West horizon, shortly after Maghrib
        </text>
      </svg>
    </Card>
  );
}
