import { db } from "@/lib/db";
import { ok } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/insights — aggregated data for the Insights view
export async function GET() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const [reviews, habits, finances, items, projects] = await Promise.all([
    db.review.findMany({
      where: { date: { gte: thirtyDaysAgo } },
      orderBy: { date: "asc" },
    }),
    db.item.findMany({
      where: { type: "habit", status: "active" },
      include: { habitLogs: { where: { date: { gte: thirtyDaysAgo } }, orderBy: { date: "asc" } } },
    }),
    db.item.findMany({
      where: { type: "finance", status: "active" },
    }),
    db.item.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { id: true, type: true, status: true, createdAt: true, completedAt: true },
    }),
    db.project.findMany({ where: { status: "active" } }),
  ]);

  // mood trend (last 30 days)
  const moodTrend = reviews.map((r) => ({
    date: new Date(r.date).toISOString().slice(0, 10),
    mood: r.mood || 0,
    energy: r.energy || 0,
    type: r.type,
  }));

  // habit consistency matrix (last 14 days)
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(now.getDate() - 13);
  fourteenDaysAgo.setHours(0, 0, 0, 0);
  const habitMatrix = habits.map((h) => {
    const meta = h.metadata ? safeParse(h.metadata) : {};
    const logSet = new Set(
      h.habitLogs.filter((l) => l.date >= fourteenDaysAgo).map((l) => new Date(l.date).toISOString().slice(0, 10)),
    );
    const days: { date: string; done: boolean }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      days.push({ date: d.toISOString().slice(0, 10), done: logSet.has(d.toISOString().slice(0, 10)) });
    }
    return {
      id: h.id,
      title: h.title,
      target: meta.target,
      unit: meta.unit,
      streak: meta.streak || 0,
      consistency: Math.round((days.filter((d) => d.done).length / 14) * 100),
      days,
    };
  });

  // finance summary
  const financeItems = finances.map((f) => ({ ...f, metadata: f.metadata ? safeParse(f.metadata) : {} }));
  const income = financeItems.filter((f) => f.metadata?.kind === "income").reduce((s, f) => s + (f.metadata?.amount || 0), 0);
  const expenses = financeItems.filter((f) => f.metadata?.kind === "expense").reduce((s, f) => s + (f.metadata?.amount || 0), 0);
  const subscriptions = financeItems
    .filter((f) => f.metadata?.recurring && f.metadata?.recurring !== "one-time")
    .reduce((s, f) => s + (f.metadata?.amount || 0), 0);
  const savingsGoals = financeItems
    .filter((f) => f.metadata?.kind === "goal")
    .map((f) => ({ title: f.title, target: f.metadata?.amount || 0, current: f.metadata?.current || 0 }));

  // items created / completed over 30 days (by day)
  const dailyActivity: { date: string; created: number; completed: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().slice(0, 10);
    const next = new Date(d);
    next.setDate(d.getDate() + 1);
    dailyActivity.push({
      date: key,
      created: items.filter((it) => new Date(it.createdAt) >= d && new Date(it.createdAt) < next).length,
      completed: items.filter((it) => it.completedAt && new Date(it.completedAt) >= d && new Date(it.completedAt) < next).length,
    });
  }

  // project health
  const projectHealth = await Promise.all(
    projects.map(async (p) => {
      const pItems = await db.item.findMany({
        where: { projectId: p.id, type: "task" },
        select: { status: true, dueDate: true },
      });
      const done = pItems.filter((i) => i.status === "done").length;
      const total = pItems.length;
      const overdue = pItems.filter((i) => i.dueDate && new Date(i.dueDate) < now && i.status !== "done").length;
      return {
        id: p.id,
        name: p.name,
        color: p.color,
        icon: p.icon,
        progress: total > 0 ? Math.round((done / total) * 100) : p.progress,
        done,
        total,
        overdue,
        targetDate: p.targetDate,
      };
    }),
  );

  return ok({
    moodTrend,
    habitMatrix,
    finance: { income, expenses, net: income - expenses, subscriptions, savingsGoals },
    dailyActivity,
    projectHealth,
    reviewCount: reviews.length,
  });
}

function safeParse(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}
