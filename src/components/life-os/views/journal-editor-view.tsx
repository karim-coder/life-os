"use client";

import { useState, useEffect } from "react";
import { useLifeOS } from "@/store/life-os";
import { useItem, useCreateItem, useUpdateItem, useItems, useDomains } from "@/lib/hooks";
import { Icon } from "../icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { fmtDate } from "@/lib/dates";
import ReactMarkdown from "react-markdown";
import { RichTextEditor } from "../rich-text-editor";

const ACCENT = "#a78bfa";

export function JournalEditorView() {
  const { journalEditId, setView, openItemDetail } = useLifeOS();
  const { data: existingItem, isLoading } = useItem(journalEditId);
  const create = useCreateItem();
  const update = useUpdateItem();
  const { data: domData } = useDomains();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [domainId, setDomainId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [mood, setMood] = useState(3);
  const [showPreview, setShowPreview] = useState(false);
  const [saved, setSaved] = useState(false);
  const [lastKey, setLastKey] = useState("");

  const domains = domData?.domains || [];
  const mindSoulDomain = domains.find((d: any) => d.key === "mind_soul");

  // Load existing item or initialize new
  const loadKey = journalEditId || "new";
  if (loadKey !== lastKey) {
    setLastKey(loadKey);
    if (journalEditId && existingItem) {
      setTitle(existingItem.title || "");
      setContent(existingItem.content || "");
      setDomainId(existingItem.domainId || "");
      setProjectId(existingItem.projectId || "");
    } else if (!journalEditId) {
      setTitle("");
      setContent("");
      setDomainId(mindSoulDomain?.id || "");
      setProjectId("");
      setMood(3);
    }
  }

  // Auto-save draft to localStorage
  useEffect(() => {
    if (!journalEditId && (title || content)) {
      const timer = setTimeout(() => {
        localStorage.setItem("lifeos-journal-draft", JSON.stringify({ title, content, domainId, projectId }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [title, content, domainId, projectId, journalEditId]);

  // Load draft on mount for new entries (render-time state adjustment)
  const [draftLoaded, setDraftLoaded] = useState(false);
  if (!draftLoaded && !journalEditId) {
    setDraftLoaded(true);
    const draft = localStorage.getItem("lifeos-journal-draft");
    if (draft) {
      try {
        const d = JSON.parse(draft);
        if (d.title) setTitle(d.title);
        if (d.content) setContent(d.content);
        if (d.domainId) setDomainId(d.domainId);
        if (d.projectId) setProjectId(d.projectId);
      } catch {}
    }
  }

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  async function save() {
    if (!title.trim()) {
      notify.error("Add a title first");
      return;
    }
    try {
      if (journalEditId) {
        await update.mutateAsync({
          id: journalEditId,
          title: title.trim(),
          content,
          domainId: domainId || null,
          projectId: projectId || null,
        });
        notify.success("Entry saved");
      } else {
        await create.mutateAsync({
          type: "journal",
          title: title.trim(),
          content,
          status: "active",
          domainId: domainId || null,
          projectId: projectId || null,
          scheduledAt: new Date().toISOString(),
        });
        localStorage.removeItem("lifeos-journal-draft");
        notify.success("Journal entry created");
      }
      setSaved(true);
      setTimeout(() => setView("mind_soul"), 600);
    } catch (e: any) {
      notify.error(e.message || "Failed to save");
    }
  }

  if (journalEditId && isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-muted/40" />
        <div className="h-12 w-full animate-pulse rounded-lg bg-muted/30" />
        <div className="h-64 w-full animate-pulse rounded-xl bg-muted/20" />
      </div>
    );
  }

  return (
    <div>
      {/* Sticky top bar */}
      <div className="sticky top-0 z-20 -mx-4 mb-4 flex items-center justify-between border-b border-border/40 bg-background/80 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <button
          onClick={() => setView(journalEditId ? "mind_soul" : "mind_soul")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <Icon name="ArrowLeft" className="h-4 w-4" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <span className="hidden text-[11px] text-muted-foreground sm:inline">
            {wordCount} words · {readTime} min
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview((p) => !p)}
            className="gap-1.5"
          >
            <Icon name={showPreview ? "Pencil" : "Eye"} className="h-3.5 w-3.5" />
            {showPreview ? "Edit" : "Preview"}
          </Button>
          <Button
            size="sm"
            onClick={save}
            disabled={create.isPending || update.isPending}
            className="gap-1.5 text-white"
            style={{ background: ACCENT }}
          >
            <Icon name={saved ? "Check" : "Save"} className="h-3.5 w-3.5" />
            {saved ? "Saved" : journalEditId ? "Save" : "Publish"}
          </Button>
        </div>
      </div>

      {/* Editor card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border bg-card shadow-sm"
        style={{ borderColor: `${ACCENT}30` }}
      >
        {/* Date + mood bar */}
        <div className="flex items-center justify-between border-b border-border/40 bg-muted/20 px-5 py-2.5">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Icon name="Calendar" className="h-3 w-3" style={{ color: ACCENT }} />
            {fmtDate(new Date(), "EEEE, MMMM d · p")}
          </div>
          <div className="flex items-center gap-1">
            <span className="mr-1 text-[10px] text-muted-foreground">Mood:</span>
            {[
              { v: 1, e: "Frown", c: "#f43f5e" },
              { v: 2, e: "Meh", c: "#f59e0b" },
              { v: 3, e: "Smile", c: "#eab308" },
              { v: 4, e: "SmilePlus", c: "#10b981" },
              { v: 5, e: "Laugh", c: "#06b6d4" },
            ].map((m) => (
              <button
                key={m.v}
                onClick={() => setMood(m.v)}
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-md text-sm transition-all",
                  mood === m.v ? "bg-violet-500/20 ring-1 ring-violet-500/40" : "hover:bg-muted",
                )}
              >
                <Icon name={m.e} className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="px-5 pt-5">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your entry a title…"
            className="w-full border-0 bg-transparent text-2xl font-bold tracking-tight outline-none placeholder:text-muted-foreground/40"
            autoFocus={!journalEditId}
          />
        </div>

        {/* Content area — WYSIWYG rich text editor */}
        <div className="px-5 py-4">
          {showPreview ? (
            <div className="min-h-[400px]">
              {content ? (
                <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-3 prose-li:my-1 prose-headings:mb-2 prose-headings:mt-4 prose-blockquote:border-l-violet-400">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-muted-foreground/50">Nothing to preview yet.</p>
              )}
            </div>
          ) : (
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Start writing… Express yourself freely. This is your space."
            />
          )}
        </div>

        {/* Footer: metadata + stats */}
        <div className="flex flex-wrap items-center gap-3 border-t border-border/40 bg-muted/20 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Domain</span>
            <Select value={domainId || "none"} onValueChange={(v) => setDomainId(v === "none" ? "" : v)}>
              <SelectTrigger className="h-7 w-36 text-xs"><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {domains.map((d: any) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="ml-auto flex items-center gap-3 text-[10px] text-muted-foreground">
            <span>{wordCount} words</span>
            <span>·</span>
            <span>{readTime} min read</span>
            <span>·</span>
            <span>{content.length} chars</span>
          </div>
        </div>
      </motion.div>

      {/* Tips */}
      <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
        <Icon name="Keyboard" className="h-3.5 w-3.5" />
        <span>
          The editor shows formatted text as you type — no raw markdown visible.
          Use the toolbar for bold, italic, headings, and lists. Type markdown shortcuts
          like <kbd className="rounded border border-border bg-muted px-1">#</kbd> for headings or
          <kbd className="ml-1 rounded border border-border bg-muted px-1">-</kbd> for lists.
        </span>
      </div>
    </div>
  );
}
