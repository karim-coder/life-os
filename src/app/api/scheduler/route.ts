import { db } from "@/lib/db";
import { ok } from "@/lib/api";

export const dynamic = "force-dynamic";

// POST /api/scheduler — generates next instances for recurring items whose due date has passed.
// This is a simple "run on demand" scheduler. In production this would be a cron job.
export async function POST() {
  const now = new Date();
  const results: { type: string; created: number; details: string[] }[] = [];

  // 1. Recurring finance items (monthly/weekly/yearly) past their due date
  const recurringFinances = await db.item.findMany({
    where: {
      type: "finance",
      status: "active",
      dueDate: { lt: now },
    },
  });

  const financeDetails: string[] = [];
  for (const f of recurringFinances) {
    const meta = f.metadata ? safeParse(f.metadata) : {};
    if (!meta.recurring || meta.recurring === "one-time") continue;

    // Calculate next due date based on recurrence
    const oldDue = f.dueDate ? new Date(f.dueDate) : now;
    let nextDue = new Date(oldDue);
    const periods: Record<string, number> = {
      weekly: 7,
      monthly: 30,
      yearly: 365,
    };
    const days = periods[meta.recurring] || 30;

    // Keep advancing until nextDue is in the future
    while (nextDue < now) {
      nextDue = new Date(nextDue.getTime() + days * 86400000);
    }

    // Update the existing item's due date to the next occurrence
    // (rather than creating duplicates — recurring items are "rolling")
    await db.item.update({
      where: { id: f.id },
      data: { dueDate: nextDue },
    });
    financeDetails.push(`${f.title} → ${nextDue.toISOString().slice(0, 10)}`);
  }
  if (financeDetails.length) results.push({ type: "finance", created: financeDetails.length, details: financeDetails });

  // 2. Mark overdue tasks as still active (no auto-complete, but we could add streak resets for habits)
  // 3. Update habit streaks — if a habit wasn't logged yesterday, reset streak to 0
  const habits = await db.item.findMany({
    where: { type: "habit", status: "active" },
    include: { habitLogs: { orderBy: { date: "desc" }, take: 2 } },
  });

  let streaksReset = 0;
  for (const h of habits) {
    const meta = h.metadata ? safeParse(h.metadata) : {};
    if (!meta.streak || meta.streak === 0) continue;

    // Check if the last log was more than 2 days ago (allowing 1 missed day)
    const lastLog = h.habitLogs[0];
    if (lastLog) {
      const daysSince = Math.floor((now.getTime() - new Date(lastLog.date).getTime()) / 86400000);
      if (daysSince > 2) {
        await db.item.update({
          where: { id: h.id },
          data: { metadata: JSON.stringify({ ...meta, streak: 0 }) },
        });
        streaksReset++;
      }
    }
  }
  if (streaksReset > 0) {
    results.push({ type: "habit-streak-reset", created: streaksReset, details: [`${streaksReset} habit streaks reset due to inactivity`] });
  }

  return ok({
    runAt: now.toISOString(),
    results,
    summary: {
      financeUpdated: financeDetails.length,
      streaksReset,
    },
  });
}

function safeParse(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}
