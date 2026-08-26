"use client";

import { useState } from "react";
import { useLifeOS } from "@/store/life-os";
import { useProjects, useProject, useCreateProject, useDeleteProject, useUpdateItem, useDomains } from "@/lib/hooks";
import { Icon } from "../icon";
import { PageHeader, SectionCard, EmptyState } from "../layout";
import { ItemCard } from "../item-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DOMAINS, ITEM_TYPE_MAP } from "@/lib/constants";
import { fmtDate, smartDate } from "@/lib/dates";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const COLORS = ["#ec4899", "#10b981", "#f59e0b", "#06b6d4", "#a78bfa", "#f43f5e", "#3b82f6", "#71717a"];
const ICONS = ["FolderKanban", "Plane", "Rocket", "HeartPulse", "BookOpen", "TrendingUp", "Target", "Palette", "Home", "GraduationCap"];

export function ProjectsView() {
  const { selectedProjectId, openProject, setView } = useLifeOS();
  const { data, isLoading } = useProjects();
  const [createOpen, setCreateOpen] = useState(false);
  const [filter, setFilter] = useState<"active" | "all">("active");

  const projects = (data?.projects || []).filter((p) => filter === "all" || p.status === "active");

  if (selectedProjectId) {
    return <ProjectDetail id={selectedProjectId} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects & Threads"
        subtitle="Unified dashboards that weave together every related task, note, journal, and deadline."
        icon="FolderKanban"
        color="#06b6d4"
        actions={
          <div className="flex gap-2">
            <div className="flex gap-1 rounded-lg bg-muted p-1">
              {(["active", "all"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn("rounded-md px-3 py-1 text-xs font-medium capitalize transition-all", filter === f ? "bg-background shadow-sm" : "text-muted-foreground")}
                >
                  {f}
                </button>
              ))}
            </div>
            <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
              <Icon name="Plus" className="h-4 w-4" /> New
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl border border-border/40 bg-muted/20 p-5">
              <div className="flex items-center gap-2">
                <div className="h-11 w-11 animate-pulse rounded-xl bg-muted/60" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-muted/60" />
                  <div className="h-2.5 w-1/3 animate-pulse rounded bg-muted/40" />
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="h-2.5 w-full animate-pulse rounded bg-muted/40" />
                <div className="h-2.5 w-4/5 animate-pulse rounded bg-muted/30" />
              </div>
              <div className="mt-4">
                <div className="mb-1 flex justify-between">
                  <div className="h-2.5 w-12 animate-pulse rounded bg-muted/40" />
                  <div className="h-2.5 w-8 animate-pulse rounded bg-muted/40" />
                </div>
                <div className="h-1.5 w-full animate-pulse rounded-full bg-muted/40" />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon="FolderPlus"
          title="No projects yet"
          description="Create a thread to unify related tasks, notes, journal entries, and deadlines."
          action={{ label: "Create project", onClick: () => setCreateOpen(true) }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <motion.button
              key={p.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => openProject(p.id)}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-5 text-left transition-all hover:border-border hover:shadow-md"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10 blur-2xl" style={{ background: p.color }} />
              <div className="mb-3 flex items-center gap-3">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-xl shadow-sm"
                  style={{ background: `${p.color}1a`, color: p.color }}
                >
                  <Icon name={p.icon || "FolderKanban"} className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold">{p.name}</h3>
                  {p.targetDate && (
                    <p className="text-[11px] text-muted-foreground">Target {smartDate(p.targetDate)}</p>
                  )}
                </div>
                {p.status !== "active" && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium capitalize text-muted-foreground">{p.status}</span>
                )}
              </div>
              <p className="mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground">{p.description || "No description"}</p>
              <div>
                <div className="mb-1.5 flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">{p.taskDone}/{p.taskTotal || p.itemCount} tasks · {p.itemCount} items</span>
                  <span className="font-semibold" style={{ color: p.color }}>{p.progress}%</span>
                </div>
                <Progress value={p.progress} className="h-1.5" />
              </div>
            </motion.button>
          ))}
        </div>
      )}

      <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

function ProjectDetail({ id }: { id: string }) {
  const { setView, openItemDetail, openItemEditor } = useLifeOS();
  const { data, isLoading } = useProject(id);
  const del = useDeleteProject();
  const updateItem = useUpdateItem();

  if (isLoading || !data) {
    return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted/40" />)}</div>;
  }

  const { project, stats } = data;
  const byType = (data.byType ?? {}) as Record<string, any[]>;
  const tasks = (byType.task || []).sort((a, b) => (a.status === "done" ? 1 : 0) - (b.status === "done" ? 1 : 0) || (new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime()));
  const notes = byType.note || [];
  const journals = (byType.journal || []).sort((a, b) => new Date(b.scheduledAt || b.createdAt).getTime() - new Date(a.scheduledAt || a.createdAt).getTime());
  const finances = byType.finance || [];
  const habits = byType.habit || [];
  const others = Object.entries(byType).filter(([t]) => !["task", "note", "journal", "finance", "habit"].includes(t)).flatMap(([, v]) => v);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 p-6" style={{ background: `linear-gradient(135deg, ${project.color}15, transparent 60%)` }}>
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full opacity-20 blur-3xl" style={{ background: project.color }} />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <button onClick={() => setView("projects")} className="mt-1 flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 hover:bg-muted">
              <Icon name="ArrowLeft" className="h-4 w-4" />
            </button>
            <span
              className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm"
              style={{ background: `${project.color}1a`, color: project.color }}
            >
              <Icon name={project.icon || "FolderKanban"} className="h-7 w-7" />
            </span>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
              {project.description && <p className="mt-1 max-w-xl text-sm text-muted-foreground">{project.description}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Icon name="ListChecks" className="h-3 w-3" />{stats.tasksDone}/{stats.tasksActive + stats.tasksDone} tasks</span>
                {project.targetDate && <span className="inline-flex items-center gap-1"><Icon name="CalendarClock" className="h-3 w-3" />Target {smartDate(project.targetDate)}</span>}
                <span className="inline-flex items-center gap-1"><Icon name="Layers" className="h-3 w-3" />{stats.total} items</span>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => openItemEditor({ type: "task", projectId: id })} className="gap-1.5">
            <Icon name="Plus" className="h-3.5 w-3.5" /> Add item
          </Button>
        </div>
        <div className="relative mt-4">
          <Progress value={project.progress} className="h-2" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border/60 bg-card/40 p-3">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Tasks done</p>
          <p className="mt-1 text-xl font-bold">{stats.tasksDone}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card/40 p-3">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Active tasks</p>
          <p className="mt-1 text-xl font-bold">{stats.tasksActive}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card/40 p-3">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Income</p>
          <p className="mt-1 text-xl font-bold text-emerald-500">${stats.income.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card/40 p-3">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Expense</p>
          <p className="mt-1 text-xl font-bold text-rose-500">${stats.expense.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tasks */}
        <div className="space-y-6 lg:col-span-2">
          <SectionCard title="Tasks" icon="CheckSquare" action={<Button variant="ghost" size="sm" onClick={() => openItemEditor({ type: "task", projectId: id })}><Icon name="Plus" className="mr-1 h-3.5 w-3.5" />Add</Button>}>
            {tasks.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No tasks yet.</p>
            ) : (
              <div className="space-y-2">
                {tasks.map((t) => <ItemCard key={t.id} item={t} onClick={() => openItemDetail(t.id)} />)}
              </div>
            )}
          </SectionCard>

          {notes.length > 0 && (
            <SectionCard title="Notes" icon="StickyNote">
              <div className="space-y-2">
                {notes.map((n) => <ItemCard key={n.id} item={n} onClick={() => openItemDetail(n.id)} />)}
              </div>
            </SectionCard>
          )}

          {others.length > 0 && (
            <SectionCard title="More" icon="Layers">
              <div className="space-y-2">
                {others.map((o) => <ItemCard key={o.id} item={o} onClick={() => openItemDetail(o.id)} />)}
              </div>
            </SectionCard>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {finances.length > 0 && (
            <SectionCard title="Budget" icon="Wallet">
              <div className="mb-3 flex items-center justify-between rounded-lg bg-muted/40 p-2.5">
                <span className="text-xs text-muted-foreground">Net</span>
                <span className="font-bold" style={{ color: stats.net >= 0 ? "#10b981" : "#f43f5e" }}>
                  {stats.net >= 0 ? "+" : "−"}${Math.abs(stats.net).toLocaleString()}
                </span>
              </div>
              <div className="space-y-2">
                {finances.map((f) => <ItemCard key={f.id} item={f} compact onClick={() => openItemDetail(f.id)} />)}
              </div>
            </SectionCard>
          )}

          {journals.length > 0 && (
            <SectionCard title="Journal" icon="BookHeart">
              <div className="max-h-80 space-y-2 overflow-y-auto">
                {journals.map((j) => (
                  <button key={j.id} onClick={() => openItemDetail(j.id)} className="w-full rounded-lg border border-border/60 p-3 text-left hover:bg-muted/40">
                    <p className="text-[11px] text-muted-foreground">{fmtDate(j.scheduledAt || j.createdAt, "MMM d, p")}</p>
                    <p className="mt-0.5 text-sm font-medium">{j.title}</p>
                    {j.content && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{j.content}</p>}
                  </button>
                ))}
              </div>
            </SectionCard>
          )}

          {habits.length > 0 && (
            <SectionCard title="Habits" icon="Repeat">
              <div className="space-y-2">
                {habits.map((h) => <ItemCard key={h.id} item={h} compact onClick={() => openItemDetail(h.id)} />)}
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}

function CreateProjectDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const create = useCreateProject();
  const { data: domData } = useDomains();
  const domains = domData?.domains || [];
  const [form, setForm] = useState({ name: "", description: "", color: COLORS[0], icon: ICONS[0], domainId: "", targetDate: "" });

  async function save() {
    if (!form.name.trim()) { notify.error("Name required"); return; }
    await create.mutateAsync({
      name: form.name.trim(),
      description: form.description,
      color: form.color,
      icon: form.icon,
      domainId: form.domainId || null,
      targetDate: form.targetDate ? new Date(form.targetDate).toISOString() : null,
    });
    notify.success("Project created");
    setForm({ name: "", description: "", color: COLORS[0], icon: ICONS[0], domainId: "", targetDate: "" });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>New project / thread</DialogTitle>
          <DialogDescription>A thread unifies related items across domains into one dashboard.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div>
            <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Name</Label>
            <Input autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Japan Trip 2025" />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Description</Label>
            <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Life domain</Label>
              <Select value={form.domainId || "none"} onValueChange={(value) => setForm({ ...form, domainId: value === "none" ? "" : value })}>
                <SelectTrigger>
                  <SelectValue placeholder="No domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No domain</SelectItem>
                  {domains.map((domain: any) => (
                    <SelectItem key={domain.id} value={domain.id}>
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ background: domain.color }} />
                        {domain.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Target date</Label>
              <Input type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setForm({ ...form, color: c })}
                  className={cn("h-7 w-7 rounded-full transition-all", form.color === c && "ring-2 ring-offset-2 ring-offset-background")}
                  style={{ background: c, ...(form.color === c ? { boxShadow: `0 0 0 2px ${c}` } : {}) }}
                />
              ))}
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Icon</Label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  onClick={() => setForm({ ...form, icon: ic })}
                  className={cn("flex h-9 w-9 items-center justify-center rounded-lg border transition-all", form.icon === ic ? "border-foreground" : "border-border/60 hover:bg-muted")}
                  style={form.icon === ic ? { background: `${form.color}1a`, color: form.color, borderColor: form.color } : {}}
                >
                  <Icon name={ic} className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={create.isPending}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
