"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { CircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function RadioGroup({ className, ...props }) {
  return <RadioGroupPrimitive.Root className={cn("grid gap-2", className)} {...props} />;
}

function RadioGroupItem({ className, ...props }) {
  return (
    <RadioGroupPrimitive.Item
      className={cn(
        "aspect-square size-4 shrink-0 rounded-full border border-gf-border bg-gf-bg-elevated text-gf-gold outline-none transition-colors focus-visible:ring-1 focus-visible:ring-gf-gold-dim disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="relative flex items-center justify-center">
        <CircleIcon className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 fill-gf-gold" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
