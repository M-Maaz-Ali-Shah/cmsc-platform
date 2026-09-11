import { Check, FileSearch, ScrollText, Send, ShieldCheck } from "lucide-react";

import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const steps = [
  { label: "Reports Submitted", icon: Send, state: "done" as const },
  { label: "Under Review", icon: FileSearch, state: "current" as const },
  { label: "Committee Decision", icon: ScrollText, state: "upcoming" as const },
  { label: "Announcement Published", icon: ShieldCheck, state: "upcoming" as const },
];

export function StatusTracker() {
  return (
    <section className="border-y border-border-subtle bg-paper-muted py-16 sm:py-20">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
              Where things stand
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold text-navy-900 sm:text-3xl">
              Moon-Sighting Status
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-500">
              Reports for Ramadan 1448 AH are currently being reviewed by
              regional representatives. This tracker reflects the committee&rsquo;s
              process, not a final religious ruling.
            </p>

            <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => (
                <li key={step.label}>
                  <div
                    className={cn(
                      "flex h-full flex-col gap-3 rounded-xl border p-4",
                      step.state === "current"
                        ? "border-gold-500 bg-gold-50"
                        : step.state === "done"
                        ? "border-emerald-700/20 bg-emerald-50"
                        : "border-border-subtle bg-surface"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full",
                        step.state === "current"
                          ? "bg-gold-500 text-navy-950"
                          : step.state === "done"
                          ? "bg-emerald-700 text-white"
                          : "bg-paper-muted text-ink-300"
                      )}
                    >
                      {step.state === "done" ? (
                        <Check className="size-4" />
                      ) : (
                        <step.icon className="size-4" />
                      )}
                    </div>
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        step.state === "upcoming" ? "text-ink-500" : "text-navy-900"
                      )}
                    >
                      {i + 1}. {step.label}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <Card className="flex flex-col justify-between p-6 sm:p-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
                Upcoming Sighting
              </p>
              <p className="mt-2 font-heading text-3xl font-bold text-navy-900">
                27 Aug 2026
              </p>
              <p className="mt-1 text-sm text-ink-500">
                29th of Sha&rsquo;ban 1448 AH &middot; observation window opens after Maghrib
              </p>
            </div>
            <div className="mt-6 rounded-lg bg-navy-50 p-4 text-sm text-navy-800">
              Astronomical estimates are informational only. The committee&rsquo;s
              official announcement will be published here once confirmed.
            </div>
          </Card>
        </div>
      </Container>
    </section>
  );
}
