import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

import { PageBanner } from "@/components/layout/page-banner";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { confirmNewsletterSubscription } from "@/app/actions/newsletter";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Confirm Subscription",
  // Single-use, token-specific action page — not real indexable content,
  // and also already excluded via /newsletter/ in robots.ts.
  robots: { index: false, follow: false },
};

export default async function ConfirmNewsletterPage({
  searchParams,
}: PageProps<"/newsletter/confirm">) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  const result = await confirmNewsletterSubscription(token);

  return (
    <>
      <PageBanner crumb="Confirm Subscription" eyebrow="Newsletter" title="Confirm Subscription" />
      <section className="py-14 sm:py-16">
        <Container className="max-w-xl text-center">
          {result && "success" in result ? (
            <>
              <CheckCircle2 className="mx-auto size-10 text-emerald-700" aria-hidden />
              <p className="mt-4 text-lg font-semibold text-navy-900">You&rsquo;re subscribed!</p>
              <p className="mt-2 text-sm text-ink-500">
                You&rsquo;ll now receive an email whenever the committee publishes an official announcement.
              </p>
            </>
          ) : (
            <>
              <XCircle className="mx-auto size-10 text-red-600" aria-hidden />
              <p className="mt-4 text-lg font-semibold text-navy-900">Confirmation failed</p>
              <p className="mt-2 text-sm text-ink-500">{result?.error}</p>
            </>
          )}
          <Button asChild variant="outline" className="mt-6">
            <Link href="/">Return to homepage</Link>
          </Button>
        </Container>
      </section>
    </>
  );
}
