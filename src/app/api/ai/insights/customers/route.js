import { connectDB } from "@/lib/db/connect";
import { ok, withErrorHandling } from "@/lib/api-response";
import { requireRole, MANAGEMENT_ROLES } from "@/lib/auth/session";
import { buildCustomerInsightData } from "@/lib/ai/insight-data";
import { generateInsightText, isAIConfigured } from "@/lib/ai/provider";

function fallbackNarrative(data) {
  const lines = [];
  if (data.topOrderWindows[0]) {
    const w = data.topOrderWindows[0];
    lines.push(
      `${w.pctOfTotal}% of customers order on ${w.dayOfWeek}s between ${w.hourBlockStart}:00 and ${w.hourBlockEnd}:00.`
    );
  }
  lines.push(
    `${data.repeatRate}% of customers who ordered in the last ${data.rangeDays} days have ordered more than once (${data.repeatCustomers} of ${data.totalUniqueCustomers}).`
  );
  return lines.join(" ");
}

export const GET = withErrorHandling(async (req) => {
  await requireRole(MANAGEMENT_ROLES);
  await connectDB();

  const { searchParams } = new URL(req.url);
  const days = Number(searchParams.get("days")) || 30;

  const data = await buildCustomerInsightData(days);

  let narrative;
  let aiGenerated = false;

  if (isAIConfigured() && data.totalOrders > 0) {
    try {
      const prompt = `You are a restaurant customer-behavior analyst. Given this JSON of customer ordering pattern data over the last ${days} days, write 3 short, specific, business-owner-friendly sentences about when customers order and how loyal they are. No markdown, plain sentences, concrete numbers, one actionable marketing suggestion (e.g. a promo timed to the peak window).\n\nData:\n${JSON.stringify(data)}`;
      narrative = await generateInsightText(prompt, { maxTokens: 350 });
      aiGenerated = true;
    } catch (err) {
      console.error("[ai-insights:customers] AI generation failed, using fallback", err.message);
      narrative = fallbackNarrative(data);
    }
  } else {
    narrative = data.totalOrders > 0 ? fallbackNarrative(data) : "Not enough order data yet to generate customer insights.";
  }

  return ok({ narrative, aiGenerated, data });
});
