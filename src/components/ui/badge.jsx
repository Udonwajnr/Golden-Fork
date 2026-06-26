import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors w-fit gap-1",
  {
    variants: {
      variant: {
        default: "border-transparent bg-gf-gold text-gf-bg",
        secondary: "border-gf-border bg-gf-bg-elevated text-gf-cream",
        outline: "border-gf-border text-gf-cream",
        success: "border-transparent bg-gf-success/15 text-gf-success",
        warning: "border-transparent bg-gf-warning/15 text-gf-warning",
        danger: "border-transparent bg-gf-danger/15 text-gf-danger",
        gold: "border-transparent bg-gf-gold/15 text-gf-gold",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
