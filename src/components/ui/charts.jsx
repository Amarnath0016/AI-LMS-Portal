import { cn } from "@/utils";

export function BarChart({ data, className }) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className={cn("app-card rounded-lg p-5", className)}>
      <div className="flex h-56 items-end gap-3">
        {data.map((item) => (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-44 w-full items-end rounded-t-lg bg-[hsl(var(--surface))]">
              <div
                className="w-full rounded-t-lg bg-upto-blue transition-all duration-500"
                style={{ height: `${(item.value / max) * 100}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-muted">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LineChart({ data, className }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  const points = data
    .map((item, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * 100;
      const y = 100 - (item.value / max) * 86 - 7;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className={cn("app-card rounded-lg p-5", className)}>
      <svg viewBox="0 0 100 100" className="h-56 w-full overflow-visible">
        <polyline points={points} fill="none" stroke="url(#lineGradient)" strokeWidth="3" strokeLinecap="round" />
        {points.split(" ").map((point) => {
          const [x, y] = point.split(",");
          return <circle key={point} cx={x} cy={y} r="2.4" className="fill-upto-orange" />;
        })}
        <defs>
          <linearGradient id="lineGradient" x1="0" x2="1">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#FF6B00" />
          </linearGradient>
        </defs>
      </svg>
      <div className="mt-3 flex justify-between text-xs font-semibold text-muted">
        {data.map((item) => <span key={item.label}>{item.label}</span>)}
      </div>
    </div>
  );
}

export function PieChart({ data, className }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let offset = 25;
  const stops = data.map((item) => {
    const start = offset;
    offset += (item.value / total) * 100;
    return `${item.color} ${start}% ${offset}%`;
  });

  return (
    <div className={cn("app-card rounded-lg p-5", className)}>
      <div className="flex flex-col items-center gap-5 sm:flex-row">
        <div
          className="h-44 w-44 shrink-0 rounded-full"
          style={{ background: `conic-gradient(${stops.join(", ")})` }}
        />
        <div className="w-full space-y-3">
          {data.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-4 text-sm">
              <span className="flex items-center gap-2 text-[hsl(var(--foreground))]">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                {item.label}
              </span>
              <span className="font-bold text-[hsl(var(--foreground))]">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
