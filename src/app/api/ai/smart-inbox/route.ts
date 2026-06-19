import { db } from "@/lib/db";
import { ok, bad } from "@/lib/api";
import { getAIPrefs, aiChatCompletion } from "@/lib/ai-provider";

export const dynamic = "force-dynamic";

// POST /api/ai/smart-inbox — AI suggests type, domain, and project for inbox items
export async function POST(req: Request) {
  const prefs = await getAIPrefs(req as any);
  if (!prefs.aiEnabled) return ok({ suggestions: [], error: "AI features are disabled. Enable them in Settings." });

  const inboxItems = await db.item.findMany({
    where: { status: "inbox" },
    take: 20,
  });

  if (inboxItems.length === 0) return ok({ suggestions: [], message: "Inbox is empty" });

  const domains = await db.domain.findMany();
  const projects = await db.project.findMany({ where: { status: "active" } });

  const itemsText = inboxItems.map((i, idx) => `${idx + 1}. "${i.title}"${i.content ? ` — ${i.content.slice(0, 100)}` : ""}`).join("\n");
  const domainsText = domains.map((d) => `${d.key} (${d.name})`).join(", ");
  const projectsText = projects.map((p) => `${p.id}: ${p.name}`).join(", ");

  const systemPrompt = `You are a life organization assistant. For each inbox item, suggest the best type, domain, and project (if any).

Available types: task, note, journal, habit, event, finance, contact, idea, goal, document, bookmark, milestone, routine, symptom, medication, affirmation, vision
Available domains: ${domainsText}
Available projects: ${projectsText || "none"}
If no project fits, use null.

Respond with ONLY a JSON array. Each element: { "index": number, "type": string, "domainKey": string, "projectId": string|null, "reason": string }`;

  try {
    const response = await aiChatCompletion(prefs, [
      { role: "assistant", content: systemPrompt },
      { role: "user", content: `Please categorize these ${inboxItems.length} inbox items:\n\n${itemsText}` },
    ]);

    let suggestions: any[] = [];
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(response);
    } catch {
      return ok({ suggestions: [], error: "Failed to parse AI response", raw: response.slice(0, 200) });
    }

    const result = suggestions.map((s: any) => {
      const item = inboxItems[s.index - 1];
      if (!item) return null;
      const domain = domains.find((d) => d.key === s.domainKey);
      return {
        itemId: item.id,
        title: item.title,
        suggestedType: s.type,
        suggestedDomainKey: s.domainKey,
        suggestedDomainId: domain?.id || null,
        suggestedProjectId: s.projectId || null,
        reason: s.reason,
      };
    }).filter(Boolean);

    return ok({ suggestions: result, count: result.length });
  } catch (e: any) {
    return ok({ suggestions: [], error: e.message || "AI processing failed" });
  }
}
