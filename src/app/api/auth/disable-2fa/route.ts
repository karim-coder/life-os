import { db } from "@/lib/db";
import { ok, bad, getUserFromRequest } from "@/lib/auth-utils";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// POST /api/auth/disable-2fa
export async function POST(req: NextRequest) {
  const session = await getUserFromRequest(req);
  if (!session) return bad("Unauthorized", 401);

  await db.user.update({
    where: { id: session.userId },
    data: { totpSecret: null, totpVerified: false },
  });

  return ok({ success: true, message: "2FA disabled" });
}
