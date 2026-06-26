import * as React from "react";
import { cn } from "@/lib/utils";

function Table({ className, ...props }) {
  return (
    <div className="relative w-full overflow-x-auto scrollbar-thin">
      <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  );
}

function TableHeader({ className, ...props }) {
  return <thead className={cn("[&_tr]:border-b [&_tr]:border-gf-border", className)} {...props} />;
}

function TableBody({ className, ...props }) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

function TableFooter({ className, ...props }) {
  return (
    <tfoot
      className={cn("border-t border-gf-border bg-gf-bg-elevated font-medium", className)}
      {...props}
    />
  );
}

function TableRow({ className, ...props }) {
  return (
    <tr
      className={cn(
        "border-b border-gf-border transition-colors hover:bg-gf-bg-elevated/50 data-[state=selected]:bg-gf-bg-elevated",
        className
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }) {
  return (
    <th
      className={cn(
        "h-10 px-3 text-left align-middle text-xs font-medium uppercase tracking-wide text-gf-muted whitespace-nowrap",
        className
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }) {
  return (
    <td className={cn("p-3 align-middle whitespace-nowrap", className)} {...props} />
  );
}

function TableCaption({ className, ...props }) {
  return (
    <caption className={cn("mt-4 text-sm text-gf-muted", className)} {...props} />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
};
