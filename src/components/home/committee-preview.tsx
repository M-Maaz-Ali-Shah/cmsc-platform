import Link from "next/link";
import { ArrowRight, UserRound } from "lucide-react";

import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const roles = ["Chairman", "Secretary", "Regional Representative", "Astronomical Adviser"];

export function CommitteePreview() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
              Governance
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold text-navy-900 sm:text-3xl">
              Committee
            </h2>
          </div>
          <Link
            href="/committee"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-800 underline-offset-4 hover:underline"
          >
            Meet the full committee
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((role) => (
            <Card key={role} className="p-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-navy-50 text-navy-400">
                <UserRound className="size-8" aria-hidden />
              </div>
              <p className="mt-4 font-heading text-sm font-bold text-navy-900">
                Name pending confirmation
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                {role}
              </p>
              <Badge variant="neutral" className="mt-3">
                Placeholder profile
              </Badge>
            </Card>
          ))}
        </div>
        <p className="mt-4 text-xs text-ink-500">
          Committee member details will be published here once approved by
          administrators. No individuals are represented above.
        </p>
      </Container>
    </section>
  );
}
