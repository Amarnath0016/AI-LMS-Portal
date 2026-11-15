import { useMemo, useState } from "react";
import {
  BookOpen,
  PlusCircle,
  Star,
  TrendingUp,
  Users,
  Video,
  Loader2,
  AlertCircle,
  Edit,
  Send,
  Eye,
  Trash2,
  AlertTriangle,
  CheckCircle,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/common/button";
import { HeroPanel, MetricCard, QuickActions, SectionCard, StatusBadge } from "@/components/ui/dashboard";
import { DataTable } from "@/components/ui/table";
import { instructorApi } from "@/api/endpoints";
import { useApiQuery } from "@/hooks/useApi";

export default function InstructorDashboard() {
  const navigate = useNavigate();
  const [submittingId, setSubmittingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const {
    data: dashboardData,
    loading,
    error,
    refetch,
  } = useApiQuery(() => instructorApi.getDashboard(), []);

  const stats = useMemo(() => {
    return dashboardData?.data || dashboardData || {};
  }, [dashboardData]);

  const myCourses = useMemo(() => {
    return Array.isArray(stats.courses) ? stats.courses : [];
  }, [stats]);

  const rejectedCourses = useMemo(() => {
    return myCourses.filter((c) => c.status === "rejected");
  }, [myCourses]);

  const handleSubmitForReview = async (courseId, e) => {
    e?.stopPropagation();
    setSubmittingId(courseId);
    try {
      await instructorApi.submitCourse(courseId);
      toast.success("Course submitted for admin review successfully!");
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit course for review.");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleDeleteCourse = async (courseId, title, e) => {
    e?.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    setDeletingId(courseId);
    try {
      await instructorApi.deleteCourse(courseId);
      toast.success("Course deleted successfully.");
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete course.");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusTone = (status) => {
    switch (status) {
      case "approved":
        return "green";
      case "pending":
        return "yellow";
      case "rejected":
        return "red";
      case "draft":
      default:
        return "slate";
    }
  };

  const columns = [
    {
      key: "title",
      header: "Course & Curriculum",
      cell: (c) => (
        <div className="flex flex-col gap-1 max-w-sm">
          <span className="font-bold text-[hsl(var(--foreground))] line-clamp-1">{c.title}</span>
          <span className="text-xs text-muted line-clamp-1">{c.description}</span>
          {c.status === "rejected" && c.rejectionReason && (
            <div className="mt-1 flex items-start gap-1 rounded bg-red-500/15 border border-red-500/30 px-2 py-1 text-[11px] text-red-300">
              <AlertTriangle className="h-3 w-3 shrink-0 text-red-400 mt-0.5" />
              <span>
                <strong>Reason:</strong> {c.rejectionReason}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "league",
      header: "League / Tag",
      cell: (c) => (
        <div className="text-xs">
          <p className="font-semibold text-upto-blue">{c.league || "General Track"}</p>
          <p className="text-muted">{c.tag}</p>
        </div>
      ),
    },
    {
      key: "level",
      header: "Level",
      cell: (c) => <StatusBadge tone="blue">{c.level || "Beginner"}</StatusBadge>,
    },
    {
      key: "lessons",
      header: "Lessons",
      cell: (c) => (
        <span className="text-xs text-muted">
          {c.lessons?.length || 0} {c.lessons?.length === 1 ? "lesson" : "lessons"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (c) => (
        <StatusBadge tone={getStatusTone(c.status)}>
          {c.status === "pending"
            ? "Pending Review"
            : c.status === "approved"
            ? "Approved"
            : c.status === "rejected"
            ? "Rejected"
            : "Draft"}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (c) => {
        const id = c._id || c.id;
        const isSubmitting = submittingId === id;
        const isDeleting = deletingId === id;

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/instructor/builder/${id}`)}
              className="gap-1 text-xs"
              title="Edit in Course Builder"
            >
              <Edit className="h-3.5 w-3.5" />
              Edit
            </Button>

            {(c.status === "draft" || c.status === "rejected") && (
              <Button
                variant="gradient"
                size="sm"
                onClick={(e) => handleSubmitForReview(id, e)}
                disabled={isSubmitting}
                className="gap-1 text-xs"
                title="Submit for Admin Review"
              >
                {isSubmitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                Submit
              </Button>
            )}

            {c.status === "approved" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/courses/${id}`)}
                className="gap-1 text-xs text-muted hover:text-white"
                title="Preview Student View"
              >
                <Eye className="h-3.5 w-3.5" />
                Preview
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleDeleteCourse(id, c.title, e)}
              disabled={isDeleting}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              title="Delete Course"
            >
              {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <HeroPanel>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-upto-orange">
              Instructor Studio
            </p>
            <h1 className="mt-2 text-3xl font-black text-[hsl(var(--foreground))] sm:text-4xl">
              Instructor Dashboard
            </h1>
            <p className="mt-2 max-w-xl text-muted">
              Design course curriculum, generate lesson drafts with AI, manage attachments, and track curriculum approvals.
            </p>
          </div>
          <QuickActions
            actions={[
              {
                label: "Course Builder",
                icon: PlusCircle,
                onClick: () => navigate("/instructor/builder/new"),
                variant: "gradient",
              },
              {
                label: "Live Doubts",
                icon: Video,
                onClick: () => navigate("/mentors"),
              },
              {
                label: "Analytics",
                icon: TrendingUp,
                onClick: () => navigate("/analytics"),
              },
            ]}
          />
        </div>
      </HeroPanel>

      {loading && (
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-upto-blue" />
          <p className="text-sm text-muted">Loading instructor analytics...</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center my-8">
          <AlertCircle className="mx-auto h-8 w-8 text-red-400 mb-2" />
          <p className="font-semibold text-red-300">Failed to load instructor dashboard</p>
          <p className="text-sm text-red-400/80 mt-1">{error}</p>
          <Button variant="outline" className="mt-4" onClick={refetch}>
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Key Metrics from DB */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <MetricCard
              icon={BookOpen}
              label="Total Courses"
              value={stats.totalCourses ?? myCourses.length}
              helper={`${stats.pendingCourses || 0} pending · ${stats.draftCourses || 0} drafts`}
              tone="blue"
            />
            <MetricCard
              icon={Users}
              label="Enrolled Students"
              value={(stats.totalStudents || 0).toLocaleString()}
              helper="Enrolled across your active courses"
              tone="green"
            />
            <MetricCard
              icon={Star}
              label="Learner Rating"
              value={`${stats.avgRating || 5.0} ★`}
              helper={`Based on ${stats.totalReviews || 0} verified reviews`}
              tone="orange"
            />
            <MetricCard
              icon={CheckCircle}
              label="Approved & Live"
              value={stats.approvedCourses ?? 0}
              helper={`${stats.rejectedCourses || 0} require revision`}
              tone="purple"
            />
          </div>

          {/* Rejection Notification Banner */}
          {rejectedCourses.length > 0 && (
            <div className="mb-8 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-red-300">
                    Action Required: {rejectedCourses.length} course(s) were returned with reviewer feedback
                  </h4>
                  <p className="text-xs text-red-300/80 mt-1">
                    Please inspect the reviewer feedback below, adjust your lesson scripts or materials in the course builder, and resubmit.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Courses Management Table */}
          <SectionCard
            title="Curriculum & Course Portfolio"
            description="Manage your drafts, pending review items, and published courses."
            action={
              <Button
                variant="gradient"
                size="sm"
                onClick={() => navigate("/instructor/builder/new")}
                className="gap-1.5"
              >
                <PlusCircle className="h-4 w-4" />
                New Course
              </Button>
            }
          >
            {myCourses.length === 0 ? (
              <div className="p-12 text-center text-muted text-sm border border-dashed rounded-lg border-[hsl(var(--border))]">
                <FileText className="mx-auto h-8 w-8 text-muted mb-2" />
                <p className="font-semibold text-white">No courses created yet</p>
                <p className="text-xs text-muted mt-1">
                  Start building your curriculum with AI mentor support and custom lesson modules.
                </p>
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={() => navigate("/instructor/builder/new")}
                  className="mt-4 gap-1.5"
                >
                  <PlusCircle className="h-4 w-4" />
                  Launch Course Builder
                </Button>
              </div>
            ) : (
              <DataTable
                columns={columns}
                rows={myCourses}
                getRowKey={(course) => course._id || course.id}
                className="border-0 bg-transparent shadow-none"
              />
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
}
