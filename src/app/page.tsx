import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SmoothHashScroller, SmoothScrollLink } from "@/components/smooth-scroll-link";
import { siteConfig } from "@/lib/seo";
import type { Metadata } from "next";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Brain,
  Calendar,
  CircleDot,
  Command,
  Compass,
  ExternalLink,
  Flame,
  Frown,
  Github,
  Heart,
  Home,
  Laugh,
  Leaf,
  Meh,
  Network,
  Palette,
  PenLine,
  Quote,
  Repeat,
  ShieldCheck,
  Smile,
  SmilePlus,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  alternates: {
    canonical: siteConfig.repositoryUrl,
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.repositoryUrl,
    images: [
      {
        url: siteConfig.ogImage,
        width: 2058,
        height: 1338,
        alt: "Life OS public landing page and app preview",
      },
    ],
  },
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: siteConfig.name,
  alternateName: [
    "Open-source second brain",
    "Self-hosted personal operating system",
    "Digital brain app",
    "Habit tracker app",
    "Journal app",
    "Task manager",
    "Personal productivity dashboard",
  ],
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Any",
  description: siteConfig.description,
  url: siteConfig.repositoryUrl,
  codeRepository: siteConfig.repositoryUrl,
  license: `${siteConfig.repositoryUrl}/blob/main/LICENSE`,
  isAccessibleForFree: true,
  programmingLanguage: ["TypeScript", "JavaScript"],
  runtimePlatform: "Next.js",
  keywords: siteConfig.keywords.join(", "),
  featureList: [
    "Habit tracker with streaks and weekly heatmaps",
    "Journal app with mood tracking and reflections",
    "Task manager with priorities, due dates, and inbox capture",
    "Master calendar for tasks, bills, appointments, and events",
    "Digital brain graph for linked notes, tasks, goals, habits, and projects",
    "Focus timer with Pomodoro sessions and habit logging",
    "Finance tracker for income, expenses, bills, and goals",
    "Personal knowledge management with connected life domains",
  ],
  screenshot: siteConfig.screenshotUrls,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <SmoothHashScroller />
      {/* ─── Nav ─── */}
      <nav data-public-nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/20">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Life OS</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <SmoothScrollLink href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Features</SmoothScrollLink>
            <SmoothScrollLink href="#domains" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Domains</SmoothScrollLink>
            <SmoothScrollLink href="#philosophy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Philosophy</SmoothScrollLink>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-1.5 px-3" asChild>
              <a href={siteConfig.repositoryUrl} target="_blank" rel="noreferrer" aria-label="View Life OS on GitHub">
                <Github className="h-4 w-4" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
            </Button>
            <Link href="/app">
              <Button className="gap-1.5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-700">
                Open app <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden pt-32 pb-20">
        {/* animated gradient orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 top-10 h-96 w-96 animate-pulse rounded-full bg-emerald-500/10 blur-3xl" style={{ animationDuration: "4s" }} />
          <div className="absolute -right-20 top-40 h-96 w-96 animate-pulse rounded-full bg-violet-500/10 blur-3xl" style={{ animationDuration: "6s", animationDelay: "1s" }} />
          <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 animate-pulse rounded-full bg-cyan-500/10 blur-3xl" style={{ animationDuration: "5s" }} />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/50 px-4 py-1.5 text-sm backdrop-blur-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-muted-foreground">Open-source · Self-hostable · Your data, your brain</span>
          </div>

          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
            Your life,
            <br />
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              beautifully connected.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Life OS is a personal operating system where tasks, notes, journals, habits, and finances
            aren't isolated silos — they're a <span className="font-medium text-foreground">digital brain</span> where everything links together.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Use it as a habit tracker, journal app, task manager, focus timer, master calendar,
            finance tracker, goal tracker, and second brain in one open-source workspace.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/app">
              <Button size="lg" className="h-12 gap-2 bg-gradient-to-br from-emerald-500 to-teal-600 px-8 text-base text-white shadow-xl shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-700">
                Enter your brain <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <SmoothScrollLink href="#features">
              <Button size="lg" variant="outline" className="h-12 gap-2 px-8 text-base">
                Explore features
              </Button>
            </SmoothScrollLink>
            <Button size="lg" variant="ghost" className="h-12 gap-2 px-6 text-base" asChild>
              <a href={siteConfig.repositoryUrl} target="_blank" rel="noreferrer">
                <Github className="h-5 w-5" /> View source
              </a>
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            No signup needed · Runs entirely in your browser · ⌘K to capture anything
          </p>
        </div>

        {/* App preview mockup */}
        <div className="relative mx-auto mt-16 max-w-5xl px-6">
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/50 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center gap-2 border-b border-border/40 bg-muted/30 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-rose-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <div className="ml-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Brain className="h-3.5 w-3.5 text-emerald-500" /> Life OS — Dashboard
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 p-6">
              {/* mini dashboard mock — rich version */}
              <div className="col-span-2 space-y-3">
                {/* Hero greeting */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/10 to-transparent p-4">
                  <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-emerald-500/10 blur-xl" />
                  <p className="text-xs text-emerald-500">Good morning.</p>
                  <p className="mt-1 text-lg font-bold">Your day is open. What matters most?</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">Wednesday, June 18 · 0 completed today</p>
                </div>

                {/* Stat pills */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { l: "Inbox", v: "9", c: "#f59e0b", ic: Zap },
                    { l: "Due", v: "0", c: "#10b981", ic: Calendar },
                    { l: "Overdue", v: "0", c: "#f43f5e", ic: AlertTriangle },
                    { l: "Projects", v: "5", c: "#06b6d4", ic: BookOpen },
                  ].map((s) => (
                    <div key={s.l} className="rounded-lg border border-border/40 p-2.5">
                      <div className="flex items-center gap-1.5">
                        <s.ic className="h-3 w-3" style={{ color: s.c }} />
                        <p className="text-lg font-bold" style={{ color: s.c }}>{s.v}</p>
                      </div>
                      <p className="text-[9px] text-muted-foreground">{s.l}</p>
                    </div>
                  ))}
                </div>

                {/* Today's focus with tasks */}
                <div className="rounded-lg border border-border/40 p-3">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Today's focus</p>
                  <div className="space-y-1.5">
                    {[
                      { t: "Finish landing page copy", c: "#f59e0b", p: "Urgent", d: "Fri", proj: "Launch Startup", pc: "#10b981" },
                      { t: "Morning run 5km", c: "#10b981", p: "Med", d: "Tomorrow", proj: "Health", pc: "#f43f5e" },
                      { t: "Book flights to Tokyo", c: "#f59e0b", p: "High", d: "In 7d", proj: "Japan Trip", pc: "#ec4899" },
                      { t: "Pay credit card bill", c: "#f59e0b", p: "Urgent", d: "Sat", proj: "Debt", pc: "#71717a" },
                    ].map((item) => (
                      <div key={item.t} className="flex items-center gap-2 rounded-lg bg-muted/20 px-2 py-1.5">
                        <div className="h-3.5 w-3.5 rounded-md border-2" style={{ borderColor: item.c }} />
                        <span className="flex-1 truncate text-xs font-medium">{item.t}</span>
                        <span className="rounded px-1 text-[8px] font-bold uppercase" style={{ background: `${item.c}20`, color: item.c }}>{item.p}</span>
                        <span className="text-[9px] text-muted-foreground">{item.d}</span>
                        <span className="hidden text-[9px] sm:inline" style={{ color: item.pc }}>{item.proj}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active projects with progress */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { n: "Japan Trip 2025", c: "#ec4899", p: 35 },
                    { n: "Health Transformation", c: "#f43f5e", p: 55 },
                  ].map((proj) => (
                    <div key={proj.n} className="rounded-lg border border-border/40 p-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full" style={{ background: proj.c }} />
                        <span className="truncate text-[10px] font-semibold">{proj.n}</span>
                      </div>
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full" style={{ width: `${proj.p}%`, background: proj.c }} />
                      </div>
                      <p className="mt-0.5 text-right text-[8px] text-muted-foreground">{proj.p}%</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right sidebar */}
              <div className="space-y-3">
                {/* Affirmation */}
                <div className="rounded-xl bg-gradient-to-br from-violet-500/10 to-transparent p-3">
                  <div className="flex items-center gap-1">
                    <Quote className="h-3 w-3 text-violet-500" />
                    <p className="text-[10px] font-semibold uppercase text-violet-500">Affirmation</p>
                  </div>
                  <p className="mt-1.5 text-xs font-medium italic leading-relaxed">"I am capable of hard things"</p>
                </div>

                {/* Mood check-in */}
                <div className="rounded-xl border border-border/40 p-3">
                  <p className="mb-2 text-[10px] font-semibold uppercase text-muted-foreground">How are you feeling?</p>
                  <div className="flex justify-between">
                    {[
                      { icon: Frown, c: "#f43f5e" },
                      { icon: Meh, c: "#f59e0b" },
                      { icon: Smile, c: "#eab308" },
                      { icon: SmilePlus, c: "#10b981" },
                      { icon: Laugh, c: "#06b6d4" },
                    ].map((m, i) => (
                      <div key={i} className={`flex h-7 w-7 items-center justify-center rounded-lg ${i === 3 ? "bg-violet-500/15 ring-1 ring-violet-500/30" : ""}`}>
                        {(() => {
                          const I = m.icon;
                          return <I className="h-3.5 w-3.5" style={{ color: m.c }} />;
                        })()}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Habits */}
                <div className="rounded-xl border border-border/40 p-3">
                  <div className="mb-2 flex items-center gap-1">
                    <Repeat className="h-3 w-3 text-emerald-500" />
                    <p className="text-[10px] font-semibold uppercase text-muted-foreground">Habits this week</p>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { h: "Meditate", d: [1,1,0,1,1,1,0], s: 4 },
                      { h: "Read 20pg", d: [1,1,1,1,0,1,1], s: 6 },
                      { h: "Water 2L", d: [1,1,1,1,1,1,1], s: 9 },
                    ].map((hab) => (
                      <div key={hab.h} className="flex items-center gap-1.5">
                        <span className="w-16 truncate text-[9px] text-muted-foreground">{hab.h}</span>
                        <div className="flex gap-0.5">
                          {hab.d.map((d, i) => (
                            <div key={i} className={`h-2 w-2 rounded-full ${d ? "bg-emerald-500" : "bg-muted"}`} />
                          ))}
                        </div>
                        <span className="ml-auto inline-flex items-center gap-0.5 text-[8px] font-bold text-emerald-500"><Flame className="h-2 w-2" />{hab.s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Week finance */}
                <div className="rounded-xl border border-border/40 p-3">
                  <div className="mb-1.5 flex items-center gap-1">
                    <Wallet className="h-3 w-3 text-emerald-500" />
                    <p className="text-[10px] font-semibold uppercase text-muted-foreground">This week</p>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="rounded bg-emerald-500/10 p-1.5 text-center">
                      <p className="text-[8px] uppercase text-emerald-600">Income</p>
                      <p className="text-xs font-bold text-emerald-600">$4,200</p>
                    </div>
                    <div className="rounded bg-rose-500/10 p-1.5 text-center">
                      <p className="text-[8px] uppercase text-rose-500">Expenses</p>
                      <p className="text-xs font-bold text-rose-500">$1,635</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Live Feature Demos ─── */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">See it in action.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Real, interactive previews of what Life OS looks like. No screenshots — these are live.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Live: Quick Capture demo */}
            <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-6 transition-all hover:shadow-xl">
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-500/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500"><Zap className="h-5 w-5" /></span>
                <h3 className="text-lg font-semibold">Quick Capture</h3>
                <kbd className="ml-auto rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-bold">⌘K</kbd>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">Press ⌘K anywhere to capture a thought. It goes to your inbox — process it later.</p>
              <div className="rounded-xl border border-border/40 bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Zap className="h-3.5 w-3.5 text-amber-500" /> Quick Capture <span className="ml-auto rounded border border-border bg-muted px-1 text-[9px]">⌘K</span>
                </div>
                <div className="mt-2 flex gap-1">
                  {["Task", "Idea", "Journal", "Bookmark"].map((t, i) => (
                    <span key={i} className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${i === 0 ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground"}`}>{t}</span>
                  ))}
                </div>
                <div className="mt-2 rounded-lg bg-background p-2 text-xs text-muted-foreground">
                  What's on your mind? Press Enter to capture…
                </div>
              </div>
            </div>

            {/* Live: Brain Graph demo */}
            <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-6 transition-all hover:shadow-xl">
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-500/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15 text-violet-500"><Network className="h-5 w-5" /></span>
                <h3 className="text-lg font-semibold">Brain Graph</h3>
                <span className="ml-auto text-[10px] text-muted-foreground">28 connections</span>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">See your entire life as a visual network. Everything connects.</p>
              <svg viewBox="0 0 300 160" className="w-full">
                <line x1="80" y1="50" x2="150" y2="80" stroke="#a78bfa" strokeOpacity="0.3" strokeWidth="1.5" />
                <line x1="150" y1="80" x2="220" y2="50" stroke="#a78bfa" strokeOpacity="0.3" strokeWidth="1.5" />
                <line x1="80" y1="50" x2="100" y2="120" stroke="#a78bfa" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="150" y1="80" x2="200" y2="120" stroke="#a78bfa" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="100" y1="120" x2="200" y2="120" stroke="#a78bfa" strokeOpacity="0.25" strokeWidth="1" />
                <circle cx="80" cy="50" r="8" fill="#f59e0b" />
                <rect x="142" y="72" width="16" height="16" rx="3" fill="#a78bfa" />
                <circle cx="220" cy="50" r="8" fill="#10b981" />
                <circle cx="100" cy="120" r="7" fill="#06b6d4" />
                <circle cx="200" cy="120" r="7" fill="#ec4899" />
                <text x="80" y="38" textAnchor="middle" className="fill-foreground text-[8px] font-medium">Task</text>
                <text x="150" y="100" textAnchor="middle" className="fill-foreground text-[8px] font-medium">Project</text>
                <text x="220" y="38" textAnchor="middle" className="fill-foreground text-[8px] font-medium">Habit</text>
                <text x="100" y="138" textAnchor="middle" className="fill-foreground text-[8px] font-medium">Journal</text>
                <text x="200" y="138" textAnchor="middle" className="fill-foreground text-[8px] font-medium">Goal</text>
              </svg>
            </div>

            {/* Live: Focus Timer demo */}
            <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-6 transition-all hover:shadow-xl">
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-orange-500/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/15 text-orange-500"><Brain className="h-5 w-5" /></span>
                <h3 className="text-lg font-semibold">Focus Timer</h3>
                <span className="ml-auto text-[10px] text-muted-foreground">3 cycles · 75 min</span>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">Pomodoro timer with custom durations, sound, and habit auto-logging.</p>
              <div className="flex items-center justify-center gap-4">
                <svg viewBox="0 0 120 120" className="h-28 w-28">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="var(--muted)" strokeWidth="6" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" strokeDasharray="327" strokeDashoffset="82" transform="rotate(-90 60 60)" />
                </svg>
                <div>
                  <div className="font-mono text-3xl font-bold tabular-nums">17:30</div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">in progress</div>
                  <div className="mt-2 flex gap-1 text-amber-500"><CircleDot className="h-4 w-4" /><CircleDot className="h-4 w-4" /><CircleDot className="h-4 w-4" /></div>
                </div>
              </div>
            </div>

            {/* Live: Habit tracker demo */}
            <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-6 transition-all hover:shadow-xl">
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-500/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500"><Repeat className="h-5 w-5" /></span>
                <h3 className="text-lg font-semibold">Habit Tracker</h3>
                <span className="ml-auto inline-flex items-center gap-0.5 text-[10px] text-muted-foreground"><Flame className="h-3 w-3 text-orange-500" /> 9 day streak</span>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">Build streaks with a visual heatmap. One tap to log.</p>
              <div className="space-y-2">
                {[
                  { name: "Meditate 10 min", done: [1,1,0,1,1,1,0], streak: 4 },
                  { name: "Read 20 pages", done: [1,1,1,1,0,1,1], streak: 6 },
                  { name: "Drink 2L water", done: [1,1,1,1,1,1,1], streak: 9 },
                ].map((h) => (
                  <div key={h.name} className="flex items-center gap-2">
                    <span className="w-28 truncate text-xs font-medium">{h.name}</span>
                    <div className="flex gap-1">
                      {h.done.map((d, i) => (
                        <div key={i} className={`h-4 w-4 rounded-sm ${d ? "bg-emerald-500" : "bg-muted"}`} />
                      ))}
                    </div>
                    <span className="ml-auto inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-500"><Flame className="h-3 w-3" />{h.streak}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats bar ─── */}
      <section className="border-y border-border/40 bg-muted/20 py-12">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 sm:grid-cols-4">
          {[
            { v: "17", l: "Item types" },
            { v: "8", l: "Life domains" },
            { v: "∞", l: "Connections" },
            { v: "100%", l: "Your data" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <p className="text-4xl font-bold bg-gradient-to-br from-emerald-500 to-teal-600 bg-clip-text text-transparent">{s.v}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="scroll-mt-24 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Not another to-do app.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Life OS weaves every part of your life into one interconnected system —
              a sanctuary, not a spreadsheet.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Brain, color: "#a78bfa", title: "Digital Brain", desc: "Everything is a node. Tasks link to journals, journals link to projects, projects link to goals. Bi-directional connections make your data come alive." },
              { icon: Calendar, color: "#06b6d4", title: "Master Calendar", desc: "One calendar that auto-aggregates tasks, bills, appointments, and birthdays. Toggle layers to view your life through different lenses." },
              { icon: Zap, color: "#f59e0b", title: "Frictionless Capture", desc: "Press ⌘K anywhere to capture a thought instantly. It goes to an inbox you process later. Never decide where to put something in the moment." },
              { icon: Network, color: "#10b981", title: "Brain Graph", desc: "See your entire life as a visual network. Zoom, pan, and discover connections you never knew existed between your thoughts." },
              { icon: PenLine, color: "#ec4899", title: "Rich Journal Editor", desc: "A full-page writing experience with markdown formatting, word counts, and mood tracking. Your thoughts deserve more than a text box." },
              { icon: Repeat, color: "#10b981", title: "Habit Tracker", desc: "Build streaks with a beautiful heatmap. Mark habits with one tap. See your consistency over weeks at a glance." },
              { icon: TrendingUp, color: "#10b981", title: "Insights & Charts", desc: "Mood trends, habit consistency, activity flow, and financial health — all visualized so you can spot patterns and grow." },
              { icon: Leaf, color: "#a78bfa", title: "Sanctuary Mode", desc: "A calm space for breathing exercises, daily affirmations, and life visions. Sometimes the most productive thing is to pause." },
              { icon: Command, color: "#71717a", title: "Keyboard First", desc: "⌘K to capture, ⌘P for command palette, g+d to navigate. Vim-style shortcuts make power users feel at home." },
            ].map((f) => (
              <div
                key={f.title}
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-6 transition-all hover:border-border hover:shadow-lg"
              >
                <div
                  className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-20"
                  style={{ background: f.color }}
                />
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl shadow-sm"
                  style={{ background: `${f.color}18`, color: f.color }}
                >
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Domains ─── */}
      <section id="domains" className="scroll-mt-24 border-y border-border/40 bg-muted/20 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Eight domains. One system.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Each domain has its own smart widget — purpose-built for that part of your life.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Compass, color: "#a78bfa", name: "Mind & Soul", desc: "Values, visions, affirmations, breathing exercises" },
              { icon: Calendar, color: "#f59e0b", name: "Time & Action", desc: "Tasks, habits, routines, today's focus" },
              { icon: Heart, color: "#f43f5e", name: "Health & Body", desc: "Symptoms, medications, appointments, vitals" },
              { icon: Wallet, color: "#10b981", name: "Wealth & Career", desc: "Income, expenses, subscriptions, savings goals" },
              { icon: Users, color: "#06b6d4", name: "Network", desc: "Contacts, follow-ups, birthdays, relationships" },
              { icon: BookOpen, color: "#3b82f6", name: "Growth", desc: "Reading list, courses, skills, takeaways" },
              { icon: Palette, color: "#ec4899", name: "Creativity & Joy", desc: "Ideas, media log, bucket list, events" },
              { icon: Home, color: "#71717a", name: "Admin", desc: "Documents, home maintenance, grocery lists" },
            ].map((d) => (
              <div
                key={d.name}
                className="group rounded-2xl border border-border/60 bg-card/50 p-5 transition-all hover:shadow-md"
                style={{ borderColor: `${d.color}30` }}
              >
                <div
                  className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ background: `${d.color}18`, color: d.color }}
                >
                  <d.icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold" style={{ color: d.color }}>{d.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Philosophy ─── */}
      <section id="philosophy" className="scroll-mt-24 py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-violet-500/5 via-transparent to-emerald-500/5 p-8 sm:p-12">
            <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">A sanctuary, not a spreadsheet.</h2>
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted-foreground">
                <p>
                  Most life management apps treat your life as a list of boxes to check. Life OS treats it as
                  a <span className="font-medium text-foreground">living ecosystem</span> where everything connects.
                </p>
                <p>
                  When you write a journal entry about stressing over money, you can link it to your
                  "Get out of Debt" project. When a bill is due Tuesday, it appears on your master calendar
                  automatically. When you haven't called your mom in 3 weeks, Life OS gently reminds you.
                </p>
                <p>
                  This isn't about doing more. It's about <span className="font-medium text-foreground">doing what matters</span>,
                  with clarity and calm.
                </p>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { icon: Brain, title: "Interconnected", desc: "Bi-directional links between everything" },
                  { icon: Leaf, title: "Calm by design", desc: "Soft gradients, breathing exercises, no noise" },
                  { icon: TrendingUp, title: "Growth-oriented", desc: "Insights, reflections, and gentle prompts" },
                ].map((p) => (
                  <div key={p.title} className="rounded-xl border border-border/40 bg-background/50 p-4">
                    <p.icon className="mb-2 h-5 w-5 text-emerald-500" />
                    <p className="text-sm font-semibold">{p.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Ready to build your
            <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent"> digital brain?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            No signup. No subscription. Just open the app and start connecting your life.
          </p>
          <Link href="/app">
            <Button size="lg" className="mt-8 h-14 gap-2 bg-gradient-to-br from-emerald-500 to-teal-600 px-10 text-base text-white shadow-xl shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-700">
              Open Life OS <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="ml-0 mt-3 h-14 gap-2 px-8 text-base sm:ml-3 sm:mt-0" asChild>
            <a href={siteConfig.repositoryUrl} target="_blank" rel="noreferrer">
              <Github className="h-5 w-5" /> GitHub <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border/40 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">Life OS</span>
            <span className="text-sm text-muted-foreground">· Your digital brain, interconnected.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <SmoothScrollLink href="#features" className="hover:text-foreground">Features</SmoothScrollLink>
            <SmoothScrollLink href="#domains" className="hover:text-foreground">Domains</SmoothScrollLink>
            <SmoothScrollLink href="#philosophy" className="hover:text-foreground">Philosophy</SmoothScrollLink>
            <a href={siteConfig.repositoryUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-foreground">
              <Github className="h-3.5 w-3.5" /> GitHub
            </a>
            <Link href="/app" className="hover:text-foreground">Open app</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
