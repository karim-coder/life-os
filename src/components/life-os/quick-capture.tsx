"use client";

import { useEffect, useRef, useState } from "react";
import { useLifeOS } from "@/store/life-os";
import { useQuickCapture, useCreateItem, useDomains, useProjects } from "@/lib/hooks";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Icon } from "./icon";
import { ITEM_TYPES, ITEM_TYPE_MAP } from "@/lib/constants";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";

const QUICK_TYPES = ["note", "task", "idea", "journal", "bookmark", "contact"] as const;

/** Detect macOS for displaying correct modifier symbols */
function useIsMac() {
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    setIsMac(navigator.platform?.toUpperCase().includes("MAC") ?? false);
  }, []);
  return isMac;
}

/** Reusable kbd badge component for shortcut hints */
function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium leading-none text-muted-foreground shadow-sm",
        className,
      )}
    >
      {children}
    </kbd>
  );
}

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
  const isMac = useIsMac();

  const mod = isMac ? "⌘" : "Ctrl+";

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
      notify.success(captureMode ? "Captured to inbox" : "Created");
    } catch (e: any) {
      notify.error(e.message || "Failed");
    }
  }

  return (
    <Dialog open={quickCaptureOpen} onOpenChange={setQuickCaptureOpen}>
      <DialogContent className="gap-0 p-0 sm:max-w-[560px]" showCloseButton={false}>
        <DialogHeader className="sr-only">
          <DialogTitle>Quick Capture</DialogTitle>
          <DialogDescription>Capture a thought instantly.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
          <Icon name="Zap" className="h-4 w-4 shrink-0 text-amber-500" />
          <span className="text-sm font-medium">Quick Capture</span>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <span className="hidden items-center gap-1 text-[10px] text-muted-foreground sm:inline-flex">
              <Kbd>{mod}K</Kbd> to open
            </span>
            <DialogClose className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <Icon name="X" className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        </div>

        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !(e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              submit();
            }
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              submit(false);
            }
            // Number keys 1-6 to switch type when not holding modifiers
            if (!e.metaKey && !e.ctrlKey && !e.altKey) {
              const num = parseInt(e.key);
              if (num >= 1 && num <= QUICK_TYPES.length) {
                e.preventDefault();
                setType(QUICK_TYPES[num - 1]);
              }
            }
          }}
          placeholder="What's on your mind? Press Enter to capture to inbox…"
          rows={3}
          className="w-full resize-none bg-transparent px-4 py-3 text-base outline-none placeholder:text-muted-foreground/60"
        />

        <div className="flex flex-wrap items-center gap-2 border-t border-border/60 px-4 py-3">
          {/* type chips with number shortcuts */}
          <div className="flex flex-wrap gap-1">
            {QUICK_TYPES.map((t, idx) => {
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
                  <span className={cn(
                    "ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded text-[8px] font-bold leading-none",
                    type === t ? "text-white/60" : "text-muted-foreground/50"
                  )}>
                    {idx + 1}
                  </span>
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
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Kbd>↵</Kbd> capture
            </span>
            <span className="inline-flex items-center gap-1">
              <Kbd>{mod}↵</Kbd> create active
            </span>
            <span className="inline-flex items-center gap-1">
              <Kbd>⇧↵</Kbd> new line
            </span>
            <span className="inline-flex items-center gap-1">
              <Kbd>Esc</Kbd> close
            </span>
            <span className="hidden items-center gap-1 sm:inline-flex">
              <Kbd>1</Kbd>–<Kbd>{QUICK_TYPES.length}</Kbd> switch type
            </span>
          </div>
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
