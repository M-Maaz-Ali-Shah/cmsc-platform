import { Moon, CalendarDays, Telescope } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import type { BadgeStatus } from "@/lib/calendar-data";

interface CurrentMonthProps {
  current: {
    hijriMonth: string;
    hijriYear: string;
    statusVariant: BadgeStatus;
    statusLabel: string;
    estimate: string | null;
  } | null;
  upcoming: { hijriMonth: string; hijriYear: string } | null;
}

export function CurrentMonth({ current, upcoming }: CurrentMonthProps) {
  return (
    <section className="relative -mt-12 sm:-mt-16">
      <Container>
        <Card className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.1fr_auto_1fr] lg:items-center lg:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
              Current Islamic Month
            </p>
            {current ? (
              <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 className="font-heading text-3xl font-bold text-navy-900 sm:text-4xl">
                  {current.hijriMonth} {current.hijriYear}
                </h2>
                <Badge variant={current.statusVariant}>{current.statusLabel}</Badge>
              </div>
            ) : (
              <h2 className="mt-2 font-heading text-2xl font-bold text-navy-900">
                No active cycle configured yet
              </h2>
            )}
            <p className="mt-4 max-w-md text-xs leading-relaxed text-ink-500">
              This card reflects the current entry on the committee&rsquo;s
              Islamic calendar and does not itself represent an official
              religious ruling.
            </p>
          </div>

          <div className="hidden h-full w-px bg-border-subtle lg:block" aria-hidden />

          <dl className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-2">
            <StatCell
              icon={<Moon className="size-4" aria-hidden />}
              label="Next expected sighting"
              value={current?.estimate ?? "Not yet estimated"}
            />
            <StatCell
              icon={<Telescope className="size-4" aria-hidden />}
              label="Sighting window"
              value="After Maghrib"
            />
            <StatCell
              icon={<CalendarDays className="size-4" aria-hidden />}
              label="Upcoming month"
              value={upcoming ? `${upcoming.hijriMonth} ${upcoming.hijriYear}` : "Not yet configured"}
            />
            <StatCell
              icon={<Moon className="size-4" aria-hidden />}
              label="Status"
              value={current?.statusLabel ?? "Unconfigured"}
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
