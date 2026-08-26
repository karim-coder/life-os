"use client";

import { useState, useEffect } from "react";
import { useLifeOS } from "@/store/life-os";
import { useInbox, useUpdateItem, useDeleteItem, useDomains, useProjects } from "@/lib/hooks";
import { Icon } from "../icon";
import { PageHeader, EmptyState } from "../layout";
import { ItemCard } from "../item-card";
import { Button } from "@/components/ui/button";
import { ITEM_TYPE_MAP, ITEM_TYPES, DOMAINS } from "@/lib/constants";
import { notify } from "@/lib/toast";
import { motion, AnimatePresence } from "framer-motion";

export function InboxView() {
  const { data, isLoading } = useInbox();
  const { openItemDetail, openItemEditor, setQuickCaptureOpen } = useLifeOS();
  const update = useUpdateItem();
  const del = useDeleteItem();
  const { data: domData } = useDomains();
  const { data: projData } = useProjects();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, any>>({});
  const [aiLoading, setAiLoading] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const items = data?.items || [];

  // Check AI preferences
  useEffect(() => {
    fetch("/api/preferences").then(r => r.json()).then(d => {
      setAiEnabled(d.aiEnabled && d.aiSmartInbox);
    }).catch(() => {});
  }, []);
  const domains = domData?.domains || [];
  const projects = projData?.projects || [];

  async function runAiSmartProcess() {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/smart-inbox", { method: "POST" });
      const data = await res.json();
      if (data.error) {
        notify.error(`AI error: ${data.error}`);
        return;
      }
      const mapped: Record<string, any> = {};
      for (const s of data.suggestions || []) {
        mapped[s.itemId] = s;
      }
      setAiSuggestions(mapped);
      notify.success(`AI analyzed ${data.count} inbox items`);
    } catch {
      notify.error("Failed to run AI processing");
    } finally {
      setAiLoading(false);
    }
  }

  async function applyAiSuggestion(itemId: string) {
    const s = aiSuggestions[itemId];
    if (!s) return;
    await update.mutateAsync({
      id: itemId,
      type: s.suggestedType,
      domainId: s.suggestedDomainId,
      projectId: s.suggestedProjectId,
      status: "active",
    });
    setAiSuggestions((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
    notify.success("Item processed");
  }

  function toggle(id: string) {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  async function processAll(field: "domainId" | "projectId" | "type" | "status", value: string) {
    const ids = selected.size ? Array.from(selected) : items.map((i) => i.id);
    await Promise.all(ids.map((id) => update.mutateAsync({ id, [field]: value || null })));
    setSelected(new Set());
    notify.success(`Processed ${ids.length} item${ids.length > 1 ? "s" : ""}`);
  }

  async function clearInbox() {
    await Promise.all(items.map((i) => update.mutateAsync({ id: i.id, status: "active" })));
    notify.success("Inbox cleared — all items activated");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inbox"
        subtitle="Process your captures. Decide what each one is and where it belongs."
        icon="Inbox"
        color="#f59e0b"
        actions={
          <div className="flex gap-2">
            {items.length > 0 && aiEnabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={runAiSmartProcess}
                disabled={aiLoading}
                className="gap-1.5 border-violet-500/30 text-violet-600 hover:bg-violet-500/10"
              >
                <Icon name={aiLoading ? "Loader2" : "Bot"} className={`h-3.5 w-3.5 ${aiLoading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">{aiLoading ? "AI analyzing…" : "AI Smart Process"}</span>
              </Button>
            )}
            <Button onClick={() => setQuickCaptureOpen(true)} className="gap-1.5 bg-gradient-to-br from-amber-500 to-orange-600 text-white">
              <Icon name="Zap" className="h-4 w-4" /> Capture
            </Button>
          </div>
        }
      />

      {/* Bulk processing bar */}
      {items.length > 0 && (
        <div className="sticky top-14 z-20 flex flex-wrap items-center gap-2 rounded-2xl border border-border/60 bg-card/80 p-3 backdrop-blur-md">
          <span className="text-xs font-medium text-muted-foreground">
            {selected.size > 0 ? `${selected.size} selected` : `${items.length} to process`}
          </span>
          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Set:</span>
            <select onChange={(e) => e.target.value && processAll("type", e.target.value)} className="rounded-md border border-border/60 bg-background px-2 py-1 text-xs" defaultValue="">
              <option value="">type…</option>
              {ITEM_TYPES.map((t) => <option key={t.type} value={t.type}>{t.name}</option>)}
            </select>
            <select onChange={(e) => e.target.value && processAll("domainId", e.target.value)} className="rounded-md border border-border/60 bg-background px-2 py-1 text-xs" defaultValue="">
              <option value="">domain…</option>
              {domains.map((d: any) => <option key={d.id} value={d.id}>{DOMAINS.find((dd) => dd.key === d.key)?.name}</option>)}
            </select>
            <select onChange={(e) => e.target.value && processAll("projectId", e.target.value)} className="rounded-md border border-border/60 bg-background px-2 py-1 text-xs" defaultValue="">
              <option value="">project…</option>
              {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <Button size="sm" variant="default" onClick={() => processAll("status", "active")} className="h-7 gap-1">
              <Icon name="Inbox" className="h-3 w-3" /> Activate all{selected.size ? ` (${selected.size})` : ""}
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 p-3">
              <div className="h-5 w-5 skeleton rounded-md bg-muted/60" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 skeleton rounded bg-muted/60" />
                <div className="flex gap-2">
                  <div className="h-3 w-16 skeleton rounded bg-muted/40" />
                  <div className="h-3 w-12 skeleton rounded bg-muted/40" />
                </div>
              </div>
              <div className="flex gap-1">
                <div className="h-8 w-8 skeleton rounded-lg bg-muted/40" />
                <div className="h-8 w-8 skeleton rounded-lg bg-muted/40" />
                <div className="h-8 w-8 skeleton rounded-lg bg-muted/40" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon="Inbox"
          title="Inbox zero"
          description="Your mind is clear. Capture a thought anytime with ⌘K and process it here later."
          action={{ label: "Quick Capture", onClick: () => setQuickCaptureOpen(true) }}
        />
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {items.map((item) => {
              const m = ITEM_TYPE_MAP[item.type] || { icon: "Circle", color: "#71717a" };
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: 40 }}
                  className="flex items-center gap-3"
                >
                  <button
                    onClick={() => toggle(item.id)}
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                      selected.has(item.id) ? "border-emerald-500 bg-emerald-500 text-white" : "border-muted-foreground/30"
                    }`}
                  >
                    {selected.has(item.id) && <Icon name="Check" className="h-3 w-3" strokeWidth={3} />}
                  </button>
                  <div className="relative flex-1">
                    <ItemCard item={item} showProject onClick={() => openItemDetail(item.id)} />
                    {aiSuggestions[item.id] && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1.5 flex items-center gap-2 rounded-lg border border-violet-500/20 bg-violet-500/5 p-2"
                      >
                        <Icon name="Bot" className="h-3 w-3 flex-shrink-0 text-violet-500" />
                        <div className="min-w-0 flex-1 text-[11px]">
                          <span className="font-medium text-violet-600">
                            {aiSuggestions[item.id].suggestedType}
                            {aiSuggestions[item.id].suggestedDomainKey && ` · ${aiSuggestions[item.id].suggestedDomainKey.replace("_", " ")}`}
                          </span>
                          {aiSuggestions[item.id].reason && (
                            <span className="ml-1 text-muted-foreground">{aiSuggestions[item.id].reason}</span>
                          )}
                        </div>
                        <button
                          onClick={() => applyAiSuggestion(item.id)}
                          className="flex-shrink-0 rounded-md bg-violet-500 px-2 py-0.5 text-[10px] font-medium text-white hover:bg-violet-600"
                        >
                          Apply
                        </button>
                      </motion.div>
                    )}
                  </div>
                  <div className="flex flex-shrink-0 gap-1">
                    <button
                      onClick={() => { update.mutate({ id: item.id, status: "active" }); notify.success("Activated"); }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-500"
                      title="Activate"
                    >
                      <Icon name="Check" className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => { openItemEditor(item); }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                      title="Edit"
                    >
                      <Icon name="Pencil" className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => { del.mutate(item.id); notify.success("Deleted"); }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500"
                      title="Delete"
                    >
                      <Icon name="Trash2" className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
