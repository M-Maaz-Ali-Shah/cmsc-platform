import type { Metadata } from "next";

import { PageBanner } from "@/components/layout/page-banner";
import { LegalDoc } from "@/components/legal/legal-doc";
import { getPublishedContent } from "@/app/actions/content";
import { parseSectionedBody } from "@/lib/validation/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms governing use of the Central Moon Sighting Committee GB & EU website.",
};

const DEFAULT_BODY = [
  "## Acceptance of Terms",
  "By accessing or using this website, you agree to these terms of use. If you do not agree, please do not use the website.",
  "",
  "## Nature of Announcements",
  "Content published on this website, including moon-sighting announcements and calendar information, reflects the decisions and processes of the Central Moon Sighting Committee GB & EU. Astronomical estimates shown on the calendar are informational only and are not official religious rulings.",
  "",
  "## Submitting a Sighting Report",
  "By submitting a sighting report, you confirm that the information provided is truthful and accurate to the best of your knowledge. Submission of a report does not itself constitute an official moon-sighting declaration.",
  "",
  "## Acceptable Use",
  "You agree not to submit false or misleading reports, attempt to disrupt the operation of this website, or use it for any unlawful purpose.",
  "",
  "## Limitation of Liability",
  "This website and its content are provided on an as-is basis. The committee is not liable for decisions made in reliance on information published here, to the extent permitted by law.",
  "",
  "## Changes to These Terms",
  "These terms may be updated from time to time. Continued use of the website after changes are published constitutes acceptance of the updated terms.",
].join("\n");

export default async function TermsOfUsePage() {
  const content = await getPublishedContent("terms-of-use", {
    updated: "Draft — not yet finalised",
    body: DEFAULT_BODY,
  });

  return (
    <>
      <PageBanner crumb="Terms of Use" eyebrow="Legal" title="Terms of Use" />
      <LegalDoc updated={content.updated} sections={parseSectionedBody(content.body)} />
    </>
  );
}
