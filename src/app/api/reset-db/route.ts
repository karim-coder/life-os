import { db } from "@/lib/db";
import { ok, bad, getUserFromRequest } from "@/lib/auth-utils";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// POST /api/reset-db — clears all data except users (dev only)
export async function POST(req: NextRequest) {
  const session = await getUserFromRequest(req);
  if (!session) return bad("Unauthorized", 401);

  // Safety check — don't allow in production
  if (process.env.NODE_ENV === "production") {
    return bad("Database reset is disabled in production", 403);
  }

  try {
    // Delete all data in order (respecting foreign keys)
    await db.habitLog.deleteMany();
    await db.reviewItem.deleteMany();
    await db.review.deleteMany();
    await db.link.deleteMany();
    await db.tagOnItem.deleteMany();
    await db.tag.deleteMany();
    await db.item.deleteMany();
    await db.project.deleteMany();
    await db.domain.deleteMany();
    await db.setting.deleteMany();
    // Keep User table intact

    return ok({ success: true, message: "All data cleared. Users preserved." });
  } catch (e: any) {
    return bad(`Reset failed: ${e.message}`, 500);
  }
}
