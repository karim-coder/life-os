import { db } from "@/lib/db";
import { ok, bad, parseBody, generateTOTPSecret, generateOTPAuthURL, generateTOTPCode, verifySession, verifyTOTP } from "@/lib/auth-utils";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// POST /api/auth/setup-2fa — generate TOTP secret and return QR code URL
export async function POST(req: NextRequest) {
  // Get session from cookie
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/lifeos-session=([^;]+)/);
  if (!match) return bad("No active session", 401);

  const session = verifySession(match[1]);
  if (!session) return bad("Invalid or expired session", 401);

  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user) return bad("User not found", 401);

  const body = await parseBody(req);
  const { action } = body;

  if (action === "confirm") {
    // User is confirming they scanned the QR — verify with a TOTP code
    const { token } = body;
    if (!token) return bad("Verification code is required");

    if (!user.totpSecret) return bad("No TOTP secret found. Please generate a new QR code.");

    const valid = verifyTOTP(token, user.totpSecret);
    if (!valid) return bad("Invalid code. Please try again.", 401);

    // Mark TOTP as verified
    await db.user.update({
      where: { id: user.id },
      data: { totpVerified: true },
    });

    return ok({ success: true, message: "2FA enabled successfully" });
  }

  // Generate new TOTP secret
  const secret = generateTOTPSecret();
  await db.user.update({
    where: { id: user.id },
    data: { totpSecret: secret, totpVerified: false },
  });

  const otpauthUrl = generateOTPAuthURL(user.email, secret);

  return ok({
    secret,
    otpauthUrl,
    manualEntry: secret.match(/.{1,4}/g)?.join(" "),
  });
}
