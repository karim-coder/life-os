"use client";

import { useState } from "react";
import { useLifeOS } from "@/store/life-os";
import { useReviews, useCreateReview, useUpdateReview, useDeleteReview, useItems, useInbox } from "@/lib/hooks";
import { Icon } from "../icon";
import { PageHeader, SectionCard, EmptyState } from "../layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { REVIEW_PROMPTS } from "@/lib/constants";
import { fmtDate } from "@/lib/dates";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@/components/ui/tabs";

export function ReviewsView() {
  const { openItemDetail } = useLifeOS();
  const [tab, setTab] = useState<"daily" | "weekly">("daily");
  const { data, isLoading } = useReviews();
  const [drafting, setDrafting] = useState(false);

  const reviews = (data?.reviews || []).filter((r) => r.type === tab);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviews & Reflections"
        subtitle="Close the loop. Guided reflections keep your system — and your mind — trustworthy."
        icon="NotebookPen"
        color="#a78bfa"
        actions={
          <Button onClick={() => setDrafting(true)} className="gap-1.5 bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white">
            <Icon name="NotebookPen" className="h-4 w-4" /> New reflection
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList className="grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="daily" className="gap-1.5"><Icon name="Sun" className="h-3.5 w-3.5" /> Daily</TabsTrigger>
          <TabsTrigger value="weekly" className="gap-1.5"><Icon name="CalendarRange" className="h-3.5 w-3.5" /> Weekly</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-6">
          {drafting ? (
            <ReviewForm type={tab} onDone={() => setDrafting(false)} />
          ) : isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border/60 bg-card/40 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 animate-pulse rounded-xl bg-muted/60" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 animate-pulse rounded bg-muted/60" />
                      <div className="h-2.5 w-20 animate-pulse rounded bg-muted/40" />
                    </div>
                    <div className="h-4 w-4 animate-pulse rounded bg-muted/40" />
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <div className="h-2.5 w-full animate-pulse rounded bg-muted/40" />
                    <div className="h-2.5 w-3/4 animate-pulse rounded bg-muted/30" />
                  </div>
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <EmptyState
              icon="NotebookPen"
              title={`No ${tab} reviews yet`}
              description={tab === "daily" ? "End each day with a few minutes of reflection. Wins, challenges, gratitude, and a focus for tomorrow." : "Once a week, clear the inbox, check project health, and set priorities for the week ahead."}
              action={{ label: "Start reflection", onClick: () => setDrafting(true) }}
            />
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => <ReviewCard key={r.id} review={r} onOpenItem={openItemDetail} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReviewForm({ type, onDone }: { type: "daily" | "weekly"; onDone: () => void }) {
  const create = useCreateReview();
  const update = useUpdateReview();
  const { data: inboxData } = useInbox();
  const { data: itemsData } = useItems({ type: "task", status: "active" });
  const prompts = REVIEW_PROMPTS[type];

  const [form, setForm] = useState({
    wins: "", challenges: "", learnings: "", gratitude: "", notes: "",
    priorities: ["", "", ""],
    mood: 3, energy: 3,
  });

  function set(k: string, v: any) { setForm((f) => ({ ...f, [k]: v })); }
  function setPriority(i: number, v: string) {
    setForm((f) => {
      const p = [...f.priorities];
      p[i] = v;
      return { ...f, priorities: p };
    });
  }

  async function save() {
    await create.mutateAsync({
      type,
      date: new Date().toISOString(),
      status: "completed",
      wins: form.wins, challenges: form.challenges, learnings: form.learnings,
      gratitude: form.gratitude, notes: form.notes,
      priorities: form.priorities.filter((p) => p.trim()),
      mood: form.mood, energy: form.energy,
    });
    notify.success(`${type === "daily" ? "Daily" : "Weekly"} reflection saved`);
    onDone();
  }

  const inboxCount = inboxData?.items?.length || 0;
  const openTasks = itemsData?.items?.length || 0;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      {type === "weekly" && (inboxCount > 0 || openTasks > 0) && (
        <SectionCard title="Weekly maintenance checklist" icon="ListChecks" className="mb-4 bg-amber-500/5">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-lg border border-border/60 p-2.5">
              <Icon name="Inbox" className="h-4 w-4 text-amber-500" />
              <span className="flex-1 text-sm">{inboxCount} item{inboxCount !== 1 ? "s" : ""} in inbox</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border/60 p-2.5">
              <Icon name="CheckSquare" className="h-4 w-4 text-emerald-500" />
              <span className="flex-1 text-sm">{openTasks} open task{openTasks !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </SectionCard>
      )}

      <SectionCard>
        <div className="space-y-6">
          {/* Mood + Energy */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <Label className="mb-2 block text-xs font-medium text-muted-foreground">Mood</Label>
              <div className="flex items-center gap-3">
                <Slider value={[form.mood]} onValueChange={(v) => set("mood", v[0])} min={1} max={5} step={1} className="flex-1" />
                <span className="w-16 text-right text-sm font-semibold">
                  {["", "Low", "Meh", "Okay", "Good", "Great"][form.mood]}
                </span>
              </div>
            </div>
            <div>
              <Label className="mb-2 block text-xs font-medium text-muted-foreground">Energy</Label>
              <div className="flex items-center gap-3">
                <Slider value={[form.energy]} onValueChange={(v) => set("energy", v[0])} min={1} max={5} step={1} className="flex-1" />
                <span className="w-16 text-right text-sm font-semibold">
                  {["", "Drained", "Low", "Steady", "Strong", "Charged"][form.energy]}
                </span>
              </div>
            </div>
          </div>

          <ReviewField label={prompts.wins} icon="Trophy" color="#f59e0b" value={form.wins} onChange={(v) => set("wins", v)} placeholder="Even small wins count…" />
          <ReviewField label={prompts.challenges} icon="AlertCircle" color="#f43f5e" value={form.challenges} onChange={(v) => set("challenges", v)} placeholder="What got in the way?" />
          <ReviewField label={prompts.learnings} icon="Lightbulb" color="#3b82f6" value={form.learnings} onChange={(v) => set("learnings", v)} placeholder="A lesson, an insight…" />
          <ReviewField label={prompts.gratitude} icon="Heart" color="#ec4899" value={form.gratitude} onChange={(v) => set("gratitude", v)} placeholder="Who or what are you thankful for?" />

          {/* Priorities */}
          <div>
            <Label className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Icon name="Target" className="h-3.5 w-3.5 text-emerald-500" />
              {prompts.priorities}
            </Label>
            <div className="space-y-2">
              {form.priorities.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-xs font-bold text-emerald-600">{i + 1}</span>
                  <Input value={p} onChange={(e) => setPriority(i, e.target.value)} placeholder={`Priority ${i + 1}`} />
                </div>
              ))}
            </div>
          </div>

          <ReviewField label="Anything else?" icon="PenLine" color="#71717a" value={form.notes} onChange={(v) => set("notes", v)} placeholder="Free-form notes…" />

          <div className="flex justify-end gap-2 border-t border-border/60 pt-4">
            <Button variant="ghost" onClick={onDone}>Cancel</Button>
            <Button onClick={save} disabled={create.isPending} className="gap-1.5">
              <Icon name="Save" className="h-4 w-4" /> Save reflection
            </Button>
          </div>
        </div>
      </SectionCard>
    </motion.div>
  );
}

function ReviewField({ label, icon, color, value, onChange, placeholder }: { label: string; icon: string; color: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <Label className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon name={icon} className="h-3.5 w-3.5" style={{ color }} />
        {label}
      </Label>
      <Textarea rows={2} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function ReviewCard({ review, onOpenItem }: { review: any; onOpenItem: (id: string) => void }) {
  const del = useDeleteReview();
  const [expanded, setExpanded] = useState(false);
  const date = new Date(review.date);
  const moodColors = ["", "#f43f5e", "#f59e0b", "#eab308", "#10b981", "#06b6d4"];
  const moodIcons = ["", "Frown", "Meh", "Smile", "SmilePlus", "Laugh"];

  return (
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      <SectionCard className="overflow-hidden">
        <button onClick={() => setExpanded((e) => !e)} className="flex w-full items-center gap-3 text-left">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${moodColors[review.mood] || "#a78bfa"}1a`, color: moodColors[review.mood] || "#a78bfa" }}>
            <Icon name={moodIcons[review.mood] || "Smile"} className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold capitalize">{review.type} reflection</h3>
              <Badge variant="secondary" className="text-[10px]">{fmtDate(date, "EEE, MMM d")}</Badge>
            </div>
            {review.wins && <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{review.wins}</p>}
          </div>
          <Icon name={expanded ? "ChevronUp" : "ChevronDown"} className="h-4 w-4 text-muted-foreground" />
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-3 border-t border-border/60 pt-4">
                {review.wins && <ReviewBlock label="Wins" icon="Trophy" color="#f59e0b" text={review.wins} />}
                {review.challenges && <ReviewBlock label="Challenges" icon="AlertCircle" color="#f43f5e" text={review.challenges} />}
                {review.learnings && <ReviewBlock label="Learnings" icon="Lightbulb" color="#3b82f6" text={review.learnings} />}
                {review.gratitude && <ReviewBlock label="Gratitude" icon="Heart" color="#ec4899" text={review.gratitude} />}
                {review.priorities?.length > 0 && (
                  <div>
                    <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <Icon name="Target" className="h-3 w-3 text-emerald-500" /> Priorities
                    </p>
                    <ol className="ml-4 list-decimal space-y-1 text-sm">
                      {review.priorities.map((p: string, i: number) => <li key={i}>{p}</li>)}
                    </ol>
                  </div>
                )}
                {review.notes && <ReviewBlock label="Notes" icon="PenLine" color="#71717a" text={review.notes} />}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    {review.mood && <span>Mood {["", "Low", "Meh", "Okay", "Good", "Great"][review.mood]}</span>}
                    {review.energy && <span>Energy {["", "Drained", "Low", "Steady", "Strong", "Charged"][review.energy]}</span>}
                  </div>
                  <Button variant="ghost" size="sm" className="text-rose-500 hover:text-rose-600" onClick={() => { del.mutate(review.id); notify.success("Deleted"); }}>
                    <Icon name="Trash2" className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SectionCard>
    </motion.div>
  );
}

function ReviewBlock({ label, icon, color, text }: { label: string; icon: string; color: string; text: string }) {
  return (
    <div>
      <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon name={icon} className="h-3 w-3" style={{ color }} />
        {label}
      </p>
      <p className="whitespace-pre-wrap text-sm">{text}</p>
    </div>
  );
}
