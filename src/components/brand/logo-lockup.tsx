import Link from "next/link";
import { LogoMark } from "./logo-mark";
import { cn } from "@/lib/utils";

export function LogoLockup({
  variant = "onLight",
  className,
}: {
  variant?: "onLight" | "onDark";
  className?: string;
}) {
  const titleColor = variant === "onDark" ? "text-white" : "text-navy-900";
  const subColor = variant === "onDark" ? "text-gold-400" : "text-emerald-700";

  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-3 rounded-md focus-visible:ring-2 focus-visible:ring-gold-600 focus-visible:ring-offset-2",
        className
      )}
    >
      <LogoMark variant={variant} className="h-10 w-10 shrink-0" />
      <span className="flex flex-col leading-tight whitespace-nowrap">
        <span className={cn("font-heading text-[13px] font-bold tracking-tight sm:text-[15px]", titleColor)}>
          Central Moon Sighting Committee
        </span>
        <span className={cn("text-[10px] font-semibold uppercase tracking-[0.14em] sm:text-[11px]", subColor)}>
          Great Britain &amp; Europe
        </span>
      </span>
    </Link>
  );
}
