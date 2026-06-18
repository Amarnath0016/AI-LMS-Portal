import { Sparkles, Star, Users } from "lucide-react";
import { Button } from "@/components/common/button";

export function MentorCard({ mentor, selected, onSelect }) {
  return (
    <div
      className={`relative cursor-pointer overflow-hidden rounded-lg border p-5 transition-all ${
        selected
          ? "border-upto-blue bg-upto-blue/10 ring-2 ring-upto-blue/30"
          : "border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-upto-blue/40"
      }`}
      onClick={() => onSelect?.(mentor)}
    >
      <div className="absolute top-3 right-3">
        <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-2.5 py-1 text-[10px] font-bold text-purple-300">
          <Sparkles className="h-3 w-3" />
          AI CLONE
        </span>
      </div>

      <div
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg text-xl font-black text-white"
        style={{ background: mentor.accent }}
      >
        {mentor.initials}
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-upto-orange">{mentor.tag}</p>
      <h3 className="mt-1 text-lg font-bold text-[hsl(var(--foreground))]">{mentor.name}</h3>
      <p className="mt-1 text-sm text-muted">{mentor.subject}</p>
      <p className="mt-3 text-xs leading-relaxed text-muted">{mentor.bio}</p>

      <div className="mt-4 flex items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 text-yellow-400" />
          {mentor.rating}
        </span>
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {mentor.students}
        </span>
        <span>{mentor.courses} courses</span>
      </div>

      {onSelect && (
        <Button
          variant={selected ? "default" : "outline"}
          size="sm"
          className="mt-4 w-full"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(mentor);
          }}
        >
          {selected ? "Selected Mentor ✓" : "Choose as Mentor"}
        </Button>
      )}
    </div>
  );
}
