import Link from "next/link";
import { ArrowRight, Radar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy-950 text-white">
      {/* astronomical backdrop */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(1100px 480px at 78% -10%, rgba(201,161,58,0.16), transparent 60%), radial-gradient(900px 500px at 15% 110%, rgba(20,128,77,0.20), transparent 60%)",
        }}
        aria-hidden
      />
      <div className="crescent-field pointer-events-none absolute inset-0 opacity-70" aria-hidden />

      <Container className="relative py-20 sm:py-24 lg:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="animate-fade-up">
            <Badge variant="outlineLight" className="mb-6">
              <Radar className="size-3.5" aria-hidden />
              Live coverage — Great Britain &amp; Europe
            </Badge>

            <h1 className="font-heading text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Central Moon Sighting Committee
            </h1>
            <p className="mt-3 text-lg font-semibold uppercase tracking-[0.18em] text-gold-400 sm:text-xl">
              Great Britain &amp; Europe
            </p>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
              Official moon-sighting announcements, reports and Islamic
              calendar information for communities across Great Britain and
              Europe.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="gold" size="lg">
                <Link href="/announcements">
                  Latest Announcement
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
              <Button asChild variant="outlineLight" size="lg">
                <Link href="/report-sighting">Report a Sighting</Link>
              </Button>
            </div>

            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-6 text-sm">
              <div>
                <dt className="text-white/50">Regions covered</dt>
                <dd className="mt-1 font-heading text-2xl font-bold text-white">14+</dd>
              </div>
              <div>
                <dt className="text-white/50">Countries</dt>
                <dd className="mt-1 font-heading text-2xl font-bold text-white">GB &amp; EU</dd>
              </div>
              <div>
                <dt className="text-white/50">Calendar</dt>
                <dd className="mt-1 font-heading text-2xl font-bold text-white">Hijri</dd>
              </div>
            </dl>
          </div>

          <div className="relative mx-auto hidden aspect-square w-full max-w-md items-center justify-center lg:flex">
            <MoonIllustration />
          </div>
        </div>
      </Container>
    </section>
  );
}

function MoonIllustration() {
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" role="img" aria-label="Crescent moon over a night horizon">
      <defs>
        <radialGradient id="glow" cx="50%" cy="42%" r="55%">
          <stop offset="0%" stopColor="#D9B968" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#D9B968" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="moonGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F3E3B3" />
          <stop offset="100%" stopColor="#C9A13A" />
        </linearGradient>
        <mask id="heroCrescentMask">
          <rect width="400" height="400" fill="black" />
          <circle cx="200" cy="170" r="95" fill="white" />
          <circle cx="242" cy="140" r="80" fill="black" />
        </mask>
      </defs>
      <circle cx="200" cy="170" r="150" fill="url(#glow)" />
      <circle cx="200" cy="170" r="95" fill="url(#moonGrad)" mask="url(#heroCrescentMask)" />
      <g fill="#F3E3B3">
        <circle cx="90" cy="80" r="2" opacity="0.8" />
        <circle cx="320" cy="70" r="1.6" opacity="0.7" />
        <circle cx="340" cy="200" r="2" opacity="0.6" />
        <circle cx="70" cy="230" r="1.6" opacity="0.6" />
        <circle cx="130" cy="300" r="1.4" opacity="0.5" />
      </g>
    </svg>
  );
}
