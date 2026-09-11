"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Globe, ChevronDown } from "lucide-react";

import { LogoLockup } from "@/components/brand/logo-lockup";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { primaryNav, languages } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle/80 bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      {/* Utility bar */}
      <div className="hidden border-b border-border-subtle/70 bg-navy-950 text-white/80 lg:block">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-10 py-1.5 text-xs">
          <p className="tracking-wide">
            Serving Muslim communities across Great Britain &amp; Europe
          </p>
          <div className="flex items-center gap-5">
            <Link href="/documents" className="hover:text-white">
              Documents
            </Link>
            <Link href="/how-moon-sighting-works" className="hover:text-white">
              How Moon Sighting Works
            </Link>
            <Link href="/contact" className="hover:text-white">
              Contact
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8 lg:px-10 lg:py-4">
        <LogoLockup />

        <nav className="hidden items-center gap-1 xl:flex" aria-label="Primary">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-navy-900/5 hover:text-navy-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Language switcher */}
          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              className="flex items-center gap-1.5 rounded-md border border-border-subtle px-3 py-2 text-sm font-medium text-ink-700 hover:bg-paper-muted"
            >
              <Globe className="size-4" aria-hidden />
              EN
              <ChevronDown className="size-3.5" aria-hidden />
            </button>
            {langOpen && (
              <ul
                role="listbox"
                className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-md border border-border-subtle bg-surface py-1 shadow-lg"
              >
                {languages.map((lang) => (
                  <li key={lang.code}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-ink-700 hover:bg-paper-muted"
                      onClick={() => setLangOpen(false)}
                    >
                      {lang.label}
                      <span className="text-xs uppercase text-ink-300">{lang.dir}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Button asChild size="default" className="hidden sm:inline-flex">
            <Link href="/report-sighting">Report a Sighting</Link>
          </Button>

          {/* Mobile nav */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open menu"
                className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border-subtle text-navy-900 xl:hidden"
              >
                <Menu className="size-5" />
              </button>
            </SheetTrigger>
            <SheetContent>
              <SheetTitle>Menu</SheetTitle>
              <div className="flex flex-col gap-2">
                <Button asChild size="lg" className="justify-center">
                  <Link href="/report-sighting" onClick={() => setOpen(false)}>
                    Report a Sighting
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="justify-center">
                  <Link href="/announcements" onClick={() => setOpen(false)}>
                    Latest Announcement
                  </Link>
                </Button>
              </div>

              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto" aria-label="Mobile primary">
                {primaryNav.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className="rounded-md px-3 py-3 text-base font-medium text-ink-700 hover:bg-paper-muted"
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>

              <div className="border-t border-border-subtle pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Language
                </p>
                <div className="flex gap-2">
                  {languages.map((lang, i) => (
                    <button
                      key={lang.code}
                      className={cn(
                        "flex-1 rounded-md border px-3 py-2 text-sm font-medium",
                        i === 0
                          ? "border-navy-900 bg-navy-900 text-white"
                          : "border-border-subtle text-ink-700"
                      )}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
