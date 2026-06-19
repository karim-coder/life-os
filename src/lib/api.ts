// Life OS — shared server-side helpers
import { NextResponse } from "next/server";

export function ok(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export function notFound(msg = "Not found") {
  return NextResponse.json({ error: msg }, { status: 404 });
}

// Parse JSON body safely
export async function parseBody<T = any>(req: Request): Promise<T> {
  try {
    const text = await req.text();
    if (!text) return {} as T;
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

export function parseMeta(item: any) {
  if (!item) return item;
  let metadata: any = null;
  try {
    metadata = item.metadata ? JSON.parse(item.metadata) : null;
  } catch {
    metadata = null;
  }
  return { ...item, metadata };
}

export function parseListMeta(items: any[]) {
  return items.map(parseMeta);
}
