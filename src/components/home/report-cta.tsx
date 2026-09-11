import Link from "next/link";
import { Eye, ArrowRight } from "lucide-react";

import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export function ReportCta() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="relative overflow-hidden rounded-2xl bg-emerald-800 px-8 py-12 text-white sm:px-12 sm:py-14">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(600px 260px at 90% 0%, rgba(201,161,58,0.25), transparent 60%)",
            }}
            aria-hidden
          />
          <div className="relative flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 text-gold-300">
                <Eye className="size-5" aria-hidden />
                <p className="text-xs font-semibold uppercase tracking-[0.14em]">
                  Have you sighted the crescent?
                </p>
              </div>
              <h2 className="mt-3 font-heading text-2xl font-bold sm:text-3xl">
                Report a Sighting
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/75 sm:text-base">
                Your observation helps the committee reach an accurate,
                verified decision. Submitting a report does not itself
                constitute an official moon-sighting declaration.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button asChild variant="gold" size="lg">
                <Link href="/report-sighting">
                  Submit Sighting Report
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
              <Button asChild variant="outlineLight" size="lg">
                <Link href="/how-moon-sighting-works">How it works</Link>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
