"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

import { LogoMark } from "@/components/brand/logo-mark";
import { adminNav } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";
import { logout } from "@/app/actions/auth";

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-navy-950 text-white">
      <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-5">
        <LogoMark variant="onDark" className="h-9 w-9" />
        <div className="leading-tight">
          <p className="font-heading text-sm font-bold">CMSC Admin</p>
          <p className="text-[11px] uppercase tracking-wide text-white/40">GB &amp; EU</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4" aria-label="Admin">
        {adminNav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center justify-between gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <span className="flex items-center gap-2.5">
                <item.icon className="size-4" aria-hidden />
                {item.label}
              </span>
              {item.badge ? (
                <span className="rounded-full bg-gold-500 px-1.5 py-0.5 text-[10px] font-bold text-navy-950">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white"
          >
            <LogOut className="size-4" aria-hidden />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
