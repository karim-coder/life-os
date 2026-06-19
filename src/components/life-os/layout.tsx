"use client";

import { cn } from "@/lib/utils";
import { Icon } from "./icon";
import { Button } from "@/components/ui/button";

export function PageHeader({
  title,
  subtitle,
  icon,
  color,
  actions,
}: {
  title: string;
  subtitle?: string;
  icon?: string;
  color?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-center gap-3">
        {icon && (
          <span
            className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm"
            style={{ background: color ? `${color}1a` : "var(--muted)", color: color || "var(--muted-foreground)" }}
          >
            <Icon name={icon} className="h-5 w-5" />
          </span>
        )}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SectionCard({
  title,
  icon,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  icon?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-border/60 bg-card/50 p-4 backdrop-blur-sm", className)}>
      {title && (
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            {icon && <Icon name={icon} className="h-4 w-4 text-muted-foreground" />}
            {title}
          </h3>
          {action}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function EmptyState({
  icon = "Circle",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-16 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50">
        <Icon name={icon} className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-xs text-xs text-muted-foreground">{description}</p>}
      {action && (
        <Button size="sm" className="mt-4" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function StatPill({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string | number;
  color?: string;
  icon?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/40 px-3 py-2.5">
      {icon && (
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: color ? `${color}1a` : "var(--muted)", color: color || "var(--muted-foreground)" }}
        >
          <Icon name={icon} className="h-4 w-4" />
        </span>
      )}
      <div>
        <div className="text-lg font-semibold leading-none">{value}</div>
        <div className="mt-0.5 text-[11px] text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
