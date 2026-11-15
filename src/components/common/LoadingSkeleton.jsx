import React from "react";

export function RouteLoadingSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading page content"
      aria-live="polite"
      className="w-full min-h-[70vh] p-6 space-y-6 animate-pulse"
    >
      {/* Top Banner Skeleton */}
      <div className="h-44 w-full rounded-2xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800" />

      {/* Metrics Row Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 rounded-xl bg-slate-200 dark:bg-slate-800"
          />
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-96 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-96 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

export function CardSkeleton({ count = 3 }) {
  return (
    <div
      role="status"
      aria-label="Loading cards"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 space-y-4 animate-pulse"
        >
          <div className="h-40 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-2">
            <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="pt-3 border-t border-[hsl(var(--border))] flex justify-between items-center">
            <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-8 w-24 rounded-lg bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default RouteLoadingSkeleton;
