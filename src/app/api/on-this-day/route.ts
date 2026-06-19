import { db } from "@/lib/db";
import { ok, parseMeta } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/on-this-day — journal entries and reviews from this same day in past years/weeks
export async function GET() {
  const now = new Date();
  const month = now.getMonth();
  const date = now.getDate();

  // Fetch all journals + reviews (we'll filter client-side by month/day)
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(now.getFullYear() - 3);

  const [journals, reviews] = await Promise.all([
    db.item.findMany({
      where: {
        type: "journal",
        status: { not: "archived" },
        OR: [
          { scheduledAt: { gte: oneYearAgo } },
          { createdAt: { gte: oneYearAgo } },
        ],
      },
      include: { domain: true, project: { select: { id: true, name: true, color: true } } },
      orderBy: { scheduledAt: "desc" },
      take: 200,
    }),
    db.review.findMany({
      where: { date: { gte: oneYearAgo } },
      orderBy: { date: "desc" },
      take: 200,
    }),
  ]);

  // filter to same month+day but not today
  const todayKey = `${month}-${date}`;
  const sameDayJournals = journals
    .filter((j) => {
      const d = new Date(j.scheduledAt || j.createdAt);
      return d.getMonth() === month && d.getDate() === date &&
        !(d.getFullYear() === now.getFullYear());
    })
    .map((j) => parseMeta(j as any));

  const sameDayReviews = reviews
    .filter((r) => {
      const d = new Date(r.date);
      return d.getMonth() === month && d.getDate() === date &&
        !(d.getFullYear() === now.getFullYear());
    })
    .map((r) => ({
      ...r,
      priorities: r.priorities ? safeParse(r.priorities) : null,
    }));

  // Also include items completed on this day in past (milestones, bookmarks)
  const completedOnDay = await db.item.findMany({
    where: {
      completedAt: { gte: oneYearAgo, not: null },
      status: "done",
      type: { in: ["milestone", "bookmark", "goal"] },
    },
    include: { domain: true, project: { select: { id: true, name: true, color: true } } },
    take: 100,
  });

  const sameDayCompleted = completedOnDay
    .filter((i) => {
      const d = new Date(i.completedAt!);
      return d.getMonth() === month && d.getDate() === date &&
        !(d.getFullYear() === now.getFullYear());
    })
    .map((i) => parseMeta(i as any));

  return ok({
    journals: sameDayJournals,
    reviews: sameDayReviews,
    completed: sameDayCompleted,
    yearsAgo: sameDayJournals.length || sameDayReviews.length || sameDayCompleted.length
      ? Math.min(
          ...sameDayJournals.map((j: any) => now.getFullYear() - new Date(j.scheduledAt || j.createdAt).getFullYear()),
          ...sameDayReviews.map((r: any) => now.getFullYear() - new Date(r.date).getFullYear()),
          ...sameDayCompleted.map((c: any) => now.getFullYear() - new Date(c.completedAt).getFullYear()),
        )
      : 0,
  });
}

function safeParse(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return [];
  }
}
