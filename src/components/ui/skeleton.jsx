import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gf-bg-elevated", className)}
      {...props}
    />
  );
}

export { Skeleton };
