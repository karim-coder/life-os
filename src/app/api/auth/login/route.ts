import { db } from "@/lib/db";
import { ok, bad, parseBody, verifyPassword, createSession } from "@/lib/auth-utils";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// POST /api/auth/login
export async function POST(req: NextRequest) {
  const body = await parseBody(req);
  const { email, password } = body;

  if (!email || !password) return bad("Email and password are required");

  const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return bad("Invalid email or password", 401);

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return bad("Invalid email or password", 401);

  // If user has 2FA enabled AND verified, require verification
  if (user.totpVerified && user.totpSecret) {
    const session = createSession(user.id, user.email, false);
    const res = ok({ requiresVerification: true, email: user.email });
    res.headers.set("Set-Cookie", `lifeos-session=${session}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`);
    return res;
  }

  // No 2FA — fully authenticated directly
  const session = createSession(user.id, user.email, true);
  const res = ok({ authenticated: true, email: user.email, name: user.name });
  res.headers.set("Set-Cookie", `lifeos-session=${session}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`);
  return res;
}
