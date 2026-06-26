"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

function Tabs({ className, ...props }) {
  return (
    <TabsPrimitive.Root className={cn("flex flex-col gap-2", className)} {...props} />
  );
}

function TabsList({ className, ...props }) {
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex h-10 w-fit items-center justify-center rounded-md bg-gf-bg-elevated p-1 border border-gf-border",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex flex-1 items-center justify-center gap-1.5 rounded-sm px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors text-gf-muted data-[state=active]:bg-gf-gold data-[state=active]:text-gf-bg disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }) {
  return <TabsPrimitive.Content className={cn("flex-1 outline-none", className)} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
