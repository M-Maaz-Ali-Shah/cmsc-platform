import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full rounded-md border border-border-subtle bg-paper px-3.5 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-300",
        "focus-visible:ring-2 focus-visible:ring-gold-600 focus-visible:border-gold-600",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-[invalid=true]:border-red-400 aria-[invalid=true]:ring-red-200",
        className
      )}
      {...props}
    />
  );
}

export { Input };
