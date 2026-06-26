"use client";

import { useEffect, useState } from "react";
import { Sparkles, TrendingUp, Package, Users, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function InsightCard({ icon: Icon, title, narrative, isLoading, aiGenerated, onRefresh, children }) {
  return (
    <div className="rounded-lg border border-gf-border bg-gf-bg-card p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="size-5 text-gf-gold" />
          <h3 className="font-display text-xl text-gf-cream">{title}</h3>
          {aiGenerated && (
            <Badge variant="gold" className="text-[10px]">
              <Sparkles className="size-2.5" /> AI Generated
            </Badge>
          )}
        </div>
        <button onClick={onRefresh} className="text-gf-muted hover:text-gf-gold" aria-label="Refresh">
          <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-gf-bg-elevated" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-gf-bg-elevated" />
          <div className="h-3 w-4/6 animate-pulse rounded bg-gf-bg-elevated" />
        </div>
      ) : (
        <p className="mt-4 leading-relaxed text-gf-cream/90">{narrative}</p>
      )}

      {children}
    </div>
  );
}

export default function AdminAIInsightsPage() {
  const [sales, setSales] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [customers, setCustomers] = useState(null);
  const [loadingSales, setLoadingSales] = useState(true);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [loadingCustomers, setLoadingCustomers] = useState(true);

  function loadSales() {
    setLoadingSales(true);
    fetch("/api/ai/insights/sales?days=7")
      .then((r) => r.json())
      .then(setSales)
      .finally(() => setLoadingSales(false));
  }

  function loadInventory() {
    setLoadingInventory(true);
    fetch("/api/ai/insights/inventory?windowDays=14")
      .then((r) => r.json())
      .then(setInventory)
      .finally(() => setLoadingInventory(false));
  }

  function loadCustomers() {
    setLoadingCustomers(true);
    fetch("/api/ai/insights/customers?days=30")
      .then((r) => r.json())
      .then(setCustomers)
      .finally(() => setLoadingCustomers(false));
  }

  useEffect(() => {
    loadSales();
    loadInventory();
    loadCustomers();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-3xl text-gf-cream">
          <Sparkles className="size-6 text-gf-gold" /> AI Insights
        </h1>
        <p className="text-sm text-gf-muted">
          Plain-language summaries of your sales, inventory, and customer data.
        </p>
      </div>

      <InsightCard
        icon={TrendingUp}
        title="Sales Insights"
        narrative={sales?.narrative}
        isLoading={loadingSales}
        aiGenerated={sales?.aiGenerated}
        onRefresh={loadSales}
      >
        {sales?.data?.topItems?.length > 0 && (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {sales.data.topItems.slice(0, 3).map((item) => (
              <div key={item.name} className="rounded-md bg-gf-bg-elevated p-3">
                <p className="truncate text-sm text-gf-cream">{item.name}</p>
                <p className="text-xs text-gf-muted">{item.pctOfRevenue}% of revenue</p>
              </div>
            ))}
          </div>
        )}
      </InsightCard>

      <InsightCard
        icon={Package}
        title="Inventory Forecast"
        narrative={inventory?.narrative}
        isLoading={loadingInventory}
        aiGenerated={inventory?.aiGenerated}
        onRefresh={loadInventory}
      >
        {inventory?.data?.forecasts?.some((f) => f.daysUntilStockout !== null) && (
          <div className="mt-5 space-y-2">
            {inventory.data.forecasts
              .filter((f) => f.daysUntilStockout !== null)
              .slice(0, 4)
              .map((f) => (
                <div key={f.name} className="flex items-center justify-between rounded-md bg-gf-bg-elevated p-3 text-sm">
                  <span className="text-gf-cream">{f.name}</span>
                  <span className={f.daysUntilStockout <= 5 ? "text-gf-warning" : "text-gf-muted"}>
                    ~{f.daysUntilStockout} days left
                  </span>
                </div>
              ))}
          </div>
        )}
      </InsightCard>

      <InsightCard
        icon={Users}
        title="Customer Insights"
        narrative={customers?.narrative}
        isLoading={loadingCustomers}
        aiGenerated={customers?.aiGenerated}
        onRefresh={loadCustomers}
      >
        {customers?.data && (
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-md bg-gf-bg-elevated p-3">
              <p className="font-display text-xl text-gf-gold">{customers.data.repeatRate}%</p>
              <p className="text-xs text-gf-muted">Repeat customer rate</p>
            </div>
            <div className="rounded-md bg-gf-bg-elevated p-3">
              <p className="font-display text-xl text-gf-gold">{customers.data.totalUniqueCustomers}</p>
              <p className="text-xs text-gf-muted">Unique customers (30d)</p>
            </div>
          </div>
        )}
      </InsightCard>

      {!sales?.aiGenerated && !loadingSales && (
        <p className="text-center text-xs text-gf-muted-2">
          Add an <code className="text-gf-gold">ANTHROPIC_API_KEY</code> or{" "}
          <code className="text-gf-gold">GEMINI_API_KEY</code> to your environment for richer,
          AI-written narratives. Currently showing rule-based summaries.
        </p>
      )}
    </div>
  );
}
