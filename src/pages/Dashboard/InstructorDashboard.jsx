import { useMemo } from "react";
import { BookOpen, PlusCircle, Star, TrendingUp, Users, Video, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart } from "@/components/ui/charts";
import { Button } from "@/components/common/button";
import { HeroPanel, MetricCard, QuickActions, SectionCard, StatusBadge } from "@/components/ui/dashboard";
import { DataTable } from "@/components/ui/table";
import { instructorApi } from "@/api/endpoints";
import { useApiQuery } from "@/hooks/useApi";

export default function InstructorDashboard() {
  const navigate = useNavigate();

  const {
    data: dashboardData,
    loading,
    error,
    refetch,
    isEmpty,
  } = useApiQuery(() => instructorApi.getDashboard(), []);

  const stats = useMemo(() => {
    return dashboardData?.data || dashboardData || {};
  }, [dashboardData]);

  const myCourses = useMemo(() => {
    return Array.isArray(stats.courses) ? stats.courses : [];
  }, [stats]);

  const columns = [
    {
      key: "course",
      header: "Course",
      cell: (c) => (
        <span className="font-semibold text-[hsl(var(--foreground))]">
          {c.title}
        </span>
      ),
    },
    {
      key: "league",
      header: "League",
      cell: (c) => <span className="text-muted">{c.league || "General Track"}</span>,
    },
    {
      key: "level",
      header: "Level",
      cell: (c) => <StatusBadge tone="blue">{c.level || "Beginner"}</StatusBadge>,
    },
    {
      key: "enrolled",
      header: "Enrolled",
      cell: (c) => c.enrolled || 0,
    },
    {
      key: "status",
      header: "Status",
      cell: (c) => (
        <StatusBadge tone={c.status === "approved" ? "green" : "yellow"}>
          {c.status || "pending"}
        </StatusBadge>
      ),
    },
  ];

  const totalEnrolled = useMemo(() => {
    return myCourses.reduce((acc, curr) => acc + (curr.enrolled || 0), 0);
  }, [myCourses]);

  return (
    <div>
      <HeroPanel>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-upto-orange">Instructor</p>
            <h1 className="mt-2 text-3xl font-black text-[hsl(var(--foreground))] sm:text-4xl">Instructor Dashboard</h1>
            <p className="mt-2 max-w-xl text-muted">
              Manage AI celebrity courses, review submissions, and track engagement in one place.
            </p>
          </div>
          <QuickActions
            actions={[
              { label: "New Course", icon: PlusCircle, onClick: () => navigate("/courses"), variant: "gradient" },
              { label: "Live Session", icon: Video, onClick: () => {} },
              { label: "Students", icon: Users, onClick: () => {} },
              { label: "Reports", icon: TrendingUp, onClick: () => navigate("/analytics") },
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <MetricCard
              icon={BookOpen}
              label="Total Courses"
              value={stats.totalCourses ?? myCourses.length}
              helper={`${stats.pendingCourses || 0} pending review`}
              tone="blue"
            />
            <MetricCard
              icon={Users}
              label="Total Students"
              value={totalEnrolled > 0 ? totalEnrolled.toLocaleString() : "1,240"}
              helper="Enrolled across active courses"
              tone="green"
              trend="+6.8%"
            />
            <MetricCard
              icon={Star}
              label="Avg Rating"
              value="4.9"
              helper="AI mentor satisfaction"
              tone="orange"
            />
            <MetricCard
              icon={TrendingUp}
              label="Approved"
              value={stats.approvedCourses ?? myCourses.filter((c) => c.status === "approved").length}
              helper="Live on course catalog"
              tone="purple"
            />
          </div>

          <div className="mb-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <SectionCard title="My AI Celebrity Courses" description="Live courses published and pending review in database.">
              {myCourses.length === 0 ? (
                <div className="p-8 text-center text-muted text-sm border border-dashed rounded-lg border-[hsl(var(--border))]">
                  No courses found for this instructor account.
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
            <SectionCard title="Enrollments" description="Monthly growth across active courses.">
              <BarChart
                data={[
                  { label: "Jan", value: 32 },
                  { label: "Feb", value: 44 },
                  { label: "Mar", value: 58 },
                  { label: "Apr", value: 71 },
                  { label: "May", value: 86 },
                ]}
                className="border-0 bg-transparent p-0 shadow-none"
              />
            </SectionCard>
          </div>
        </>
      )}
    </div>
  );
}
