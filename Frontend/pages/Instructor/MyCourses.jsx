import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit3,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileQuestion,
  Loader2,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { HeroPanel, EmptyState, StatusBadge } from "@/components/ui/dashboard";
import { instructorApi } from "@/api/endpoints";
import { useApiQuery } from "@/hooks/useApi";

export default function MyCourses() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [submittingId, setSubmittingId] = useState(null);

  const {
    data: coursesData,
    loading,
    error,
    refetch,
  } = useApiQuery(() => instructorApi.getCourses(), []);

  const courses = useMemo(() => {
    return Array.isArray(coursesData) ? coursesData : coursesData?.data || [];
  }, [coursesData]);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchesStatus = filterStatus === "all" || (c.status || "draft") === filterStatus;
      const matchesSearch =
        !search ||
        (c.title && c.title.toLowerCase().includes(search.toLowerCase())) ||
        (c.category && c.category.toLowerCase().includes(search.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [courses, filterStatus, search]);

  const handleSubmitForReview = async (courseId) => {
    try {
      setSubmittingId(courseId);
      await instructorApi.submitCourse(courseId);
      toast.success("Course submitted for admin approval!");
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit course for review.");
    } finally {
      setSubmittingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <StatusBadge tone="green">Approved & Live</StatusBadge>;
      case "pending":
        return <StatusBadge tone="yellow">Pending Review</StatusBadge>;
      case "rejected":
        return <StatusBadge tone="red">Needs Revisions</StatusBadge>;
      case "draft":
      default:
        return <StatusBadge tone="blue">Draft</StatusBadge>;
    }
  };

  return (
    <div className="space-y-6">
      <HeroPanel>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-upto-orange">
              Teaching Studio
            </p>
            <h1 className="mt-1 text-2xl font-black text-[hsl(var(--foreground))] sm:text-3xl">
              My Courses
            </h1>
            <p className="mt-1 text-sm text-muted">
              Manage your authored curriculum, review submissions, and track course publication status.
            </p>
          </div>
          <Button
            variant="gradient"
            onClick={() => navigate("/instructor/builder")}
            className="self-start sm:self-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-1">
            {["all", "draft", "pending", "approved", "rejected"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`rounded-md px-3 py-1.5 text-xs font-bold capitalize transition-all ${
                  filterStatus === st
                    ? "bg-upto-blue text-white shadow-sm"
                    : "text-muted hover:text-[hsl(var(--foreground))]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </HeroPanel>

      {loading && (
        <div className="flex h-48 flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-upto-blue" />
          <p className="text-sm text-muted">Loading your courses...</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-400" />
          <p className="mt-2 text-sm text-red-300">Failed to load courses. Please try again.</p>
          <Button variant="outline" size="sm" onClick={refetch} className="mt-3">
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && filteredCourses.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title={courses.length === 0 ? "No courses yet" : "No courses matching filter"}
          description={
            courses.length === 0
              ? "You haven't authored any courses yet. Start creating your first AI-powered course!"
              : "Try choosing a different status filter or clearing your search term."
          }
          action={
            courses.length === 0 ? (
              <Button variant="gradient" onClick={() => navigate("/instructor/builder")}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Course
              </Button>
            ) : null
          }
        />
      )}

      {!loading && !error && filteredCourses.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => {
            const courseId = course._id || course.id;
            const isSubmitting = submittingId === courseId;
            return (
              <div
                key={courseId}
                className="app-card flex flex-col justify-between overflow-hidden rounded-xl p-5 transition-all hover:border-upto-blue/40"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-upto-blue">
                      {course.category || "General"}
                    </span>
                    {getStatusBadge(course.status)}
                  </div>

                  <h3 className="mt-3 text-lg font-bold text-[hsl(var(--foreground))] line-clamp-2">
                    {course.title || "Untitled Course"}
                  </h3>
                  <p className="mt-1 text-xs text-muted line-clamp-2">
                    {course.description || "No description provided."}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      {course.modules?.length || 0} Modules
                    </span>
                    <span className="font-semibold text-[hsl(var(--foreground))]">
                      {course.accessType === "paid" ? `₹${course.price || 0}` : "Free"}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[hsl(var(--border))] pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/instructor/builder/${courseId}`)}
                  >
                    <Edit3 className="mr-1.5 h-3.5 w-3.5" />
                    Edit
                  </Button>

                  <div className="flex items-center gap-2">
                    {course.status === "draft" && (
                      <Button
                        variant="gradient"
                        size="sm"
                        disabled={isSubmitting}
                        onClick={() => handleSubmitForReview(courseId)}
                      >
                        {isSubmitting ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Send className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        Submit
                      </Button>
                    )}
                    {course.status === "approved" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/courses/${courseId}`)}
                      >
                        <ExternalLink className="mr-1 h-3.5 w-3.5" />
                        View
                      </Button>
                    )}
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
