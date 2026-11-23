import { useState, useMemo } from "react";
import { Users, Search, BookOpen, CheckCircle, Clock, Award, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { HeroPanel, SectionCard, EmptyState, StatusBadge } from "@/components/ui/dashboard";
import { DataTable } from "@/components/ui/table";
import { instructorApi } from "@/api/endpoints";
import { useApiQuery } from "@/hooks/useApi";

export default function StudentProgress() {
  const [search, setSearch] = useState("");

  const { data: dashboardData, loading } = useApiQuery(
    () => instructorApi.getDashboard(),
    []
  );

  // Mock initial learner records mapped with realistic course engagement
  const students = useMemo(() => [
    {
      id: "std-1",
      name: "Aarav Sharma",
      email: "aarav.sharma@example.com",
      course: "Complete Modern React & Next.js",
      progress: 92,
      quizzesPassed: 8,
      lastActive: "Today",
      status: "Active",
    },
    {
      id: "std-2",
      name: "Priya Patel",
      email: "priya.patel@example.com",
      course: "AI-Powered Full Stack Development",
      progress: 68,
      quizzesPassed: 5,
      lastActive: "Yesterday",
      status: "Active",
    },
    {
      id: "std-3",
      name: "Rohan Verma",
      email: "rohan.v@example.com",
      course: "Python Automation & AI Agents",
      progress: 100,
      quizzesPassed: 10,
      lastActive: "2 days ago",
      status: "Completed",
    },
    {
      id: "std-4",
      name: "Sneha Reddy",
      email: "sneha.reddy@example.com",
      course: "Complete Modern React & Next.js",
      progress: 45,
      quizzesPassed: 3,
      lastActive: "3 days ago",
      status: "In Progress",
    },
    {
      id: "std-5",
      name: "Vikram Malhotra",
      email: "vikram.m@example.com",
      course: "Cloud Architecture & Microservices",
      progress: 20,
      quizzesPassed: 1,
      lastActive: "1 week ago",
      status: "Behind Schedule",
    },
  ], []);

  const filtered = useMemo(() => {
    return students.filter((s) =>
      [s.name, s.email, s.course, s.status]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [students, search]);

  const columns = [
    {
      header: "Learner",
      accessor: "name",
      cell: (row) => (
        <div>
          <p className="font-bold text-[hsl(var(--foreground))]">{row.name}</p>
          <p className="text-xs text-muted">{row.email}</p>
        </div>
      ),
    },
    {
      header: "Enrolled Course",
      accessor: "course",
      cell: (row) => (
        <span className="text-xs font-semibold text-[hsl(var(--foreground))]">
          {row.course}
        </span>
      ),
    },
    {
      header: "Syllabus Progress",
      accessor: "progress",
      cell: (row) => (
        <div className="w-36">
          <div className="flex items-center justify-between text-xs font-bold mb-1">
            <span>{row.progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--surface))]">
            <div
              className={`h-full rounded-full transition-all ${
                row.progress >= 80
                  ? "bg-upto-green"
                  : row.progress >= 50
                  ? "bg-upto-blue"
                  : "bg-upto-orange"
              }`}
              style={{ width: `${row.progress}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      header: "Quizzes Passed",
      accessor: "quizzesPassed",
      cell: (row) => (
        <span className="flex items-center gap-1 text-xs font-bold text-muted">
          <Award className="h-3.5 w-3.5 text-upto-orange" />
          {row.quizzesPassed} passed
        </span>
      ),
    },
    {
      header: "Last Active",
      accessor: "lastActive",
      cell: (row) => <span className="text-xs text-muted">{row.lastActive}</span>,
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => {
        const tone =
          row.status === "Completed"
            ? "green"
            : row.status === "Active"
            ? "blue"
            : row.status === "Behind Schedule"
            ? "red"
            : "yellow";
        return <StatusBadge tone={tone}>{row.status}</StatusBadge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <HeroPanel>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-upto-orange">
              Cohort Intelligence
            </p>
            <h1 className="mt-1 text-2xl font-black text-[hsl(var(--foreground))] sm:text-3xl">
              Student Progress
            </h1>
            <p className="mt-1 text-sm text-muted">
              Monitor syllabus progress, quiz achievements, and active learning milestones for students in your courses.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              type="text"
              placeholder="Search students or courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </HeroPanel>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="app-card rounded-xl p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Enrolled Students</p>
          <p className="mt-2 text-3xl font-black text-[hsl(var(--foreground))]">
            {dashboardData?.totalEnrollments || 128}
          </p>
          <p className="mt-1 text-xs text-muted">+14 this week</p>
        </div>
        <div className="app-card rounded-xl p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Avg Completion</p>
          <p className="mt-2 text-3xl font-black text-upto-green">71%</p>
          <p className="mt-1 text-xs text-muted">Across all courses</p>
        </div>
        <div className="app-card rounded-xl p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Certificates Issued</p>
          <p className="mt-2 text-3xl font-black text-upto-blue">42</p>
          <p className="mt-1 text-xs text-muted">Verified credentials</p>
        </div>
        <div className="app-card rounded-xl p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Active Now</p>
          <p className="mt-2 text-3xl font-black text-upto-orange">19</p>
          <p className="mt-1 text-xs text-muted">Learners studying</p>
        </div>
      </div>

      <SectionCard title="Active Learners Roster" description="Individual progress tracking per enrolled student.">
        <DataTable columns={columns} data={filtered} />
      </SectionCard>
    </div>
  );
}
