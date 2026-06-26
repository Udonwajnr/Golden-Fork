import { connectDB } from "@/lib/db/connect";
import { ok, withErrorHandling } from "@/lib/api-response";
import { requireRole, MANAGEMENT_ROLES } from "@/lib/auth/session";
import { buildInventoryForecastData } from "@/lib/ai/insight-data";
import { generateInsightText, isAIConfigured } from "@/lib/ai/provider";

function fallbackNarrative(data) {
  const urgent = data.forecasts.filter((f) => f.daysUntilStockout !== null && f.daysUntilStockout <= 5);
  if (urgent.length === 0) {
    return "Stock levels look healthy. No ingredients are projected to run out within the next 5 days based on recent usage.";
  }
  return urgent
    .slice(0, 4)
    .map(
      (f) =>
        `Based on recent sales, ${f.name} stock may run out in ${f.daysUntilStockout} day(s) at the current usage rate (${f.currentStock}${f.unit} left, using ~${f.avgDailyUsage}${f.unit}/day).`
    )
    .join(" ");
}

export const GET = withErrorHandling(async (req) => {
  await requireRole(MANAGEMENT_ROLES);
  await connectDB();

  const { searchParams } = new URL(req.url);
  const windowDays = Number(searchParams.get("windowDays")) || 14;

  const data = await buildInventoryForecastData(windowDays);

  let narrative;
  let aiGenerated = false;

  const hasUsageData = data.forecasts.some((f) => f.avgDailyUsage > 0);

  if (isAIConfigured() && hasUsageData) {
    try {
      const prompt = `You are a restaurant inventory analyst. Given this JSON forecast of ingredient stock levels and daily usage, write 3-4 short, specific, actionable sentences warning about ingredients likely to run out soon (prioritize the most urgent). Use plain sentences, no markdown, mention concrete numbers and days remaining. If nothing is urgent, say stock looks healthy.\n\nData:\n${JSON.stringify(data)}`;
      narrative = await generateInsightText(prompt, { maxTokens: 400 });
      aiGenerated = true;
    } catch (err) {
      console.error("[ai-insights:inventory] AI generation failed, using fallback", err.message);
      narrative = fallbackNarrative(data);
    }
  } else {
    narrative = hasUsageData
      ? fallbackNarrative(data)
      : "Not enough usage history yet to forecast stockouts. Forecasts improve as more orders are placed.";
  }

  return ok({ narrative, aiGenerated, data });
});
