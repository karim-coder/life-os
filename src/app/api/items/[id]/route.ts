import { db } from "@/lib/db";
import { ok, bad, notFound, parseBody, parseMeta } from "@/lib/api";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/items/[id]
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const item = await db.item.findUnique({
    where: { id },
    include: {
      tags: { include: { tag: true } },
      domain: true,
      project: true,
      linksFrom: { include: { to: { include: { domain: true, project: { select: { id: true, name: true, color: true } } } } } },
      linksTo: { include: { from: { include: { domain: true, project: { select: { id: true, name: true, color: true } } } } } },
      habitLogs: { orderBy: { date: "desc" }, take: 60 },
    },
  });
  if (!item) return notFound();
  return ok(parseMeta(item as any));
}

// PATCH /api/items/[id]
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await parseBody(req);
  const { metadata, tagNames, ...rest } = body;

  // handle completedAt on status change
  if (rest.status === "done" && !rest.completedAt) {
    rest.completedAt = new Date().toISOString();
  }
  if (rest.status && rest.status !== "done") {
    rest.completedAt = null;
  }

  const item = await db.item.update({
    where: { id },
    data: {
      ...rest,
      ...(metadata ? { metadata: JSON.stringify(metadata) } : {}),
    },
    include: {
      tags: { include: { tag: true } },
      domain: true,
      project: { select: { id: true, name: true, color: true } },
    },
  });

  // tag sync
  if (tagNames) {
    await db.tagOnItem.deleteMany({ where: { itemId: id } });
    if (tagNames.length) {
      await db.tagOnItem.createMany({
        data: await Promise.all(
          (tagNames as string[]).map(async (name) => {
            const tag = await db.tag.upsert({ where: { name }, update: {}, create: { name } });
            return { itemId: id, tagId: tag.id };
          }),
        ).then((rows) => rows),
      });
    }
  }

  return ok(parseMeta(item as any));
}

// DELETE /api/items/[id]
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  await db.item.delete({ where: { id } }).catch(() => {});
  return ok({ deleted: true });
}
