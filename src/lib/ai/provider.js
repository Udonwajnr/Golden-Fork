import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Generates a text completion from whichever AI provider is configured.
 * Prefers Claude (ANTHROPIC_API_KEY) if present, falls back to Gemini
 * (GEMINI_API_KEY). Throws if neither is configured so callers can
 * fall back to rule-based output.
 */
export async function generateInsightText(prompt, { maxTokens = 700 } = {}) {
  if (process.env.ANTHROPIC_API_KEY) {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    });
    return response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
  }

  if (process.env.GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  }

  throw Object.assign(new Error("No AI provider configured"), { code: "NO_AI_PROVIDER" });
}

export function isAIConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY);
}
