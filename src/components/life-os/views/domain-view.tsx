"use client";

import { useLifeOS } from "@/store/life-os";
import { useItems, useDomains } from "@/lib/hooks";
import { Icon } from "../icon";
import { PageHeader, SectionCard, EmptyState } from "../layout";
import { ItemCard } from "../item-card";
import { Button } from "@/components/ui/button";
import { DOMAINS, ITEM_TYPES, ITEM_TYPE_MAP } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";
import { FollowUpDue } from "../follow-up-due";
import { ReadingTracker } from "../reading-tracker";
import { HealthOverview } from "../health-overview";
import { SubscriptionsOverview } from "../subscriptions-overview";
import { IdeaVault } from "../idea-vault";
import { BucketList } from "../bucket-list";
import { AdminQuickActions } from "../admin-quick-actions";
import { TimeActionOverview } from "../time-action-overview";

export function DomainView({ domainKey }: { domainKey: string }) {
  const { openItemDetail, openItemEditor } = useLifeOS();
  const { data: domData } = useDomains();
  const domainMeta = DOMAINS.find((d) => d.key === domainKey)!;
  const domainRecord = domData?.domains?.find((d: any) => d.key === domainKey);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const { data, isLoading } = useItems({ domain: domainRecord?.id || domainKey, status: "active,done" });
  const items = data?.items || [];

  // group by type
  const byType: Record<string, any[]> = {};
  for (const it of items) (byType[it.type] ||= []).push(it);
  const types = Object.keys(byType).sort((a, b) => byType[b].length - byType[a].length);

  const filteredItems = typeFilter ? byType[typeFilter] || [] : items;

  // domain-specific quick-add types
  const quickTypes: Record<string, string[]> = {
    mind_soul: ["journal", "affirmation", "vision", "habit"],
    time_action: ["task", "habit", "routine", "goal"],
    health: ["symptom", "medication", "habit", "event", "task"],
    wealth: ["finance", "task", "goal", "note"],
    network: ["contact", "event", "task", "note"],
    growth: ["bookmark", "note", "goal"],
    creativity: ["idea", "bookmark", "event", "note", "milestone"],
    admin: ["task", "document", "note"],
  };
  const qtypes = quickTypes[domainKey] || ["task", "note"];

  return (
    <div className="space-y-6">
      <PageHeader
        title={domainMeta.name}
        subtitle={domainMeta.description}
        icon={domainMeta.icon}
        color={domainMeta.color}
        actions={
          <div className="flex gap-1.5">
            {qtypes.map((t) => {
              const m = ITEM_TYPE_MAP[t];
              return (
                <Button key={t} variant="outline" size="sm" onClick={() => openItemEditor({ type: t, domainId: domainRecord?.id })} className="gap-1.5">
                  <Icon name={m.icon} className="h-3.5 w-3.5" style={{ color: m.color }} />
                  <span className="hidden sm:inline">{m.name}</span>
                </Button>
              );
            })}
          </div>
        }
      />

      {/* Hero domain card */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-border/60 p-6"
        style={{ background: `linear-gradient(135deg, ${domainMeta.color}15, transparent 70%)` }}
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20 blur-3xl" style={{ background: domainMeta.color }} />
        <div className="relative grid gap-4 sm:grid-cols-4">
          <Stat label="Total items" value={items.length} />
          <Stat label="Done" value={items.filter((i) => i.status === "done").length} />
          <Stat label="Active" value={items.filter((i) => i.status === "active").length} />
          <Stat label="Types" value={types.length} />
        </div>
      </motion.div>

      {/* Sanctuary call-to-action for Mind & Soul */}
      {domainKey === "mind_soul" && (
        <motion.button
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => useLifeOS.getState().setView("sanctuary")}
          className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/5 to-transparent p-5 text-left transition-all hover:border-violet-500/40 hover:shadow-md"
        >
          <div className="pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl" />
          <span className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-fuchsia-500 text-white shadow-sm">
            <Icon name="Leaf" className="h-6 w-6" />
          </span>
          <div className="relative flex-1">
            <h3 className="text-sm font-semibold">Enter the Sanctuary</h3>
            <p className="text-xs text-muted-foreground">A guided breathing exercise, your daily affirmation, and your life visions in one calm space.</p>
          </div>
          <Icon name="ArrowRight" className="relative h-4 w-4 text-violet-500 transition-transform group-hover:translate-x-1" />
        </motion.button>
      )}

      {/* Domain-specific widgets */}
      {domainKey === "time_action" && <TimeActionOverview />}
      {domainKey === "network" && <FollowUpDue />}
      {domainKey === "growth" && <ReadingTracker />}
      {domainKey === "health" && <HealthOverview />}
      {domainKey === "wealth" && <SubscriptionsOverview />}
      {domainKey === "creativity" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <IdeaVault />
          <BucketList />
        </div>
      )}
      {domainKey === "admin" && <AdminQuickActions />}

      {/* Type filter chips */}
      {types.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setTypeFilter(null)}
            className={cn("rounded-full px-3 py-1 text-xs font-medium transition-all", !typeFilter ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70")}
          >
            All ({items.length})
          </button>
          {types.map((t) => {
            const m = ITEM_TYPE_MAP[t] || { name: t, color: "#71717a", icon: "Circle" };
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all", typeFilter === t ? "text-white" : "bg-muted text-muted-foreground hover:bg-muted/70")}
                style={typeFilter === t ? { background: m.color } : {}}
              >
                <Icon name={m.icon} className="h-3 w-3" />
                {m.name} ({byType[t].length})
              </button>
            );
          })}
        </div>
      )}

      {/* Hero domain card skeleton */}
      {isLoading && (
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-3xl border border-border/60 p-6">
            <div className="grid gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-7 w-12 animate-pulse rounded bg-muted/40" />
                  <div className="h-3 w-16 animate-pulse rounded bg-muted/30" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Items */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-muted/40" />)}</div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={domainMeta.icon}
          title={`Nothing in ${domainMeta.short} yet`}
          description={`Start capturing ${domainMeta.name.toLowerCase()} items. They'll appear here and connect to your projects.`}
          action={{ label: "Add item", onClick: () => openItemEditor({ type: qtypes[0], domainId: domainRecord?.id }) }}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} showProject onClick={() => openItemDetail(item.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
