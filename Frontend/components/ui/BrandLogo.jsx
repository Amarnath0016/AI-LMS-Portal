import { Link } from "react-router-dom";
import { Factory } from "lucide-react";

export function BrandLogo({ to = "/" }) {
  return (
    <Link to={to} className="flex items-center gap-2.5">
      <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-upto-blue/30 bg-slate-950 text-white shadow-lg shadow-blue-500/15">
        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-upto-orange" />
        <div className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-upto-blue/60 blur-sm" />
        <Factory className="relative h-5 w-5 text-white" />
      </div>
      <span className="leading-none">
        <span className="block text-lg font-black tracking-tight text-[hsl(var(--foreground))]">
          Upto<span className="text-upto-orange">Skills</span>
        </span>
        <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
          Learn · Play · Grow
        </span>
      </span>
    </Link>
  );
}
