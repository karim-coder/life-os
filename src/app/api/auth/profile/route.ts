import { db } from "@/lib/db";
import { ok, bad, parseBody, getUserFromRequest } from "@/lib/auth-utils";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// PATCH /api/auth/profile
export async function PATCH(req: NextRequest) {
  const session = await getUserFromRequest(req);
  if (!session) return bad("Unauthorized", 401);

  const body = await parseBody(req);
  const { name } = body;

  await db.user.update({
    where: { id: session.userId },
    data: { name: name || null },
  });

  return ok({ success: true });
}
