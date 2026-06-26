import { connectDB } from "@/lib/db/connect";
import { ok, withErrorHandling } from "@/lib/api-response";
import { requireRole, MANAGEMENT_ROLES } from "@/lib/auth/session";
import { buildSalesInsightData } from "@/lib/ai/insight-data";
import { generateInsightText, isAIConfigured } from "@/lib/ai/provider";

function fallbackNarrative(data) {
  const lines = [];
  if (data.topItems[0]) {
    lines.push(
      `${data.topItems[0].name} generated ${data.topItems[0].pctOfRevenue}% of revenue over the last ${data.rangeDays} days (${data.topItems[0].quantity} sold, $${data.topItems[0].revenue}).`
    );
  }
  if (data.peakSlots[0]) {
    lines.push(
      `Your busiest window was ${data.peakSlots[0].dayOfWeek}s around ${data.peakSlots[0].hour}:00, with ${data.peakSlots[0].orders} orders.`
    );
  }
  const topType = [...data.orderTypeSplit].sort((a, b) => b.count - a.count)[0];
  if (topType) {
    lines.push(`Most orders came through ${topType.type} (${topType.count} orders).`);
  }
  lines.push(`Total revenue: $${data.totalRevenue} across ${data.totalOrders} orders.`);
  return lines.join(" ");
}

export const GET = withErrorHandling(async (req) => {
  await requireRole(MANAGEMENT_ROLES);
  await connectDB();

  const { searchParams } = new URL(req.url);
  const days = Number(searchParams.get("days")) || 7;

  const data = await buildSalesInsightData(days);

  let narrative;
  let aiGenerated = false;

  if (isAIConfigured() && data.totalOrders > 0) {
    try {
      const prompt = `You are a restaurant analytics assistant. Given this JSON of sales data for the last ${days} days, write 3-4 short, specific, business-owner-friendly insight sentences (no markdown, no bullet points, plain sentences separated by newlines). Focus on what's selling, when orders peak, and one actionable suggestion. Be concrete with numbers from the data.\n\nData:\n${JSON.stringify(data)}`;
      narrative = await generateInsightText(prompt, { maxTokens: 400 });
      aiGenerated = true;
    } catch (err) {
      console.error("[ai-insights:sales] AI generation failed, using fallback", err.message);
      narrative = fallbackNarrative(data);
    }
  } else {
    narrative = data.totalOrders > 0 ? fallbackNarrative(data) : "Not enough order data yet to generate insights.";
  }

  return ok({ narrative, aiGenerated, data });
});
