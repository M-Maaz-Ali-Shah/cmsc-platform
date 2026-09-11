import type { Metadata } from "next";

import { PageBanner } from "@/components/layout/page-banner";
import { LegalDoc } from "@/components/legal/legal-doc";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How the Central Moon Sighting Committee GB & EU handles personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageBanner crumb="Privacy Policy" eyebrow="Legal" title="Privacy Policy" />
      <LegalDoc
        updated="Draft — not yet finalised"
        sections={[
          {
            heading: "Information We Collect",
            body: [
              "When you submit a moon-sighting report, contact us, or subscribe to updates, we may collect information such as your name, contact details, general or exact location, and details of your observation, including any photographs you choose to upload.",
            ],
          },
          {
            heading: "How We Use Your Information",
            body: [
              "Information submitted through the sighting report form is used solely to review and verify moon-sighting observations as part of the committee's decision-making process. Contact details may be used to follow up on a report for verification purposes.",
            ],
          },
          {
            heading: "Data Retention",
            body: [
              "Reports and associated information are retained for a period necessary to support the committee's records and historical archive, after which they may be anonymised or deleted in line with the committee's data retention schedule (to be defined).",
            ],
          },
          {
            heading: "Sharing of Information",
            body: [
              "Personal information submitted in a sighting report is not published publicly. Only aggregated or anonymised information (such as regional summaries) may appear on public-facing pages of this website.",
            ],
          },
          {
            heading: "Your Rights",
            body: [
              "You may request access to, correction of, or deletion of personal information you have submitted by contacting the committee using the details on the Contact page.",
            ],
          },
          {
            heading: "Contact",
            body: [
              "Questions about this policy can be directed to the committee via the Contact page once official contact details are confirmed.",
            ],
          },
        ]}
      />
    </>
  );
}
