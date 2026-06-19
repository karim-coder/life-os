import { ok } from "@/lib/auth-utils";
import { verifySession } from "@/lib/auth";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/auth/session
export async function GET(req: NextRequest) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/lifeos-session=([^;]+)/);
  if (!match) return ok({ authenticated: false });

  const session = verifySession(match[1]);
  if (!session) return ok({ authenticated: false });

  return ok({
    authenticated: true,
    twoFactorVerified: session.twoFactorVerified,
    email: session.email,
    userId: session.userId,
  });
}
