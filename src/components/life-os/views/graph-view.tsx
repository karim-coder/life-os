"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useGraph } from "@/lib/hooks";
import { useLifeOS } from "@/store/life-os";
import { Icon } from "../icon";
import { PageHeader, SectionCard, EmptyState } from "../layout";
import { Button } from "@/components/ui/button";
import { ITEM_TYPES, ITEM_TYPE_MAP } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface SimNode {
  id: string;
  kind: "item" | "project";
  type: string;
  title: string;
  color: string;
  status?: string;
  x: number;
  y: number;
  r: number;
}

interface SimEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  kind: "link" | "project";
}

export function GraphView() {
  const { openItemDetail, openProject } = useLifeOS();
  const { data, isLoading } = useGraph({ limit: "120" });
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 800, h: 560 });
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [filterKinds, setFilterKinds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  // positions snapshot, updated by the simulation loop
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  // zoom & pan
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const simRef = useRef<{ nodes: Map<string, { x: number; y: number; vx: number; vy: number; r: number }>; edges: SimEdge[] }>({ nodes: new Map(), edges: [] });

  // track container size
  useEffect(() => {
    function update() {
      if (containerRef.current) {
        const r = containerRef.current.getBoundingClientRect();
        setDims({ w: r.width, h: Math.max(520, r.height) });
      }
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // keyboard zoom shortcuts (only when graph is visible)
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (document.activeElement?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (e.key === "+" || e.key === "=") {
        setZoom((z) => Math.min(3, z + 0.2));
      } else if (e.key === "-" || e.key === "_") {
        setZoom((z) => Math.max(0.3, z - 0.2));
      } else if (e.key === "0") {
        setZoom(1);
        setPan({ x: 0, y: 0 });
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // initialize simulation nodes from data
  useEffect(() => {
    if (!data) return;
    const cx = dims.w / 2;
    const cy = dims.h / 2;
    const map = new Map<string, { x: number; y: number; vx: number; vy: number; r: number }>();
    for (const n of data.nodes) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 80 + Math.random() * 180;
      map.set(n.id, {
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        r: n.kind === "project" ? 14 : 8,
      });
    }
    simRef.current = { nodes: map, edges: data.edges as SimEdge[] };
    // emit initial positions
    const pos: Record<string, { x: number; y: number }> = {};
    for (const [id, n] of map) pos[id] = { x: n.x, y: n.y };
    setPositions(pos);
  }, [data, dims.w, dims.h]);

  // physics simulation loop
  useEffect(() => {
    if (!data || simRef.current.nodes.size === 0) return;
    let raf: number;
    let alpha = 1;
    let frame = 0;

    function step() {
      const { nodes, edges } = simRef.current;
      const cx = dims.w / 2;
      const cy = dims.h / 2;
      alpha = Math.max(0.02, alpha * 0.985);

      // edge springs
      for (const e of edges) {
        const a = nodes.get(e.source);
        const b = nodes.get(e.target);
        if (!a || !b) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const ideal = e.kind === "project" ? 90 : 120;
        const force = (dist - ideal) * 0.02 * alpha;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx += fx; a.vy += fy;
        b.vx -= fx; b.vy -= fy;
      }

      // repulsion
      const arr = Array.from(nodes.values());
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          const a = arr[i];
          const b = arr[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist2 = dx * dx + dy * dy || 1;
          const dist = Math.sqrt(dist2);
          if (dist > 300) continue;
          const force = (800 * alpha) / dist2;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          a.vx -= fx; a.vy -= fy;
          b.vx += fx; b.vy += fy;
        }
      }

      // integrate + bounds
      const pad = 30;
      for (const n of arr) {
        n.vx += (cx - n.x) * 0.002 * alpha;
        n.vy += (cy - n.y) * 0.002 * alpha;
        n.vx *= 0.82;
        n.vy *= 0.82;
        n.x += n.vx;
        n.y += n.vy;
        n.x = Math.max(pad, Math.min(dims.w - pad, n.x));
        n.y = Math.max(pad, Math.min(dims.h - pad, n.y));
      }

      // emit positions every 2 frames
      frame++;
      if (frame % 2 === 0) {
        const pos: Record<string, { x: number; y: number }> = {};
        for (const [id, n] of nodes) pos[id] = { x: n.x, y: n.y };
        setPositions(pos);
      }
      raf = requestAnimationFrame(step);
    }

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [data, dims.w, dims.h]);

  // build display arrays
  const allNodes: SimNode[] = useMemo(() => {
    if (!data) return [];
    return data.nodes.map((n: any) => ({
      id: n.id,
      kind: n.kind,
      type: n.type,
      title: n.title,
      color: n.color,
      status: n.status,
      x: positions[n.id]?.x ?? dims.w / 2,
      y: positions[n.id]?.y ?? dims.h / 2,
      r: n.kind === "project" ? 14 : 8,
    }));
  }, [data, positions, dims.w, dims.h]);

  const edges: SimEdge[] = data?.edges || [];

  const visibleNodes = filterKinds.size
    ? allNodes.filter((n) => n.kind === "project" || filterKinds.has(n.type))
    : allNodes;
  const visibleIds = new Set(visibleNodes.map((n) => n.id));
  const visibleEdges = edges.filter((e) => visibleIds.has(e.source) && visibleIds.has(e.target));

  const focusId = hovered || selected;
  const searchMatchIds = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    const matches = new Set<string>();
    for (const n of allNodes) {
      if (n.title.toLowerCase().includes(q)) matches.add(n.id);
    }
    return matches;
  }, [searchQuery, allNodes]);
  const neighborIds = useMemo(() => {
    if (!focusId) return null;
    const set = new Set<string>([focusId]);
    for (const e of edges) {
      if (e.source === focusId) set.add(e.target);
      if (e.target === focusId) set.add(e.source);
    }
    return set;
  }, [focusId, edges]);

  function handleClick(n: SimNode) {
    if (n.kind === "project") openProject(n.id);
    else openItemDetail(n.id);
  }

  const presentTypes = useMemo(() => {
    if (!data) return [];
    const set = new Set(data.nodes.filter((n: any) => n.kind === "item").map((n: any) => n.type));
    return ITEM_TYPES.filter((t) => set.has(t.type));
  }, [data]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Digital Brain"
        subtitle="See how everything connects. Every line is a link or a project thread weaving your life together."
        icon="Network"
        color="#a78bfa"
        actions={
          <Button variant="outline" size="sm" onClick={() => setFilterKinds(new Set())}>
            <Icon name="RotateCcw" className="mr-1.5 h-3.5 w-3.5" /> Reset
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
        <SectionCard className="relative overflow-hidden p-0" bodyClassName="p-0">
          <div ref={containerRef} className="relative h-[560px] w-full">
            {isLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" /> Weaving your brain…
              </div>
            ) : allNodes.length === 0 ? (
              <EmptyState icon="Network" title="No connections yet" description="Link items to each other from the detail panel to see your digital brain bloom." />
            ) : (
              <svg
                width={dims.w}
                height={dims.h}
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
                onWheel={(e) => {
                  e.preventDefault();
                  const delta = -e.deltaY * 0.001;
                  setZoom((z) => Math.max(0.3, Math.min(3, z + delta)));
                }}
                onMouseDown={(e) => {
                  if ((e.target as SVGElement).tagName === "svg" || (e.target as SVGElement).tagName === "rect") {
                    isDragging.current = true;
                    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
                  }
                }}
                onMouseMove={(e) => {
                  if (isDragging.current) {
                    setPan({
                      x: dragStart.current.panX + (e.clientX - dragStart.current.x),
                      y: dragStart.current.panY + (e.clientY - dragStart.current.y),
                    });
                  }
                }}
                onMouseUp={() => { isDragging.current = false; }}
                onMouseLeave={() => { isDragging.current = false; }}
              >
                <defs>
                  <radialGradient id="bgGlow">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.06} />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                  </radialGradient>
                </defs>
                <rect width={dims.w} height={dims.h} fill="url(#bgGlow)" />

                {/* zoom/pan group */}
                <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                {/* edges */}
                <g>
                  {visibleEdges.map((e) => {
                    const a = visibleNodes.find((n) => n.id === e.source);
                    const b = visibleNodes.find((n) => n.id === e.target);
                    if (!a || !b) return null;
                    const dimmed = neighborIds && !neighborIds.has(a.id) && !neighborIds.has(b.id);
                    return (
                      <line
                        key={e.id}
                        x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                        stroke={e.kind === "project" ? b.color : "#a78bfa"}
                        strokeOpacity={dimmed ? 0.05 : e.kind === "project" ? 0.18 : 0.35}
                        strokeWidth={e.kind === "project" ? 1 : 1.5}
                        strokeDasharray={e.kind === "project" ? "3 4" : undefined}
                      />
                    );
                  })}
                </g>

                {/* nodes */}
                <g>
                  {visibleNodes.map((n) => {
                    const dimmed = (neighborIds && !neighborIds.has(n.id)) || (searchMatchIds && !searchMatchIds.has(n.id));
                    const focused = focusId === n.id;
                    const isSearchMatch = searchMatchIds?.has(n.id);
                    const isProject = n.kind === "project";
                    return (
                      <g
                        key={n.id}
                        transform={`translate(${n.x}, ${n.y})`}
                        className="cursor-pointer transition-opacity"
                        style={{ opacity: dimmed ? 0.2 : 1 }}
                        onMouseEnter={() => setHovered(n.id)}
                        onMouseLeave={() => setHovered(null)}
                        onClick={() => handleClick(n)}
                      >
                        {(focused || hovered === n.id) && (
                          <circle r={n.r + 8} fill={n.color} opacity={0.15} />
                        )}
                        {isSearchMatch && (
                          <circle r={n.r + 5} fill="none" stroke="#f59e0b" strokeWidth={2} strokeDasharray="3 2" opacity={0.8} />
                        )}
                        {isSearchMatch && (
                          <text textAnchor="middle" dy={-n.r - 12} className="pointer-events-none fill-amber-500 text-[10px] font-semibold">
                            {truncate(n.title, 22)}
                          </text>
                        )}
                        {isProject ? (
                          <>
                            <rect x={-n.r} y={-n.r} width={n.r * 2} height={n.r * 2} rx={4} fill={n.color} stroke="white" strokeWidth={2} />
                            <text textAnchor="middle" dy={n.r + 14} className="pointer-events-none fill-foreground text-[10px] font-semibold">
                              {truncate(n.title, 16)}
                            </text>
                          </>
                        ) : (
                          <>
                            <circle r={n.r} fill={n.color} stroke="white" strokeWidth={1.5} />
                            {(hovered === n.id || focused) && (
                              <text textAnchor="middle" dy={-n.r - 8} className="pointer-events-none fill-foreground text-[10px] font-medium">
                                {truncate(n.title, 22)}
                              </text>
                            )}
                          </>
                        )}
                        {n.status === "done" && (
                          <circle r={n.r + 3} fill="none" stroke="#10b981" strokeWidth={1.5} strokeDasharray="2 2" />
                        )}
                      </g>
                    );
                  })}
                </g>
                </g>
                {/* /zoom-pan group */}
              </svg>
            )}

            {!isLoading && allNodes.length > 0 && (
              <div className="pointer-events-none absolute bottom-3 left-3 flex gap-2 text-[11px] text-muted-foreground">
                <span className="rounded-md bg-background/80 px-2 py-1 backdrop-blur">{visibleNodes.filter((n) => n.kind === "item").length} items</span>
                <span className="rounded-md bg-background/80 px-2 py-1 backdrop-blur">{visibleNodes.filter((n) => n.kind === "project").length} projects</span>
                <span className="rounded-md bg-background/80 px-2 py-1 backdrop-blur">{visibleEdges.length} connections</span>
              </div>
            )}

            {/* Zoom controls */}
            {!isLoading && allNodes.length > 0 && (
              <div className="absolute bottom-3 right-3 flex flex-col gap-1">
                <button
                  onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-background/80 text-foreground shadow-sm backdrop-blur transition-all hover:bg-background"
                  title="Zoom in"
                >
                  <Icon name="Plus" className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setZoom((z) => Math.max(0.3, z - 0.2))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-background/80 text-foreground shadow-sm backdrop-blur transition-all hover:bg-background"
                  title="Zoom out"
                >
                  <Icon name="Minus" className="h-4 w-4" />
                </button>
                <button
                  onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-background/80 text-foreground shadow-sm backdrop-blur transition-all hover:bg-background"
                  title="Reset view"
                >
                  <Icon name="Maximize" className="h-4 w-4" />
                </button>
                <span className="mt-0.5 rounded-md bg-background/80 px-1 py-0.5 text-center text-[9px] font-medium text-muted-foreground backdrop-blur">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
            )}
          </div>
        </SectionCard>

        <div className="space-y-6">
          {/* Search */}
          <SectionCard className="p-3" bodyClassName="p-0">
            <div className="relative">
              <Icon name="Search" className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search nodes…"
                className="w-full rounded-lg border border-border/60 bg-background py-1.5 pl-8 pr-7 text-xs outline-none focus:border-violet-500/40"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <Icon name="X" className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            {searchMatchIds && (
              <p className="mt-2 text-[10px] text-muted-foreground">
                {searchMatchIds.size} match{searchMatchIds.size !== 1 ? "es" : ""} · non-matches dimmed
              </p>
            )}
          </SectionCard>

          <SectionCard title="Legend" icon="Info">
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded" style={{ background: "#a78bfa" }} />
                <span>Project / Thread (square)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full" style={{ background: "#f59e0b" }} />
                <span>Item (circle, colored by type)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded border-2 border-dashed border-muted-foreground" />
                <span>Project membership (dashed)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded border-2 border-emerald-500 border-dashed" />
                <span>Completed (green ring)</span>
              </div>
            </div>
          </SectionCard>

          {presentTypes.length > 0 && (
            <SectionCard title="Filter by type" icon="Filter">
              <div className="flex flex-wrap gap-1.5">
                {presentTypes.map((t) => {
                  const on = filterKinds.has(t.type);
                  return (
                    <button
                      key={t.type}
                      onClick={() => {
                        setFilterKinds((s) => {
                          const n = new Set(s);
                          if (n.has(t.type)) n.delete(t.type);
                          else n.add(t.type);
                          return n;
                        });
                      }}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-all",
                        on ? "border-transparent text-white" : "border-border/60 text-muted-foreground hover:bg-muted",
                      )}
                      style={on ? { background: t.color } : {}}
                    >
                      <Icon name={t.icon} className="h-3 w-3" />
                      {t.name}
                    </button>
                  );
                })}
                {filterKinds.size > 0 && (
                  <button onClick={() => setFilterKinds(new Set())} className="text-xs text-muted-foreground underline">
                    clear
                  </button>
                )}
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                Click a node to open it. Hover to highlight its connections.
              </p>
              <div className="mt-2 space-y-1 text-[10px] text-muted-foreground/70">
                <div className="flex items-center gap-1.5">
                  <kbd className="rounded border border-border bg-muted px-1">+</kbd>/<kbd className="rounded border border-border bg-muted px-1">−</kbd> zoom
                  <span className="mx-1">·</span>
                  <kbd className="rounded border border-border bg-muted px-1">0</kbd> reset
                </div>
                <div>Scroll to zoom · drag to pan</div>
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
