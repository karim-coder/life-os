import { db } from "@/lib/db";
import { ok, bad, parseBody } from "@/lib/api";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/items/[id]/links — return related items (both directions)
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const [linksFrom, linksTo] = await Promise.all([
    db.link.findMany({ where: { fromId: id }, include: { to: { include: { domain: true, project: { select: { id: true, name: true, color: true } } } } } }),
    db.link.findMany({ where: { toId: id }, include: { from: { include: { domain: true, project: { select: { id: true, name: true, color: true } } } } } }),
  ]);
  return ok({
    outgoing: linksFrom.map((l) => ({ ...l, to: l.to })),
    incoming: linksTo.map((l) => ({ ...l, from: l.from })),
  });
}

// POST /api/items/[id]/links — create a link from this item to another
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await parseBody(req);
  if (!body.toId) return bad("toId is required");
  const link = await db.link.upsert({
    where: { fromId_toId_type: { fromId: id, toId: body.toId, type: body.type || "related" } },
    update: { note: body.note },
    create: { fromId: id, toId: body.toId, type: body.type || "related", note: body.note },
  });
  return ok(link);
}

// DELETE /api/items/[id]/links — remove a link
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const sp = req.nextUrl.searchParams;
  const toId = sp.get("toId");
  const type = sp.get("type") || "related";
  if (!toId) return bad("toId is required");
  await db.link.deleteMany({ where: { fromId: id, toId, type } }).catch(() => {});
  return ok({ deleted: true });
}
