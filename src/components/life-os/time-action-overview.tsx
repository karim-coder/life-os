"use client";

import { useItems, useStats } from "@/lib/hooks";
import { useLifeOS } from "@/store/life-os";
import { Icon } from "./icon";
import { motion } from "framer-motion";
import { smartDate, dateColor } from "@/lib/dates";
import { cn } from "@/lib/utils";

const ENERGY_META = [
  { value: 0, name: "Any", color: "#71717a", icon: "Circle" },
  { value: 1, name: "Low", color: "#3b82f6", icon: "BatteryLow" },
  { value: 2, name: "Medium", color: "#eab308", icon: "BatteryMedium" },
  { value: 3, name: "High", color: "#f43f5e", icon: "BatteryFull" },
];

export function TimeActionOverview() {
  const { data: stats } = useStats();
  const { data } = useItems({ type: "task,habit", status: "active,done" });
  const { openItemDetail, openItemEditor } = useLifeOS();

  const items = data?.items || [];
  const tasks = items.filter((i: any) => i.type === "task");
  const habits = items.filter((i: any) => i.type === "habit");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endToday = new Date(today);
  endToday.setHours(23, 59, 59, 999);

  const overdue = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < today && t.status !== "done");
  const dueToday = tasks.filter((t) => t.dueDate && new Date(t.dueDate) >= today && new Date(t.dueDate) <= endToday);
  const upcoming = tasks.filter((t) => t.dueDate && new Date(t.dueDate) > endToday)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);
  const doneToday = tasks.filter((t) => t.completedAt && new Date(t.completedAt) >= today);

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-dashed border-border/60 bg-card/30 p-4"
      >
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600">
            <Icon name="Hourglass" className="h-3.5 w-3.5" />
          </span>
          <h3 className="text-sm font-semibold">Today's actions</h3>
        </div>
        <p className="text-xs text-muted-foreground">Plan your day with tasks and habits matched to your energy.</p>
        <button
          onClick={() => openItemEditor({ type: "task" })}
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-amber-600 hover:underline"
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
      {/* Today summary */}
      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600">
              <Icon name="Hourglass" className="h-3.5 w-3.5" />
            </span>
            <div>
              <h3 className="text-sm font-semibold">Today</h3>
              <p className="text-[10px] text-muted-foreground">
                {doneToday.length} done · {dueToday.length} due · {overdue.length} overdue
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {doneToday.length > 0 && (
              <div className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5">
                <Icon name="Check" className="h-3 w-3 text-emerald-600" />
                <span className="text-[11px] font-bold text-emerald-600">{doneToday.length}</span>
              </div>
            )}
            {overdue.length > 0 && (
              <div className="flex items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5">
                <Icon name="AlertTriangle" className="h-3 w-3 text-rose-500" />
                <span className="text-[11px] font-bold text-rose-500">{overdue.length}</span>
              </div>
            )}
          </div>
        </div>

        {/* Overdue */}
        {overdue.length > 0 && (
          <div className="mb-2">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-rose-500">Overdue</p>
            <div className="space-y-1">
              {overdue.slice(0, 3).map((t, i) => (
                <TaskRow key={t.id} task={t} delay={i * 0.04} onClick={() => openItemDetail(t.id)} />
              ))}
            </div>
          </div>
        )}

        {/* Due today */}
        {dueToday.length > 0 && (
          <div className="mb-2">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-amber-600">Due today</p>
            <div className="space-y-1">
              {dueToday.slice(0, 4).map((t, i) => (
                <TaskRow key={t.id} task={t} delay={(overdue.length + i) * 0.04} onClick={() => openItemDetail(t.id)} />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Coming up</p>
            <div className="space-y-1">
              {upcoming.map((t, i) => (
                <TaskRow key={t.id} task={t} delay={(overdue.length + dueToday.length + i) * 0.04} onClick={() => openItemDetail(t.id)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Habits row */}
      {habits.length > 0 && (
        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent p-3">
          <h4 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
            <Icon name="Repeat" className="h-3 w-3" />
            Habits this week
          </h4>
          <div className="space-y-1.5">
            {habits.slice(0, 4).map((h, i) => {
              const habitStats = stats?.habitStats?.find((hs: any) => hs.id === h.id);
              const doneThisWeek = habitStats?.doneThisWeek || 0;
              const streak = h.metadata?.streak || 0;
              return (
                <motion.button
                  key={h.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => openItemDetail(h.id)}
                  className="group flex w-full items-center gap-2"
                >
                  <span className="flex-1 truncate text-xs font-medium">{h.title}</span>
                  {/* 7-day dots */}
                  <div className="flex gap-0.5">
                    {Array.from({ length: 7 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="h-2 w-2 rounded-full"
                        style={{ background: idx < doneThisWeek ? "#10b981" : "var(--muted)" }}
                      />
                    ))}
                  </div>
                  {streak > 0 && (
                    <span className="flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
                      <Icon name="Flame" className="h-2.5 w-2.5" />
                      {streak}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function TaskRow({ task, delay, onClick }: { task: any; delay: number; onClick: () => void }) {
  const energyMeta = ENERGY_META[task.energy || 0] || ENERGY_META[0];
  const isDone = task.status === "done";
  return (
    <motion.button
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      onClick={onClick}
      className="group flex w-full items-center gap-2 rounded-lg border border-border/40 bg-background/40 p-2 text-left transition-all hover:bg-background"
    >
      <span className={cn(
        "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all",
        isDone ? "border-emerald-500 bg-emerald-500 text-white" : "border-muted-foreground/30",
      )}>
        {isDone && <Icon name="Check" className="h-3 w-3" strokeWidth={3} />}
      </span>
      <span className={cn("flex-1 truncate text-xs font-medium", isDone && "text-muted-foreground line-through")}>
        {task.title}
      </span>
      {task.priority > 0 && (
        <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: ["#71717a", "#3b82f6", "#eab308", "#f59e0b", "#f43f5e"][task.priority] }} />
      )}
      {task.dueDate && (
        <span className={cn("flex-shrink-0 text-[10px]", dateColor(task.dueDate))}>{smartDate(task.dueDate)}</span>
      )}
    </motion.button>
  );
}
