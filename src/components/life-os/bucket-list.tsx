"use client";

import { useItems, useUpdateItem } from "@/lib/hooks";
import { useLifeOS } from "@/store/life-os";
import { Icon } from "./icon";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/toast";

export function BucketList() {
  const { data } = useItems({ type: "goal,milestone", status: "active,done" });
  const { openItemDetail, openItemEditor } = useLifeOS();
  const update = useUpdateItem();

  const items = data?.items || [];
  const goals = items.filter((i: any) => i.type === "goal");
  const milestones = items.filter((i: any) => i.type === "milestone");

  const completed = items.filter((i: any) => i.status === "done");
  const active = items.filter((i: any) => i.status !== "done");
  const completionPct = items.length > 0 ? Math.round((completed.length / items.length) * 100) : 0;

  if (items.length === 0) {
    return null; // Don't show empty state — IdeaVault already handles that
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/15 text-purple-500">
            <Icon name="ListChecks" className="h-3.5 w-3.5" />
          </span>
          <div>
            <h3 className="text-sm font-semibold">Bucket list</h3>
            <p className="text-[10px] text-muted-foreground">
              {completed.length} done · {active.length} to go
            </p>
          </div>
        </div>
        <span className="text-sm font-bold text-purple-500">{completionPct}%</span>
      </div>

      {/* Progress bar */}
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${completionPct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-500"
        />
      </div>

      <div className="space-y-1.5">
        <AnimatePresence>
          {active.slice(0, 5).map((item: any, i: number) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              transition={{ delay: i * 0.04 }}
              className="group flex w-full items-center gap-2 rounded-lg border border-border/40 bg-background/40 p-2 transition-all hover:border-purple-500/30 hover:bg-background"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  update.mutate({ id: item.id, status: "done" });
                  notify.success("Achieved!");
                }}
                className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 border-purple-400/50 transition-all hover:border-purple-500 hover:bg-purple-500/10"
                title="Mark as done"
              >
                <Icon name="Check" className="h-3 w-3 text-transparent transition-colors group-hover:text-purple-500" />
              </button>
              <button
                onClick={() => openItemDetail(item.id)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{item.title}</p>
                  {item.metadata?.measure && (
                    <p className="text-[10px] text-muted-foreground">{item.metadata.measure}</p>
                  )}
                </div>
                {item.dueDate && (
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(item.dueDate).getFullYear()}
                  </span>
                )}
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Completed items */}
        {completed.length > 0 && (
          <div className="mt-2 border-t border-border/30 pt-2">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-500">
              Achieved ({completed.length})
            </p>
            <div className="space-y-0.5">
              {completed.slice(0, 3).map((item: any, i: number) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => openItemDetail(item.id)}
                  className="flex w-full items-center gap-2 rounded-lg p-1.5 text-left transition-all hover:bg-muted/40"
                >
                  <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Icon name="Check" className="h-2.5 w-2.5" strokeWidth={3} />
                  </span>
                  <span className="flex-1 truncate text-xs font-medium text-muted-foreground line-through">
                    {item.title}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => openItemEditor({ type: "goal" })}
        className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-border/40 py-1.5 text-[11px] font-medium text-muted-foreground transition-all hover:border-purple-500/40 hover:text-purple-500"
      >
        <Icon name="Plus" className="h-3 w-3" />
        Add to bucket list
      </button>
    </motion.div>
  );
}
