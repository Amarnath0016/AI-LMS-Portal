import { BookOpen, PlusCircle, Star, TrendingUp, Users, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart } from "@/components/ui/charts";
import { HeroPanel, MetricCard, QuickActions, SectionCard, StatusBadge } from "@/components/ui/dashboard";
import { DataTable } from "@/components/ui/table";
import { courses } from "@/store/mockData";

export default function InstructorDashboard() {
  const navigate = useNavigate();
  const myCourses = courses.slice(0, 4);
  const columns = [
    { key: "course", header: "Course", cell: (c) => <span className="font-semibold text-[hsl(var(--foreground))]">{c.title}</span> },
    { key: "league", header: "League", cell: (c) => <span className="text-muted">{c.league}</span> },
    { key: "level", header: "Level", cell: (c) => <StatusBadge tone="blue">{c.level}</StatusBadge> },
    { key: "enrolled", header: "Enrolled", cell: (c) => c.enrolled },
    {
      key: "status",
      header: "Status",
      cell: (c) => <StatusBadge tone={c.status === "approved" ? "green" : "yellow"}>{c.status}</StatusBadge>,
    },
  ];

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
              { label: "New Course", icon: PlusCircle, onClick: () => {}, variant: "gradient" },
              { label: "Live Session", icon: Video, onClick: () => {} },
              { label: "Students", icon: Users, onClick: () => {} },
              { label: "Reports", icon: TrendingUp, onClick: () => navigate("/analytics") },
            ]}
          />
        </div>
      </HeroPanel>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <MetricCard icon={BookOpen} label="Published Courses" value="4" helper="1 pending approval" tone="blue" />
        <MetricCard icon={Users} label="Total Students" value="12,430" helper="+284 this month" tone="green" trend="+6.8%" />
        <MetricCard icon={Star} label="Avg Rating" value="4.8" helper="Across all courses" tone="orange" />
        <MetricCard icon={TrendingUp} label="Completion Rate" value="71%" helper="+3.1% weekly" tone="purple" />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="My AI Celebrity Courses" description="Responsive table with cleaner status and level treatments.">
          <DataTable columns={columns} rows={myCourses} getRowKey={(course) => course.id} className="border-0 bg-transparent shadow-none" />
        </SectionCard>
        <SectionCard title="Enrollments" description="Monthly growth across active courses.">
          <BarChart data={[
            { label: "Jan", value: 32 },
            { label: "Feb", value: 44 },
            { label: "Mar", value: 58 },
            { label: "Apr", value: 71 },
            { label: "May", value: 86 },
          ]} className="border-0 bg-transparent p-0 shadow-none" />
        </SectionCard>
      </div>
    </div>
  );
}
