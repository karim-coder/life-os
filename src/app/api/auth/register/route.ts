import { db } from "@/lib/db";
import { ok, bad, parseBody, hashPassword, createSession } from "@/lib/auth-utils";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// POST /api/auth/register
export async function POST(req: NextRequest) {
  const body = await parseBody(req);
  const { email, password, name } = body;

  if (!email || !password) return bad("Email and password are required");
  if (password.length < 8) return bad("Password must be at least 8 characters");

  const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return bad("An account with this email already exists", 409);

  const passwordHash = await hashPassword(password);
  const user = await db.user.create({
    data: {
      email: email.toLowerCase(),
      name: name || null,
      passwordHash,
      totpVerified: false,
    },
  });

  // No 2FA required by default — fully authenticated
  const session = createSession(user.id, user.email, true);
  const res = ok({ authenticated: true, email: user.email, name: user.name });
  res.headers.set("Set-Cookie", `lifeos-session=${session}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`);
  return res;
}
