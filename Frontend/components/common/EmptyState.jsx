import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "./button";

export function EmptyState({
  icon: Icon = FolderOpen,
  title = "No Items Found",
  description = "There are no records matching your query or active filters.",
  actionLabel,
  onAction,
  className = "",
}) {
  return (
    <div
      role="status"
      aria-label={title}
      className={`rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--surface))]/50 p-12 text-center flex flex-col items-center justify-center space-y-4 ${className}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-upto-blue/10 text-upto-blue">
        <Icon className="h-7 w-7" />
      </div>
      <div className="max-w-sm space-y-1">
        <h3 className="text-base font-extrabold text-[hsl(var(--foreground))]">{title}</h3>
        <p className="text-xs text-muted leading-relaxed">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button size="sm" variant="gradient" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
