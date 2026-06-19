import { db } from "@/lib/db";
import { ok, getUserFromRequest } from "@/lib/auth-utils";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/auth/2fa-status
export async function GET(req: NextRequest) {
  const session = await getUserFromRequest(req);
  if (!session) return ok({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user) return ok({ error: "User not found" }, { status: 404 });

  return ok({
    enabled: user.totpVerified && !!user.totpSecret,
    name: user.name,
    email: user.email,
  });
}
