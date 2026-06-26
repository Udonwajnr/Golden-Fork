"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function Checkbox({ className, ...props }) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "peer size-4 shrink-0 rounded-[4px] border border-gf-border bg-gf-bg-elevated outline-none transition-colors focus-visible:ring-1 focus-visible:ring-gf-gold-dim disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-gf-gold data-[state=checked]:border-gf-gold data-[state=checked]:text-gf-bg",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
