import { db } from "@/lib/db";
import { ok, parseBody } from "@/lib/api";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await parseBody(req);
  const { priorities, ...rest } = body;
  const review = await db.review.update({
    where: { id },
    data: {
      ...rest,
      ...(priorities !== undefined
        ? { priorities: typeof priorities === "string" ? priorities : JSON.stringify(priorities) }
        : {}),
    },
  });
  return ok(review);
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  await db.review.delete({ where: { id } }).catch(() => {});
  return ok({ deleted: true });
}
