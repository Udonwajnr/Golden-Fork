import Anthropic from "@anthropic-ai/sdk";
import { getCurrentUser } from "@/lib/auth/session";
import { chatMessageSchema } from "@/lib/validation";
import { ok, fail, withErrorHandling } from "@/lib/api-response";
import { CHAT_TOOLS, runTool } from "@/lib/ai/chat-tools";

const SYSTEM_PROMPT = `You are the friendly, concise virtual host for The Golden Fork, a modern restaurant. You help website visitors with:
- Questions about the menu (use the search_menu and list_categories tools - never invent dishes, prices, or ingredients)
- Checking the status of an order they've already placed (use lookup_order_status - ask for their order number if they haven't given one, format like GF-XXXXX-XXX)
- General questions about hours (Tue-Sun, 5:30 PM - 10:30 PM, closed Mondays), location (124 Luxury Avenue, Culinary District), reservations, delivery/pickup/dine-in options, and the loyalty program (10 points per $1 spent, 100 points = $1 off)
- Light hospitality small talk

Keep replies short (2-4 sentences typically), warm, and concrete. If you don't know something and no tool can answer it, say so plainly and suggest they use the Contact page or call the restaurant. Never invent menu items, prices, or order information - always use tools for anything factual about the restaurant's actual data. Do not discuss topics unrelated to the restaurant.`;

const MAX_TOOL_ROUNDS = 4;

export const POST = withErrorHandling(async (req) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return fail(
      "The chat assistant isn't configured yet. Add ANTHROPIC_API_KEY to your environment to enable it.",
      503
    );
  }

  const body = await req.json();
  const parsed = chatMessageSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Invalid message", 422);
  }
  const { message, conversation } = parsed.data;

  const currentUser = await getCurrentUser();
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const messages = [
    ...conversation.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: message },
  ];

  let finalText = "";
  let rounds = 0;

  while (rounds < MAX_TOOL_ROUNDS) {
    rounds += 1;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      tools: CHAT_TOOLS,
      messages,
    });

    const toolUseBlocks = response.content.filter((b) => b.type === "tool_use");
    const textBlocks = response.content.filter((b) => b.type === "text");

    if (toolUseBlocks.length === 0) {
      finalText = textBlocks.map((b) => b.text).join("\n").trim();
      break;
    }

    // Claude wants to call one or more tools - run them and feed results back.
    messages.push({ role: "assistant", content: response.content });

    const toolResults = await Promise.all(
      toolUseBlocks.map(async (block) => {
        const result = await runTool(block.name, block.input, { currentUser });
        return {
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(result),
        };
      })
    );

    messages.push({ role: "user", content: toolResults });

    if (rounds === MAX_TOOL_ROUNDS) {
      // Force a final text-only reply on the last allowed round.
      const finalResponse = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages,
      });
      finalText = finalResponse.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
    }
  }

  if (!finalText) {
    finalText = "Sorry, I had trouble putting that together. Could you rephrase your question?";
  }

  return ok({ reply: finalText });
});