import { Eye, FileEdit, Users, Megaphone } from "lucide-react";

import { Container } from "@/components/ui/container";

const steps = [
  {
    icon: Eye,
    title: "Observe",
    body: "Observers across GB & EU look for the crescent after Maghrib on the anticipated date.",
  },
  {
    icon: FileEdit,
    title: "Report",
    body: "Sightings are submitted through our secure reporting form with supporting details.",
  },
  {
    icon: Users,
    title: "Review",
    body: "Reviewers and committee scholars verify evidence and observer credibility.",
  },
  {
    icon: Megaphone,
    title: "Announce",
    body: "An approved decision is published as the committee's official announcement.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-navy-950 py-16 text-white sm:py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-400">
            Process
          </p>
          <h2 className="mt-1 font-heading text-2xl font-bold sm:text-3xl">
            How Moon Sighting Works
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/65">
            A transparent, four-stage process from observation to official
            announcement.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="relative rounded-xl border border-white/10 bg-white/[0.03] p-6"
            >
              <span className="font-heading text-4xl font-bold text-white/10">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="mt-2 flex h-10 w-10 items-center justify-center rounded-lg bg-gold-500/15 text-gold-400">
                <step.icon className="size-5" aria-hidden />
              </div>
              <h3 className="mt-4 font-heading text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{step.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
