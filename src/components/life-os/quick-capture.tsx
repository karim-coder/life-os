"use client";

import { useEffect, useRef, useState } from "react";
import { useLifeOS } from "@/store/life-os";
import { useQuickCapture, useCreateItem, useDomains, useProjects } from "@/lib/hooks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Icon } from "./icon";
import { ITEM_TYPES, ITEM_TYPE_MAP } from "@/lib/constants";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const QUICK_TYPES = ["note", "task", "idea", "journal", "bookmark", "contact"] as const;

export function QuickCapture() {
  const { quickCaptureOpen, setQuickCaptureOpen, openItemEditor } = useLifeOS();
  const capture = useQuickCapture();
  const create = useCreateItem();
  const { data: domData } = useDomains();
  const { data: projData } = useProjects();
  const [text, setText] = useState("");
  const [type, setType] = useState<(typeof QUICK_TYPES)[number]>("task");
  const [domainId, setDomainId] = useState<string>("");
  const [projectId, setProjectId] = useState<string>("");
  const [wasOpen, setWasOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // reset form when opening (render-time state adjustment)
  if (quickCaptureOpen !== wasOpen) {
    setWasOpen(quickCaptureOpen);
    if (quickCaptureOpen) {
      setText("");
      setType("task");
      setDomainId("");
      setProjectId("");
    }
  }

  useEffect(() => {
    if (quickCaptureOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [quickCaptureOpen]);

  // global hotkey Cmd/Ctrl+K
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setQuickCaptureOpen(true);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setQuickCaptureOpen]);

  const domains = domData?.domains || [];
  const projects = projData?.projects || [];

  async function submit(captureMode = true) {
    const title = text.trim();
    if (!title) return;
    try {
      if (captureMode) {
        await capture.mutateAsync({ title, type, content: "", domainId: domainId || null, projectId: projectId || null });
      } else {
        await create.mutateAsync({ title, type, status: "active", domainId: domainId || null, projectId: projectId || null });
      }
      setText("");
      toast.success(captureMode ? "Captured to inbox" : "Created");
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
  }

  return (
    <Dialog open={quickCaptureOpen} onOpenChange={setQuickCaptureOpen}>
      <DialogContent className="gap-0 p-0 sm:max-w-[560px]">
        <DialogHeader className="sr-only">
          <DialogTitle>Quick Capture</DialogTitle>
          <DialogDescription>Capture a thought instantly.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
          <Icon name="Zap" className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium">Quick Capture</span>
          <kbd className="ml-auto rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">⌘K</kbd>
        </div>

        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              submit(false);
            }
          }}
          placeholder="What's on your mind? Press Enter to capture to inbox…"
          rows={3}
          className="w-full resize-none bg-transparent px-4 py-3 text-base outline-none placeholder:text-muted-foreground/60"
        />

        <div className="flex flex-wrap items-center gap-2 border-t border-border/60 px-4 py-3">
          {/* type chips */}
          <div className="flex flex-wrap gap-1">
            {QUICK_TYPES.map((t) => {
              const m = ITEM_TYPE_MAP[t];
              return (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all",
                    type === t ? "text-white" : "bg-muted text-muted-foreground hover:bg-muted/70",
                  )}
                  style={type === t ? { background: m.color } : {}}
                >
                  <Icon name={m.icon} className="h-3 w-3" />
                  {m.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 px-4 pb-3">
          <select
            value={domainId}
            onChange={(e) => setDomainId(e.target.value)}
            className="rounded-md border border-border/60 bg-background px-2 py-1 text-xs"
          >
            <option value="">No domain</option>
            {domains.map((d: any) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="rounded-md border border-border/60 bg-background px-2 py-1 text-xs"
          >
            <option value="">No project</option>
            {projects.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button
            onClick={() => { setQuickCaptureOpen(false); openItemEditor({ title: text, type }); }}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground"
          >
            More fields →
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border/60 bg-muted/30 px-4 py-3">
          <span className="text-xs text-muted-foreground">
            <kbd className="rounded border bg-background px-1">↵</kbd> capture · <kbd className="rounded border bg-background px-1">⌘↵</kbd> create active
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => submit(false)}
              disabled={!text.trim()}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-background disabled:opacity-40"
            >
              Create active
            </button>
            <button
              onClick={() => submit(true)}
              disabled={!text.trim() || capture.isPending}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
            >
              {capture.isPending ? "Capturing…" : "Capture to inbox"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
