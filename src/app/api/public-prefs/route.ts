import { db } from "@/lib/db";
import { ok } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/public-prefs — returns non-sensitive preferences (no auth required)
export async function GET() {
  // Check if any user has QR login disabled
  const settings = await db.setting.findMany();
  let qrLoginEnabled = true;
  for (const s of settings) {
    if (s.id.startsWith("prefs-")) {
      try {
        const prefs = JSON.parse(s.value);
        if (prefs.qrLoginEnabled === false) {
          qrLoginEnabled = false;
          break;
        }
      } catch {}
    }
  }

  return ok({ qrLoginEnabled });
}
