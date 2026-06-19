"use client";

import { useOnThisDay } from "@/lib/hooks";
import { useLifeOS } from "@/store/life-os";
import { Icon } from "./icon";
import { motion } from "framer-motion";
import { fmtDate } from "@/lib/dates";
import { ITEM_TYPE_MAP } from "@/lib/constants";

export function OnThisDay() {
  const { data, isLoading } = useOnThisDay();
  const { openItemDetail } = useLifeOS();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card/40 p-4">
        <div className="h-4 w-24 animate-pulse rounded bg-muted/50" />
        <div className="mt-3 space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-muted/40" />
          ))}
        </div>
      </div>
    );
  }

  const journals = data?.journals || [];
  const reviews = data?.reviews || [];
  const completed = data?.completed || [];
  const total = journals.length + reviews.length + completed.length;

  if (total === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-card/30 p-4 text-center">
        <Icon name="CalendarHeart" className="mx-auto mb-1.5 h-5 w-5 text-muted-foreground/50" />
        <p className="text-xs font-medium text-muted-foreground">No memories on this day yet</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground/70">Keep journaling — future you will thank you.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent p-4"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600">
          <Icon name="CalendarHeart" className="h-3.5 w-3.5" />
        </span>
        <div>
          <h3 className="text-sm font-semibold">On this day</h3>
          <p className="text-[10px] text-muted-foreground">{total} memor{total === 1 ? "y" : "ies"} from the past</p>
        </div>
      </div>

      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {journals.map((j: any, i: number) => {
          const yearsAgo = new Date().getFullYear() - new Date(j.scheduledAt || j.createdAt).getFullYear();
          return (
            <motion.button
              key={j.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => openItemDetail(j.id)}
              className="group block w-full rounded-lg border border-border/40 bg-background/60 p-2.5 text-left transition-all hover:border-border hover:bg-background"
            >
              <div className="mb-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Icon name="BookHeart" className="h-3 w-3 text-violet-500" />
                <span>{yearsAgo} year{yearsAgo !== 1 ? "s" : ""} ago · {fmtDate(j.scheduledAt || j.createdAt, "MMM d")}</span>
              </div>
              <p className="line-clamp-1 text-xs font-medium">{j.title}</p>
              {j.content && <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">{j.content}</p>}
            </motion.button>
          );
        })}

        {reviews.map((r: any, i: number) => {
          const yearsAgo = new Date().getFullYear() - new Date(r.date).getFullYear();
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (journals.length + i) * 0.05 }}
              className="rounded-lg border border-border/40 bg-background/60 p-2.5"
            >
              <div className="mb-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Icon name="NotebookPen" className="h-3 w-3 text-amber-500" />
                <span>{yearsAgo} year{yearsAgo !== 1 ? "s" : ""} ago · {r.type} review</span>
                {r.mood && <span className="ml-auto" style={{ color: ["", "#f43f5e", "#f59e0b", "#eab308", "#10b981", "#06b6d4"][r.mood] }}>
                  <Icon name={["", "Frown", "Meh", "Smile", "SmilePlus", "Laugh"][r.mood] || "Smile"} className="h-3.5 w-3.5" />
                </span>}
              </div>
              {r.wins && <p className="line-clamp-2 text-xs text-muted-foreground">{r.wins}</p>}
            </motion.div>
          );
        })}

        {completed.map((c: any, i: number) => {
          const yearsAgo = new Date().getFullYear() - new Date(c.completedAt).getFullYear();
          const m = ITEM_TYPE_MAP[c.type] || { icon: "Check", color: "#10b981" };
          return (
            <motion.button
              key={c.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (journals.length + reviews.length + i) * 0.05 }}
              onClick={() => openItemDetail(c.id)}
              className="group flex w-full items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-left transition-all hover:bg-emerald-500/10"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-600">
                <Icon name={m.icon} className="h-3 w-3" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-xs font-medium">{c.title}</p>
                <p className="text-[10px] text-muted-foreground">{yearsAgo} year{yearsAgo !== 1 ? "s" : ""} ago · completed</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
