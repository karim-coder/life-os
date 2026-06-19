"use client";

import { useLifeOS } from "@/store/life-os";
import { useStats, useItems, useProjects, useReviews } from "@/lib/hooks";
import { Icon } from "../icon";
import { PageHeader, SectionCard, StatPill, EmptyState } from "../layout";
import { ItemCard } from "../item-card";
import { MoodCheckIn } from "../mood-check-in";
import { OnThisDay } from "../on-this-day";
import { FollowUpDue } from "../follow-up-due";
import { ReadingTracker } from "../reading-tracker";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DOMAINS, ITEM_TYPE_MAP } from "@/lib/constants";
import { fmtDate, smartDate } from "@/lib/dates";
import { motion } from "framer-motion";

export function DashboardView() {
  const { setView, openItemDetail, openProject, openItemEditor, setQuickCaptureOpen } = useLifeOS();
  const { data: stats, isLoading } = useStats();
  const { data: todayData } = useItems({ type: "task", status: "active" });
  const { data: projData } = useProjects();
  const { data: reviewData } = useReviews();

  const today = new Date();
  const greeting = today.getHours() < 12 ? "Good morning" : today.getHours() < 18 ? "Good afternoon" : "Good evening";

  const tasks = todayData?.items || [];
  const tasksToday = tasks.filter((t) => {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate);
    return d.toDateString() === today.toDateString();
  });
  const overdue = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < today && t.status !== "done");
  const upcoming = tasks
    .filter((t) => t.dueDate && new Date(t.dueDate) > today)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const projects = (projData?.projects || []).filter((p) => p.status === "active").slice(0, 4);
  const lastReview = reviewData?.reviews?.[0];
  const reviewAge = lastReview ? Math.floor((today.getTime() - new Date(lastReview.date).getTime()) / 86400000) : 999;

  return (
    <div className="space-y-6">
      {/* Hero greeting */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent p-6"
      >
        <div className="relative z-10">
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{greeting}.</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {tasksToday.length > 0
              ? `You have ${tasksToday.length} task${tasksToday.length > 1 ? "s" : ""} due today.`
              : overdue.length > 0
                ? `${overdue.length} task${overdue.length > 1 ? "s" : ""} overdue.`
                : "Your day is open. What matters most?"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {today.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            {stats?.completedToday ? ` · ${stats.completedToday} completed today` : ""}
          </p>
        </div>
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-teal-500/10 blur-3xl" />
      </motion.div>

      {/* Stat pills */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button onClick={() => setView("inbox")} className="text-left">
          <StatPill label="In inbox" value={stats?.inboxCount ?? "—"} color="#f59e0b" icon="Inbox" />
        </button>
        <button onClick={() => setView("calendar")} className="text-left">
          <StatPill label="Due today" value={stats?.tasksToday ?? "—"} color="#10b981" icon="CalendarClock" />
        </button>
        <button onClick={() => setView("calendar")} className="text-left">
          <StatPill label="Overdue" value={stats?.tasksOverdue ?? "—"} color="#f43f5e" icon="AlertTriangle" />
        </button>
        <button onClick={() => setView("projects")} className="text-left">
          <StatPill label="Active projects" value={stats?.activeProjects ?? "—"} color="#06b6d4" icon="FolderKanban" />
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's focus — main column */}
        <div className="space-y-6 lg:col-span-2">
          <SectionCard
            title="Today's focus"
            icon="Target"
            action={
              <Button variant="ghost" size="sm" onClick={() => openItemEditor({ type: "task" })}>
                <Icon name="Plus" className="mr-1 h-3.5 w-3.5" /> Add task
              </Button>
            }
          >
            {tasksToday.length === 0 && overdue.length === 0 && upcoming.length === 0 ? (
              <EmptyState
                icon="Coffee"
                title="Nothing scheduled today"
                description="A clear calendar is a gift. Capture a thought or plan something meaningful."
                action={{ label: "Quick Capture", onClick: () => setQuickCaptureOpen(true) }}
              />
            ) : (
              <div className="space-y-4">
                {overdue.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-rose-500">Overdue</p>
                    <div className="space-y-2">
                      {overdue.slice(0, 4).map((t) => (
                        <ItemCard key={t.id} item={t} showProject onClick={() => openItemDetail(t.id)} />
                      ))}
                    </div>
                  </div>
                )}
                {tasksToday.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-500">Today</p>
                    <div className="space-y-2">
                      {tasksToday.map((t) => (
                        <ItemCard key={t.id} item={t} showProject onClick={() => openItemDetail(t.id)} />
                      ))}
                    </div>
                  </div>
                )}
                {upcoming.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Coming up</p>
                    <div className="space-y-2">
                      {upcoming.map((t) => (
                        <ItemCard key={t.id} item={t} showProject onClick={() => openItemDetail(t.id)} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </SectionCard>

          {/* Active projects */}
          <SectionCard
            title="Active threads"
            icon="FolderKanban"
            action={<Button variant="ghost" size="sm" onClick={() => setView("projects")}>View all</Button>}
          >
            {projects.length === 0 ? (
              <EmptyState icon="FolderPlus" title="No active projects" description="Create a thread to unify related tasks, notes, and journal entries." />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => openProject(p.id)}
                    className="group rounded-xl border border-border/60 p-4 text-left transition-all hover:border-border hover:shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ background: p.color }} />
                      <span className="flex-1 truncate text-sm font-semibold">{p.name}</span>
                      <Icon name="ArrowUpRight" className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{p.description || "No description"}</p>
                    <div className="mt-3">
                      <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{p.taskDone}/{p.taskTotal || p.itemCount} done</span>
                        <span>{p.progress}%</span>
                      </div>
                      <Progress value={p.progress} className="h-1.5" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Bottom row: Life balance + Habits side by side */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Habits */}
            {stats?.habitStats && stats.habitStats.length > 0 && (
              <SectionCard title="Habits this week" icon="Repeat">
                <div className="space-y-2.5">
                  {stats.habitStats.slice(0, 4).map((h: any) => (
                    <div key={h.id}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="truncate font-medium">{h.title}</span>
                        <span className="ml-2 flex-shrink-0 text-muted-foreground">{h.doneThisWeek}/7</span>
                      </div>
                      <div className="flex gap-1">
                        {Array.from({ length: 7 }).map((_, i) => (
                          <div
                            key={i}
                            className="h-2 flex-1 rounded-full"
                            style={{ background: i < h.doneThisWeek ? "#10b981" : "var(--muted)" }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Life balance */}
            <SectionCard title="Life balance" icon="Scale">
              <div className="space-y-1.5">
                {DOMAINS.map((d) => {
                  const count = stats?.byDomain?.find((b: any) => b.domain === d.key)?.count || 0;
                  const max = Math.max(1, ...(stats?.byDomain?.map((b: any) => b.count) || [1]));
                  return (
                    <div key={d.key} className="flex items-center gap-2">
                      <span className="w-16 truncate text-[10px] text-muted-foreground">{d.short}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${(count / max) * 100}%`, background: d.color }}
                        />
                      </div>
                      <span className="w-5 text-right text-[10px] tabular-nums text-muted-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </div>
        </div>

        {/* Right sidebar — quick actions and reminders */}
        <div className="space-y-4">
          {/* Mood check-in */}
          <MoodCheckIn />

          {/* Review prompt */}
          <SectionCard title="Reflection" icon="NotebookPen" className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5">
            {reviewAge > 1 ? (
              <div>
                <p className="text-sm">
                  {reviewAge > 7
                    ? "It's been a while since you reflected. Take a moment to close the loop on your week."
                    : `Your last ${lastReview?.type || "daily"} review was ${reviewAge} days ago.`}
                </p>
                <Button size="sm" className="mt-3" onClick={() => setView("reviews")}>
                  <Icon name="NotebookPen" className="mr-1 h-3.5 w-3.5" /> Start reflection
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-sm">You reflected {reviewAge === 0 ? "today" : "yesterday"}. Beautiful.</p>
                {lastReview?.wins && (
                  <p className="mt-2 rounded-lg bg-background/60 p-2 text-xs italic text-muted-foreground">
                    “{lastReview.wins}”
                  </p>
                )}
              </div>
            )}
          </SectionCard>

          {/* Week finance */}
          {stats?.week && (stats.week.income > 0 || stats.week.expense > 0) && (
            <SectionCard title="This week" icon="Wallet">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg bg-emerald-500/10 p-2.5">
                  <p className="text-[9px] uppercase tracking-wide text-emerald-600">Income</p>
                  <p className="mt-0.5 text-base font-bold text-emerald-600">${stats.week.income.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-rose-500/10 p-2.5">
                  <p className="text-[9px] uppercase tracking-wide text-rose-500">Expenses</p>
                  <p className="mt-0.5 text-base font-bold text-rose-500">${stats.week.expense.toLocaleString()}</p>
                </div>
              </div>
            </SectionCard>
          )}

          {/* Follow-up reminders */}
          <FollowUpDue />

          {/* On this day */}
          <OnThisDay />

          {/* Reading list */}
          <ReadingTracker />
        </div>
      </div>
    </div>
  );
}
