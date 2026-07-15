import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

interface QuickCaptureProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickCapture({ open, onOpenChange }: QuickCaptureProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!open) {
      setTitle("");
      setContent("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Quick Capture
            <Badge variant="secondary" className="text-xs font-mono">
              Ctrl+K
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Input
              placeholder="Title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Press <kbd className="px-1 py-0.5 rounded border bg-muted text-[10px] font-mono">Tab</kbd> to move to content
            </p>
          </div>
          <div>
            <Textarea
              placeholder="Capture your thought..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Press <kbd className="px-1 py-0.5 rounded border bg-muted text-[10px] font-mono">Ctrl+Enter</kbd> to save
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-2 text-xs text-muted-foreground">
            <span>
              <kbd className="px-1 py-0.5 rounded border bg-muted text-[10px] font-mono">Esc</kbd> to close
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button size="sm">Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
