import { db } from "@/lib/db";
import { ok, bad, parseBody, verifyTOTP, verifySession, createSession } from "@/lib/auth-utils";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// POST /api/auth/verify — verify TOTP code and upgrade session
export async function POST(req: NextRequest) {
  const body = await parseBody(req);
  const { token } = body;

  if (!token) return bad("Verification code is required");

  // Get session from cookie
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/lifeos-session=([^;]+)/);
  if (!match) return bad("No active session", 401);

  const session = verifySession(match[1]);
  if (!session) return bad("Invalid or expired session", 401);

  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user) return bad("User not found", 401);

  if (!user.totpSecret) return bad("2FA is not set up. Please set up 2FA first.");

  const valid = verifyTOTP(token, user.totpSecret);
  if (!valid) return bad("Invalid verification code. Please try again.", 401);

  // Upgrade session to verified
  const newSession = createSession(user.id, user.email, true);
  const res = ok({ authenticated: true, email: user.email });
  res.headers.set("Set-Cookie", `lifeos-session=${newSession}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`);
  return res;
}
