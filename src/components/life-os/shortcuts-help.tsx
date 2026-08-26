"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Icon } from "./icon";

interface ShortcutGroup {
  title: string;
  shortcuts: { keys: string[]; desc: string; icon: string }[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: "Global",
    shortcuts: [
      { keys: ["⌘", "K"], desc: "Quick Capture to inbox", icon: "Zap" },
      { keys: ["⌘", "P"], desc: "Open Command Palette", icon: "Command" },
      { keys: ["/"], desc: "Focus the search bar", icon: "Search" },
      { keys: ["?"], desc: "Show this shortcuts cheat sheet", icon: "Keyboard" },
    ],
  },
  {
    title: "Quick Capture",
    shortcuts: [
      { keys: ["Enter"], desc: "Capture to inbox", icon: "Inbox" },
      { keys: ["⌘", "Enter"], desc: "Create as active item", icon: "PlusCircle" },
      { keys: ["Shift", "Enter"], desc: "New line in text", icon: "CornerDownLeft" },
      { keys: ["Esc"], desc: "Close dialog", icon: "X" },
      { keys: ["1–6"], desc: "Switch item type", icon: "ListFilter" },
    ],
  },
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["G", "D"], desc: "Go to Dashboard", icon: "LayoutDashboard" },
      { keys: ["G", "I"], desc: "Go to Inbox", icon: "Inbox" },
      { keys: ["G", "C"], desc: "Go to Calendar", icon: "CalendarDays" },
      { keys: ["G", "A"], desc: "Go to Agenda", icon: "CalendarRange" },
      { keys: ["G", "F"], desc: "Go to Focus timer", icon: "Brain" },
      { keys: ["G", "P"], desc: "Go to Projects", icon: "FolderKanban" },
      { keys: ["G", "G"], desc: "Go to Brain Graph", icon: "Network" },
      { keys: ["G", "R"], desc: "Go to Reviews", icon: "NotebookPen" },
      { keys: ["G", "S"], desc: "Go to Insights", icon: "TrendingUp" },
    ],
  },
];

export function ShortcutsHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (document.activeElement?.tagName || "").toLowerCase();
      const inField = tag === "input" || tag === "textarea";
      if (e.key === "?" && !inField) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Keyboard" className="h-5 w-5 text-violet-500" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>Navigate your Life OS at the speed of thought.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {group.title}
              </h3>
              <div className="grid gap-1">
                {group.shortcuts.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg px-2 py-1.5 odd:bg-muted/30"
                  >
                    <span className="flex items-center gap-2 text-sm">
                      <Icon name={s.icon} className="h-3.5 w-3.5 text-muted-foreground" />
                      {s.desc}
                    </span>
                    <span className="flex items-center gap-1">
                      {s.keys.map((k, j) => (
                        <kbd
                          key={j}
                          className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-semibold shadow-sm"
                        >
                          {k}
                        </kbd>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
