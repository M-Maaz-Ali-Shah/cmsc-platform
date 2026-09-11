import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

import { PageBanner } from "@/components/layout/page-banner";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { unsubscribeNewsletter } from "@/app/actions/newsletter";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Unsubscribe",
};

export default async function UnsubscribeNewsletterPage({
  searchParams,
}: PageProps<"/newsletter/unsubscribe">) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  const result = await unsubscribeNewsletter(token);

  return (
    <>
      <PageBanner crumb="Unsubscribe" eyebrow="Newsletter" title="Unsubscribe" />
      <section className="py-14 sm:py-16">
        <Container className="max-w-xl text-center">
          {result && "success" in result ? (
            <>
              <CheckCircle2 className="mx-auto size-10 text-emerald-700" aria-hidden />
              <p className="mt-4 text-lg font-semibold text-navy-900">You&rsquo;ve been unsubscribed</p>
              <p className="mt-2 text-sm text-ink-500">
                You will no longer receive announcement emails. You can resubscribe on the homepage at any time.
              </p>
            </>
          ) : (
            <>
              <XCircle className="mx-auto size-10 text-red-600" aria-hidden />
              <p className="mt-4 text-lg font-semibold text-navy-900">Unsubscribe failed</p>
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
