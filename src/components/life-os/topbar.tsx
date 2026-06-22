"use client";

import { useState } from "react";
import { useLifeOS } from "@/store/life-os";
import { useSearch } from "@/lib/hooks";
import { Icon } from "./icon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ITEM_TYPE_MAP, DOMAIN_MAP } from "@/lib/constants";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { useTheme } from "next-themes";

export function Topbar() {
  const { setQuickCaptureOpen, openItemDetail, setView } = useLifeOS();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const { data } = useSearch(q);
  const { theme, setTheme } = useTheme();

  const results = data && q ? data : { items: [], projects: [], tags: [] };

  function updateSearch(value: string) {
    setQ(value);
    setOpen(value.length > 0);
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md">
      {/* Search */}
      <Popover open={open && q.length > 0} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div className="relative w-full max-w-md">
            <Icon name="Search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => updateSearch(e.target.value)}
              onFocus={() => setOpen(q.length > 0)}
              placeholder="Search your brain…"
              className="h-9 bg-muted/50 pl-9 pr-16"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
              /
            </kbd>
          </div>
        </PopoverAnchor>
        <PopoverContent
          className="w-[420px] p-0"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div className="max-h-[420px] overflow-y-auto p-2">
            {results.items.length === 0 && results.projects.length === 0 && results.tags.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">No results for “{q}”</div>
            ) : (
              <>
                {results.projects.length > 0 && (
                  <div className="mb-2">
                    <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Projects</div>
                    {results.projects.map((p: any) => (
                      <button
                        key={p.id}
                        onClick={() => { useLifeOS.getState().openProject(p.id); setOpen(false); setQ(""); }}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                      >
                        <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                        <span className="flex-1">{p.name}</span>
                      </button>
                    ))}
                  </div>
                )}
                {results.items.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Items</div>
                    {results.items.map((i: any) => {
                      const m = ITEM_TYPE_MAP[i.type] || {};
                      return (
                        <button
                          key={i.id}
                          onClick={() => { openItemDetail(i.id); setOpen(false); setQ(""); }}
                          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                        >
                          <Icon name={(m as any).icon || "Circle"} className="h-3.5 w-3.5" style={{ color: (m as any).color }} />
                          <span className="flex-1 truncate">{i.title}</span>
                          {i.domainId && DOMAIN_MAP[i.domainId] && (
                            <span className="text-[10px] text-muted-foreground">{DOMAIN_MAP[i.domainId].short}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Icon name={theme === "dark" ? "Sun" : "Moon"} className="h-4 w-4" />
        </Button>

        <Button
          onClick={() => setQuickCaptureOpen(true)}
          className="h-9 gap-1.5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm hover:from-emerald-600 hover:to-teal-700"
        >
          <Icon name="Zap" className="h-4 w-4" />
          <span className="hidden sm:inline">Quick Capture</span>
          <kbd className="hidden rounded border border-white/30 px-1 text-[10px] sm:inline">⌘K</kbd>
        </Button>
      </div>
    </header>
  );
}
