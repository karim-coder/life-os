import { db } from "@/lib/db";
import { ok, bad, parseBody } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/backup — full database export as JSON
export async function GET() {
  const [domains, projects, items, links, tags, reviews, habitLogs] = await Promise.all([
    db.domain.findMany(),
    db.project.findMany(),
    db.item.findMany({ include: { tags: { include: { tag: true } } } }),
    db.link.findMany(),
    db.tag.findMany(),
    db.review.findMany(),
    db.habitLog.findMany(),
  ]);

  return ok({
    version: 1,
    exportedAt: new Date().toISOString(),
    domains,
    projects,
    items: items.map((i) => ({ ...i, metadata: i.metadata })),
    links,
    tags,
    reviews,
    habitLogs,
  });
}

// POST /api/backup — restore from JSON backup
export async function POST(req: Request) {
  const body = await parseBody(req);
  if (!body || !body.version) return bad("Invalid backup file");

  try {
    // Clear existing data (except users)
    await db.habitLog.deleteMany();
    await db.reviewItem.deleteMany();
    await db.review.deleteMany();
    await db.link.deleteMany();
    await db.tagOnItem.deleteMany();
    await db.tag.deleteMany();
    await db.item.deleteMany();
    await db.project.deleteMany();
    await db.domain.deleteMany();

    // Restore domains
    if (body.domains) {
      for (const d of body.domains) {
        await db.domain.create({ data: { ...d, items: undefined, projects: undefined } });
      }
    }

    // Restore tags
    if (body.tags) {
      for (const t of body.tags) {
        await db.tag.create({ data: { ...t, items: undefined } });
      }
    }

    // Restore projects
    if (body.projects) {
      for (const p of body.projects) {
        await db.project.create({ data: { ...p, items: undefined, domain: undefined } });
      }
    }

    // Restore items
    if (body.items) {
      for (const i of body.items) {
        const { tags, domain, project, ...itemData } = i;
        await db.item.create({ data: itemData });
      }
    }

    // Restore links
    if (body.links) {
      for (const l of body.links) {
        await db.link.create({ data: l });
      }
    }

    // Restore reviews
    if (body.reviews) {
      for (const r of body.reviews) {
        const { items, ...reviewData } = r;
        await db.review.create({ data: reviewData });
      }
    }

    // Restore habit logs
    if (body.habitLogs) {
      for (const h of body.habitLogs) {
        await db.habitLog.create({ data: h });
      }
    }

    return ok({ success: true, message: "Backup restored successfully" });
  } catch (e: any) {
    return bad(`Restore failed: ${e.message}`, 500);
  }
}
