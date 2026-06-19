"use client";

import { useLifeOS } from "@/store/life-os";
import { useStats, useInbox } from "@/lib/hooks";
import { Icon } from "./icon";
import { DOMAINS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";

const NAV = [
  { key: "dashboard", name: "Dashboard", icon: "LayoutDashboard" },
  { key: "inbox", name: "Inbox", icon: "Inbox" },
  { key: "calendar", name: "Calendar", icon: "CalendarDays" },
  { key: "agenda", name: "Agenda", icon: "CalendarRange" },
  { key: "focus", name: "Focus", icon: "Brain" },
  { key: "projects", name: "Projects", icon: "FolderKanban" },
  { key: "graph", name: "Brain Graph", icon: "Network" },
  { key: "reviews", name: "Reviews", icon: "NotebookPen" },
  { key: "insights", name: "Insights", icon: "TrendingUp" },
  { key: "all", name: "All Items", icon: "Layers" },
] as const;

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { view, setView } = useLifeOS();
  const { data: stats } = useStats();
  const { data: inbox } = useInbox();
  const inboxCount = stats?.inboxCount ?? inbox?.items?.length ?? 0;

  function nav(key: any) {
    setView(key);
    onNavigate?.();
  }

  return (
    <>
      {/* Brand */}
      <div className="flex h-14 flex-shrink-0 items-center gap-2.5 border-b border-border/40 px-4">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sm">
          <Icon name="Brain" className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold leading-none tracking-tight">Life OS</div>
          <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Digital Brain</div>
        </div>
      </div>

      {/* Scrollable nav */}
      <ScrollArea className="flex-1 px-3 py-3">
        <div className="space-y-0.5">
          {NAV.map((n) => {
            const active = view === n.key;
            const badge = n.key === "inbox" && inboxCount > 0 ? inboxCount : null;
            return (
              <button
                key={n.key}
                onClick={() => nav(n.key)}
                className={cn(
                  "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span layoutId="nav-active" className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-emerald-500" />
                )}
                <Icon name={n.icon} className="h-4 w-4" />
                <span className="flex-1 text-left">{n.name}</span>
                {badge && (
                  <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">{badge}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Life Domains</div>
        <div className="space-y-0.5">
          {DOMAINS.map((d) => {
            const active = view === d.key;
            const count = stats?.byDomain?.find((b: any) => b.domain === d.key)?.count;
            return (
              <button
                key={d.key}
                onClick={() => nav(d.key)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-lg px-3 py-1.5 text-sm transition-all",
                  active ? "bg-sidebar-accent text-foreground" : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
                )}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-md" style={{ background: `${d.color}1a`, color: d.color }}>
                  <Icon name={d.icon} className="h-3 w-3" />
                </span>
                <span className="flex-1 text-left text-[13px] font-medium">{d.short}</span>
                {count ? <span className="text-[10px] text-muted-foreground/60">{count}</span> : null}
              </button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer — Settings + Sign out */}
      <div className="flex-shrink-0 border-t border-border/40 p-2">
        <button
          onClick={() => nav("settings")}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors",
            view === "settings" ? "bg-sidebar-accent text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
          )}
        >
          <Icon name="Settings" className="h-3.5 w-3.5" />
          Settings
        </button>
        <button
          onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/login"; }}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-500"
        >
          <Icon name="LogOut" className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { view } = useLifeOS();

  // Close mobile sidebar on view change
  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Desktop sidebar — fixed height, scrollable */}
      <aside className="hidden h-full w-60 flex-col border-r border-border/60 bg-sidebar/40 backdrop-blur-sm md:flex">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar trigger — floating button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-3 z-40 flex h-10 w-10 items-center justify-center rounded-lg border border-border/60 bg-background/80 shadow-md backdrop-blur-md md:hidden"
        aria-label="Open menu"
      >
        <Icon name="Menu" className="h-5 w-5" />
      </button>

      {/* Mobile sidebar — drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <div className="flex h-full flex-col">
            <SidebarContent onNavigate={closeMobile} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
