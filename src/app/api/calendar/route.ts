import { db } from "@/lib/db";
import { ok, parseMeta } from "@/lib/api";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/calendar?from=ISO&to=ISO&layers=type,type
// Aggregates anything with a date (dueDate, scheduledAt, startDate) into day buckets.
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const from = sp.get("from") ? new Date(sp.get("from")!) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const to = sp.get("to") ? new Date(sp.get("to")!) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);
  const layers = sp.get("layers"); // comma separated types or domains
  const layerMode = (sp.get("layerMode") || "type") as "type" | "domain";

  const where: any = {
    AND: [
      {
        OR: [
          { dueDate: { gte: from, lte: to } },
          { scheduledAt: { gte: from, lte: to } },
          { startDate: { gte: from, lte: to } },
        ],
      },
      { status: { not: "archived" } },
    ],
  };

  if (layers) {
    const vals = layers.split(",");
    if (layerMode === "type") where.type = { in: vals };
    else where.domainId = { in: vals };
  }

  const items = await db.item.findMany({
    where,
    include: { domain: true, project: { select: { id: true, name: true, color: true } } },
    orderBy: [{ dueDate: "asc" }, { scheduledAt: "asc" }],
  });

  // bucket by day
  const days: Record<string, any[]> = {};
  for (const it of items) {
    const dates = [it.dueDate, it.scheduledAt, it.startDate].filter(Boolean);
    for (const d of dates) {
      const key = new Date(d!).toISOString().slice(0, 10);
      (days[key] ||= []).push({ ...parseMeta(it as any), _dateField: it.dueDate === d ? "due" : it.scheduledAt === d ? "scheduled" : "start" });
    }
  }

  return ok({ from: from.toISOString(), to: to.toISOString(), days, items: items.map((i) => parseMeta(i as any)) });
}
