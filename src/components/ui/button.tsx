import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold tracking-wide transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-gold-600 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
  {
    variants: {
      variant: {
        default:
          "bg-navy-900 text-white hover:bg-navy-800 shadow-sm",
        emerald:
          "bg-emerald-700 text-white hover:bg-emerald-600 shadow-sm",
        gold: "bg-gold-500 text-navy-950 hover:bg-gold-400 shadow-sm",
        outline:
          "border border-navy-900/20 bg-transparent text-navy-900 hover:bg-navy-900/5",
        outlineLight:
          "border border-white/30 bg-transparent text-white hover:bg-white/10",
        ghost: "bg-transparent text-navy-900 hover:bg-navy-900/5",
        ghostLight: "bg-transparent text-white/90 hover:bg-white/10",
        link: "text-navy-800 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 px-4 text-xs",
        lg: "h-13 px-7 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
