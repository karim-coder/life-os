import { db } from "@/lib/db";
import { ok, bad, parseBody, verifyPassword, createSession, getUserFromRequest } from "@/lib/auth-utils";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// In-memory store for QR login tokens (in production, use Redis or DB)
const qrTokens = new Map<string, { userId: string; email: string; createdAt: number; confirmed: boolean }>();

// POST /api/auth/qr-login — generate a QR login token (laptop side)
// GET /api/auth/qr-login?token=xxx — check if QR was scanned (polling)
// PUT /api/auth/qr-login — confirm QR login (phone side, scans the code)

export async function POST(req: NextRequest) {
  const body = await parseBody(req);
  const { email, password, action } = body;

  // If action=confirm, this is the phone confirming the QR login
  if (action === "confirm") {
    const { token, email: confirmEmail, password: confirmPassword } = body;
    if (!token) return bad("Token is required");

    const entry = qrTokens.get(token);
    if (!entry) return bad("Invalid or expired token", 404);
    if (Date.now() - entry.createdAt > 5 * 60 * 1000) {
      qrTokens.delete(token);
      return bad("QR code expired. Please generate a new one.", 410);
    }

    // The phone must authenticate with email+password to confirm
    if (confirmEmail && confirmPassword) {
      const user = await db.user.findUnique({ where: { email: confirmEmail.toLowerCase() } });
      if (!user) return bad("Invalid credentials", 401);
      const valid = await verifyPassword(confirmPassword, user.passwordHash);
      if (!valid) return bad("Invalid credentials", 401);

      // Verify the token belongs to the same user
      if (entry.userId !== user.id) return bad("This QR code belongs to a different account", 403);
    }

    // Mark as confirmed — the laptop's polling will pick this up
    entry.confirmed = true;
    qrTokens.set(token, entry);

    // Also create a session for the phone (the device that scanned)
    const session = createSession(entry.userId, entry.email, true);
    const res = ok({ authenticated: true, email: entry.email });
    res.headers.set("Set-Cookie", `lifeos-session=${session}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`);
    return res;
  }

  // Normal flow: generate a QR login token
  // If user is already authenticated (from Settings), use their session
  // If not (from login page), verify credentials
  let userId: string;
  let userEmail: string;

  if (!email || !password) {
    // Check if already authenticated via session cookie
    const session = await getUserFromRequest(req);
    if (!session) return bad("Email and password are required");
    userId = session.userId;
    userEmail = session.email;
  } else {
    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return bad("Invalid email or password", 401);
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) return bad("Invalid email or password", 401);
    userId = user.id;
    userEmail = user.email;
  }

  // Generate a random token
  const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
  qrTokens.set(token, {
    userId,
    email: userEmail,
    createdAt: Date.now(),
    confirmed: false,
  });

  // The QR URL encodes the token — the phone will open this URL
  const qrUrl = `${req.nextUrl.origin}/login?qr=${token}`;

  return ok({ token, qrUrl });
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const token = sp.get("token");
  if (!token) return bad("Token is required");

  const entry = qrTokens.get(token);
  if (!entry) return ok({ expired: true });

  if (Date.now() - entry.createdAt > 5 * 60 * 1000) {
    qrTokens.delete(token);
    return ok({ expired: true });
  }

  if (entry.confirmed) {
    // Laptop gets a verified session
    qrTokens.delete(token);
    const session = createSession(entry.userId, entry.email, true);
    const res = ok({ confirmed: true, email: entry.email });
    res.headers.set("Set-Cookie", `lifeos-session=${session}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`);
    return res;
  }

  return ok({ confirmed: false, waiting: true });
}
