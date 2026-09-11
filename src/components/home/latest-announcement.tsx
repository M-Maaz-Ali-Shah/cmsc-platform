import Link from "next/link";
import { Download, FileText, MapPin, Clock } from "lucide-react";

import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function LatestAnnouncement() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
              Official Communication
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold text-navy-900 sm:text-3xl">
              Latest Official Announcement
            </h2>
          </div>
          <Link
            href="/announcements"
            className="text-sm font-semibold text-navy-800 underline-offset-4 hover:underline"
          >
            View archive →
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border-subtle bg-navy-950 text-white shadow-xl">
          <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="confirmed">Confirmed</Badge>
                <span className="text-xs uppercase tracking-wide text-white/50">
                  Demo content — for design review
                </span>
              </div>
              <h3 className="mt-4 font-heading text-2xl font-bold sm:text-3xl">
                Start of Ramadan 1448 AH
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
                Following verified sighting reports received from across our
                regional network and review by committee scholars, the
                Central Moon Sighting Committee GB &amp; EU has confirmed the
                sighting of the crescent moon marking the beginning of
                Ramadan.
              </p>

              <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/60">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-gold-400" aria-hidden />
                  <span>Published 19 Aug 2026, 21:40 BST</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-gold-400" aria-hidden />
                  <span>Great Britain &amp; Europe</span>
                </div>
              </dl>
            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
              <Button asChild variant="gold" size="lg">
                <Link href="/announcements/ramadan-1448">
                  <FileText className="size-4" aria-hidden />
                  Read Full Announcement
                </Link>
              </Button>
              <Button asChild variant="outlineLight" size="lg">
                <Link href="/announcements/ramadan-1448.pdf">
                  <Download className="size-4" aria-hidden />
                  Download PDF
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
