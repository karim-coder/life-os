import { db } from "@/lib/db";
import { ok, parseBody, parseMeta, parseListMeta } from "@/lib/api";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/inbox — all items in inbox status
export async function GET() {
  const items = await db.item.findMany({
    where: { status: "inbox" },
    orderBy: { createdAt: "desc" },
    include: { tags: { include: { tag: true } }, domain: true, project: { select: { id: true, name: true, color: true } } },
  });
  return ok({ items: parseListMeta(items as any[]) });
}

// POST /api/inbox — quick capture. Minimal fields; defaults to inbox note/task.
export async function POST(req: NextRequest) {
  const body = await parseBody(req);
  const title = (body.title || body.text || "").trim();
  if (!title) return ok({ error: "title required" }, { status: 400 });

  const item = await db.item.create({
    data: {
      title,
      type: body.type || "note",
      status: "inbox",
      content: body.content,
      domainId: body.domainId,
      projectId: body.projectId,
      ...(body.metadata ? { metadata: JSON.stringify(body.metadata) } : {}),
    },
    include: { domain: true, project: { select: { id: true, name: true, color: true } } },
  });
  return ok(parseMeta(item as any));
}
