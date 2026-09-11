"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Search, UserCircle } from "lucide-react";

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { adminNav } from "@/lib/admin-nav";

export function AdminTopbar({
  userName,
  userRoleLabel,
}: {
  userName: string;
  userRoleLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const title =
    [...adminNav].sort((a, b) => b.href.length - a.href.length).find((item) => pathname.startsWith(item.href))
      ?.label ?? "Dashboard";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border-subtle bg-surface px-4 py-3 sm:px-6">
      <div className="flex items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Open admin menu"
              className="flex h-10 w-10 items-center justify-center rounded-md border border-border-subtle text-navy-900 lg:hidden"
            >
              <Menu className="size-5" />
            </button>
          </SheetTrigger>
          <SheetContent className="max-w-xs bg-navy-950 p-0">
            <SheetTitle className="sr-only">Admin navigation</SheetTitle>
            <AdminSidebar onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <h1 className="font-heading text-lg font-bold text-navy-900">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-300" aria-hidden />
          <input
            type="search"
            placeholder="Search…"
            aria-label="Search admin"
            className="h-9 w-56 rounded-md border border-border-subtle bg-paper pl-9 pr-3 text-sm outline-none placeholder:text-ink-300 focus-visible:ring-2 focus-visible:ring-gold-600"
          />
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border-subtle py-1 pl-1 pr-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-50 text-navy-700">
            <UserCircle className="size-5" aria-hidden />
          </div>
          <div className="hidden text-left leading-tight sm:block">
            <p className="text-xs font-semibold text-navy-900">{userName}</p>
            <p className="text-[10px] text-ink-500">{userRoleLabel}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
