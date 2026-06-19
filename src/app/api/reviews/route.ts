import { db } from "@/lib/db";
import { ok, bad, parseBody } from "@/lib/api";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/reviews?type=daily|weekly
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const where: any = {};
  if (sp.get("type")) where.type = sp.get("type");
  const reviews = await db.review.findMany({
    where,
    orderBy: { date: "desc" },
    take: 50,
  });
  // parse priorities JSON
  const parsed = reviews.map((r) => ({
    ...r,
    priorities: r.priorities ? safeParse(r.priorities) : null,
  }));
  return ok({ reviews: parsed });
}

// POST /api/reviews
export async function POST(req: NextRequest) {
  const body = await parseBody(req);
  if (!body.type) return bad("type is required");
  const date = body.date ? new Date(body.date) : new Date();
  const review = await db.review.create({
    data: {
      type: body.type,
      date,
      status: body.status || "completed",
      weekStart: body.weekStart ? new Date(body.weekStart) : null,
      weekEnd: body.weekEnd ? new Date(body.weekEnd) : null,
      wins: body.wins,
      challenges: body.challenges,
      learnings: body.learnings,
      gratitude: body.gratitude,
      priorities: body.priorities ? (typeof body.priorities === "string" ? body.priorities : JSON.stringify(body.priorities)) : null,
      mood: body.mood,
      energy: body.energy,
      notes: body.notes,
    },
  });
  return ok(review);
}

function safeParse(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return [];
  }
}
