import { useState } from "react";
import { BarChart3, LineChart as LineIcon, PieChart as PieIcon, Users } from "lucide-react";
import { BarChart, LineChart, PieChart } from "@/components/ui/charts";
import { FilterTabs, MetricCard, PageHeader, SectionCard } from "@/components/ui/dashboard";

const ranges = ["Weekly", "Monthly", "Yearly"];

const dataByRange = {
  Weekly: {
    users: "1,284",
    enrollments: "3,920",
    progress: "74%",
    growth: [
      { label: "Mon", value: 28 },
      { label: "Tue", value: 35 },
      { label: "Wed", value: 48 },
      { label: "Thu", value: 42 },
      { label: "Fri", value: 64 },
      { label: "Sat", value: 52 },
      { label: "Sun", value: 70 },
    ],
  },
  Monthly: {
    users: "8,940",
    enrollments: "16,480",
    progress: "69%",
    growth: [
      { label: "W1", value: 45 },
      { label: "W2", value: 58 },
      { label: "W3", value: 75 },
      { label: "W4", value: 82 },
    ],
  },
  Yearly: {
    users: "48,210",
    enrollments: "129,300",
    progress: "71%",
    growth: [
      { label: "Q1", value: 58 },
      { label: "Q2", value: 72 },
      { label: "Q3", value: 86 },
      { label: "Q4", value: 94 },
    ],
  },
};

export default function AnalyticsPage() {
  const [range, setRange] = useState("Monthly");
  const active = dataByRange[range];

  return (
    <div>
      <PageHeader
        eyebrow="Analytics"
        title="Platform Performance"
        description="Track user growth, enrollments, course progress, and role-based learning outcomes."
        actions={<FilterTabs options={ranges} value={range} onChange={setRange} />}
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={Users} label="User Growth" value={active.users} helper={`${range} learner acquisition`} tone="blue" trend="+12%" />
        <MetricCard icon={BarChart3} label="Enrollments" value={active.enrollments} helper="Across approved courses" tone="green" trend="+7%" />
        <MetricCard icon={LineIcon} label="Avg Progress" value={active.progress} helper="Course completion health" tone="orange" />
        <MetricCard icon={PieIcon} label="Active Roles" value="3" helper="Student, instructor, admin UI" tone="purple" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard title={`${range} User Growth`} description="Learner signups and returning users.">
          <LineChart data={active.growth} className="border-0 bg-transparent p-0 shadow-none" />
        </SectionCard>
        <SectionCard title="Enrollment Mix" description="Distribution by learning path.">
          <PieChart
            className="border-0 bg-transparent p-0 shadow-none"
            data={[
              { label: "AI Leagues", value: 42, color: "#2563EB" },
              { label: "Mentor Labs", value: 28, color: "#10B981" },
              { label: "Career Tracks", value: 18, color: "#FF6B00" },
              { label: "Workshops", value: 12, color: "#8B5CF6" },
            ]}
          />
        </SectionCard>
        <SectionCard title="Progress Reports" description="Completion velocity across active cohorts." className="xl:col-span-2">
          <BarChart
            className="border-0 bg-transparent p-0 shadow-none"
            data={[
              { label: "Beginner", value: 72 },
              { label: "Intermediate", value: 64 },
              { label: "Advanced", value: 51 },
              { label: "Projects", value: 83 },
              { label: "Certified", value: 46 },
            ]}
          />
        </SectionCard>
      </div>
    </div>
  );
}
