import type { Metadata } from "next";
import Link from "next/link";
import { countDistinct, inArray } from "drizzle-orm";
import { Award, Eye, ShieldCheck, Users } from "lucide-react";

import { PageBanner } from "@/components/layout/page-banner";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDb, schema } from "@/db/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Observers",
  description:
    "About the volunteer observer network that supports the Central Moon Sighting Committee GB & EU.",
};

const VERIFIED_STATUSES = ["Accepted", "Included in Decision"];

export default async function ObserversPage() {
  const db = await getDb();
  const [observerTotal, regionsRows, verifiedTotal] = await Promise.all([
    db.select({ value: countDistinct(schema.sightingReports.email) }).from(schema.sightingReports),
    db.select().from(schema.regions),
    db
      .select({ value: countDistinct(schema.sightingReports.email) })
      .from(schema.sightingReports)
      .where(inArray(schema.sightingReports.status, VERIFIED_STATUSES)),
  ]);

  const totalObservers = observerTotal[0]?.value ?? 0;
  const regionsCovered = regionsRows.length;
  const verifiedObservers = verifiedTotal[0]?.value ?? 0;

  return (
    <>
      <PageBanner
        crumb="Observers"
        eyebrow="Our Network"
        title="Observers"
        description="A trusted network of volunteers across Great Britain and Europe who observe the crescent moon and submit reports to the committee."
      >
        <Button asChild variant="gold" size="lg">
          <Link href="/report-sighting">Report a Sighting</Link>
        </Button>
      </PageBanner>

      <section className="py-14 sm:py-16">
        <Container>
          <div className="grid gap-5 sm:grid-cols-3">
            <StatCard icon={Users} label="Observers to date" value={`${totalObservers}`} />
            <StatCard icon={ShieldCheck} label="Regions covered" value={`${regionsCovered}`} />
            <StatCard icon={Award} label="Verified reports to date" value={`${verifiedObservers}`} />
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <Card className="p-7">
              <div className="flex items-center gap-2 text-emerald-700">
                <Eye className="size-5" aria-hidden />
                <h2 className="font-heading text-lg font-bold text-navy-900">Who is an observer?</h2>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-500">
                An observer is anyone who watches for the crescent moon and
                submits a report describing what they saw &mdash; or did not see.
                Observers do not need special equipment or training, though
                experience helps reviewers weigh a report&rsquo;s reliability.
              </p>
            </Card>
            <Card className="p-7">
              <div className="flex items-center gap-2 text-emerald-700">
                <ShieldCheck className="size-5" aria-hidden />
                <h2 className="font-heading text-lg font-bold text-navy-900">How reports are verified</h2>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-500">
                Reviewers may contact observers directly to confirm details
                before a report is passed to committee scholars. Observer
                contact details are never shared publicly.
              </p>
            </Card>
          </div>

          <div className="mt-12 rounded-2xl bg-navy-950 p-8 text-center text-white sm:p-12">
            <h2 className="font-heading text-2xl font-bold">Become an Observer</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-white/70">
              No formal registration is required to submit a report. If
              you&rsquo;d like to join our regional network as an ongoing
              volunteer observer, get in touch with your regional
              representative.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild variant="gold" size="lg">
                <Link href="/report-sighting">Submit a Report</Link>
              </Button>
              <Button asChild variant="outlineLight" size="lg">
                <Link href="/contact">Contact a Representative</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="font-heading text-2xl font-bold text-navy-900">{value}</p>
        <p className="text-xs text-ink-500">{label}</p>
      </div>
    </Card>
  );
}
