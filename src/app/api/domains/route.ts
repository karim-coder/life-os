import { db } from "@/lib/db";
import { ok } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/domains
export async function GET() {
  const domains = await db.domain.findMany({ orderBy: { order: "asc" } });
  return ok({ domains });
}
