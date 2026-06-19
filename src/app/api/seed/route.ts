import { db } from "@/lib/db";
import { ok, bad, getUserFromRequest } from "@/lib/auth-utils";
import type { NextRequest } from "next/server";
import { DOMAINS } from "@/lib/constants";

export const dynamic = "force-dynamic";

function daysFromNow(n: number, h = 9, m = 0) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(h, m, 0, 0);
  return d;
}

// POST /api/seed — seeds demo data for testing (dev only)
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return bad("Seeding is disabled in production", 403);
  }

  // Check if data already exists
  const existingDomains = await db.domain.count();
  if (existingDomains > 0) {
    return bad("Data already exists. Reset the database first.", 409);
  }

  // Seed domains
  const domainMap: Record<string, string> = {};
  for (const dom of DOMAINS) {
    const d = await db.domain.create({
      data: { key: dom.key, name: dom.name, description: dom.description, icon: dom.icon, color: dom.color, order: dom.order },
    });
    domainMap[dom.key] = d.id;
  }

  // Seed projects
  const projects = await Promise.all([
    db.project.create({ data: { name: "Japan Trip 2025", description: "Two-week adventure across Tokyo, Kyoto, and Osaka.", color: "#ec4899", icon: "Plane", domainId: domainMap.creativity, status: "active", progress: 35, targetDate: daysFromNow(120) } }),
    db.project.create({ data: { name: "Health Transformation", description: "Build strength, improve sleep, and run a half-marathon.", color: "#f43f5e", icon: "HeartPulse", domainId: domainMap.health, status: "active", progress: 55, targetDate: daysFromNow(200) } }),
    db.project.create({ data: { name: "Launch Startup", description: "Ship the MVP and get first 100 paying customers.", color: "#10b981", icon: "Rocket", domainId: domainMap.wealth, status: "active", progress: 20, targetDate: daysFromNow(90) } }),
    db.project.create({ data: { name: "Get out of Debt", description: "Pay off credit card and student loans.", color: "#71717a", icon: "TrendingDown", domainId: domainMap.wealth, status: "active", progress: 40, targetDate: daysFromNow(300) } }),
    db.project.create({ data: { name: "Read 24 Books", description: "Two books a month for a year.", color: "#3b82f6", icon: "BookOpen", domainId: domainMap.growth, status: "active", progress: 50, targetDate: daysFromNow(180) } }),
  ]);
  const pmap: Record<string, string> = {};
  projects.forEach((p) => { pmap[p.name] = p.id; });

  async function item(data: Record<string, any>) {
    const meta = data.metadata ? { metadata: JSON.stringify(data.metadata) } : {};
    const { metadata, ...rest } = data;
    return db.item.create({ data: { ...rest, ...meta } as any });
  }

  // Tasks
  await item({ type: "task", title: "Book flights to Tokyo", domainId: domainMap.time_action, projectId: pmap["Japan Trip 2025"], status: "active", priority: 3, dueDate: daysFromNow(7), metadata: { estimate: "2h" } });
  await item({ type: "task", title: "Research JR Pass options", domainId: domainMap.time_action, projectId: pmap["Japan Trip 2025"], status: "active", priority: 2, dueDate: daysFromNow(10) });
  await item({ type: "task", title: "Morning run 5km", domainId: domainMap.time_action, projectId: pmap["Health Transformation"], status: "active", priority: 2, dueDate: daysFromNow(1) });
  await item({ type: "task", title: "Finish landing page copy", domainId: domainMap.time_action, projectId: pmap["Launch Startup"], status: "active", priority: 4, dueDate: daysFromNow(2) });
  await item({ type: "task", title: "Set up Stripe billing", domainId: domainMap.time_action, projectId: pmap["Launch Startup"], status: "active", priority: 3, dueDate: daysFromNow(5) });
  await item({ type: "task", title: "Pay credit card bill", domainId: domainMap.time_action, projectId: pmap["Get out of Debt"], status: "active", priority: 4, dueDate: daysFromNow(3), metadata: { amount: 850 } });
  await item({ type: "task", title: "Grocery: oats, eggs, spinach, bananas", domainId: domainMap.admin, status: "active", priority: 2, dueDate: daysFromNow(1), content: "Weekly grocery run" });
  await item({ type: "task", title: "Replace HVAC filter", domainId: domainMap.admin, status: "active", priority: 1, dueDate: daysFromNow(6) });

  // Habits
  const medHabit = await item({ type: "habit", title: "Meditate 10 minutes", domainId: domainMap.mind_soul, status: "active", metadata: { cadence: "daily", target: 10, unit: "min", streak: 4 } });
  const runHabit = await item({ type: "habit", title: "Run / Walk 5km", domainId: domainMap.health, status: "active", metadata: { cadence: "daily", target: 5, unit: "km", streak: 2 } });
  const readHabit = await item({ type: "habit", title: "Read 20 pages", domainId: domainMap.growth, status: "active", projectId: pmap["Read 24 Books"], metadata: { cadence: "daily", target: 20, unit: "pages", streak: 6 } });
  const waterHabit = await item({ type: "habit", title: "Drink 2L water", domainId: domainMap.health, status: "active", metadata: { cadence: "daily", target: 2, unit: "L", streak: 9 } });
  const writeHabit = await item({ type: "habit", title: "Morning pages", domainId: domainMap.mind_soul, status: "active", metadata: { cadence: "daily", target: 1, unit: "entry", streak: 3 } });

  // Habit logs
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const r = Math.random();
    if (medHabit && r > 0.2) await db.habitLog.create({ data: { itemId: medHabit.id, date: d, value: 10 } }).catch(() => {});
    if (runHabit && r > 0.45) await db.habitLog.create({ data: { itemId: runHabit.id, date: d, value: 5 } }).catch(() => {});
    if (readHabit && r > 0.3) await db.habitLog.create({ data: { itemId: readHabit.id, date: d, value: 20 } }).catch(() => {});
    if (waterHabit && r > 0.15) await db.habitLog.create({ data: { itemId: waterHabit.id, date: d, value: 2 } }).catch(() => {});
    if (writeHabit && r > 0.5) await db.habitLog.create({ data: { itemId: writeHabit.id, date: d, value: 1 } }).catch(() => {});
  }

  // Journals
  await item({ type: "journal", title: "Stress about money", domainId: domainMap.mind_soul, projectId: pmap["Get out of Debt"], status: "active", scheduledAt: daysFromNow(-2, 21), content: "Feeling the weight of debt again today. Need to sit down and make a real plan." });
  await item({ type: "journal", title: "Great workout session", domainId: domainMap.mind_soul, projectId: pmap["Health Transformation"], status: "active", scheduledAt: daysFromNow(-1, 8), content: "Hit a new PR on squats today. Energy is finally coming back." });

  // Notes
  await item({ type: "note", title: "Tokyo neighborhood research", domainId: domainMap.creativity, projectId: pmap["Japan Trip 2025"], status: "active", content: "## Areas to stay\n- **Shinjuku** — lively, great transit\n- **Shibuya** — young, energetic\n- **Asakusa** — quieter, traditional" });
  await item({ type: "note", title: "Startup pricing ideas", domainId: domainMap.wealth, projectId: pmap["Launch Startup"], status: "active", content: "Freemium → $9/mo → $29/mo → custom. Annual gets 2 months free." });

  // Finance
  await item({ type: "finance", title: "Salary", domainId: domainMap.wealth, status: "active", dueDate: daysFromNow(5), metadata: { kind: "income", amount: 4200, recurring: "monthly" } });
  await item({ type: "finance", title: "Rent", domainId: domainMap.wealth, status: "active", dueDate: daysFromNow(2), metadata: { kind: "expense", amount: 1450, recurring: "monthly" } });
  await item({ type: "finance", title: "Netflix", domainId: domainMap.wealth, status: "active", dueDate: daysFromNow(8), metadata: { kind: "expense", amount: 15.99, recurring: "monthly", subscription: true } });
  await item({ type: "finance", title: "Spotify", domainId: domainMap.wealth, status: "active", dueDate: daysFromNow(12), metadata: { kind: "expense", amount: 11.99, recurring: "monthly", subscription: true } });
  await item({ type: "finance", title: "Emergency fund goal", domainId: domainMap.wealth, status: "active", metadata: { kind: "goal", amount: 10000, current: 3200 } });

  // Contacts
  await item({ type: "contact", title: "Sarah Chen", domainId: domainMap.network, status: "active", metadata: { relationship: "close friend", birthday: "1992-04-18", lastContact: daysFromNow(-12).toISOString() } });
  await item({ type: "contact", title: "Marcus Rivera", domainId: domainMap.network, status: "active", metadata: { relationship: "mentor", lastContact: daysFromNow(-30).toISOString() } });
  await item({ type: "contact", title: "Priya Patel", domainId: domainMap.network, status: "active", metadata: { relationship: "colleague", lastContact: daysFromNow(-3).toISOString() } });

  // Books & media
  await item({ type: "bookmark", title: "Atomic Habits", domainId: domainMap.growth, projectId: pmap["Read 24 Books"], status: "active", metadata: { author: "James Clear", medium: "book", status: "reading", rating: 5, currentPage: 180, totalPages: 320 }, content: "Tiny changes, remarkable results. Focus on systems over goals." });
  await item({ type: "bookmark", title: "Deep Work", domainId: domainMap.growth, projectId: pmap["Read 24 Books"], status: "done", priority: 2, completedAt: daysFromNow(-20), metadata: { author: "Cal Newport", medium: "book", status: "finished", rating: 5 } });
  await item({ type: "bookmark", title: "The Almanack of Naval Ravikant", domainId: domainMap.growth, status: "active", metadata: { author: "Eric Jorgenson", medium: "book", status: "queued" } });

  // Movies
  await item({ type: "bookmark", title: "Everything Everywhere All at Once", domainId: domainMap.creativity, status: "active", metadata: { medium: "movie", status: "queued", author: "Daniels" } });
  await item({ type: "bookmark", title: "Dune: Part Two", domainId: domainMap.creativity, status: "active", metadata: { medium: "movie", status: "queued", author: "Denis Villeneuve" } });
  await item({ type: "bookmark", title: "Spirited Away", domainId: domainMap.creativity, status: "done", metadata: { medium: "movie", status: "finished", rating: 5, author: "Hayao Miyazaki" }, completedAt: daysFromNow(-8) });

  // Mind & Soul
  await item({ type: "vision", title: "Live with intention", domainId: domainMap.mind_soul, status: "active", content: "I want every day to be a deliberate choice, not a reaction." });
  await item({ type: "affirmation", title: "I am capable of hard things", domainId: domainMap.mind_soul, status: "active" });
  await item({ type: "goal", title: "Run a half-marathon", domainId: domainMap.health, projectId: pmap["Health Transformation"], status: "active", dueDate: daysFromNow(90), metadata: { measure: "21km race" } });

  // Ideas
  await item({ type: "idea", title: "App for tracking plant care", domainId: domainMap.creativity, status: "inbox", content: "Notification + watering schedule with plant ID." });
  await item({ type: "idea", title: "Weekend podcast about local food", domainId: domainMap.creativity, status: "inbox" });

  // Inbox items
  await item({ type: "note", title: "Look into tax-advantaged accounts", domainId: domainMap.wealth, status: "inbox" });
  await item({ type: "task", title: "Reply to landlord about lease renewal", domainId: domainMap.admin, status: "inbox" });

  // Reviews
  await db.review.create({ data: { type: "daily", date: daysFromNow(-1, 21), status: "completed", wins: "Shipped the landing page hero section.", challenges: "Got distracted by notifications.", learnings: "Deep work blocks need to be phone-free.", gratitude: "Grateful for my supportive partner.", mood: 4, energy: 3 } });
  await db.review.create({ data: { type: "weekly", date: daysFromNow(-4, 20), status: "completed", weekStart: daysFromNow(-10), weekEnd: daysFromNow(-4), wins: "Hit 5/7 meditation days, read 80 pages.", challenges: "Overspent on takeout.", learnings: "Meal prep on Sunday makes the week smoother.", gratitude: "Grateful for Marcus's mentorship.", priorities: '["Launch landing page","Plan Japan itinerary","3 strength workouts"]', mood: 4, energy: 3 } });

  // Links
  const debtJournal = await db.item.findFirst({ where: { title: "Stress about money" } });
  const financialVision = await db.item.findFirst({ where: { title: "Live with intention" } });
  if (debtJournal && financialVision) {
    await db.link.create({ data: { fromId: debtJournal.id, toId: financialVision.id, type: "related" } }).catch(() => {});
  }
  if (medHabit && writeHabit) {
    await db.link.create({ data: { fromId: medHabit.id, toId: writeHabit.id, type: "related" } }).catch(() => {});
  }

  return ok({ success: true, message: "Seed data created successfully" });
}
