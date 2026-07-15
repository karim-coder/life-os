"use client";

import { useState } from "react";
import { useCreateReview, useReviews } from "@/lib/hooks";
import { Icon } from "./icon";
import { motion, AnimatePresence } from "framer-motion";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { fmtDate } from "@/lib/dates";

const MOODS = [
  { value: 1, icon: "Frown", label: "Low", color: "#f43f5e" },
  { value: 2, icon: "Meh", label: "Meh", color: "#f59e0b" },
  { value: 3, icon: "Smile", label: "Okay", color: "#eab308" },
  { value: 4, icon: "SmilePlus", label: "Good", color: "#10b981" },
  { value: 5, icon: "Laugh", label: "Great", color: "#06b6d4" },
];

const ENERGY = [
  { value: 1, label: "Drained", color: "#6366f1" },
  { value: 2, label: "Low", color: "#8b5cf6" },
  { value: 3, label: "Steady", color: "#06b6d4" },
  { value: 4, label: "Strong", color: "#10b981" },
  { value: 5, label: "Charged", color: "#f59e0b" },
];

export function MoodCheckIn() {
  const create = useCreateReview();
  const { data: reviewData } = useReviews("daily");
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  // Check if already logged today
  const today = new Date().toISOString().slice(0, 10);
  const todayReview = (reviewData?.reviews || []).find(
    (r: any) => new Date(r.date).toISOString().slice(0, 10) === today,
  );

  if (todayReview && !saved) {
    return (
      <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `${MOODS.find((m) => m.value === todayReview.mood)?.color}1a`, color: MOODS.find((m) => m.value === todayReview.mood)?.color }}>
            <Icon name={MOODS.find((m) => m.value === todayReview.mood)?.icon || "Smile"} className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold">Checked in today</p>
            <p className="text-xs text-muted-foreground">
              Mood {MOODS.find((m) => m.value === todayReview.mood)?.label} · Energy {ENERGY.find((e) => e.value === todayReview.energy)?.label}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (saved) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent p-4 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
          className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white"
        >
          <Icon name="Check" className="h-5 w-5" strokeWidth={3} />
        </motion.div>
        <p className="text-sm font-semibold">Thanks for checking in</p>
        <p className="mt-0.5 text-xs text-muted-foreground">Your reflection is saved.</p>
      </motion.div>
    );
  }

  async function save() {
    if (mood == null && energy == null) {
      notify.error("Pick a mood or energy level first");
      return;
    }
    await create.mutateAsync({
      type: "daily",
      date: new Date().toISOString(),
      status: "completed",
      mood: mood || 3,
      energy: energy || 3,
      wins: "",
      notes: "Quick check-in from dashboard",
    });
    setSaved(true);
    notify.success("Check-in saved");
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-violet-500/5 to-transparent p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon name="Smile" className="h-4 w-4 text-violet-500" />
        <h3 className="text-sm font-semibold">How are you feeling?</h3>
      </div>

      {/* Mood selector */}
      <div className="mb-3">
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Mood</p>
        <div className="flex justify-between gap-1">
          {MOODS.map((m) => (
            <motion.button
              key={m.value}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setMood(m.value)}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 transition-all",
                mood === m.value ? "bg-violet-500/15 ring-1 ring-violet-500/40" : "hover:bg-muted/50",
              )}
            >
              <Icon name={m.icon} className="h-5 w-5" />
              <span className={cn("text-[9px]", mood === m.value ? "font-semibold text-violet-600" : "text-muted-foreground")}>
                {m.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Energy selector */}
      <div className="mb-4">
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Energy</p>
        <div className="flex gap-1">
          {ENERGY.map((e) => (
            <motion.button
              key={e.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setEnergy(e.value)}
              className={cn(
                "flex-1 rounded-md py-1.5 text-[10px] font-medium transition-all",
                energy === e.value ? "text-white" : "bg-muted/50 text-muted-foreground hover:bg-muted",
              )}
              style={energy === e.value ? { background: e.color } : {}}
            >
              {e.label}
            </motion.button>
          ))}
        </div>
      </div>

      <button
        onClick={save}
        disabled={create.isPending}
        className="w-full rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-600 py-2 text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
      >
        {create.isPending ? "Saving…" : "Save check-in"}
      </button>
    </div>
  );
}
