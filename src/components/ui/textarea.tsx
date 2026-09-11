import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-24 w-full rounded-md border border-border-subtle bg-paper px-3.5 py-2.5 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-300",
        "focus-visible:ring-2 focus-visible:ring-gold-600 focus-visible:border-gold-600",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
