import { useMemo, useState } from "react";
import { CheckCircle, XCircle, Clock, Loader2, AlertCircle, Lock, ShieldCheck, Tag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { EmptyState, HeroPanel, StatusBadge } from "@/components/ui/dashboard";
import { courseApi, adminApi, mentorApi } from "@/api/endpoints";
import { useApiQuery } from "@/hooks/useApi";

export default function CourseApproval() {
  const [processingId, setProcessingId] = useState(null);

  const {
    data: coursesData,
    loading: coursesLoading,
    error: coursesError,
    refetch: refetchCourses,
  } = useApiQuery(() => courseApi.getAll(), []);

  const {
    data: mentorsData,
  } = useApiQuery(() => mentorApi.getAll(), []);

  const mentors = useMemo(() => {
    return Array.isArray(mentorsData) ? mentorsData : mentorsData?.data || [];
  }, [mentorsData]);

  const mentorMap = useMemo(() => {
    const map = {};
    mentors.forEach((m) => {
      map[String(m._id)] = m;
      if (m.id !== undefined) map[String(m.id)] = m;
    });
    return map;
  }, [mentors]);

  const pending = useMemo(() => {
    const list = Array.isArray(coursesData) ? coursesData : coursesData?.data || [];
    return list.filter((c) => c.status === "pending");
  }, [coursesData]);

  const approve = async (course) => {
    const id = course._id || course.id;
    setProcessingId(id);
    try {
      await adminApi.approveCourse(id);
      toast.success(`Course "${course.title}" approved and published!`);
      refetchCourses();
    } catch (err) {
      toast.error("Failed to approve course: " + (err.response?.data?.message || err.message));
    } finally {
      setProcessingId(null);
    }
  };

  const reject = async (course) => {
    const id = course._id || course.id;
    setProcessingId(id);
    try {
      await adminApi.rejectCourse(id);
      toast.error(`Course "${course.title}" rejected`);
      refetchCourses();
    } catch (err) {
      toast.error("Failed to reject course: " + (err.response?.data?.message || err.message));
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleAccess = async (course) => {
    const id = course._id || course.id;
    const nextType = course.accessType === "paid" ? "free" : "paid";
    const nextPrice = nextType === "free" ? 0 : (course.price || 2999);
    try {
      await adminApi.updateCourseAccess(id, { accessType: nextType, price: nextPrice });
      toast.success(`Course updated to ${nextType.toUpperCase()} (₹${nextPrice})`);
      refetchCourses();
    } catch (err) {
      toast.error("Failed to update access type: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div>
      <HeroPanel>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-upto-blue">Admin</p>
        <h1 className="mt-2 text-3xl font-black text-[hsl(var(--foreground))] sm:text-4xl">Course Approval</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Review, approve, or reject AI celebrity courses before they go live on the platform.
        </p>
      </HeroPanel>

      {coursesLoading && (
        <div className="flex h-48 flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-upto-blue" />
          <p className="text-sm text-muted">Checking pending course submissions...</p>
        </div>
      )}

      {coursesError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center my-6">
          <AlertCircle className="mx-auto h-8 w-8 text-red-400 mb-2" />
          <p className="font-semibold text-red-300">Failed to load courses</p>
          <p className="text-sm text-red-400/80 mt-1">{coursesError}</p>
          <Button variant="outline" className="mt-4" onClick={refetchCourses}>
            Retry
          </Button>
        </div>
      )}

      {!coursesLoading && !coursesError && pending.length === 0 && (
        <EmptyState
          icon={CheckCircle}
          title="All caught up"
          description="No courses are pending approval right now in the database."
        />
      )}

      {!coursesLoading && !coursesError && pending.length > 0 && (
        <div className="space-y-4">
          {pending.map((course) => {
            const courseId = course._id || course.id;
            const mentor = mentorMap[String(course.mentorId)] || course.mentor;
            const isProcessing = processingId === courseId;

            return (
              <div key={courseId} className="app-card rounded-lg p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-4">
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg text-lg font-black text-white"
                      style={{ background: mentor?.accent || "#3B82F6" }}
                    >
                      {mentor?.initials || "AI"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <StatusBadge tone="yellow">
                          <Clock className="h-3 w-3" />
                          Pending
                        </StatusBadge>
                        <span className="text-xs text-muted">{course.league || "Professional Track"}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                          course.accessType === "paid" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        }`}>
                          {course.accessType === "paid" ? `PAID (₹${course.price || 0})` : "FREE"}
                        </span>
                      </div>
                      <h3 className="mt-1 text-lg font-bold">{course.title}</h3>
                      <p className="text-sm text-muted">
                        AI Mentor: {mentor?.name || "AI Expert"} · {course.level || "Beginner"} · {course.duration || "Self-paced"}
                      </p>
                      <p className="mt-2 max-w-xl text-sm text-muted">{course.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 shrink-0 items-start sm:items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleAccess(course)}
                      className="text-xs gap-1"
                      title="Switch between Free and Paid"
                    >
                      <Tag className="h-3.5 w-3.5" /> Toggle {course.accessType === "paid" ? "to Free" : "to Paid"}
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      disabled={isProcessing}
                      onClick={() => approve(course)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="mr-1.5 h-4 w-4" />
                          Approve
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isProcessing}
                      onClick={() => reject(course)}
                    >
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
