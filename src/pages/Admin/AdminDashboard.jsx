import { useState } from "react";
import { ArrowUpRight, DollarSign, Download, GraduationCap, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/common/button";
import { BarChart, LineChart, PieChart } from "@/components/ui/charts";
import { FilterTabs, HeroPanel, MetricCard, QuickActions, SectionCard, StatusBadge } from "@/components/ui/dashboard";
import { DataTable } from "@/components/ui/table";
import { adminUsers } from "@/store/mockData";

function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [range, setRange] = useState("Monthly");
  const columns = [
    {
      key: "user",
      header: "User",
      cell: (user) => (
        <div>
          <p className="font-semibold text-[hsl(var(--foreground))]">{user.name}</p>
          <p className="text-xs text-muted">{user.email}</p>
        </div>
      ),
    },
    { key: "role", header: "Role", cell: (user) => <span className="capitalize">{user.role}</span> },
    {
      key: "status",
      header: "Status",
      cell: (user) => <StatusBadge tone={user.status === "Active" ? "green" : "red"}>{user.status}</StatusBadge>,
    },
    { key: "xp", header: "XP", cell: (user) => <span className="font-bold text-upto-orange">{user.xp.toLocaleString()}</span> },
  ];

  const exportUserReport = () => {
    downloadCsv("uptoskills-user-report.csv", [
      ["Name", "Email", "Role", "Status", "XP"],
      ...adminUsers.map((user) => [user.name, user.email, user.role, user.status, user.xp]),
    ]);
  };

  const exportPlatformData = () => {
    downloadCsv("uptoskills-platform-data.csv", [
      ["Metric", "Value", "Range"],
      ["Total Users", "48210", range],
      ["Active Enrollments", "12930", range],
      ["Monthly Revenue", "₹13.4L", range],
      ["Completion Rate", "71%", range],
    ]);
  };

  return (
    <div>
      <HeroPanel>
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-upto-blue">Admin Panel</p>
            <h1 className="mt-2 text-3xl font-black text-[hsl(var(--foreground))] sm:text-4xl">Platform Analytics</h1>
            <p className="mt-2 max-w-2xl text-muted">
              Monitor user growth, enrollments, progress reports, revenue, and role-based activity.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <FilterTabs options={["Weekly", "Monthly", "Yearly"]} value={range} onChange={setRange} />
            <Button variant="gradient" onClick={() => navigate("/analytics")}>
              Open Reports
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </HeroPanel>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <MetricCard icon={Users} label="Total Users" value="48,210" helper={`${range} view`} tone="blue" trend="+12.4%" />
        <MetricCard icon={GraduationCap} label="Active Enrollments" value="12,930" helper="1,024 this week" tone="green" trend="+6.8%" />
        <MetricCard icon={DollarSign} label="Monthly Revenue" value="₹13.4L" helper="Premium plans" tone="orange" trend="+18.2%" />
        <MetricCard icon={TrendingUp} label="Completion Rate" value="71%" helper="Across all roles" tone="purple" trend="+3.1%" />
      </div>

      <div className="mb-8">
        <QuickActions
          actions={[
            { label: "User Report", icon: Download, onClick: exportUserReport, variant: "outline" },
            { label: "Review Courses", icon: ShieldCheck, onClick: () => navigate("/admin/courses"), variant: "outline" },
            { label: "Growth Trends", icon: TrendingUp, onClick: () => navigate("/analytics"), variant: "outline" },
            { label: "Export Data", icon: ArrowUpRight, onClick: exportPlatformData, variant: "gradient" },
          ]}
        />
      </div>

      <div className="mb-8 grid gap-6 xl:grid-cols-3">
        <SectionCard title="User Growth" description="Returning users and new learner acquisition." className="xl:col-span-2">
          <LineChart data={[
            { label: "W1", value: 210 },
            { label: "W2", value: 340 },
            { label: "W3", value: 420 },
            { label: "W4", value: 610 },
          ]} className="border-0 bg-transparent p-0 shadow-none" />
        </SectionCard>
        <SectionCard title="Role Split" description="Role-based feature usage.">
          <PieChart data={[
            { label: "Students", value: 72, color: "#2563EB" },
            { label: "Instructors", value: 18, color: "#10B981" },
            { label: "Admins", value: 10, color: "#FF6B00" },
          ]} className="border-0 bg-transparent p-0 shadow-none" />
        </SectionCard>
      </div>

      <SectionCard title="Enrollments" description="Course enrollments by month." className="mb-8">
        <BarChart data={[
          { label: "Jan", value: 420 },
          { label: "Feb", value: 560 },
          { label: "Mar", value: 640 },
          { label: "Apr", value: 720 },
          { label: "May", value: 930 },
          { label: "Jun", value: 1120 },
        ]} className="border-0 bg-transparent p-0 shadow-none" />
      </SectionCard>

      <SectionCard title="Recent Users" description="Latest learner and instructor activity.">
        <DataTable columns={columns} rows={adminUsers} getRowKey={(user) => user.id} className="border-0 bg-transparent shadow-none" />
      </SectionCard>
    </div>
  );
}
