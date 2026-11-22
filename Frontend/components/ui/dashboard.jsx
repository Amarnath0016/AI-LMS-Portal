import { ArrowUpRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/common/button";
import { cn } from "@/utils";

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-upto-orange">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-3xl font-black tracking-tight text-[hsl(var(--foreground))] sm:text-4xl">
          {title}
        </h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function HeroPanel({ children, className }) {
  return (
    <section
      className={cn(
        "app-card mb-8 overflow-hidden rounded-lg p-5 sm:p-6",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function MetricCard({ icon: Icon, label, value, helper, tone = "blue", trend }) {
  const tones = {
    blue: "bg-blue-500/10 text-upto-blue",
    orange: "bg-orange-500/10 text-upto-orange",
    green: "bg-emerald-500/10 text-upto-green",
    purple: "bg-violet-500/10 text-violet-400",
  };

  return (
    <div className="app-card group rounded-lg p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-upto-blue/40">
      <div className="flex items-start justify-between gap-4">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-lg", tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span className="inline-flex items-center gap-1 rounded-full bg-upto-green/10 px-2.5 py-1 text-xs font-bold text-upto-green">
            {trend}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-2xl font-black text-[hsl(var(--foreground))]">{value}</p>
      {helper && <p className="mt-2 text-xs text-muted">{helper}</p>}
    </div>
  );
}

export function QuickActions({ actions }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {actions.map(({ label, icon: Icon, onClick, variant = "outline" }) => (
        <Button key={label} variant={variant} onClick={onClick} className="h-12 justify-start gap-2">
          <Icon className="h-4 w-4" />
          {label}
        </Button>
      ))}
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={cn("animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800/70", className)} />;
}

export function DashboardSkeleton() {
  return (
    <div>
      <Skeleton className="mb-8 h-44" />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-36" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}

export function SectionCard({ title, description, action, children, className }) {
  return (
    <section className={cn("app-card rounded-lg", className)}>
      {(title || description || action) && (
        <div className="flex flex-col gap-3 border-b border-[hsl(var(--border))] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title && <h2 className="text-lg font-bold text-[hsl(var(--foreground))]">{title}</h2>}
            {description && <p className="mt-1 text-sm text-muted">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function FilterTabs({ options, value, onChange }) {
  return (
    <div className="inline-flex flex-wrap rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-1">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-bold transition-all",
            value === option
              ? "bg-upto-blue text-white shadow-sm"
              : "text-muted hover:text-[hsl(var(--foreground))]",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export function LiveUpdateBar({ label, updatedAt }) {
  return (
    <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-muted">
      <RefreshCw className="h-3.5 w-3.5" />
      {label} {updatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
    </p>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="rounded-lg border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] p-10 text-center">
      {Icon && (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-upto-blue/10 text-upto-blue">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <h3 className="text-lg font-bold text-[hsl(var(--foreground))]">{title}</h3>
      {description && <p className="mx-auto mt-2 max-w-md text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function StatusBadge({ children, tone = "green" }) {
  const tones = {
    green: "bg-emerald-500/10 text-emerald-400",
    red: "bg-red-500/10 text-red-400",
    yellow: "bg-yellow-500/10 text-yellow-400",
    blue: "bg-blue-500/10 text-blue-400",
  };

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold", tones[tone])}>
      {children}
    </span>
  );
}
