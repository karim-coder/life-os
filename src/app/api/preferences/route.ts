import { db } from "@/lib/db";
import { ok, bad, parseBody, getUserFromRequest } from "@/lib/auth-utils";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// Default preferences
const DEFAULT_PREFS = {
  aiEnabled: true,
  aiSmartInbox: true,
  aiProvider: "z-ai-sdk", // z-ai-sdk | openai-compatible | custom
  aiApiKey: "",
  aiBaseUrl: "",
  aiModel: "",
  qrLoginEnabled: true,
  notificationsEnabled: false,
};

// GET /api/preferences
export async function GET(req: NextRequest) {
  const session = await getUserFromRequest(req);
  if (!session) return bad("Unauthorized", 401);

  const setting = await db.setting.findUnique({ where: { id: `prefs-${session.userId}` } });
  const prefs = setting ? { ...DEFAULT_PREFS, ...JSON.parse(setting.value) } : DEFAULT_PREFS;

  // Don't return the API key
  const { aiApiKey, ...safePrefs } = prefs;
  return ok({ ...safePrefs, hasApiKey: !!aiApiKey });
}

// PATCH /api/preferences
export async function PATCH(req: NextRequest) {
  const session = await getUserFromRequest(req);
  if (!session) return bad("Unauthorized", 401);

  const body = await parseBody(req);

  const existing = await db.setting.findUnique({ where: { id: `prefs-${session.userId}` } });
  const current = existing ? JSON.parse(existing.value) : DEFAULT_PREFS;

  // Merge — don't overwrite apiKey with empty string
  const merged = { ...current, ...body };
  if (body.aiApiKey === "") delete merged.aiApiKey; // keep existing if empty

  await db.setting.upsert({
    where: { id: `prefs-${session.userId}` },
    update: { value: JSON.stringify(merged) },
    create: { id: `prefs-${session.userId}`, value: JSON.stringify(merged) },
  });

  const { aiApiKey, ...safePrefs } = merged;
  return ok({ ...safePrefs, hasApiKey: !!aiApiKey });
}
