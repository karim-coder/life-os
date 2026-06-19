// AI Provider abstraction — supports z-ai-sdk, OpenAI-compatible, and custom endpoints
import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";
import { getUserFromRequest } from "./auth-utils";
import type { NextRequest } from "next/server";

export interface AIPrefs {
  aiEnabled: boolean;
  aiProvider: "z-ai-sdk" | "openai-compatible" | "custom";
  aiApiKey: string;
  aiBaseUrl: string;
  aiModel: string;
}

const DEFAULT_PREFS: AIPrefs = {
  aiEnabled: true,
  aiProvider: "z-ai-sdk",
  aiApiKey: "",
  aiBaseUrl: "",
  aiModel: "",
};

export async function getAIPrefs(req: NextRequest): Promise<AIPrefs> {
  const session = await getUserFromRequest(req);
  if (!session) return DEFAULT_PREFS;

  const setting = await db.setting.findUnique({ where: { id: `prefs-${session.userId}` } });
  if (!setting) return DEFAULT_PREFS;

  return { ...DEFAULT_PREFS, ...JSON.parse(setting.value) };
}

export async function aiChatCompletion(
  prefs: AIPrefs,
  messages: { role: string; content: string }[],
): Promise<string> {
  if (!prefs.aiEnabled) throw new Error("AI features are disabled");

  if (prefs.aiProvider === "z-ai-sdk" || (!prefs.aiApiKey && !prefs.aiBaseUrl)) {
    // Use z-ai-web-dev-sdk (default, no config needed)
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: messages as any,
      thinking: { type: "disabled" },
    });
    return completion.choices[0]?.message?.content || "";
  }

  if (prefs.aiProvider === "openai-compatible" || prefs.aiProvider === "custom") {
    // Use OpenAI-compatible API (works with OpenAI, Groq, Together, Anyscale, etc.)
    const baseUrl = prefs.aiBaseUrl || "https://api.openai.com/v1";
    const model = prefs.aiModel || "gpt-4o-mini";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (prefs.aiApiKey) {
      headers["Authorization"] = `Bearer ${prefs.aiApiKey}`;
    }

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`AI API error (${res.status}): ${err.slice(0, 200)}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  }

  throw new Error(`Unknown AI provider: ${prefs.aiProvider}`);
}
