import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";

interface RegionsProps {
  regions: { name: string; group: string }[];
}

export function Regions({ regions }: RegionsProps) {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
              Our Network
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold text-navy-900 sm:text-3xl">
              GB &amp; EU Regional Coverage
            </h2>
          </div>
          <Link
            href="/regions"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-800 underline-offset-4 hover:underline"
          >
            View regional map
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        {regions.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border-subtle p-10 text-center text-sm text-ink-500">
            No regions have been configured yet.
          </p>
        ) : (
          <Card className="grid grid-cols-2 gap-px overflow-hidden bg-border-subtle sm:grid-cols-3 lg:grid-cols-4">
            {regions.map((region) => (
              <Link
                key={region.name}
                href="/regions"
                className="group flex items-center justify-between gap-2 bg-surface px-5 py-4 transition-colors hover:bg-paper-muted"
              >
                <span>
                  <span className="block text-sm font-semibold text-navy-900">
                    {region.name}
                  </span>
                  <span className="block text-xs text-ink-500">{region.group}</span>
                </span>
                <MapPin className="size-4 text-ink-300 group-hover:text-emerald-700" aria-hidden />
              </Link>
            ))}
            <Link
              href="/regions"
              className="flex items-center justify-center gap-1.5 bg-navy-900 px-5 py-4 text-sm font-semibold text-white hover:bg-navy-800"
            >
              View all regions
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Card>
        )}
      </Container>
    </section>
  );
}
