import { db } from "@/lib/db";
import { ok } from "@/lib/api";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/graph?center=<itemId>&depth=1|2&limit=80
// Returns nodes (items + projects) and edges (links + project memberships)
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const centerId = sp.get("center");
  const depth = Number(sp.get("depth") || 2);
  const limit = Math.min(Number(sp.get("limit") || 100), 200);

  // If a center item is given, BFS outward through links; otherwise return all linked items + projects
  let itemIds = new Set<string>();
  let projectIds = new Set<string>();

  if (centerId) {
    // BFS
    const visited = new Set<string>();
    const frontier = [centerId];
    for (let d = 0; d < depth && frontier.length; d++) {
      const next: string[] = [];
      const links = await db.link.findMany({
        where: { OR: [{ fromId: { in: frontier } }, { toId: { in: frontier } }] },
      });
      for (const l of links) {
        if (!visited.has(l.fromId)) { visited.add(l.fromId); next.push(l.fromId); }
        if (!visited.has(l.toId)) { visited.add(l.toId); next.push(l.toId); }
      }
      frontier.length = 0;
      frontier.push(...next);
    }
    itemIds = visited;
    // add center if not already
    itemIds.add(centerId);
  }

  // Fetch items (optionally filtered by center BFS)
  const items = await db.item.findMany({
    where: centerId
      ? { id: { in: Array.from(itemIds) } }
      : { status: { not: "archived" } },
    take: limit,
    include: { domain: true, project: { select: { id: true, name: true, color: true } } },
  });

  // collect project ids from items
  for (const it of items) {
    if (it.projectId) projectIds.add(it.projectId);
  }

  // links among the fetched items
  const itemIdSet = new Set(items.map((i) => i.id));
  const links = await db.link.findMany({
    where: { AND: [{ fromId: { in: Array.from(itemIdSet) } }, { toId: { in: Array.from(itemIdSet) } }] },
  });

  // fetch projects
  const projects = await db.project.findMany({
    where: projectIds.size ? { id: { in: Array.from(projectIds) } } : { status: "active" },
    take: 30,
  });

  // Build nodes
  const nodes = [
    ...items.map((it) => {
      const meta = it.metadata ? safeParse(it.metadata) : {};
      return {
        id: it.id,
        kind: "item" as const,
        type: it.type,
        title: it.title,
        status: it.status,
        color: TYPE_COLORS[it.type] || "#71717a",
        domainId: it.domainId,
        projectId: it.projectId,
        projectName: it.project?.name,
        projectColor: it.project?.color,
        priority: it.priority,
      };
    }),
    ...projects.map((p) => ({
      id: p.id,
      kind: "project" as const,
      type: "project",
      title: p.name,
      status: p.status,
      color: p.color,
      progress: p.progress,
      domainId: p.domainId,
    })),
  ];

  // Build edges: explicit links + project membership (item -> project)
  const edges = [
    ...links.map((l) => ({
      id: l.id,
      source: l.fromId,
      target: l.toId,
      type: l.type,
      kind: "link" as const,
    })),
    ...items
      .filter((it) => it.projectId)
      .map((it) => ({
        id: `proj-${it.id}-${it.projectId}`,
        source: it.id,
        target: it.projectId!,
        type: "belongs",
        kind: "project" as const,
      })),
  ];

  return ok({ nodes, edges });
}

function safeParse(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}

const TYPE_COLORS: Record<string, string> = {
  task: "#f59e0b",
  note: "#eab308",
  journal: "#a78bfa",
  habit: "#10b981",
  event: "#06b6d4",
  finance: "#10b981",
  contact: "#06b6d4",
  idea: "#ec4899",
  goal: "#f43f5e",
  document: "#71717a",
  bookmark: "#3b82f6",
  milestone: "#f59e0b",
  routine: "#eab308",
  symptom: "#f43f5e",
  medication: "#f43f5e",
  affirmation: "#a78bfa",
  vision: "#a78bfa",
};
