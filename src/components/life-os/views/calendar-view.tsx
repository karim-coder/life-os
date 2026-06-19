"use client";

import { useState, useMemo } from "react";
import { useLifeOS } from "@/store/life-os";
import { useCalendar } from "@/lib/hooks";
import { Icon } from "../icon";
import { PageHeader, SectionCard, EmptyState } from "../layout";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { ITEM_TYPES, ITEM_TYPE_MAP, DOMAINS, DOMAIN_MAP } from "@/lib/constants";
import { fmtDate, smartDate } from "@/lib/dates";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  isSameMonth, isSameDay, addMonths, subMonths, format,
} from "date-fns";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function CalendarView() {
  const { calendarLayers, toggleLayer, calendarLayerMode, setCalendarLayerMode, openItemDetail } = useLifeOS();
  const [cursor, setCursor] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());

  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const from = gridStart.toISOString();
  const to = gridEnd.toISOString();
  const layersParam = calendarLayers.length ? calendarLayers.join(",") : undefined;

  const { data, isLoading } = useCalendar({
    from,
    to,
    ...(layersParam ? { layers: layersParam, layerMode: calendarLayerMode } : {}),
  });

  const dayMap = useMemo(() => {
    const m: Record<string, any[]> = {};
    if (data?.days) {
      for (const [k, v] of Object.entries(data.days)) m[k] = v as any[];
    }
    return m;
  }, [data]);

  const layers = calendarLayerMode === "type" ? ITEM_TYPES.map((t) => ({ id: t.type, name: t.name, color: t.color, icon: t.icon })) : DOMAINS.map((d) => ({ id: d.key, name: d.name, color: d.color, icon: d.icon }));

  const selectedDayItems = selectedDay ? dayMap[format(selectedDay, "yyyy-MM-dd")] || [] : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Calendar"
        subtitle="Everything with a date — tasks, bills, appointments, birthdays — in one view."
        icon="CalendarDays"
        color="#06b6d4"
        actions={
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCursor(subMonths(cursor, 1))}>
              <Icon name="ChevronLeft" className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-8" onClick={() => { setCursor(new Date()); setSelectedDay(new Date()); }}>
              Today
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCursor(addMonths(cursor, 1))}>
              <Icon name="ChevronRight" className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Calendar grid */}
        <SectionCard className="overflow-hidden p-0">
          {/* Month header */}
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <h2 className="text-lg font-semibold">{format(cursor, "MMMM yyyy")}</h2>
            <span className="text-xs text-muted-foreground">
              {Object.values(dayMap).reduce((s, v) => s + v.length, 0)} items this view
            </span>
          </div>

          {/* Weekday header */}
          <div className="grid grid-cols-7 border-b border-border/60">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7">
            {isLoading ? (
              Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="min-h-[88px] border-b border-r border-border/40 p-1.5">
                  <div className="mb-1 h-5 w-5 animate-pulse rounded-full bg-muted/40" />
                  <div className="space-y-1">
                    <div className="h-3 w-full animate-pulse rounded bg-muted/30" />
                    {i % 3 === 0 && <div className="h-3 w-2/3 animate-pulse rounded bg-muted/30" />}
                  </div>
                </div>
              ))
            ) : days.map((day, i) => {
              const key = format(day, "yyyy-MM-dd");
              const items = dayMap[key] || [];
              const inMonth = isSameMonth(day, cursor);
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "min-h-[88px] border-b border-r border-border/40 p-1.5 text-left transition-colors hover:bg-muted/40",
                    !inMonth && "bg-muted/20 opacity-50",
                    (i + 1) % 7 === 0 && "border-r-0",
                    isSelected && "bg-primary/5 ring-1 ring-inset ring-primary/30",
                  )}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-xs",
                        isToday ? "bg-primary font-bold text-primary-foreground" : "text-muted-foreground",
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    {items.length > 3 && (
                      <span className="text-[9px] text-muted-foreground">+{items.length - 3}</span>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    {items.slice(0, 3).map((it, idx) => {
                      const m = ITEM_TYPE_MAP[it.type] || { color: "#71717a", icon: "Circle" };
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-1 rounded px-1 py-0.5 text-[10px] font-medium"
                          style={{ background: `${m.color}1a`, color: m.color }}
                        >
                          <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: m.color }} />
                          <span className="truncate">{it.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </button>
              );
            })}
          </div>
        </SectionCard>

        {/* Right column: layers + selected day */}
        <div className="space-y-6">
          {/* Layers */}
          <SectionCard title="Layers" icon="Layers">
            <div className="mb-3 flex gap-1 rounded-lg bg-muted p-1">
              <button
                onClick={() => setCalendarLayerMode("type")}
                className={cn("flex-1 rounded-md py-1 text-xs font-medium transition-all", calendarLayerMode === "type" ? "bg-background shadow-sm" : "text-muted-foreground")}
              >
                By type
              </button>
              <button
                onClick={() => setCalendarLayerMode("domain")}
                className={cn("flex-1 rounded-md py-1 text-xs font-medium transition-all", calendarLayerMode === "domain" ? "bg-background shadow-sm" : "text-muted-foreground")}
              >
                By domain
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {layers.map((l) => {
                const on = calendarLayers.includes(l.id);
                return (
                  <button
                    key={l.id}
                    onClick={() => toggleLayer(l.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-all",
                      on ? "border-transparent text-white" : "border-border/60 text-muted-foreground hover:bg-muted",
                    )}
                    style={on ? { background: l.color } : {}}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ background: on ? "white" : l.color }} />
                    {l.name}
                  </button>
                );
              })}
              {calendarLayers.length > 0 && (
                <button onClick={() => calendarLayers.forEach(toggleLayer)} className="text-xs text-muted-foreground underline">
                  clear
                </button>
              )}
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              {calendarLayers.length === 0 ? "Showing all layers" : `Filtering to ${calendarLayers.length} layer${calendarLayers.length > 1 ? "s" : ""}`}
            </p>
          </SectionCard>

          {/* Selected day detail */}
          <SectionCard
            title={selectedDay ? format(selectedDay, "EEEE, MMM d") : "Select a day"}
            icon="CalendarClock"
          >
            {selectedDayItems.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Nothing scheduled.</p>
            ) : (
              <div className="max-h-96 space-y-2 overflow-y-auto">
                {selectedDayItems.map((it) => {
                  const m = ITEM_TYPE_MAP[it.type] || { color: "#71717a", icon: "Circle", name: it.type };
                  return (
                    <motion.button
                      key={it.id}
                      layout
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => openItemDetail(it.id)}
                      className="flex w-full items-start gap-2.5 rounded-lg p-2 text-left transition-colors hover:bg-muted/50"
                    >
                      <span
                        className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
                        style={{ background: `${m.color}1a`, color: m.color }}
                      >
                        <Icon name={m.icon} className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{it.title}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {m.name}
                          {it._dateField === "due" ? " · due" : it._dateField === "scheduled" ? " · scheduled" : ""}
                          {it.metadata?.amount ? ` · $${it.metadata.amount}` : ""}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
