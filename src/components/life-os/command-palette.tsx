"use client";

import { useEffect, useState } from "react";
import { useLifeOS, type ViewKey } from "@/store/life-os";
import { useSearch, useProjects, useItems } from "@/lib/hooks";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Icon } from "./icon";
import { DOMAINS, ITEM_TYPE_MAP } from "@/lib/constants";
import { smartDate } from "@/lib/dates";

const NAV_ITEMS: { key: ViewKey; name: string; icon: string; group: string }[] = [
  { key: "dashboard", name: "Dashboard", icon: "LayoutDashboard", group: "Navigate" },
  { key: "inbox", name: "Inbox", icon: "Inbox", group: "Navigate" },
  { key: "calendar", name: "Master Calendar", icon: "CalendarDays", group: "Navigate" },
  { key: "agenda", name: "Weekly Agenda", icon: "CalendarRange", group: "Navigate" },
  { key: "focus", name: "Focus", icon: "Brain", group: "Navigate" },
  { key: "projects", name: "Projects & Threads", icon: "FolderKanban", group: "Navigate" },
  { key: "graph", name: "Brain Graph", icon: "Network", group: "Navigate" },
  { key: "sanctuary", name: "Sanctuary", icon: "Leaf", group: "Navigate" },
  { key: "journal", name: "Journal Editor", icon: "PenLine", group: "Navigate" },
  { key: "reviews", name: "Reviews & Reflections", icon: "NotebookPen", group: "Navigate" },
  { key: "insights", name: "Insights", icon: "TrendingUp", group: "Navigate" },
  { key: "all", name: "All Items", icon: "Layers", group: "Navigate" },
];

export function CommandPalette() {
  const {
    commandOpen, setCommandOpen,
    setView, openProject, openItemDetail,
    setQuickCaptureOpen, openItemEditor,
  } = useLifeOS();
  const [q, setQ] = useState("");

  const { data: searchData } = useSearch(q);
  const { data: projData } = useProjects();
  const { data: tasksData } = useItems({ type: "task", status: "active" });

  // global hotkey ⌘P / Ctrl+P
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setCommandOpen(true);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setCommandOpen]);

  function run(action: () => void) {
    return () => {
      action();
      setCommandOpen(false);
      setQ("");
    };
  }

  const projects = projData?.projects || [];
  const searchItems = searchData?.items || [];
  const searchProjects = searchData?.projects || [];
  const upcomingTasks = (tasksData?.items || [])
    .filter((t) => t.dueDate && new Date(t.dueDate) >= new Date())
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  // client-side filter helper (since shouldFilter is disabled for custom control)
  const ql = q.toLowerCase().trim();
  const matches = (...texts: string[]) => !ql || texts.some((t) => t.toLowerCase().includes(ql));
  const filteredNav = NAV_ITEMS.filter((n) => matches(n.name));
  const filteredDomains = DOMAINS.filter((d) => matches(d.name, d.short));
  const filteredProjects = projects.filter((p: any) => matches(p.name, p.description || ""));
  const filteredUpcoming = upcomingTasks.filter((t) => matches(t.title));
  const hasResults =
    !ql ||
    matches("quick capture", "create", "task", "note", "journal", "idea", "new") ||
    filteredNav.length || filteredDomains.length || filteredProjects.length ||
    searchItems.length || searchProjects.length || filteredUpcoming.length;

  return (
    <Dialog open={commandOpen} onOpenChange={(o) => { setCommandOpen(o); if (!o) setQ(""); }}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-[560px]">
        <DialogHeader className="sr-only">
          <DialogTitle>Command Palette</DialogTitle>
          <DialogDescription>Search and run commands across your Life OS.</DialogDescription>
        </DialogHeader>
        <Command shouldFilter={false} className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <CommandInput placeholder="Type a command, search, or jump to…" value={q} onValueChange={setQ} />
          <CommandList className="max-h-[460px]">
            {!hasResults && <CommandEmpty>No results found.</CommandEmpty>}

        {/* Quick actions */}
        {(!ql || matches("quick capture", "create", "new", "task", "note", "journal", "idea")) && (
        <CommandGroup heading="Actions">
          {(!ql || matches("quick", "capture", "inbox")) && (
          <CommandItem value="quick capture inbox" onSelect={run(() => setQuickCaptureOpen(true))} className="gap-2">
            <Icon name="Zap" className="h-4 w-4 text-amber-500" />
            <span>Quick Capture to inbox</span>
            <CommandShortcut>⌘K</CommandShortcut>
          </CommandItem>
          )}
          {(!ql || matches("create", "new", "task")) && (
          <CommandItem value="create new task" onSelect={run(() => openItemEditor({ type: "task" }))} className="gap-2">
            <Icon name="Plus" className="h-4 w-4 text-emerald-500" />
            <span>Create new task</span>
          </CommandItem>
          )}
          {(!ql || matches("create", "new", "note")) && (
          <CommandItem value="create new note" onSelect={run(() => openItemEditor({ type: "note" }))} className="gap-2">
            <Icon name="StickyNote" className="h-4 w-4 text-yellow-500" />
            <span>Create new note</span>
          </CommandItem>
          )}
          {(!ql || matches("capture", "idea")) && (
          <CommandItem value="capture an idea" onSelect={run(() => openItemEditor({ type: "idea" }))} className="gap-2">
            <Icon name="Lightbulb" className="h-4 w-4 text-pink-500" />
            <span>Capture an idea</span>
          </CommandItem>
          )}
          {(!ql || matches("write", "journal", "entry")) && (
          <CommandItem value="write journal entry full editor" onSelect={run(() => useLifeOS.getState().openJournalEditor(null))} className="gap-2">
            <Icon name="PenLine" className="h-4 w-4 text-violet-500" />
            <span>Write journal entry</span>
            <CommandShortcut>Full editor</CommandShortcut>
          </CommandItem>
          )}
        </CommandGroup>
        )}

        {filteredNav.length > 0 && (
        <>
        <CommandSeparator />
        {/* Navigation */}
        <CommandGroup heading="Navigate">
          {filteredNav.map((n) => (
            <CommandItem key={n.key} value={`go to ${n.name}`} onSelect={run(() => setView(n.key))} className="gap-2">
              <Icon name={n.icon} className="h-4 w-4 text-muted-foreground" />
              <span>{n.name}</span>
            </CommandItem>
          ))}
          {filteredDomains.map((d) => (
            <CommandItem key={d.key} value={`domain ${d.name}`} onSelect={run(() => setView(d.key as ViewKey))} className="gap-2">
              <span className="flex h-4 w-4 items-center justify-center">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
              </span>
              <span>Domain: {d.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        </>
        )}

        {/* Projects */}
        {filteredProjects.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Projects">
              {filteredProjects.slice(0, 8).map((p: any) => (
                <CommandItem key={p.id} value={`project ${p.name}`} onSelect={run(() => openProject(p.id))} className="gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
                  <span className="flex-1">{p.name}</span>
                  <span className="text-xs text-muted-foreground">{p.progress}%</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Upcoming tasks */}
        {filteredUpcoming.length > 0 && !q && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Upcoming tasks">
              {filteredUpcoming.map((t) => (
                <CommandItem key={t.id} value={`task ${t.title}`} onSelect={run(() => openItemDetail(t.id))} className="gap-2">
                  <Icon name="CheckSquare" className="h-4 w-4 text-amber-500" />
                  <span className="flex-1 truncate">{t.title}</span>
                  <CommandShortcut>{smartDate(t.dueDate)}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Search results */}
        {q && (searchProjects.length > 0 || searchItems.length > 0) && (
          <>
            {searchProjects.length > 0 && (
              <CommandGroup heading={`Projects matching "${q}"`}>
                {searchProjects.map((p: any) => (
                  <CommandItem key={p.id} value={`search project ${p.name}`} onSelect={run(() => openProject(p.id))} className="gap-2">
                    <Icon name="FolderKanban" className="h-4 w-4" style={{ color: p.color }} />
                    <span>{p.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {searchItems.length > 0 && (
              <CommandGroup heading={`Items matching "${q}"`}>
                {searchItems.map((i: any) => {
                  const m = ITEM_TYPE_MAP[i.type] || { icon: "Circle", color: "#71717a" };
                  return (
                    <CommandItem key={i.id} value={`search item ${i.title}`} onSelect={run(() => openItemDetail(i.id))} className="gap-2">
                      <Icon name={(m as any).icon} className="h-4 w-4" style={{ color: (m as any).color }} />
                      <span className="flex-1 truncate">{i.title}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </>
        )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
