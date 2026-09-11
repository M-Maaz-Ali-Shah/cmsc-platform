import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
  {
    variants: {
      variant: {
        neutral: "border-border-subtle bg-paper-muted text-ink-700",
        navy: "border-navy-900/10 bg-navy-50 text-navy-800",
        emerald: "border-emerald-700/15 bg-emerald-50 text-emerald-800",
        gold: "border-gold-600/20 bg-gold-50 text-gold-800",
        awaiting: "border-status-awaiting/20 bg-gold-50 text-status-awaiting",
        review: "border-status-review/20 bg-navy-50 text-status-review",
        sighted: "border-status-sighted/20 bg-emerald-50 text-status-sighted",
        confirmed: "border-status-confirmed/25 bg-emerald-100 text-status-confirmed",
        published: "border-status-published/20 bg-navy-100 text-status-published",
        notSighted: "border-status-not-sighted/20 bg-paper-muted text-status-not-sighted",
        outlineLight: "border-white/30 bg-white/5 text-white",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props} />
  );
}

export { Badge, badgeVariants };
