import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "flex min-h-20 w-full rounded-md border border-gf-border bg-gf-bg-elevated px-3 py-2 text-sm text-gf-cream placeholder:text-gf-muted-2 outline-none transition-colors focus-visible:border-gf-gold-dim focus-visible:ring-1 focus-visible:ring-gf-gold-dim disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
