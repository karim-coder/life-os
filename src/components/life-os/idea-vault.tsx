"use client";

import { useItems } from "@/lib/hooks";
import { useLifeOS } from "@/store/life-os";
import { Icon } from "./icon";
import { motion } from "framer-motion";
import { fmtDate, smartDate } from "@/lib/dates";
import { cn } from "@/lib/utils";

export function IdeaVault() {
  const { data } = useItems({ type: "idea,bookmark,milestone,event", status: "active,done,inbox" });
  const { openItemDetail, openItemEditor } = useLifeOS();

  const items = data?.items || [];
  const ideas = items.filter((i: any) => i.type === "idea");
  const inboxIdeas = ideas.filter((i: any) => i.status === "inbox");
  const mediaLog = items.filter((i: any) => i.type === "bookmark")
    .sort((a: any, b: any) => new Date(b.completedAt || b.createdAt).getTime() - new Date(a.completedAt || a.createdAt).getTime());
  const milestones = items.filter((i: any) => i.type === "milestone");
  const events = items.filter((i: any) => i.type === "event")
    .filter((e: any) => e.scheduledAt && new Date(e.scheduledAt) >= new Date())
    .sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-dashed border-border/60 bg-card/30 p-4"
      >
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-500/15 text-pink-500">
            <Icon name="Lightbulb" className="h-3.5 w-3.5" />
          </span>
          <h3 className="text-sm font-semibold">Idea vault</h3>
        </div>
        <p className="text-xs text-muted-foreground">Capture sparks of inspiration, log media you enjoy, and track milestones.</p>
        <button
          onClick={() => openItemEditor({ type: "idea" })}
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-pink-500 hover:underline"
        >
          <Icon name="Plus" className="h-3 w-3" /> Capture an idea
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
      {/* Idea vault */}
      {ideas.length > 0 && (
        <div className="rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/5 to-transparent p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-500/15 text-pink-500">
                <Icon name="Lightbulb" className="h-3.5 w-3.5" />
              </span>
              <div>
                <h3 className="text-sm font-semibold">Idea vault</h3>
                <p className="text-[10px] text-muted-foreground">
                  {ideas.length} idea{ideas.length !== 1 ? "s" : ""}{inboxIdeas.length > 0 && ` · ${inboxIdeas.length} unprocessed`}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            {ideas.slice(0, 4).map((idea: any, i: number) => (
              <motion.button
                key={idea.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => openItemDetail(idea.id)}
                className="group flex w-full items-start gap-2 rounded-lg border border-border/40 bg-background/40 p-2.5 text-left transition-all hover:border-pink-500/30 hover:bg-background"
              >
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-pink-500/10 text-pink-500">
                  <Icon name="Lightbulb" className="h-3 w-3" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium">{idea.title}</p>
                  {idea.content && <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground">{idea.content}</p>}
                </div>
                {idea.status === "inbox" && (
                  <span className="flex-shrink-0 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-600">NEW</span>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Media log + upcoming events side by side on larger screens */}
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Media log */}
        {mediaLog.length > 0 && (
          <div className="rounded-2xl border border-border/50 bg-card/30 p-3">
            <h4 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Icon name="Film" className="h-3 w-3" />
              Media log
            </h4>
            <div className="space-y-1">
              {mediaLog.slice(0, 3).map((m: any, i: number) => (
                <button
                  key={m.id}
                  onClick={() => openItemDetail(m.id)}
                  className="flex w-full items-center gap-2 rounded-lg p-1.5 text-left transition-all hover:bg-muted/40"
                >
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-blue-500/10 text-blue-500">
                    <Icon name={m.metadata?.medium === "movie" ? "Film" : m.metadata?.medium === "book" ? "BookOpen" : "PlayCircle"} className="h-3 w-3" />
                  </span>
                  <span className="flex-1 truncate text-xs font-medium">{m.title}</span>
                  {m.metadata?.rating > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] text-amber-500">
                      <Icon name="Star" className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                      {m.metadata.rating}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming events */}
        {events.length > 0 && (
          <div className="rounded-2xl border border-border/50 bg-card/30 p-3">
            <h4 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Icon name="Calendar" className="h-3 w-3" />
              Upcoming
            </h4>
            <div className="space-y-1">
              {events.slice(0, 3).map((e: any, i: number) => (
                <button
                  key={e.id}
                  onClick={() => openItemDetail(e.id)}
                  className="flex w-full items-center gap-2 rounded-lg p-1.5 text-left transition-all hover:bg-muted/40"
                >
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-cyan-500/10 text-cyan-500">
                    <Icon name="Calendar" className="h-3 w-3" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{e.title}</p>
                    <p className="text-[10px] text-muted-foreground">{smartDate(e.scheduledAt)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent milestones */}
      {milestones.length > 0 && (
        <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent p-3">
          <h4 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-600">
            <Icon name="Flag" className="h-3 w-3" />
            Milestones
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {milestones.map((ms: any) => (
              <button
                key={ms.id}
                onClick={() => openItemDetail(ms.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs transition-all",
                  ms.status === "done"
                    ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600"
                    : "border-border/40 bg-background/40 hover:bg-background"
                )}
              >
                <Icon name={ms.status === "done" ? "Check" : "Flag"} className="h-3 w-3" />
                <span className="font-medium">{ms.title}</span>
                <span className="text-[10px] text-muted-foreground">{smartDate(ms.completedAt || ms.scheduledAt)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
