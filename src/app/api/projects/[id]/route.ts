import { db } from "@/lib/db";
import { ok, notFound, parseBody, parseMeta } from "@/lib/api";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/projects/[id] — unified dashboard
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const project = await db.project.findUnique({
    where: { id },
    include: { domain: true },
  });
  if (!project) return notFound();

  const items = await db.item.findMany({
    where: { projectId: id },
    include: { tags: { include: { tag: true } }, domain: true },
  });

  const byType: Record<string, any[]> = {};
  for (const it of items) {
    (byType[it.type] ||= []).push(parseMeta(it as any));
  }

  const tasks = items.filter((i) => i.type === "task");
  const finances = items.filter((i) => i.type === "finance").map((f) => parseMeta(f as any));
  const income = finances.filter((f) => f.metadata?.kind === "income").reduce((s, f) => s + (f.metadata?.amount || 0), 0);
  const expense = finances.filter((f) => f.metadata?.kind === "expense").reduce((s, f) => s + (f.metadata?.amount || 0), 0);

  return ok({
    project,
    items: items.map((i) => parseMeta(i as any)),
    byType,
    stats: {
      total: items.length,
      tasksDone: tasks.filter((t) => t.status === "done").length,
      tasksActive: tasks.filter((t) => t.status === "active").length,
      income,
      expense,
      net: income - expense,
    },
  });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await parseBody(req);
  const project = await db.project.update({ where: { id }, data: body, include: { domain: true } });
  return ok(parseMeta(project as any));
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  // unlink items first
  await db.item.updateMany({ where: { projectId: id }, data: { projectId: null } });
  await db.project.delete({ where: { id } }).catch(() => {});
  return ok({ deleted: true });
}
