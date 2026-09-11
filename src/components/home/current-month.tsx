import { Moon, CalendarDays, Telescope } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";

export function CurrentMonth() {
  return (
    <section className="relative -mt-12 sm:-mt-16">
      <Container>
        <Card className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.1fr_auto_1fr] lg:items-center lg:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
              Current Islamic Month
            </p>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 className="font-heading text-3xl font-bold text-navy-900 sm:text-4xl">
                Sha&rsquo;ban 1448 AH
              </h2>
              <Badge variant="awaiting">Awaiting Sighting</Badge>
            </div>
            <p className="mt-3 flex items-center gap-2 text-sm text-ink-500">
              <CalendarDays className="size-4 text-ink-300" aria-hidden />
              Gregorian date &mdash;{" "}
              <span className="font-medium text-ink-700">Thursday, 20 August 2026</span>
            </p>
            <p className="mt-4 max-w-md text-xs leading-relaxed text-ink-500">
              This is a demonstration status card. Islamic dates shown here are
              placeholder content and do not represent an official committee
              decision.
            </p>
          </div>

          <div className="hidden h-full w-px bg-border-subtle lg:block" aria-hidden />

          <dl className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-2">
            <StatCell
              icon={<Moon className="size-4" aria-hidden />}
              label="Next expected sighting"
              value="27 Aug 2026"
            />
            <StatCell
              icon={<Telescope className="size-4" aria-hidden />}
              label="Sighting window"
              value="After Maghrib"
            />
            <StatCell
              icon={<CalendarDays className="size-4" aria-hidden />}
              label="Upcoming month"
              value="Ramadan 1448 AH"
            />
            <StatCell
              icon={<Moon className="size-4" aria-hidden />}
              label="Status"
              value="Awaiting Moon Sighting"
            />
          </dl>
        </Card>
      </Container>
    </section>
  );
}

function StatCell({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-paper-muted p-4">
      <div className="flex items-center gap-2 text-emerald-700">
        {icon}
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
          {label}
        </p>
      </div>
      <p className="mt-1.5 font-heading text-base font-bold text-navy-900">{value}</p>
    </div>
  );
}
