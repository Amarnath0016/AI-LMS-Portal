import { useNavigate } from "react-router-dom";
import { Clock, Users, Zap } from "lucide-react";
import { formatCurrency } from "@/utils";

export function CourseCard({ course, selectedMentorId, mentors = [], onMentorChange, onMentorRemove }) {
  const navigate = useNavigate();

  // Find mentor from course object or passed mentors list
  let mentor = null;
  if (selectedMentorId !== null) {
    if (selectedMentorId) {
      mentor = mentors.find((m) => m.id === selectedMentorId || m._id === selectedMentorId) || course.mentor;
    } else {
      mentor = course.mentor || mentors.find((m) => m.id === course.mentorId || m._id === course.mentorId);
    }
  }

  const hasMentorControls = Boolean(onMentorChange);

  return (
    <div
      onClick={() => navigate(`/courses/${course.id || course._id}`)}
      className="app-card group cursor-pointer overflow-hidden rounded-lg transition-all hover:-translate-y-1 hover:border-upto-blue/40 hover:shadow-xl hover:shadow-blue-500/10"
    >
      <div
        className="relative flex h-36 items-end p-4"
        style={{ background: `linear-gradient(135deg, ${mentor?.color || "#1a1a2e"}, #0B0F19)` }}
      >
        <div
          className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white ring-2 ring-white/20"
          style={{ background: mentor?.accent || "#2563EB" }}
        >
          {mentor?.initials || "AI"}
        </div>
        <span className="rounded-full bg-upto-blue/20 px-3 py-1 text-xs font-semibold text-blue-300">
          {course.tag}
        </span>
        <span className="ml-auto rounded-full bg-gray-800/80 px-3 py-1 text-xs font-medium text-gray-300">
          {course.level}
        </span>
      </div>

      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-upto-orange">
          {course.league}
        </p>
        <h3 className="mt-1 text-base font-bold leading-snug text-[hsl(var(--foreground))] transition-colors group-hover:text-upto-blue">
          {course.title}
        </h3>
        <p className="mt-1 text-sm text-muted">
          {mentor ? (
            <>with <span className="text-upto-blue font-medium">{mentor.name} AI</span></>
          ) : (
            <span className="font-medium text-muted">AI Mentor Curriculum</span>
          )}
        </p>

        {hasMentorControls && mentors.length > 0 && (
          <div className="mt-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-3">
            <label className="text-xs font-bold uppercase tracking-wide text-muted" htmlFor={`mentor-${course.id || course._id}`}>
              Celebrity mentor
            </label>
            <div className="mt-2 flex gap-2">
              <select
                id={`mentor-${course.id || course._id}`}
                value={selectedMentorId === null ? "" : selectedMentorId || course.mentorId || ""}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => {
                  event.stopPropagation();
                  onMentorChange(course.id || course._id, event.target.value ? Number(event.target.value) || event.target.value : null);
                }}
                className="h-10 min-w-0 flex-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-sm text-[hsl(var(--foreground))] outline-none focus:ring-2 focus:ring-upto-blue"
              >
                <option value="">Default mentor</option>
                {mentors.map((item) => (
                  <option key={item.id || item._id} value={item.id || item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onMentorRemove(course.id || course._id);
                }}
                className="rounded-lg border border-[hsl(var(--border))] px-3 text-xs font-bold text-muted hover:bg-[hsl(var(--card))] hover:text-[hsl(var(--foreground))]"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {course.duration || "10h"}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {course.enrolled || "12K"}
          </span>
          <span className="flex items-center gap-1 text-upto-orange">
            <Zap className="h-3.5 w-3.5" />
            {course.xp || 1000} XP
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[hsl(var(--border))] pt-4">
          <span className="text-lg font-extrabold text-[hsl(var(--foreground))]">
            {!course.price || course.price === 0 ? "Freemium" : formatCurrency(course.price)}
          </span>
          <span className="rounded-lg bg-upto-blue/10 px-4 py-1.5 text-xs font-bold text-upto-blue transition-all group-hover:bg-upto-blue group-hover:text-white">
            Enroll →
          </span>
        </div>
      </div>
    </div>
  );
}
