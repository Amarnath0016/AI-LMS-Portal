import { useState } from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/common/button";
import { EmptyState, HeroPanel, StatusBadge } from "@/components/ui/dashboard";
import { pendingCourses, getMentorById } from "@/store/mockData";

export default function CourseApproval() {
  const [pending, setPending] = useState(pendingCourses);

  const approve = (id) => {
    setPending((prev) => prev.filter((c) => c.id !== id));
    toast.success("Course approved and published!");
  };

  const reject = (id) => {
    setPending((prev) => prev.filter((c) => c.id !== id));
    toast.error("Course rejected");
  };

  return (
    <div>
      <HeroPanel>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-upto-blue">Admin</p>
        <h1 className="mt-2 text-3xl font-black text-[hsl(var(--foreground))] sm:text-4xl">Course Approval</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Review, approve, or reject AI celebrity courses before they go live.
        </p>
      </HeroPanel>

      {pending.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="All caught up"
          description="No courses are pending approval right now."
        />
      ) : (
        <div className="space-y-4">
          {pending.map((course) => {
            const mentor = getMentorById(course.mentorId);
            return (
              <div key={course.id} className="app-card rounded-lg p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-4">
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg text-lg font-black text-white"
                      style={{ background: mentor?.accent }}
                    >
                      {mentor?.initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <StatusBadge tone="yellow">
                          <Clock className="h-3 w-3" />
                          Pending
                        </StatusBadge>
                        <span className="text-xs text-muted">{course.league}</span>
                      </div>
                      <h3 className="mt-1 text-lg font-bold">{course.title}</h3>
                      <p className="text-sm text-muted">
                        AI Mentor: {mentor?.name} · {course.level} · {course.duration}
                      </p>
                      <p className="mt-2 max-w-xl text-sm text-muted">{course.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => approve(course.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-1.5 h-4 w-4" />
                      Approve
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => reject(course.id)}>
                      <XCircle className="mr-1.5 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
