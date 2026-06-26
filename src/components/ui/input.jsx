import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-gf-border bg-gf-bg-elevated px-3 py-2 text-sm text-gf-cream placeholder:text-gf-muted-2 outline-none transition-colors focus-visible:border-gf-gold-dim focus-visible:ring-1 focus-visible:ring-gf-gold-dim disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      {...props}
    />
  );
}

export { Input };
