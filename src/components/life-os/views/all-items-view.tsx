"use client";

import { useState } from "react";
import { useLifeOS } from "@/store/life-os";
import { useItems } from "@/lib/hooks";
import { Icon } from "../icon";
import { PageHeader, EmptyState } from "../layout";
import { ItemCard } from "../item-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ITEM_TYPES, ITEM_TYPE_MAP, DOMAINS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function AllItemsView() {
  const { openItemDetail, openItemEditor } = useLifeOS();
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("active");

  const { data, isLoading } = useItems({
    ...(q ? { q } : {}),
    ...(typeFilter ? { type: typeFilter } : {}),
    status: statusFilter,
  });
  const items = data?.items || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Items"
        subtitle="The full stream of your digital brain — every task, note, journal, habit, and idea."
        icon="Layers"
        color="#71717a"
        actions={
          <Button onClick={() => openItemEditor()} className="gap-1.5">
            <Icon name="Plus" className="h-4 w-4" /> New item
          </Button>
        }
      />

      {/* Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Icon name="Search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title or content…" className="pl-9" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            {["active", "done", "inbox", "archived", "all"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s === "all" ? "active,done,archived,inbox,snoozed" : s)}
                className={cn("rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-all", statusFilter === s || (s === "all" && statusFilter.includes(",")) ? "bg-background shadow-sm" : "text-muted-foreground")}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setTypeFilter(null)}
            className={cn("rounded-full px-2.5 py-1 text-xs font-medium transition-all", !typeFilter ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70")}
          >
            All types
          </button>
          {ITEM_TYPES.map((t) => {
            const on = typeFilter === t.type;
            return (
              <button
                key={t.type}
                onClick={() => setTypeFilter(t.type)}
                className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all", on ? "text-white" : "bg-muted text-muted-foreground hover:bg-muted/70")}
                style={on ? { background: t.color } : {}}
              >
                <Icon name={t.icon} className="h-3 w-3" />
                {t.name}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/40" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState icon="Layers" title="No items match" description="Try clearing filters or capturing something new." />
      ) : (
        <>
          <p className="text-xs text-muted-foreground">{items.length} item{items.length !== 1 ? "s" : ""}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} showProject onClick={() => openItemDetail(item.id)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
