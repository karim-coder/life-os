"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qk = {
  items: (params?: Record<string, string>) => ["items", params] as const,
  item: (id: string) => ["item", id] as const,
  inbox: ["inbox"] as const,
  projects: ["projects"] as const,
  project: (id: string) => ["project", id] as const,
  calendar: (params?: Record<string, string>) => ["calendar", params] as const,
  reviews: (type?: string) => ["reviews", type] as const,
  stats: ["stats"] as const,
  tags: ["tags"] as const,
  domains: ["domains"] as const,
  search: (q: string) => ["search", q] as const,
  habitLogs: (id: string) => ["habitLogs", id] as const,
  insights: ["insights"] as const,
  graph: (params?: Record<string, string>) => ["graph", params] as const,
  onThisDay: ["onThisDay"] as const,
};

async function jfetch<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(opts?.headers || {}) },
    ...opts,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || res.statusText);
  }
  return res.json() as Promise<T>;
}

// ── Items ──
export function useItems(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return useQuery({
    queryKey: qk.items(params),
    queryFn: () => jfetch<{ items: any[] }>(`/api/items${qs ? `?${qs}` : ""}`),
  });
}

export function useItem(id: string | null) {
  return useQuery({
    queryKey: qk.item(id!),
    queryFn: () => jfetch<any>(`/api/items/${id}`),
    enabled: !!id,
  });
}

export function useCreateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => jfetch<any>("/api/items", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items"] });
      qc.invalidateQueries({ queryKey: qk.inbox });
      qc.invalidateQueries({ queryKey: qk.stats });
      qc.invalidateQueries({ queryKey: ["project"] });
      qc.invalidateQueries({ queryKey: qk.calendar() });
    },
  });
}

export function useUpdateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: any) =>
      jfetch<any>(`/api/items/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["items"] });
      qc.invalidateQueries({ queryKey: qk.item(vars.id) });
      qc.invalidateQueries({ queryKey: qk.inbox });
      qc.invalidateQueries({ queryKey: qk.stats });
      qc.invalidateQueries({ queryKey: ["project"] });
      qc.invalidateQueries({ queryKey: qk.calendar() });
    },
  });
}

export function useDeleteItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jfetch<any>(`/api/items/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items"] });
      qc.invalidateQueries({ queryKey: qk.inbox });
      qc.invalidateQueries({ queryKey: qk.stats });
      qc.invalidateQueries({ queryKey: ["project"] });
      qc.invalidateQueries({ queryKey: qk.calendar() });
    },
  });
}

// ── Inbox ──
export function useInbox() {
  return useQuery({ queryKey: qk.inbox, queryFn: () => jfetch<{ items: any[] }>("/api/inbox") });
}

export function useQuickCapture() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => jfetch<any>("/api/inbox", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.inbox });
      qc.invalidateQueries({ queryKey: qk.stats });
    },
  });
}

// ── Projects ──
export function useProjects() {
  return useQuery({ queryKey: qk.projects, queryFn: () => jfetch<{ projects: any[] }>("/api/projects") });
}

export function useProject(id: string | null) {
  return useQuery({
    queryKey: qk.project(id!),
    queryFn: () => jfetch<any>(`/api/projects/${id}`),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => jfetch<any>("/api/projects", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.projects }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: any) =>
      jfetch<any>(`/api/projects/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: qk.projects });
      qc.invalidateQueries({ queryKey: qk.project(vars.id) });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jfetch<any>(`/api/projects/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.projects }),
  });
}

// ── Calendar ──
export function useCalendar(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return useQuery({ queryKey: qk.calendar(params), queryFn: () => jfetch<any>(`/api/calendar?${qs}`) });
}

// ── Reviews ──
export function useReviews(type?: string) {
  const qs = type ? `?type=${type}` : "";
  return useQuery({ queryKey: qk.reviews(type), queryFn: () => jfetch<{ reviews: any[] }>(`/api/reviews${qs}`) });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => jfetch<any>("/api/reviews", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews"] });
      qc.invalidateQueries({ queryKey: qk.stats });
    },
  });
}

export function useUpdateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: any) =>
      jfetch<any>(`/api/reviews/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviews"] }),
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jfetch<any>(`/api/reviews/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviews"] }),
  });
}

// ── Stats ──
export function useStats() {
  return useQuery({ queryKey: qk.stats, queryFn: () => jfetch<any>("/api/stats") });
}

// ── Tags ──
export function useTags() {
  return useQuery({ queryKey: qk.tags, queryFn: () => jfetch<{ tags: any[] }>("/api/tags") });
}

// ── Domains ──
export function useDomains() {
  return useQuery({ queryKey: qk.domains, queryFn: () => jfetch<{ domains: any[] }>("/api/domains") });
}

// ── Insights ──
export function useInsights() {
  return useQuery({ queryKey: qk.insights, queryFn: () => jfetch<any>("/api/insights") });
}

// ── Graph ──
export function useGraph(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return useQuery({ queryKey: qk.graph(params), queryFn: () => jfetch<any>(`/api/graph?${qs}`) });
}

// ── Export ──
export function downloadCSV(type: "finance" | "reviews" | "items") {
  const a = document.createElement("a");
  a.href = `/api/export?type=${type}`;
  a.download = "";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ── On this day ──
export function useOnThisDay() {
  return useQuery({ queryKey: qk.onThisDay, queryFn: () => jfetch<any>("/api/on-this-day") });
}

// ── Scheduler ──
export function useRunScheduler() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => jfetch<any>("/api/scheduler", { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items"] });
      qc.invalidateQueries({ queryKey: qk.stats });
      qc.invalidateQueries({ queryKey: qk.calendar() });
      qc.invalidateQueries({ queryKey: qk.insights });
    },
  });
}

// ── Search ──
export function useSearch(q: string) {
  return useQuery({
    queryKey: qk.search(q),
    queryFn: () => jfetch<any>(`/api/search?q=${encodeURIComponent(q)}`),
    enabled: q.length > 0,
  });
}

// ── Habit logs ──
export function useToggleHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, date, value }: { id: string; date?: string; value?: number }) =>
      jfetch<any>(`/api/items/${id}/habit-logs`, { method: "POST", body: JSON.stringify({ date, value }) }),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: qk.item(vars.id) });
      qc.invalidateQueries({ queryKey: qk.habitLogs(vars.id) });
      qc.invalidateQueries({ queryKey: qk.stats });
      qc.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

// ── Links ──
export function useCreateLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ fromId, ...body }: any) =>
      jfetch<any>(`/api/items/${fromId}/links`, { method: "POST", body: JSON.stringify(body) }),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: qk.item(vars.fromId) });
    },
  });
}

export function useDeleteLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ fromId, toId, type }: { fromId: string; toId: string; type?: string }) =>
      jfetch<any>(`/api/items/${fromId}/links?toId=${toId}&type=${type || "related"}`, { method: "DELETE" }),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: qk.item(vars.fromId) });
    },
  });
}
