import { GROQ_API_KEY } from "../config/env.config.js";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function extractFirstNumber(text) {
  const match = String(text || "").match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function fallbackPriority({ quantity, expiryDate }) {
  const now = Date.now();
  const expiryTs = new Date(expiryDate).getTime();
  const hoursToExpiry = Number.isFinite(expiryTs)
    ? Math.max(1, (expiryTs - now) / (1000 * 60 * 60))
    : 24;

  const qNum = extractFirstNumber(quantity) || 1;
  const qtyFactor = clamp(1 + qNum / 20, 1, 3);
  const score = Math.round((100 / (hoursToExpiry + 1)) * qtyFactor * 2);
  return clamp(score, 1, 100);
}

async function callGroq(systemPrompt, userPrompt) {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Groq request failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "";
}

function parseJsonFromText(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

export async function calculatePriorityScoreWithAI(input) {
  const fallback = fallbackPriority(input);

  try {
    const prompt = `Food data:\n${JSON.stringify(input, null, 2)}\n\nReturn only JSON: {"priorityScore": number between 1 and 100}. Higher score means more urgent to prioritize.`;
    const content = await callGroq(
      "You score food rescue urgency. Return strict JSON only.",
      prompt
    );

    const parsed = parseJsonFromText(content);
    const score = Number(parsed?.priorityScore);
    if (!Number.isFinite(score)) {
      return fallback;
    }

    return clamp(Math.round(score), 1, 100);
  } catch {
    return fallback;
  }
}

export async function generateFoodContentWithAI(input) {
  const details = input?.details || "";
  const quantity = input?.quantity || "";
  const foodType = input?.foodType || "";

  const fallbackTitle = `${foodType ? foodType.toUpperCase() : "Food"} donation`;
  const fallbackDescription =
    details ||
    "Fresh surplus food available for pickup. Please claim quickly to reduce food waste.";

  try {
    const prompt = `Generate a concise food listing from this data:\n${JSON.stringify(
      { details, quantity, foodType },
      null,
      2
    )}\n\nReturn strict JSON only: {"title":"...","description":"..."}.\nRules:\n- Keep title under 60 chars\n- Keep description under 220 chars\n- Practical, clear, no marketing fluff`;

    const content = await callGroq(
      "You generate concise listing copy for a food rescue app. Return strict JSON.",
      prompt
    );

    const parsed = parseJsonFromText(content);
    const title = String(parsed?.title || "").trim();
    const description = String(parsed?.description || "").trim();

    return {
      title: title || fallbackTitle,
      description: description || fallbackDescription,
    };
  } catch {
    return {
      title: fallbackTitle,
      description: fallbackDescription,
    };
  }
}
