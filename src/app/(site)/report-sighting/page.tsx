import type { Metadata } from "next";

import { PageBanner } from "@/components/layout/page-banner";
import { Container } from "@/components/ui/container";
import { SightingReportForm } from "@/components/report/sighting-report-form";

export const metadata: Metadata = {
  title: "Report a Sighting",
  description:
    "Submit a moon-sighting observation report to the Central Moon Sighting Committee GB & EU.",
};

export default function ReportSightingPage() {
  return (
    <>
      <PageBanner
        crumb="Report a Sighting"
        eyebrow="Public Reporting"
        title="Report a Sighting"
        description="Your observation helps the committee reach an accurate, verified decision. Submitting a report does not itself constitute an official moon-sighting declaration."
      />
      <section className="py-14 sm:py-16">
        <Container className="max-w-3xl">
          <SightingReportForm />
        </Container>
      </section>
    </>
  );
}
