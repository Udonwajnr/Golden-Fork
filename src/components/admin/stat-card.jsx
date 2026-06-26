import { cn } from "@/lib/utils";

export function StatCard({ label, value, icon: Icon, trend, trendLabel, accent = false }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-gf-border bg-gf-bg-card p-5",
        accent && "border-gf-gold-dim/50"
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-gf-muted">{label}</p>
        {Icon && <Icon className="size-4 text-gf-gold" />}
      </div>
      <p className="mt-2 font-display text-3xl text-gf-cream">{value}</p>
      {trend !== undefined && (
        <p
          className={cn(
            "mt-1 text-xs",
            trend >= 0 ? "text-gf-success" : "text-gf-danger"
          )}
        >
          {trend >= 0 ? "+" : ""}{trend}% {trendLabel}
        </p>
      )}
    </div>
  );
}
