// Life OS — seed script
// Run with: bun run src/lib/seed.ts
import { PrismaClient } from "@prisma/client";
import { DOMAINS } from "./constants";

const db = new PrismaClient();

function daysFromNow(n: number, h = 9, m = 0) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(h, m, 0, 0);
  return d;
}

async function main() {
  console.log("🌱 Seeding Life OS…");

  // Domains
  for (const dom of DOMAINS) {
    await db.domain.upsert({
      where: { key: dom.key },
      update: {
        name: dom.name,
        description: dom.description,
        icon: dom.icon,
        color: dom.color,
        order: dom.order,
      },
      create: {
        key: dom.key,
        name: dom.name,
        description: dom.description,
        icon: dom.icon,
        color: dom.color,
        order: dom.order,
      },
    });
  }
  const domains = await db.domain.findMany();
  const dmap = Object.fromEntries(domains.map((d) => [d.key, d.id]));

  // Projects / Threads
  const projects = await Promise.all(
    [
      {
        name: "Japan Trip 2025",
        description: "Two-week adventure across Tokyo, Kyoto, and Osaka.",
        color: "#ec4899",
        icon: "Plane",
        domainId: dmap.creativity,
        status: "active",
        progress: 35,
        targetDate: daysFromNow(120),
      },
      {
        name: "Health Transformation",
        description: "Build strength, improve sleep, and run a half-marathon.",
        color: "#f43f5e",
        icon: "HeartPulse",
        domainId: dmap.health,
        status: "active",
        progress: 55,
        targetDate: daysFromNow(200),
      },
      {
        name: "Launch Startup",
        description: "Ship the MVP and get first 100 paying customers.",
        color: "#10b981",
        icon: "Rocket",
        domainId: dmap.wealth,
        status: "active",
        progress: 20,
        targetDate: daysFromNow(90),
      },
      {
        name: "Get out of Debt",
        description: "Pay off credit card and student loans.",
        color: "#71717a",
        icon: "TrendingDown",
        domainId: dmap.wealth,
        status: "active",
        progress: 40,
        targetDate: daysFromNow(300),
      },
      {
        name: "Read 24 Books",
        description: "Two books a month for a year.",
        color: "#3b82f6",
        icon: "BookOpen",
        domainId: dmap.growth,
        status: "active",
        progress: 50,
        targetDate: daysFromNow(180),
      },
    ].map((p) => db.project.create({ data: p as any })),
  );
  const pmap = Object.fromEntries(projects.map((p) => [p.name, p.id]));

  // Helper to create item + metadata
  async function item(data: Record<string, any>) {
    const meta = data.metadata ? { metadata: JSON.stringify(data.metadata) } : {};
    const { metadata, ...rest } = data;
    return db.item.create({ data: { ...rest, ...meta } as any });
  }

  // ── Tasks (Time & Action) ──
  await item({ type: "task", title: "Book flights to Tokyo", domainId: dmap.time_action, projectId: pmap["Japan Trip 2025"], status: "active", priority: 3, dueDate: daysFromNow(7), metadata: { estimate: "2h" } });
  await item({ type: "task", title: "Research JR Pass options", domainId: dmap.time_action, projectId: pmap["Japan Trip 2025"], status: "active", priority: 2, dueDate: daysFromNow(10) });
  await item({ type: "task", title: "Create packing list", domainId: dmap.time_action, projectId: pmap["Japan Trip 2025"], status: "active", priority: 1, dueDate: daysFromNow(30) });
  await item({ type: "task", title: "Renew passport", domainId: dmap.time_action, projectId: pmap["Japan Trip 2025"], status: "done", priority: 4, completedAt: daysFromNow(-5), dueDate: daysFromNow(-5) });

  await item({ type: "task", title: "Morning run 5km", domainId: dmap.time_action, projectId: pmap["Health Transformation"], status: "active", priority: 2, dueDate: daysFromNow(1), metadata: { estimate: "30m" } });
  await item({ type: "task", title: "Meal prep for the week", domainId: dmap.time_action, projectId: pmap["Health Transformation"], status: "active", priority: 2, dueDate: daysFromNow(2) });
  await item({ type: "task", title: "Schedule annual physical", domainId: dmap.time_action, projectId: pmap["Health Transformation"], status: "active", priority: 3, dueDate: daysFromNow(14) });

  await item({ type: "task", title: "Finish landing page copy", domainId: dmap.time_action, projectId: pmap["Launch Startup"], status: "active", priority: 4, dueDate: daysFromNow(2) });
  await item({ type: "task", title: "Set up Stripe billing", domainId: dmap.time_action, projectId: pmap["Launch Startup"], status: "active", priority: 3, dueDate: daysFromNow(5) });
  await item({ type: "task", title: "Write launch announcement", domainId: dmap.time_action, projectId: pmap["Launch Startup"], status: "active", priority: 2, dueDate: daysFromNow(8) });
  await item({ type: "task", title: "Email beta testers", domainId: dmap.time_action, projectId: pmap["Launch Startup"], status: "done", priority: 2, completedAt: daysFromNow(-2), dueDate: daysFromNow(-2) });

  await item({ type: "task", title: "Pay credit card bill", domainId: dmap.time_action, projectId: pmap["Get out of Debt"], status: "active", priority: 4, dueDate: daysFromNow(3), metadata: { amount: 850 } });
  await item({ type: "task", title: "Cancel unused gym membership", domainId: dmap.time_action, projectId: pmap["Get out of Debt"], status: "active", priority: 1, dueDate: daysFromNow(7) });

  // ── Habits ──
  const medHabit = await item({ type: "habit", title: "Meditate 10 minutes", domainId: dmap.mind_soul, status: "active", metadata: { cadence: "daily", target: 10, unit: "min", streak: 4 } });
  const runHabit = await item({ type: "habit", title: "Run / Walk 5km", domainId: dmap.health, status: "active", metadata: { cadence: "daily", target: 5, unit: "km", streak: 2 } });
  const readHabit = await item({ type: "habit", title: "Read 20 pages", domainId: dmap.growth, status: "active", projectId: pmap["Read 24 Books"], metadata: { cadence: "daily", target: 20, unit: "pages", streak: 6 } });
  const waterHabit = await item({ type: "habit", title: "Drink 2L water", domainId: dmap.health, status: "active", metadata: { cadence: "daily", target: 2, unit: "L", streak: 9 } });
  const writeHabit = await item({ type: "habit", title: "Morning pages", domainId: dmap.mind_soul, status: "active", metadata: { cadence: "daily", target: 1, unit: "entry", streak: 3 } });

  // Habit logs for the last 14 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const r = Math.random();
    if (medHabit && r > 0.2) await db.habitLog.create({ data: { itemId: medHabit.id, date: d, value: 10 } }).catch(() => {});
    if (runHabit && r > 0.45) await db.habitLog.create({ data: { itemId: runHabit.id, date: d, value: 5 } }).catch(() => {});
    if (readHabit && r > 0.3) await db.habitLog.create({ data: { itemId: readHabit.id, date: d, value: 20 } }).catch(() => {});
    if (waterHabit && r > 0.15) await db.habitLog.create({ data: { itemId: waterHabit.id, date: d, value: 2 } }).catch(() => {});
    if (writeHabit && r > 0.5) await db.habitLog.create({ data: { itemId: writeHabit.id, date: d, value: 1 } }).catch(() => {});
  }

  // ── Journal entries ──
  await item({ type: "journal", title: "Stress about money", domainId: dmap.mind_soul, projectId: pmap["Get out of Debt"], status: "active", scheduledAt: daysFromNow(-2, 21), content: "Feeling the weight of debt again today. Need to sit down and make a real plan. The interest is eating into everything. I'll start by cutting subscriptions and cooking at home more." });
  await item({ type: "journal", title: "Great workout session", domainId: dmap.mind_soul, projectId: pmap["Health Transformation"], status: "active", scheduledAt: daysFromNow(-1, 8), content: "Hit a new PR on squats today. Energy is finally coming back. Sleep has been solid for a week. Feeling optimistic." });
  await item({ type: "journal", title: "Startup doubts", domainId: dmap.mind_soul, projectId: pmap["Launch Startup"], status: "active", scheduledAt: daysFromNow(-3, 23), content: "Questioning whether the market really wants this. But the beta feedback was encouraging. I need to talk to 5 more users this week." });

  // ── Notes ──
  await item({ type: "note", title: "Tokyo neighborhood research", domainId: dmap.creativity, projectId: pmap["Japan Trip 2025"], status: "active", content: "## Areas to stay\n- **Shinjuku** — lively, great transit\n- **Shibuya** — young, energetic\n- **Asakusa** — quieter, traditional\n- **Ginza** — upscale shopping" });
  await item({ type: "note", title: "Startup pricing ideas", domainId: dmap.wealth, projectId: pmap["Launch Startup"], status: "active", content: "Freemium → $9/mo → $29/mo → custom. Annual gets 2 months free. Lifetime deal for early adopters at $199." });
  await item({ type: "note", title: "Half-marathon training plan", domainId: dmap.health, projectId: pmap["Health Transformation"], status: "active", content: "Week 1-4: base building. Week 5-8: tempo runs. Week 9-12: long runs + taper." });

  // ── Finance ──
  await item({ type: "finance", title: "Salary", domainId: dmap.wealth, status: "active", dueDate: daysFromNow(5), metadata: { kind: "income", amount: 4200, recurring: "monthly" } });
  await item({ type: "finance", title: "Rent", domainId: dmap.wealth, status: "active", dueDate: daysFromNow(2), metadata: { kind: "expense", amount: 1450, recurring: "monthly" } });
  await item({ type: "finance", title: "Netflix subscription", domainId: dmap.wealth, status: "active", dueDate: daysFromNow(8), metadata: { kind: "expense", amount: 15.99, recurring: "monthly", subscription: true } });
  await item({ type: "finance", title: "Spotify", domainId: dmap.wealth, status: "active", dueDate: daysFromNow(12), metadata: { kind: "expense", amount: 11.99, recurring: "monthly", subscription: true } });
  await item({ type: "finance", title: "Gym membership", domainId: dmap.wealth, status: "active", dueDate: daysFromNow(20), metadata: { kind: "expense", amount: 39, recurring: "monthly", subscription: true } });
  await item({ type: "finance", title: "Groceries", domainId: dmap.wealth, status: "active", dueDate: daysFromNow(1), metadata: { kind: "expense", amount: 120 } });
  await item({ type: "finance", title: "Emergency fund goal", domainId: dmap.wealth, status: "active", metadata: { kind: "goal", amount: 10000, current: 3200 } });

  // ── Health: symptoms & meds ──
  await item({ type: "symptom", title: "Headache (mild)", domainId: dmap.health, status: "active", scheduledAt: daysFromNow(-1, 16), metadata: { severity: 2 } });
  await item({ type: "medication", title: "Vitamin D", domainId: dmap.health, status: "active", metadata: { dose: "1000 IU", frequency: "daily" } });
  await item({ type: "event", title: "Dental cleaning", domainId: dmap.health, status: "active", scheduledAt: daysFromNow(18, 10), metadata: { location: "Bright Smile Dental" } });

  // ── Network: contacts ──
  await item({ type: "contact", title: "Sarah Chen", domainId: dmap.network, status: "active", metadata: { relationship: "close friend", birthday: "1992-04-18", lastContact: daysFromNow(-12).toISOString() } });
  await item({ type: "contact", title: "Marcus Rivera", domainId: dmap.network, status: "active", metadata: { relationship: "mentor", lastContact: daysFromNow(-30).toISOString() } });
  await item({ type: "contact", title: "Priya Patel", domainId: dmap.network, status: "active", metadata: { relationship: "colleague", lastContact: daysFromNow(-3).toISOString() } });
  await item({ type: "event", title: "Sarah's birthday", domainId: dmap.network, status: "active", scheduledAt: daysFromNow(20, 19), metadata: { contactId: "Sarah Chen" } });

  // ── Growth: books & courses ──
  await item({ type: "bookmark", title: "Atomic Habits", domainId: dmap.growth, projectId: pmap["Read 24 Books"], status: "active", metadata: { author: "James Clear", medium: "book", status: "reading", rating: 5, currentPage: 180, totalPages: 320 }, content: "Tiny changes, remarkable results. Focus on systems over goals.\n\n## Key takeaways\n- **1% better every day** compounds into 37x in a year\n- Focus on **systems** over goals\n- The 4 laws: make it obvious, attractive, easy, satisfying\n- Identity-based habits: \"I am a reader\" not \"I want to read more\"" });
  await item({ type: "bookmark", title: "Deep Work", domainId: dmap.growth, projectId: pmap["Read 24 Books"], status: "done", priority: 2, completedAt: daysFromNow(-20), metadata: { author: "Cal Newport", medium: "book", status: "finished", rating: 5 } });
  await item({ type: "bookmark", title: "The Almanack of Naval Ravikant", domainId: dmap.growth, status: "active", metadata: { author: "Eric Jorgenson", medium: "book", status: "queued" } });
  await item({ type: "bookmark", title: "Building a Second Brain", domainId: dmap.growth, status: "active", metadata: { author: "Tiago Forte", medium: "course", status: "queued", url: "https://buildingasecondbrain.com" } });

  // ── Creativity: movies to watch / watched ──
  await item({ type: "bookmark", title: "Everything Everywhere All at Once", domainId: dmap.creativity, status: "active", metadata: { medium: "movie", status: "queued", author: "Daniels" }, content: "Multiverse adventure. Recommended by Sarah." });
  await item({ type: "bookmark", title: "Dune: Part Two", domainId: dmap.creativity, status: "active", metadata: { medium: "movie", status: "queued", author: "Denis Villeneuve" } });
  await item({ type: "bookmark", title: "Spirited Away", domainId: dmap.creativity, status: "done", metadata: { medium: "movie", status: "finished", rating: 5, author: "Hayao Miyazaki" }, completedAt: daysFromNow(-8), content: "A masterpiece. The bathhouse world is so immersive. Haku's river spirit reveal was beautiful." });

  // ── Mind & Soul ──
  await item({ type: "vision", title: "Live with intention", domainId: dmap.mind_soul, status: "active", content: "I want every day to be a deliberate choice, not a reaction. Less screen time, more presence." });
  await item({ type: "vision", title: "Financial peace", domainId: dmap.mind_soul, projectId: pmap["Get out of Debt"], status: "active", content: "Be debt-free and have a 6-month emergency fund within 2 years." });
  await item({ type: "affirmation", title: "I am capable of hard things", domainId: dmap.mind_soul, status: "active", content: "Repeat each morning." });
  await item({ type: "affirmation", title: "Progress over perfection", domainId: dmap.mind_soul, status: "active" });
  await item({ type: "goal", title: "Run a half-marathon", domainId: dmap.health, projectId: pmap["Health Transformation"], status: "active", dueDate: daysFromNow(90), metadata: { measure: "21km race" } });

  // ── Creativity & Joy ──
  await item({ type: "idea", title: "App for tracking plant care", domainId: dmap.creativity, status: "inbox", content: "Notification + watering schedule with plant ID." });
  await item({ type: "idea", title: "Weekend podcast about local food", domainId: dmap.creativity, status: "inbox" });
  await item({ type: "bookmark", title: "Past Lives", domainId: dmap.creativity, status: "done", metadata: { medium: "movie", rating: 4, status: "finished", author: "Celine Song" }, completedAt: daysFromNow(-15), content: "Quiet, devastating. The ending stayed with me for days." });
  await item({ type: "milestone", title: "Japan Trip booked!", domainId: dmap.creativity, projectId: pmap["Japan Trip 2025"], status: "done", completedAt: daysFromNow(-5), scheduledAt: daysFromNow(-5) });

  // ── Inbox (Quick Capture) ──
  await item({ type: "note", title: "Look into tax-advantaged accounts", domainId: dmap.wealth, status: "inbox" });
  await item({ type: "task", title: "Reply to landlord about lease renewal", domainId: dmap.admin, status: "inbox" });
  await item({ type: "idea", title: "Try a cold plunge 3x this week", domainId: dmap.health, status: "inbox" });
  await item({ type: "note", title: "Call mom this weekend", domainId: dmap.network, status: "inbox" });
  await item({ type: "bookmark", title: "Article: The art of saying no", domainId: dmap.growth, status: "inbox", metadata: { url: "https://example.com/saying-no" } });

  // ── Admin ──
  await item({ type: "task", title: "Replace HVAC filter", domainId: dmap.admin, status: "active", priority: 1, dueDate: daysFromNow(6) });
  await item({ type: "task", title: "Grocery: oats, eggs, spinach, bananas", domainId: dmap.admin, status: "active", priority: 2, dueDate: daysFromNow(1), content: "Weekly grocery run" });
  await item({ type: "document", title: "Passport scan", domainId: dmap.admin, status: "active", metadata: { category: "identity" } });

  // ── Bi-directional links ──
  const debtJournal = await db.item.findFirst({ where: { title: "Stress about money" } });
  const debtProject = await db.project.findFirst({ where: { name: "Get out of Debt" } });
  const financialVision = await db.item.findFirst({ where: { title: "Financial peace" } });
  const halfGoal = await db.item.findFirst({ where: { title: "Run a half-marathon" } });
  const healthProject = await db.project.findFirst({ where: { name: "Health Transformation" } });
  if (debtJournal && financialVision) {
    await db.link.create({ data: { fromId: debtJournal.id, toId: financialVision.id, type: "related", note: "journal references the vision" } }).catch(() => {});
  }
  if (halfGoal && runHabit) {
    await db.link.create({ data: { fromId: halfGoal.id, toId: runHabit.id, type: "related", note: "habit supports this goal" } }).catch(() => {});
  }
  if (medHabit && writeHabit) {
    await db.link.create({ data: { fromId: medHabit.id, toId: writeHabit.id, type: "related" } }).catch(() => {});
  }

  // ── Reviews ──
  await db.review.create({
    data: {
      type: "daily",
      date: daysFromNow(-1, 21),
      status: "completed",
      wins: "Shipped the landing page hero section and had a great run.",
      challenges: "Got distracted by notifications in the afternoon.",
      learnings: "Deep work blocks need to be phone-free.",
      gratitude: "Grateful for my supportive partner and a warm apartment.",
      priorities: '["Finish Stripe integration","30-min run","Process inbox"]',
      mood: 4,
      energy: 3,
      notes: "Felt focused in the morning, drained by evening.",
    },
  });
  await db.review.create({
    data: {
      type: "daily",
      date: daysFromNow(-2, 21),
      status: "completed",
      wins: "Cooked a healthy dinner and meditated.",
      challenges: "Procrastinated on the email to landlord.",
      learnings: "Hard conversations get easier when scheduled.",
      gratitude: "Body felt strong during the workout.",
      priorities: '["Reply to landlord","Book flights","Read 20 pages"]',
      mood: 3,
      energy: 3,
    },
  });
  await db.review.create({
    data: {
      type: "weekly",
      date: daysFromNow(-4, 20),
      status: "completed",
      weekStart: daysFromNow(-10),
      weekEnd: daysFromNow(-4),
      wins: "Hit 5/7 meditation days, read 80 pages, got passport renewed.",
      challenges: "Overspent on takeout. Skipped two runs.",
      learnings: "Meal prep on Sunday makes the whole week smoother.",
      gratitude: "Grateful for Marcus's mentorship this week.",
      priorities: '["Launch landing page","Plan Japan itinerary","3 strength workouts"]',
      mood: 4,
      energy: 3,
      notes: "Good momentum overall. Need to tighten the budget.",
    },
  });

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
