import { db } from "@/lib/db";
import { ok, parseBody } from "@/lib/api";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/tags
export async function GET() {
  const tags = await db.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { items: true } } },
  });
  return ok({ tags });
}

// POST /api/tags
export async function POST(req: NextRequest) {
  const body = await parseBody(req);
  if (!body.name) return ok({ error: "name required" }, { status: 400 });
  const tag = await db.tag.upsert({
    where: { name: body.name },
    update: { color: body.color },
    create: { name: body.name, color: body.color || "#71717a" },
  });
  return ok(tag);
}
