"use client";

import { useItems } from "@/lib/hooks";
import { useLifeOS } from "@/store/life-os";
import { Icon } from "./icon";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function ReadingTracker() {
  const { data } = useItems({ type: "bookmark", status: "active,done" });
  const { openItemDetail, openItemEditor } = useLifeOS();

  const books = (data?.items || []).filter((b: any) => b.metadata?.medium === "book");
  const reading = books.filter((b: any) => b.metadata?.status === "reading");
  const queued = books.filter((b: any) => b.metadata?.status === "queued");
  const finished = books.filter((b: any) => b.metadata?.status === "finished" || b.status === "done");

  if (books.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-dashed border-border/60 bg-card/30 p-4"
      >
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/15 text-blue-500">
            <Icon name="BookOpen" className="h-3.5 w-3.5" />
          </span>
          <h3 className="text-sm font-semibold">Reading list</h3>
        </div>
        <p className="text-xs text-muted-foreground">Track books you're reading, queue what's next, and rate what you finish.</p>
        <button
          onClick={() => openItemEditor({ type: "bookmark" })}
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-500 hover:underline"
        >
          <Icon name="Plus" className="h-3 w-3" /> Add a book
        </button>
      </motion.div>
    );
  }

  const completionPct = books.length > 0 ? Math.round((finished.length / books.length) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/15 text-blue-500">
            <Icon name="BookOpen" className="h-3.5 w-3.5" />
          </span>
          <div>
            <h3 className="text-sm font-semibold">Reading list</h3>
            <p className="text-[10px] text-muted-foreground">
              {finished.length} finished · {reading.length} reading · {queued.length} queued
            </p>
          </div>
        </div>
        <span className="text-sm font-bold text-blue-500">{completionPct}%</span>
      </div>

      <Progress value={completionPct} className="mb-3 h-1.5" />

      <div className="space-y-2">
        {/* Currently reading */}
        {reading.length > 0 && (
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-blue-500">Currently reading</p>
            {reading.map((b: any, i: number) => (
              <motion.button
                key={b.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => openItemDetail(b.id)}
                className="group mb-1 flex w-full items-start gap-2.5 rounded-lg border border-blue-500/20 bg-blue-500/5 p-2.5 text-left transition-all hover:bg-blue-500/10"
              >
                <Icon name="BookOpen" className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">{b.title}</p>
                  {b.metadata?.author && <p className="text-[10px] text-muted-foreground">{b.metadata.author}</p>}
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {/* Up next */}
        {queued.length > 0 && (
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Up next</p>
            {queued.slice(0, 3).map((b: any, i: number) => (
              <motion.button
                key={b.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (reading.length + i) * 0.05 }}
                onClick={() => openItemDetail(b.id)}
                className="group flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition-all hover:bg-muted/40"
              >
                <Icon name="Bookmark" className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{b.title}</p>
                  {b.metadata?.author && <p className="text-[10px] text-muted-foreground">{b.metadata.author}</p>}
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {/* Recently finished */}
        {finished.length > 0 && (
          <div>
            <p className="mb-1 mt-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-500">Finished</p>
            {finished.slice(0, 2).map((b: any, i: number) => (
              <motion.button
                key={b.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (reading.length + queued.length + i) * 0.05 }}
                onClick={() => openItemDetail(b.id)}
                className="group flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition-all hover:bg-muted/40"
              >
                <Icon name="Check" className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium line-through opacity-60">{b.title}</p>
                </div>
                {b.metadata?.rating && (
                  <span className="flex items-center gap-0.5 text-[10px] text-amber-500">
                    <Icon name="Star" className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                    {b.metadata.rating}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
