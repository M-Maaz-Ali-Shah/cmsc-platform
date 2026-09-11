"use client";

import { useState } from "react";
import { ImageIcon, PlayCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { schema } from "@/db/client";

type MediaRow = typeof schema.media.$inferSelect;

const categories = ["All", "Moon Sightings", "Committee", "Events", "Announcements", "Community"] as const;

export function MediaGallery({ items }: { items: MediaRow[] }) {
  const [active, setActive] = useState<(typeof categories)[number]>("All");

  const visible = active === "All" ? items : items.filter((i) => i.category === active);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              active === c
                ? "border-navy-900 bg-navy-900 text-white"
                : "border-border-subtle bg-surface text-ink-700 hover:bg-paper-muted"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {visible.map((item, i) => {
          const tile = (
            <div className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-xl bg-gradient-to-br from-navy-800 to-navy-950 p-4 text-white">
              {item.fileKey && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/public-files/${item.fileKey}?w=512`}
                  alt={item.title}
                  className="absolute inset-0 h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
                />
              )}
              {!item.fileKey && (
                <div
                  className="absolute inset-0 opacity-40 transition-opacity group-hover:opacity-60"
                  style={{
                    background: `radial-gradient(200px 120px at ${20 + ((i * 17) % 60)}% 20%, rgba(201,161,58,0.35), transparent 60%)`,
                  }}
                  aria-hidden
                />
              )}
              <div className="relative flex items-center gap-2 text-gold-400">
                {item.type === "video" ? (
                  <PlayCircle className="size-5" aria-hidden />
                ) : (
                  <ImageIcon className="size-5" aria-hidden />
                )}
                <span className="text-[10px] font-semibold uppercase tracking-wide">{item.category}</span>
              </div>
              <p className="relative mt-2 text-sm font-semibold leading-snug">{item.title}</p>
            </div>
          );
          return item.type === "video" && item.videoUrl ? (
            <a key={item.id} href={item.videoUrl} target="_blank" rel="noreferrer">
              {tile}
            </a>
          ) : (
            <div key={item.id}>{tile}</div>
          );
        })}
        {visible.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-border-subtle p-10 text-center text-sm text-ink-500">
            No media in this category yet.
          </div>
        )}
      </div>
    </div>
  );
}
