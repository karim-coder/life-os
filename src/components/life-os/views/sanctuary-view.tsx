"use client";

import { useState, useEffect, useRef } from "react";
import { useLifeOS } from "@/store/life-os";
import { useItems, useToggleHabit } from "@/lib/hooks";
import { Icon } from "../icon";
import { Button } from "@/components/ui/button";
import { PageHeader, SectionCard } from "../layout";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { fmtDate } from "@/lib/dates";

type BreathPhase = "inhale" | "hold-in" | "exhale" | "hold-out";
const BREATH_CYCLE: { phase: BreathPhase; label: string; secs: number }[] = [
  { phase: "inhale", label: "Breathe in", secs: 4 },
  { phase: "hold-in", label: "Hold", secs: 4 },
  { phase: "exhale", label: "Breathe out", secs: 6 },
  { phase: "hold-out", label: "Rest", secs: 2 },
];

export function SanctuaryView() {
  const { openItemDetail, openItemEditor, setView, openJournalEditor } = useLifeOS();
  const { data, isLoading } = useItems({ type: "affirmation,vision,journal", status: "active,done" });
  const toggleHabit = useToggleHabit();

  const affirmations = (data?.items || []).filter((i: any) => i.type === "affirmation");
  const visions = (data?.items || []).filter((i: any) => i.type === "vision");
  const journals = (data?.items || []).filter((i: any) => i.type === "journal")
    .sort((a: any, b: any) => new Date(b.scheduledAt || b.createdAt).getTime() - new Date(a.scheduledAt || a.createdAt).getTime());

  // Daily affirmation — rotate by day of year
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const dailyAffirmation = affirmations.length > 0 ? affirmations[dayOfYear % affirmations.length] : null;

  // Breathing exercise state
  const [breathing, setBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const breathTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!breathing) return;
    const current = BREATH_CYCLE[breathPhase];
    breathTimer.current = setTimeout(() => {
      const next = (breathPhase + 1) % BREATH_CYCLE.length;
      setBreathPhase(next);
      if (next === 0) setCycleCount((c) => c + 1);
    }, current.secs * 1000);
    return () => {
      if (breathTimer.current) clearTimeout(breathTimer.current);
    };
  }, [breathing, breathPhase]);

  function stopBreathing() {
    setBreathing(false);
    setBreathPhase(0);
    setCycleCount(0);
    if (breathTimer.current) clearTimeout(breathTimer.current);
  }

  const currentBreath = BREATH_CYCLE[breathPhase];
  const breathScale = breathing
    ? currentBreath.phase === "inhale"
      ? 1
      : currentBreath.phase === "exhale"
        ? 0.4
        : breathPhase === 1 ? 1 : 0.4
    : 0.6;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Sanctuary"
          subtitle="A quiet space for your mind. Breathe, reflect, reconnect with what matters."
          icon="Leaf"
          color="#a78bfa"
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => openJournalEditor(null)} className="gap-1.5 border-violet-500/30 text-violet-600 hover:bg-violet-500/10">
                <Icon name="PenLine" className="h-3.5 w-3.5" /> Write journal
              </Button>
              <Button variant="outline" size="sm" onClick={() => setView("mind_soul")} className="gap-1.5">
                <Icon name="ArrowLeft" className="h-3.5 w-3.5" /> Back
              </Button>
            </div>
          }
        />

        {/* Daily affirmation skeleton */}
        <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-transparent p-8 text-center">
          <div className="mx-auto max-w-2xl space-y-3">
            <div className="mx-auto h-4 w-32 animate-pulse rounded bg-muted/40" />
            <div className="mx-auto h-8 w-96 animate-pulse rounded bg-muted/40" />
            <div className="mx-auto h-4 w-48 animate-pulse rounded bg-muted/30" />
            <div className="mt-4 flex justify-center gap-2">
              <div className="h-8 w-28 animate-pulse rounded-md bg-muted/30" />
              <div className="h-8 w-32 animate-pulse rounded-md bg-muted/30" />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Breathing exercise — renders immediately, no skeleton needed */}
          <SectionCard className="overflow-hidden">
            <div className="flex flex-col items-center justify-center py-8">
              <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Box Breathing</h3>
              <p className="mb-8 text-xs text-muted-foreground">4-4-6-2 pattern to calm your nervous system</p>
              <div className="h-40 w-40 animate-pulse rounded-full bg-muted/30" />
              <div className="mt-8 h-10 w-36 animate-pulse rounded-lg bg-muted/40" />
            </div>
          </SectionCard>

          {/* Vision board skeleton */}
          <SectionCard title="Your visions" icon="Eye">
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border/40 bg-gradient-to-br from-violet-500/5 to-transparent p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 animate-pulse rounded-lg bg-muted/40" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-2/3 animate-pulse rounded bg-muted/40" />
                      <div className="h-3 w-full animate-pulse rounded bg-muted/30" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Recent reflections skeleton */}
        <SectionCard title="Recent reflections" icon="BookHeart">
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border/40 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-3 w-3 animate-pulse rounded bg-muted/30" />
                  <div className="h-3 w-24 animate-pulse rounded bg-muted/30" />
                </div>
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted/40" />
                <div className="mt-2 h-3 w-full animate-pulse rounded bg-muted/30" />
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sanctuary"
        subtitle="A quiet space for your mind. Breathe, reflect, reconnect with what matters."
        icon="Leaf"
        color="#a78bfa"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => openJournalEditor(null)} className="gap-1.5 border-violet-500/30 text-violet-600 hover:bg-violet-500/10">
              <Icon name="PenLine" className="h-3.5 w-3.5" /> Write journal
            </Button>
            <Button variant="outline" size="sm" onClick={() => setView("mind_soul")} className="gap-1.5">
              <Icon name="ArrowLeft" className="h-3.5 w-3.5" /> Back
            </Button>
          </div>
        }
      />

      {/* Daily Affirmation Hero */}
      {dailyAffirmation && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-transparent p-8 text-center"
        >
          <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-fuchsia-500/10 blur-3xl" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-500">Today's affirmation</p>
            <motion.blockquote
              key={dailyAffirmation.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mx-auto mt-3 max-w-2xl text-2xl font-medium italic leading-relaxed text-foreground sm:text-3xl"
            >
              “{dailyAffirmation.title}”
            </motion.blockquote>
            {dailyAffirmation.content && (
              <p className="mt-3 text-sm text-muted-foreground">{dailyAffirmation.content}</p>
            )}
            <div className="mt-5 flex justify-center gap-2">
              <Button variant="outline" size="sm" onClick={() => openItemDetail(dailyAffirmation.id)} className="gap-1.5">
                <Icon name="Heart" className="h-3.5 w-3.5" /> Reflect on this
              </Button>
              <Button variant="ghost" size="sm" onClick={() => openItemEditor({ type: "affirmation", domainId: dailyAffirmation.domainId })} className="gap-1.5">
                <Icon name="Plus" className="h-3.5 w-3.5" /> Add affirmation
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Breathing Exercise */}
        <SectionCard className="overflow-hidden">
          <div className="relative flex flex-col items-center justify-center py-8">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent" />
            <h3 className="relative mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {breathing ? `${cycleCount} cycle${cycleCount !== 1 ? "s" : ""} complete` : "Box Breathing"}
            </h3>
            <p className="relative mb-8 text-xs text-muted-foreground">
              {breathing ? "Follow the circle" : "4-4-6-2 pattern to calm your nervous system"}
            </p>

            <div className="relative flex h-64 w-64 items-center justify-center">
              {/* ambient rings */}
              <div className="absolute h-64 w-64 rounded-full border border-violet-500/10" />
              <div className="absolute h-48 w-48 rounded-full border border-violet-500/15" />
              <div className="absolute h-32 w-32 rounded-full border border-violet-500/20" />

              {/* breathing circle */}
              <motion.div
                animate={{
                  scale: breathScale,
                  opacity: breathing ? 1 : 0.5,
                }}
                transition={{
                  duration: currentBreath.secs,
                  ease: "easeInOut",
                }}
                className="flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 shadow-lg"
                style={{ boxShadow: "0 0 60px rgba(167, 139, 250, 0.3)" }}
              >
                <AnimatePresence mode="wait">
                  {breathing && (
                    <motion.div
                      key={breathPhase}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.3 }}
                      className="text-center text-white"
                    >
                      <div className="text-lg font-semibold">{currentBreath.label}</div>
                      <div className="text-xs opacity-80">{currentBreath.secs}s</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            <div className="relative mt-8">
              {!breathing ? (
                <Button onClick={() => setBreathing(true)} className="gap-2 bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white">
                  <Icon name="Play" className="h-4 w-4" /> Begin breathing
                </Button>
              ) : (
                <Button variant="outline" onClick={stopBreathing} className="gap-2">
                  <Icon name="Square" className="h-4 w-4" /> End session
                </Button>
              )}
            </div>
          </div>
        </SectionCard>

        {/* Vision Board */}
        <SectionCard title="Your visions" icon="Eye" action={
          <Button variant="ghost" size="sm" onClick={() => openItemEditor({ type: "vision" })} className="gap-1">
            <Icon name="Plus" className="h-3.5 w-3.5" /> Add
          </Button>
        }>
          {visions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Icon name="Eye" className="mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">What do you want your life to look like?</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => openItemEditor({ type: "vision" })}>
                Write a vision
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {visions.map((v: any, i: number) => (
                <motion.button
                  key={v.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => openItemDetail(v.id)}
                  className="group block w-full rounded-xl border border-border/60 bg-gradient-to-br from-violet-500/5 to-transparent p-4 text-left transition-all hover:border-violet-500/30 hover:shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
                      <Icon name="Eye" className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold">{v.title}</h4>
                      {v.content && (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{v.content}</p>
                      )}
                    </div>
                    <Icon name="ArrowUpRight" className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Recent journal entries */}
      <SectionCard title="Recent reflections" icon="BookHeart" action={
        <Button variant="ghost" size="sm" onClick={() => openJournalEditor(null)} className="gap-1 text-violet-600 hover:bg-violet-500/10">
          <Icon name="PenLine" className="h-3.5 w-3.5" /> Write
        </Button>
      }>
        {journals.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <button onClick={() => openJournalEditor(null)} className="group flex flex-col items-center">
              <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500 transition-all group-hover:scale-105 group-hover:bg-violet-500/20">
                <Icon name="PenLine" className="h-6 w-6" />
              </span>
              <p className="text-sm font-medium">Start your first journal entry</p>
              <p className="mt-0.5 text-xs text-muted-foreground">A full-page editor with rich text formatting awaits.</p>
            </button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {journals.slice(0, 4).map((j: any, i: number) => (
              <motion.button
                key={j.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => openJournalEditor(j.id)}
                className="group rounded-xl border border-border/60 p-4 text-left transition-all hover:border-violet-500/30 hover:shadow-sm"
              >
                <div className="mb-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Icon name="Calendar" className="h-3 w-3" />
                  {fmtDate(j.scheduledAt || j.createdAt, "EEE, MMM d · p")}
                  {j.project && (
                    <span className="inline-flex items-center gap-1" style={{ color: j.project.color }}>
                      · {j.project.name}
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-semibold">{j.title}</h4>
                {j.content && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{j.content}</p>
                )}
              </motion.button>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
