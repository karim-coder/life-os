"use client";

import { useState, useEffect } from "react";
import { useLifeOS } from "@/store/life-os";
import { Icon } from "../icon";
import { PageHeader, SectionCard } from "../layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { notify } from "@/lib/toast";
import QRCode from "qrcode";
import { useTheme } from "next-themes";
import { requestNotificationPermission, sendNotification } from "../notifications";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function SettingsView() {
  const { setView } = useLifeOS();
  const { theme = "system", setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState<any>(null);

  // 2FA
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qr2faUrl, setQr2faUrl] = useState("");
  const [manualEntry, setManualEntry] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // QR login from settings
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrLoginUrl, setQrLoginUrl] = useState("");
  const [qrLoginToken, setQrLoginToken] = useState("");
  const [qrLoading, setQrLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session").then(r => r.json()).then(d => setEmail(d.email || ""));
    fetch("/api/preferences").then(r => r.json()).then(d => { setPrefs(d); setName(d.name || ""); setLoading(false); });
    fetch("/api/auth/2fa-status").then(r => r.json()).then(d => { setTwoFAEnabled(d.enabled); setName(d.name || ""); });
  }, []);

  async function updatePrefs(patch: any) {
    const res = await fetch("/api/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    setPrefs(data);
    notify.success("Settings saved");
  }

  async function toggle2FA(enabled: boolean) {
    if (enabled) {
      setShow2FASetup(true);
      setLoading(true);
      try {
        const res = await fetch("/api/auth/setup-2fa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
        const data = await res.json();
        if (!res.ok) { notify.error(data.error); return; }
        const qr = await QRCode.toDataURL(data.otpauthUrl, { width: 200, margin: 1, color: { dark: "#0f172a", light: "#ffffff" } });
        setQr2faUrl(qr);
        setManualEntry(data.manualEntry);
      } catch { notify.error("Failed to set up 2FA"); }
      finally { setLoading(false); }
    } else {
      const res = await fetch("/api/auth/disable-2fa", { method: "POST" });
      if (res.ok) { setTwoFAEnabled(false); notify.success("2FA disabled"); }
    }
  }

  async function confirm2FA() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/setup-2fa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "confirm", token: verifyCode }) });
      const data = await res.json();
      if (!res.ok) { notify.error(data.error); return; }
      setTwoFAEnabled(true); setShow2FASetup(false); setVerifyCode("");
      notify.success("2FA enabled");
    } catch { notify.error("Failed to verify"); }
    finally { setLoading(false); }
  }

  function applyTheme(t: "light" | "dark" | "system") {
    setTheme(t);
    notify.success(`Theme: ${t}`);
  }

  async function startQrLogin() {
    setQrLoading(true);
    try {
      const res = await fetch("/api/auth/qr-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "" }), // password not needed — already authenticated
      });
      const data = await res.json();
      if (!res.ok) { notify.error(data.error || "Failed"); return; }
      const qr = await QRCode.toDataURL(data.qrUrl, { width: 280, margin: 1, color: { dark: "#0f172a", light: "#ffffff" } });
      setQrLoginUrl(qr);
      setQrLoginToken(data.token);
      setQrDialogOpen(true);
      pollQrStatus(data.token);
    } catch { notify.error("Failed to generate QR"); }
    finally { setQrLoading(false); }
  }

  async function pollQrStatus(token: string) {
    const poll = async () => {
      try {
        const res = await fetch(`/api/auth/qr-login?token=${token}`);
        const data = await res.json();
        if (data.confirmed) {
          setQrDialogOpen(false);
          notify.success("Login confirmed on another device!");
          return;
        }
        if (data.expired) {
          notify.error("QR expired");
          setQrDialogOpen(false);
          return;
        }
      } catch {}
      setTimeout(poll, 2000);
    };
    setTimeout(poll, 2000);
  }

  async function seedData() {
    const res = await fetch("/api/seed", { method: "POST" });
    const data = await res.json();
    if (res.ok) { notify.success("Seed data created!"); setTimeout(() => window.location.reload(), 1500); }
    else notify.error(data.error || "Seeding failed");
  }

  if (loading) return (
    <div className="space-y-6">
      {/* Page header skeleton */}
      <div className="h-8 w-32 animate-pulse rounded bg-muted/40" />

      {/* Profile section skeleton */}
      <div className="space-y-3 rounded-xl border border-border/40 p-4">
        <div className="h-5 w-20 animate-pulse rounded bg-muted/40" />
        <div className="space-y-2">
          <div className="h-4 w-12 animate-pulse rounded bg-muted/30" />
          <div className="h-9 w-full animate-pulse rounded-md bg-muted/40" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-12 animate-pulse rounded bg-muted/30" />
          <div className="h-9 w-full animate-pulse rounded-md bg-muted/40" />
        </div>
        <div className="h-9 w-24 animate-pulse rounded-md bg-muted/40" />
      </div>

      {/* Security section skeleton */}
      <div className="space-y-3 rounded-xl border border-border/40 p-4">
        <div className="h-5 w-20 animate-pulse rounded bg-muted/40" />
        <div className="flex items-center justify-between rounded-xl border border-border/40 p-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 animate-pulse rounded-lg bg-muted/40" />
            <div className="space-y-1">
              <div className="h-4 w-48 animate-pulse rounded bg-muted/40" />
              <div className="h-3 w-32 animate-pulse rounded bg-muted/30" />
            </div>
          </div>
          <div className="h-5 w-9 animate-pulse rounded-full bg-muted/40" />
        </div>
      </div>

      {/* Appearance section skeleton */}
      <div className="space-y-3 rounded-xl border border-border/40 p-4">
        <div className="h-5 w-36 animate-pulse rounded bg-muted/40" />
        <div className="space-y-2">
          <div className="h-4 w-14 animate-pulse rounded bg-muted/30" />
          <div className="h-9 w-full animate-pulse rounded-md bg-muted/40" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Manage your account, security, AI, and preferences." icon="Settings" color="#71717a" />

      {/* Profile */}
      <SectionCard title="Profile" icon="User">
        <div className="space-y-3">
          <div>
            <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-9" />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</Label>
            <Input value={email} disabled className="h-9 bg-muted/50" />
          </div>
          <Button size="sm" onClick={async () => {
            const res = await fetch("/api/auth/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
            if (res.ok) notify.success("Profile updated");
          }} className="gap-1.5"><Icon name="Save" className="h-3.5 w-3.5" /> Save profile</Button>
        </div>
      </SectionCard>

      {/* Security */}
      <SectionCard title="Security" icon="Shield">
        <div className="space-y-4">
          <ToggleRow icon="Smartphone" color="#10b981" title="Two-factor authentication" desc={twoFAEnabled ? "Enabled — requires code on login" : "Off — password only"} checked={twoFAEnabled} onChange={toggle2FA} />
          {show2FASetup && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
              <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                <h4 className="mb-3 text-sm font-semibold text-violet-600">Set up 2FA</h4>
                {qr2faUrl && <div className="mb-3 flex justify-center"><img src={qr2faUrl} alt="2FA QR" className="rounded-lg border-2 border-border" width={180} height={180} /></div>}
                <p className="mb-2 text-[11px] text-muted-foreground">Scan with Google Authenticator, Authy, etc.:</p>
                <p className="mb-3 break-all rounded bg-muted/50 p-2 font-mono text-[10px]">{manualEntry}</p>
                <div className="flex gap-2">
                  <Input value={verifyCode} onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" className="h-9 text-center text-lg font-bold tracking-widest" />
                  <Button size="sm" onClick={confirm2FA} disabled={loading || verifyCode.length !== 6} className="gap-1.5">{loading ? <Icon name="Loader2" className="h-3.5 w-3.5 animate-spin" /> : "Confirm"}</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setShow2FASetup(false); setVerifyCode(""); }}>Cancel</Button>
                </div>
              </div>
            </motion.div>
          )}
          {/* Login on another device */}
          <div className="flex items-center justify-between rounded-xl border border-border/40 p-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500"><Icon name="QrCode" className="h-4 w-4" /></span>
              <div><p className="text-sm font-medium">Login on another device</p><p className="text-[11px] text-muted-foreground">Generate a QR code to sign in on your phone</p></div>
            </div>
            <Button size="sm" variant="outline" onClick={startQrLogin} disabled={qrLoading} className="gap-1.5">
              <Icon name={qrLoading ? "Loader2" : "QrCode"} className={`h-3.5 w-3.5 ${qrLoading ? "animate-spin" : ""}`} /> Generate QR
            </Button>
          </div>
        </div>
      </SectionCard>

      {/* QR Login Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="max-w-sm p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Login on another device</DialogTitle>
            <DialogDescription>Scan this QR code on your phone.</DialogDescription>
          </DialogHeader>
          <div className="p-6 text-center">
            <h3 className="mb-1 text-lg font-semibold">Login on another device</h3>
            <p className="mb-4 text-xs text-muted-foreground">Open your phone's camera and scan this code</p>
            {qrLoginUrl && <img src={qrLoginUrl} alt="Login QR Code" className="mx-auto rounded-xl border-2 border-border" width={240} height={240} />}
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Icon name="Loader2" className="h-4 w-4 animate-spin" />
              <span>Waiting for scan…</span>
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">Expires in 5 minutes</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Features */}
      <SectionCard title="AI Features" icon="Bot">
        <div className="space-y-4">
          <ToggleRow icon="Bot" color="#a78bfa" title="Enable AI features" desc="Master toggle for all AI-powered features" checked={prefs?.aiEnabled ?? true} onChange={(v) => updatePrefs({ aiEnabled: v })} />

          {prefs?.aiEnabled && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <ToggleRow icon="Inbox" color="#f59e0b" title="Smart Inbox Processing" desc="AI suggests type, domain & project for inbox items" checked={prefs?.aiSmartInbox ?? true} onChange={(v) => updatePrefs({ aiSmartInbox: v })} />

              <div>
                <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">AI Provider</Label>
                <Select value={prefs?.aiProvider || "z-ai-sdk"} onValueChange={(v) => updatePrefs({ aiProvider: v })}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="z-ai-sdk">Z.AI SDK (default, free)</SelectItem>
                    <SelectItem value="openai-compatible">OpenAI-compatible (OpenAI, Groq, Together, etc.)</SelectItem>
                    <SelectItem value="custom">Custom endpoint</SelectItem>
                  </SelectContent>
                </Select>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {prefs?.aiProvider === "z-ai-sdk" && "Uses the built-in z-ai-web-dev-sdk. No configuration needed."}
                  {prefs?.aiProvider === "openai-compatible" && "Works with any OpenAI-compatible API. Enter your API key and base URL below."}
                  {prefs?.aiProvider === "custom" && "Enter a custom API endpoint, key, and model name."}
                </p>
              </div>

              {(prefs?.aiProvider === "openai-compatible" || prefs?.aiProvider === "custom") && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 rounded-lg border border-border/40 p-3">
                  <div>
                    <Label className="mb-1 block text-[11px] font-medium text-muted-foreground">API Key {prefs?.hasApiKey && "(saved)"}</Label>
                    <Input type="password" placeholder={prefs?.hasApiKey ? "•••••••• (saved)" : "sk-..."} onChange={(e) => { if (e.target.value) updatePrefs({ aiApiKey: e.target.value }); }} className="h-9" />
                  </div>
                  <div>
                    <Label className="mb-1 block text-[11px] font-medium text-muted-foreground">Base URL</Label>
                    <Input value={prefs?.aiBaseUrl || ""} onChange={(e) => updatePrefs({ aiBaseUrl: e.target.value })} placeholder="https://api.openai.com/v1" className="h-9" />
                  </div>
                  <div>
                    <Label className="mb-1 block text-[11px] font-medium text-muted-foreground">Model</Label>
                    <Input value={prefs?.aiModel || ""} onChange={(e) => updatePrefs({ aiModel: e.target.value })} placeholder="gpt-4o-mini" className="h-9" />
                  </div>
                  <p className="text-[10px] text-muted-foreground">Works with: OpenAI, Groq, Together AI, Anyscale, Ollama, LM Studio, and any OpenAI-compatible API.</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </SectionCard>

      {/* Appearance & Notifications */}
      <SectionCard title="Appearance & Notifications" icon="Palette">
        <div className="space-y-3">
          <div>
            <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Theme</Label>
            <Select value={theme} onValueChange={(v) => applyTheme(v as any)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="light">Light</SelectItem><SelectItem value="dark">Dark</SelectItem><SelectItem value="system">System</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border/40 p-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600"><Icon name="Bell" className="h-4 w-4" /></span>
              <div><p className="text-sm font-medium">Browser notifications</p><p className="text-[11px] text-muted-foreground">Overdue & due task alerts</p></div>
            </div>
            <Button size="sm" variant="outline" onClick={async () => { const g = await requestNotificationPermission(); if (g) { notify.success("Notifications enabled"); sendNotification("Life OS", "Enabled!"); } else notify.error("Permission denied"); }}>Enable</Button>
          </div>
        </div>
      </SectionCard>

      {/* Database */}
      <SectionCard title="Database" icon="Database">
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg border border-border/40 p-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600"><Icon name="HardDrive" className="h-4 w-4" /></span>
            <div className="flex-1">
              <p className="text-sm font-medium">SQLite (local file)</p>
              <p className="text-[11px] text-muted-foreground">Current database — stored at <code className="rounded bg-muted px-1 text-[10px]">db/custom.db</code></p>
            </div>
          </div>

          <div className="rounded-lg border border-border/40 p-3">
            <p className="mb-2 text-xs font-medium">Want to use a cloud database?</p>
            <p className="text-[11px] text-muted-foreground">Life OS supports any PostgreSQL database. To switch:</p>
            <ol className="mt-1.5 space-y-1 text-[11px] text-muted-foreground">
              <li>1. Create a free database on <a href="https://neon.tech" target="_blank" className="text-blue-500 hover:underline">Neon</a> or <a href="https://supabase.com" target="_blank" className="text-blue-500 hover:underline">Supabase</a></li>
              <li>2. Set <code className="rounded bg-muted px-1">DATABASE_URL</code> in your <code className="rounded bg-muted px-1">.env</code> file</li>
              <li>3. Change Prisma provider from <code className="rounded bg-muted px-1">sqlite</code> to <code className="rounded bg-muted px-1">postgresql</code></li>
              <li>4. Run <code className="rounded bg-muted px-1">bun run db:push</code></li>
            </ol>
            <p className="mt-2 text-[10px] text-muted-foreground">PostgreSQL connection string format: <code className="rounded bg-muted px-1">postgresql://user:pass@host/dbname</code></p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={seedData}>
              <Icon name="Sprout" className="h-3.5 w-3.5" /> Seed test data
            </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600">
                <Icon name="Trash2" className="h-3.5 w-3.5" /> Reset database
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset all data?</AlertDialogTitle>
                <AlertDialogDescription>This will permanently delete ALL items, projects, domains, reviews, and tags. Your user account will be preserved. This cannot be undone. Consider downloading a backup first.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={async () => {
                  const res = await fetch("/api/reset-db", { method: "POST" });
                  const data = await res.json();
                  if (res.ok) { notify.success("Database reset. Reloading…"); setTimeout(() => window.location.reload(), 1500); }
                  else notify.error(data.error || "Reset failed");
                }} className="bg-rose-500 hover:bg-rose-600">Reset everything</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          </div>
        </div>
      </SectionCard>
      <SectionCard title="Data & Backup" icon="Archive">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.open("/api/export?type=items", "_blank")}><Icon name="Download" className="h-3.5 w-3.5" /> Export CSV</Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={async () => {
            const res = await fetch("/api/backup"); const data = await res.json();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob); const a = document.createElement("a");
            a.href = url; a.download = `lifeos-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click();
            URL.revokeObjectURL(url); notify.success("Backup downloaded");
          }}><Icon name="Download" className="h-3.5 w-3.5" /> Full backup (JSON)</Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => {
            const input = document.createElement("input"); input.type = "file"; input.accept = ".json";
            input.onchange = async (e) => {
              const file = (e.target as HTMLInputElement).files?.[0]; if (!file) return;
              const text = await file.text();
              try {
                const data = JSON.parse(text);
                const res = await fetch("/api/backup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
                if (res.ok) { notify.success("Backup restored"); setTimeout(() => window.location.reload(), 1000); }
                else notify.error("Restore failed");
              } catch { notify.error("Invalid file"); }
            };
            input.click();
          }}><Icon name="Upload" className="h-3.5 w-3.5" /> Restore backup</Button>
        </div>
      </SectionCard>

      {/* Account */}
      <SectionCard title="Account" icon="UserCog">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Sign out of your account</p>
          <Button variant="outline" size="sm" className="gap-1.5 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600" onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/login"; }}>
            <Icon name="LogOut" className="h-3.5 w-3.5" /> Sign out
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}

function ToggleRow({ icon, color, title, desc, checked, onChange }: { icon: string; color: string; title: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/40 p-3">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `${color}1a`, color }}><Icon name={icon} className="h-4 w-4" /></span>
        <div><p className="text-sm font-medium">{title}</p><p className="text-[11px] text-muted-foreground">{desc}</p></div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
