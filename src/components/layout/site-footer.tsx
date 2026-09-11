import Link from "next/link";
import { Mail } from "lucide-react";

import { LogoLockup } from "@/components/brand/logo-lockup";
import { FacebookGlyph, YoutubeGlyph } from "@/components/brand/social-icons";
import { footerNav, legalNav } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-navy-950 text-white/70">
      <div className="crescent-field pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div className="relative mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <LogoLockup variant="onDark" />
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Official moon-sighting announcements, reports and Islamic calendar
              information for communities across Great Britain and Europe.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="#"
                aria-label="Official Facebook page"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 hover:border-gold-400 hover:text-gold-400"
              >
                <FacebookGlyph className="size-4" />
              </a>
              <a
                href="#"
                aria-label="Official YouTube channel"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 hover:border-gold-400 hover:text-gold-400"
              >
                <YoutubeGlyph className="size-4" />
              </a>
              <a
                href="mailto:info@example.org"
                aria-label="Email the committee"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 hover:border-gold-400 hover:text-gold-400"
              >
                <Mail className="size-4" />
              </a>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-400">
              Navigate
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {footerNav.slice(0, 4).map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-400">
              Resources
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {footerNav.slice(4).map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-400">
              Legal
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {legalNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/admin" className="hover:text-white">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Central Moon Sighting Committee — Great Britain &amp; Europe.
            All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
