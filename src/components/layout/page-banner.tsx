import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Container } from "@/components/ui/container";

export function PageBanner({
  eyebrow,
  title,
  description,
  crumb,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  crumb: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-navy-950 py-14 text-white sm:py-16">
      <div className="crescent-field pointer-events-none absolute inset-0 opacity-50" aria-hidden />
      <Container className="relative">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-white/50">
          <Link href="/" className="hover:text-white">
            Home
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <span className="text-white/80">{crumb}</span>
        </nav>

        <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            {eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-400">
                {eyebrow}
              </p>
            )}
            <h1 className="mt-2 font-heading text-3xl font-bold leading-tight sm:text-4xl">
              {title}
            </h1>
            {description && (
              <p className="mt-3 text-sm leading-relaxed text-white/70 sm:text-base">
                {description}
              </p>
            )}
          </div>
          {children}
        </div>
      </Container>
    </section>
  );
}
