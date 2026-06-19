"use client";

import { useItems } from "@/lib/hooks";
import { useLifeOS } from "@/store/life-os";
import { Icon } from "./icon";
import { motion } from "framer-motion";
import { smartDate, dateColor } from "@/lib/dates";
import { cn } from "@/lib/utils";

export function AdminQuickActions() {
  const { data } = useItems({ type: "task,document", status: "active,done" });
  const { openItemDetail, openItemEditor } = useLifeOS();

  const items = data?.items || [];
  const tasks = items.filter((i: any) => i.type === "task");
  const documents = items.filter((i: any) => i.type === "document");

  // Maintenance tasks (home-related)
  const maintenance = tasks.filter((t: any) =>
    /filter|hvac|repair|fix|replace|clean|inspect|maintenance/i.test(t.title)
  );
  // Grocery/shopping tasks
  const groceries = tasks.filter((t: any) => /grocery|groceries|buy|shopping|list/i.test(t.title));
  // Other admin tasks
  const otherTasks = tasks.filter((t: any) => !maintenance.includes(t) && !groceries.includes(t));

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-dashed border-border/60 bg-card/30 p-4"
      >
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-500/15 text-zinc-600">
            <Icon name="Home" className="h-3.5 w-3.5" />
          </span>
          <h3 className="text-sm font-semibold">Home & Admin</h3>
        </div>
        <p className="text-xs text-muted-foreground">Track home maintenance, grocery lists, and important documents.</p>
        <button
          onClick={() => openItemEditor({ type: "task" })}
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-zinc-600 hover:underline"
        >
          <Icon name="Plus" className="h-3 w-3" /> Add a task
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Grocery list */}
      {groceries.length > 0 && (
        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600">
              <Icon name="ShoppingCart" className="h-3.5 w-3.5" />
            </span>
            <h3 className="text-sm font-semibold">Shopping list</h3>
          </div>
          <div className="space-y-1">
            {groceries.map((g: any, i: number) => (
              <motion.button
                key={g.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => openItemDetail(g.id)}
                className="group flex w-full items-center gap-2 rounded-lg p-2 text-left transition-all hover:bg-background/60"
              >
                <span className={cn(
                  "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all",
                  g.status === "done" ? "border-emerald-500 bg-emerald-500 text-white" : "border-muted-foreground/30"
                )}>
                  {g.status === "done" && <Icon name="Check" className="h-3 w-3" strokeWidth={3} />}
                </span>
                <span className={cn("flex-1 text-xs font-medium", g.status === "done" && "text-muted-foreground line-through")}>
                  {g.title}
                </span>
                {g.dueDate && (
                  <span className={cn("text-[10px]", dateColor(g.dueDate))}>{smartDate(g.dueDate)}</span>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {/* Home maintenance */}
        {maintenance.length > 0 && (
          <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent p-3">
            <h4 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-600">
              <Icon name="Wrench" className="h-3 w-3" />
              Maintenance
            </h4>
            <div className="space-y-1">
              {maintenance.slice(0, 4).map((m: any) => (
                <button
                  key={m.id}
                  onClick={() => openItemDetail(m.id)}
                  className="flex w-full items-center gap-2 rounded-lg p-1.5 text-left transition-all hover:bg-muted/40"
                >
                  <span className={cn(
                    "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2",
                    m.status === "done" ? "border-emerald-500 bg-emerald-500 text-white" : "border-amber-500/40"
                  )}>
                    {m.status === "done" && <Icon name="Check" className="h-2.5 w-2.5" strokeWidth={3} />}
                  </span>
                  <span className={cn("flex-1 truncate text-xs font-medium", m.status === "done" && "text-muted-foreground line-through")}>
                    {m.title}
                  </span>
                  {m.dueDate && <span className={cn("text-[10px]", dateColor(m.dueDate))}>{smartDate(m.dueDate)}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Documents */}
        {documents.length > 0 && (
          <div className="rounded-2xl border border-border/50 bg-card/30 p-3">
            <h4 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Icon name="FileText" className="h-3 w-3" />
              Documents
            </h4>
            <div className="space-y-1">
              {documents.slice(0, 4).map((d: any) => (
                <button
                  key={d.id}
                  onClick={() => openItemDetail(d.id)}
                  className="flex w-full items-center gap-2 rounded-lg p-1.5 text-left transition-all hover:bg-muted/40"
                >
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-zinc-500/10 text-zinc-600">
                    <Icon name="FileText" className="h-3 w-3" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{d.title}</p>
                    {d.metadata?.category && <p className="text-[10px] text-muted-foreground">{d.metadata.category}</p>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Other admin tasks */}
      {otherTasks.length > 0 && (
        <div className="rounded-2xl border border-border/50 bg-card/30 p-3">
          <h4 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Icon name="ClipboardList" className="h-3 w-3" />
            Other tasks
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {otherTasks.slice(0, 6).map((t: any) => (
              <button
                key={t.id}
                onClick={() => openItemDetail(t.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs transition-all",
                  t.status === "done"
                    ? "border-emerald-500/20 bg-emerald-500/5 text-muted-foreground line-through"
                    : "border-border/40 bg-background/40 hover:bg-background"
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", t.status === "done" ? "bg-emerald-500" : "bg-zinc-400")} />
                {t.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
