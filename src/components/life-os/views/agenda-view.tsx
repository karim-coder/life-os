"use client";

import { useState, useMemo } from "react";
import { useCalendar, useItems } from "@/lib/hooks";
import { useLifeOS } from "@/store/life-os";
import { Icon } from "../icon";
import { PageHeader, SectionCard, EmptyState } from "../layout";
import { Button } from "@/components/ui/button";
import { ITEM_TYPE_MAP } from "@/lib/constants";
import {
  startOfWeek, addDays, format, isSameDay, isToday, addWeeks, subWeeks,
} from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function AgendaView() {
  const { openItemDetail } = useLifeOS();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const { data, isLoading } = useCalendar({
    from: weekStart.toISOString(),
    to: addDays(weekStart, 7).toISOString(),
  });

  const days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = addDays(weekStart, i);
      const key = format(date, "yyyy-MM-dd");
      const items = (data?.days?.[key] || []).sort((a: any, b: any) => {
        const da = new Date(a.dueDate || a.scheduledAt || a.startDate || 0).getTime();
        const db = new Date(b.dueDate || b.scheduledAt || b.startDate || 0).getTime();
        return da - db;
      });
      return { date, items };
    });
  }, [weekStart, data]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Weekly Agenda"
        subtitle="A calm, time-blocked view of your week. See everything ahead at a glance."
        icon="CalendarRange"
        color="#06b6d4"
        actions={
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekStart(subWeeks(weekStart, 1))}>
              <Icon name="ChevronLeft" className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-8" onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}>
              This week
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekStart(addWeeks(weekStart, 1))}>
              <Icon name="ChevronRight" className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      {/* week summary bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-gradient-to-r from-cyan-500/5 to-transparent p-4">
        <div>
          <p className="text-sm font-semibold">
            {format(weekStart, "MMM d")} – {format(addDays(weekStart, 6), "MMM d, yyyy")}
          </p>
          <p className="text-xs text-muted-foreground">
            {days.reduce((s, d) => s + d.items.length, 0)} items this week
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          {days.map((d, i) => (
            <div key={i} className="text-center">
              <div className={cn(
                "flex h-9 w-9 flex-col items-center justify-center rounded-lg text-xs",
                isToday(d.date) ? "bg-primary text-primary-foreground" : "bg-muted/50",
              )}>
                <span className="text-[9px] uppercase">{format(d.date, "EEEEE")}</span>
                <span className="text-sm font-bold leading-none">{format(d.date, "d")}</span>
              </div>
              {d.items.length > 0 && (
                <span className="mt-0.5 inline-block h-1 w-1 rounded-full bg-cyan-500" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 7-day columns */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {Array.from({ length: 7 }).map((_, i) => <div key={i} className="h-48 animate-pulse rounded-xl bg-muted/40" />)}
        </div>
      ) : days.every((d) => d.items.length === 0) ? (
        <EmptyState
          icon="CalendarRange"
          title="An open week"
          description="Nothing scheduled this week. Capture a thought or plan something meaningful."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {days.map((d, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cn(
                "flex flex-col rounded-2xl border p-3",
                isToday(d.date) ? "border-primary/40 bg-primary/5" : "border-border/60 bg-card/30",
              )}
            >
              {/* day header */}
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{format(d.date, "EEE")}</p>
                  <p className={cn("text-lg font-bold leading-none", isToday(d.date) && "text-primary")}>
                    {format(d.date, "d")}
                  </p>
                </div>
                {d.items.length > 0 && (
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                    {d.items.length}
                  </span>
                )}
              </div>

              {/* items */}
              <div className="flex-1 space-y-1.5">
                <AnimatePresence>
                  {d.items.length === 0 ? (
                    <p className="py-4 text-center text-[11px] text-muted-foreground/50">—</p>
                  ) : (
                    d.items.map((item: any) => {
                      const m = ITEM_TYPE_MAP[item.type] || { icon: "Circle", color: "#71717a", name: item.type };
                      const isDone = item.status === "done";
                      const timeField = item.dueDate || item.scheduledAt || item.startDate;
                      const time = timeField ? format(new Date(timeField), "HH:mm") : null;
                      return (
                        <motion.button
                          key={item.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          onClick={() => openItemDetail(item.id)}
                          className={cn(
                            "group flex w-full items-start gap-1.5 rounded-lg border-l-2 bg-background/60 p-1.5 text-left transition-all hover:bg-background hover:shadow-sm",
                            isDone && "opacity-50",
                          )}
                          style={{ borderColor: m.color }}
                        >
                          {time && (
                            <span className="mt-0.5 flex-shrink-0 text-[9px] font-semibold tabular-nums text-muted-foreground">
                              {time}
                            </span>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className={cn("text-[11px] font-medium leading-tight", isDone && "line-through")}>
                              {item.title}
                            </p>
                            {item.project && (
                              <span className="text-[9px]" style={{ color: item.project.color }}>
                                {item.project.name}
                              </span>
                            )}
                            {item.metadata?.amount != null && (
                              <span className="ml-1 text-[9px] font-semibold" style={{ color: item.metadata.kind === "income" ? "#10b981" : "#f43f5e" }}>
                                ${item.metadata.amount}
                              </span>
                            )}
                          </div>
                        </motion.button>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
