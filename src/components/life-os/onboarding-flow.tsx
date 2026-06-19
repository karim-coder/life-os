"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "./icon";
import { motion, AnimatePresence } from "framer-motion";
import { useLifeOS } from "@/store/life-os";

const STEPS = [
  {
    icon: "Brain",
    color: "#a78bfa",
    title: "Welcome to your Digital Brain",
    desc: "Life OS connects everything — tasks, notes, journals, habits, finances, and more — into one interconnected system. Nothing lives in isolation.",
  },
  {
    icon: "Zap",
    color: "#f59e0b",
    title: "Capture anything, instantly",
    desc: "Press ⌘K anywhere to capture a thought. It goes to your Inbox. Process it later — no need to decide where it belongs in the moment.",
  },
  {
    icon: "CalendarDays",
    color: "#06b6d4",
    title: "One calendar for everything",
    desc: "Tasks, bills, appointments, and birthdays all appear on your Master Calendar automatically. Toggle layers to see your life through different lenses.",
  },
  {
    icon: "Network",
    color: "#10b981",
    title: "Everything connects",
    desc: "Link a journal entry to a project. Connect a task to a goal. See your whole life as a graph. The connections make your data come alive.",
  },
  {
    icon: "NotebookPen",
    color: "#ec4899",
    title: "Reflect and grow",
    desc: "Daily reflections, weekly reviews, mood tracking, and insights keep your system — and your mind — trustworthy over time.",
  },
];

export function OnboardingFlow() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const { setView } = useLifeOS();

  useEffect(() => {
    const seen = localStorage.getItem("lifeos-onboarded");
    if (!seen) {
      // Small delay to let the app load
      const timer = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  function next() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      finish();
    }
  }

  function finish() {
    localStorage.setItem("lifeos-onboarded", "1");
    setOpen(false);
  }

  function skip() {
    localStorage.setItem("lifeos-onboarded", "1");
    setOpen(false);
  }

  const current = STEPS[step];

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) skip(); }}>
      <DialogContent className="max-w-md overflow-hidden p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Welcome to Life OS</DialogTitle>
          <DialogDescription>A quick tour of your digital brain.</DialogDescription>
        </DialogHeader>

        <div className="relative">
          {/* Gradient background */}
          <div
            className="h-48 overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${current.color}20, transparent)` }}
          >
            <div
              className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 blur-2xl"
              style={{ background: current.color }}
            />
            <div className="flex h-full items-center justify-center">
              <motion.div
                key={step}
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="flex h-20 w-20 items-center justify-center rounded-2xl shadow-lg"
                style={{ background: `${current.color}22`, color: current.color }}
              >
                <Icon name={current.icon} className="h-10 w-10" />
              </motion.div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-bold tracking-tight">{current.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{current.desc}</p>
              </motion.div>
            </AnimatePresence>

            {/* Progress dots */}
            <div className="mt-6 flex items-center justify-between">
              <div className="flex gap-1.5">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={`h-2 rounded-full transition-all ${i === step ? "w-6 bg-foreground" : "w-2 bg-muted"}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                {step < STEPS.length - 1 && (
                  <Button variant="ghost" size="sm" onClick={skip}>Skip</Button>
                )}
                <Button size="sm" onClick={next} className="gap-1.5" style={{ background: current.color, color: "white" }}>
                  {step < STEPS.length - 1 ? "Next" : "Get started"}
                  <Icon name={step < STEPS.length - 1 ? "ArrowRight" : "Check"} className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
