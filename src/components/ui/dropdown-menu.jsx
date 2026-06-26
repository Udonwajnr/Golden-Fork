"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function DropdownMenu({ ...props }) {
  return <DropdownMenuPrimitive.Root {...props} />;
}
function DropdownMenuTrigger({ ...props }) {
  return <DropdownMenuPrimitive.Trigger {...props} />;
}
function DropdownMenuGroup({ ...props }) {
  return <DropdownMenuPrimitive.Group {...props} />;
}
function DropdownMenuPortal({ ...props }) {
  return <DropdownMenuPrimitive.Portal {...props} />;
}
function DropdownMenuSub({ ...props }) {
  return <DropdownMenuPrimitive.Sub {...props} />;
}
function DropdownMenuRadioGroup({ ...props }) {
  return <DropdownMenuPrimitive.RadioGroup {...props} />;
}

function DropdownMenuContent({ className, sideOffset = 4, ...props }) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-md border border-gf-border bg-gf-bg-elevated p-1 text-gf-cream shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuItem({ className, inset, variant = "default", ...props }) {
  return (
    <DropdownMenuPrimitive.Item
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 focus:bg-gf-bg-card focus:text-gf-gold data-[variant=destructive]:text-gf-danger data-[variant=destructive]:focus:bg-gf-danger/10 data-[variant=destructive]:focus:text-gf-danger [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({ className, children, checked, ...props }) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      className={cn(
        "relative flex cursor-pointer items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none select-none transition-colors focus:bg-gf-bg-card focus:text-gf-gold data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioItem({ className, children, ...props }) {
  return (
    <DropdownMenuPrimitive.RadioItem
      className={cn(
        "relative flex cursor-pointer items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none select-none transition-colors focus:bg-gf-bg-card focus:text-gf-gold data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

function DropdownMenuLabel({ className, inset, ...props }) {
  return (
    <DropdownMenuPrimitive.Label
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-xs font-medium text-gf-muted data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({ className, ...props }) {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn("-mx-1 my-1 h-px bg-gf-border", className)}
      {...props}
    />
  );
}

function DropdownMenuSubTrigger({ className, inset, children, ...props }) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-inset={inset}
      className={cn(
        "flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none focus:bg-gf-bg-card data-[inset]:pl-8",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

function DropdownMenuSubContent({ className, ...props }) {
  return (
    <DropdownMenuPrimitive.SubContent
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border border-gf-border bg-gf-bg-elevated p-1 text-gf-cream shadow-lg",
        className
      )}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
};
