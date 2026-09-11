import Link from "next/link";
import { ArrowRight, ImageIcon, PlayCircle } from "lucide-react";

import { Container } from "@/components/ui/container";

const items = [
  { type: "photo", label: "Moon Sightings" },
  { type: "video", label: "Committee" },
  { type: "photo", label: "Events" },
  { type: "photo", label: "Announcements" },
];

export function MediaPreview() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
              Gallery
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold text-navy-900 sm:text-3xl">
              Media
            </h2>
          </div>
          <Link
            href="/media"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-800 underline-offset-4 hover:underline"
          >
            Browse media library
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {items.map((item, i) => (
            <Link
              key={i}
              href="/media"
              className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-xl bg-gradient-to-br from-navy-800 to-navy-950 p-4 text-white"
            >
              <div
                className="absolute inset-0 opacity-40 transition-opacity group-hover:opacity-60"
                style={{
                  background:
                    "radial-gradient(200px 120px at 30% 20%, rgba(201,161,58,0.35), transparent 60%)",
                }}
                aria-hidden
              />
              <div className="relative flex items-center gap-2 text-gold-400">
                {item.type === "video" ? (
                  <PlayCircle className="size-5" aria-hidden />
                ) : (
                  <ImageIcon className="size-5" aria-hidden />
                )}
              </div>
              <p className="relative mt-2 text-sm font-semibold">{item.label}</p>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
