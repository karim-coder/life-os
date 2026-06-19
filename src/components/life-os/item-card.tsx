"use client";

import { cn } from "@/lib/utils";
import { Icon } from "./icon";
import { ITEM_TYPE_MAP, DOMAIN_MAP, PRIORITY_META } from "@/lib/constants";
import { smartDate, dateColor } from "@/lib/dates";
import { useUpdateItem } from "@/lib/hooks";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface ItemCardProps {
  item: any;
  onClick?: () => void;
  compact?: boolean;
  showProject?: boolean;
  className?: string;
}

export function ItemCard({ item, onClick, compact, showProject, className }: ItemCardProps) {
  const update = useUpdateItem();
  const typeMeta = ITEM_TYPE_MAP[item.type] || { icon: "Circle", color: "#71717a", name: item.type };
  const domain = item.domainId ? DOMAIN_MAP[item.domainId] : null;
  const completable = typeMeta.completable || item.type === "task";
  const done = item.status === "done";

  function toggleDone(e: React.MouseEvent) {
    e.stopPropagation();
    update.mutate({ id: item.id, status: done ? "active" : "done" });
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      onClick={onClick}
      className={cn(
        "group relative flex items-start gap-3 rounded-xl border border-border/60 bg-card/60 p-3 transition-all hover:border-border hover:bg-card hover:shadow-sm cursor-pointer",
        done && "opacity-55",
        className,
      )}
    >
      {/* type accent stripe */}
      <span className="absolute left-0 top-3 bottom-3 w-1 rounded-full" style={{ background: typeMeta.color }} />

      {/* checkbox or type icon */}
      <div className="ml-1.5 flex-shrink-0 pt-0.5">
        {completable ? (
          <button onClick={toggleDone} className="flex h-5 w-5 items-center justify-center" aria-label="toggle complete">
            <div
              className={cn(
                "flex h-[18px] w-[18px] items-center justify-center rounded-md border-2 transition-all",
                done ? "border-transparent text-white" : "border-muted-foreground/40 hover:border-foreground/60",
              )}
              style={done ? { background: typeMeta.color } : {}}
            >
              {done && <Icon name="Check" className="h-3 w-3" strokeWidth={3} />}
            </div>
          </button>
        ) : (
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ background: `${typeMeta.color}1a`, color: typeMeta.color }}
          >
            <Icon name={typeMeta.icon} className="h-3.5 w-3.5" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4
            className={cn(
              "text-sm font-medium leading-snug",
              done && "line-through text-muted-foreground",
            )}
          >
            {item.title}
          </h4>
          {item.priority > 0 && (
            <span
              className="mt-0.5 flex-shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{ background: `${PRIORITY_META[item.priority]?.color}1a`, color: PRIORITY_META[item.priority]?.color }}
            >
              {PRIORITY_META[item.priority]?.name}
            </span>
          )}
        </div>

        {!compact && item.content && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.content}</p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {(item.dueDate || item.scheduledAt) && (
            <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium", dateColor(item.dueDate || item.scheduledAt))}>
              <Icon name="CalendarClock" className="h-3 w-3" />
              {smartDate(item.dueDate || item.scheduledAt)}
            </span>
          )}
          {domain && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <span className="h-2 w-2 rounded-full" style={{ background: domain.color }} />
              {domain.short}
            </span>
          )}
          {showProject && item.project && (
            <span
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium"
              style={{ background: `${item.project.color}1a`, color: item.project.color }}
            >
              <Icon name="Folder" className="h-2.5 w-2.5" />
              {item.project.name}
            </span>
          )}
          {item.tags?.length > 0 &&
            item.tags.slice(0, 3).map((t: any) => (
              <span
                key={t.tag.id}
                className="rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                style={{ background: `${t.tag.color}1a`, color: t.tag.color }}
              >
                #{t.tag.name}
              </span>
            ))}
          {item.metadata?.amount != null && (
            <span className="text-[11px] font-semibold" style={{ color: item.metadata.kind === "income" ? "#10b981" : "#f43f5e" }}>
              {item.metadata.kind === "income" ? "+" : "−"}${Number(item.metadata.amount).toLocaleString()}
            </span>
          )}
          {item.metadata?.rating && (
            <span className="inline-flex items-center gap-0.5 text-[11px] text-amber-500">
              <Icon name="Star" className="h-3 w-3 fill-amber-400 text-amber-400" />
              {item.metadata.rating}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function ItemCardList({ items, showProject }: { items: any[]; showProject?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} showProject={showProject} />
      ))}
    </div>
  );
}
