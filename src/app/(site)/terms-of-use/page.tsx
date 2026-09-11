import type { Metadata } from "next";

import { PageBanner } from "@/components/layout/page-banner";
import { LegalDoc } from "@/components/legal/legal-doc";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms governing use of the Central Moon Sighting Committee GB & EU website.",
};

export default function TermsOfUsePage() {
  return (
    <>
      <PageBanner crumb="Terms of Use" eyebrow="Legal" title="Terms of Use" />
      <LegalDoc
        updated="Draft — not yet finalised"
        sections={[
          {
            heading: "Acceptance of Terms",
            body: [
              "By accessing or using this website, you agree to these terms of use. If you do not agree, please do not use the website.",
            ],
          },
          {
            heading: "Nature of Announcements",
            body: [
              "Content published on this website, including moon-sighting announcements and calendar information, reflects the decisions and processes of the Central Moon Sighting Committee GB & EU. Astronomical estimates shown on the calendar are informational only and are not official religious rulings.",
            ],
          },
          {
            heading: "Submitting a Sighting Report",
            body: [
              "By submitting a sighting report, you confirm that the information provided is truthful and accurate to the best of your knowledge. Submission of a report does not itself constitute an official moon-sighting declaration.",
            ],
          },
          {
            heading: "Acceptable Use",
            body: [
              "You agree not to submit false or misleading reports, attempt to disrupt the operation of this website, or use it for any unlawful purpose.",
            ],
          },
          {
            heading: "Limitation of Liability",
            body: [
              "This website and its content are provided on an as-is basis. The committee is not liable for decisions made in reliance on information published here, to the extent permitted by law.",
            ],
          },
          {
            heading: "Changes to These Terms",
            body: [
              "These terms may be updated from time to time. Continued use of the website after changes are published constitutes acceptance of the updated terms.",
            ],
          },
        ]}
      />
    </>
  );
}
