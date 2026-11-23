import { useState, useMemo } from "react";
import { ArrowUpRight, DollarSign, Download, GraduationCap, ShieldCheck, TrendingUp, Users, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/common/button";
import { BarChart, LineChart, PieChart } from "@/components/ui/charts";
import { FilterTabs, HeroPanel, MetricCard, QuickActions, SectionCard, StatusBadge } from "@/components/ui/dashboard";
import { DataTable } from "@/components/ui/table";
import { adminApi, subscriptionApi } from "@/api/endpoints";
import { useApiQuery } from "@/hooks/useApi";

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

  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useApiQuery(() => adminApi.getUsers(), []);

  const {
    data: analyticsData,
    loading: analyticsLoading,
  } = useApiQuery(() => adminApi.getAnalytics(), []);

  const {
    data: subscriptionsData,
    loading: subsLoading,
    error: subsError,
    refetch: refetchSubs,
  } = useApiQuery(() => subscriptionApi.getAllAdmin(), []);

  const subscriptions = useMemo(() => {
    return Array.isArray(subscriptionsData) ? subscriptionsData : subscriptionsData?.data || [];
  }, [subscriptionsData]);

  const users = useMemo(() => {
    return Array.isArray(usersData) ? usersData : usersData?.data || [];
  }, [usersData]);

  const analytics = useMemo(() => {
    return analyticsData?.data || analyticsData || {};
  }, [analyticsData]);

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
    {
      key: "role",
      header: "Role",
      cell: (user) => <span className="capitalize">{user.role || "student"}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (user) => (
        <StatusBadge tone={user.status === "Active" ? "green" : "red"}>
          {user.status || "Active"}
        </StatusBadge>
      ),
    },
    {
      key: "xp",
      header: "XP",
      cell: (user) => (
        <span className="font-bold text-upto-orange">
          {(user.xp || 0).toLocaleString()}
        </span>
      ),
    },
  ];

  const subColumns = [
    {
      key: "subscriber",
      header: "Subscriber",
      cell: (sub) => (
        <div>
          <p className="font-semibold text-[hsl(var(--foreground))]">{sub.billingName || sub.userId?.name || "Learner"}</p>
          <p className="text-xs text-muted">{sub.billingEmail || sub.userId?.email}</p>
        </div>
      ),
    },
    {
      key: "plan",
      header: "Plan & Price",
      cell: (sub) => (
        <div>
          <p className="font-bold text-sm text-[hsl(var(--foreground))]">{sub.planId?.name || "Pass"}</p>
          <p className="text-xs text-muted">₹{sub.planId?.price ? Number(sub.planId.price).toLocaleString("en-IN") : "0"}</p>
        </div>
      ),
    },
    {
      key: "mode",
      header: "Mode & Reference",
      cell: (sub) => (
        <div>
          <span className="font-mono text-xs font-bold text-upto-blue">{sub.demoReference || sub._id}</span>
          <p className="text-[10px] text-muted uppercase font-semibold">{sub.paymentMode || "demo"}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (sub) => (
        <StatusBadge tone={sub.status === "active" ? "green" : sub.status === "cancelled" ? "yellow" : "red"}>
          {sub.status ? sub.status.toUpperCase() : "ACTIVE"}
        </StatusBadge>
      ),
    },
    {
      key: "dates",
      header: "Validity",
      cell: (sub) => (
        <span className="text-xs text-muted">
          {sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString() : "Ongoing"}
        </span>
      ),
    },
  ];

  const exportUserReport = () => {
    downloadCsv("uptoskills-user-report.csv", [
      ["Name", "Email", "Role", "Status", "XP"],
      ...users.map((user) => [
        user.name,
        user.email,
        user.role || "student",
        user.status || "Active",
        user.xp || 0,
      ]),
    ]);
  };

  const exportPlatformData = () => {
    downloadCsv("uptoskills-platform-data.csv", [
      ["Metric", "Value", "Range"],
      ["Total Users", analytics.totalUsers ?? users.length, range],
      ["Active Students", analytics.activeStudents ?? Math.max(users.length - 2, 0), range],
      ["Approved Courses", analytics.approvedCourses ?? 0, range],
      ["Total Mentors", analytics.totalMentors ?? 6, range],
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
        <MetricCard
          icon={Users}
          label="Total Users"
          value={(analytics.totalUsers ?? users.length).toLocaleString()}
          helper={`${range} database count`}
          tone="blue"
          trend="+12.4%"
        />
        <MetricCard
          icon={GraduationCap}
          label="Active Students"
          value={(analytics.activeStudents ?? Math.max(users.length - 2, 1)).toLocaleString()}
          helper="Enrolled & actively studying"
          tone="green"
          trend="+6.8%"
        />
        <MetricCard
          icon={DollarSign}
          label="Approved Courses"
          value={(analytics.approvedCourses ?? 8).toString()}
          helper="Live in catalog"
          tone="orange"
          trend="+18.2%"
        />
        <MetricCard
          icon={TrendingUp}
          label="AI Inference"
          value={`${analytics.aiInferenceAvgMs ?? 312}ms`}
          helper="Latency performance"
          tone="purple"
          trend="Optimal"
        />
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
          <LineChart
            data={[
              { label: "W1", value: 210 },
              { label: "W2", value: 340 },
              { label: "W3", value: 420 },
              { label: "W4", value: 610 },
            ]}
            className="border-0 bg-transparent p-0 shadow-none"
          />
        </SectionCard>
        <SectionCard title="Role Split" description="Role-based platform population.">
          <PieChart
            data={[
              { label: "Students", value: 72, color: "#2563EB" },
              { label: "Instructors", value: 18, color: "#10B981" },
              { label: "Admins", value: 10, color: "#FF6B00" },
            ]}
            className="border-0 bg-transparent p-0 shadow-none"
          />
        </SectionCard>
      </div>

      <SectionCard title="Enrollments" description="Course enrollments by month." className="mb-8">
        <BarChart
          data={[
            { label: "Jan", value: 420 },
            { label: "Feb", value: 560 },
            { label: "Mar", value: 640 },
            { label: "Apr", value: 720 },
            { label: "May", value: 930 },
            { label: "Jun", value: 1120 },
          ]}
          className="border-0 bg-transparent p-0 shadow-none"
        />
      </SectionCard>

      <SectionCard title="Recent Users" description="Real user accounts retrieved from database.">
        {usersLoading && (
          <div className="flex h-36 flex-col items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-upto-blue" />
            <p className="text-xs text-muted">Loading users from database...</p>
          </div>
        )}

        {usersError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center my-4">
            <AlertCircle className="mx-auto h-6 w-6 text-red-400 mb-1" />
            <p className="text-xs font-semibold text-red-300">Failed to load users: {usersError}</p>
            <Button variant="outline" size="sm" className="mt-2 text-xs" onClick={refetchUsers}>
              Retry
            </Button>
          </div>
        )}

        {!usersLoading && !usersError && (
          <DataTable
            columns={columns}
            rows={users}
            getRowKey={(user) => user._id || user.id}
            className="border-0 bg-transparent shadow-none"
          />
        )}
      </SectionCard>

      <SectionCard title="Active & Recent Subscriptions" description="Simulated and verified student subscription passes.">
        {subsLoading && (
          <div className="flex h-32 flex-col items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-upto-blue" />
            <p className="text-xs text-muted">Loading subscriptions...</p>
          </div>
        )}

        {subsError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center my-4">
            <p className="text-xs font-semibold text-red-300">Failed to load subscriptions: {subsError}</p>
            <Button variant="outline" size="sm" className="mt-2 text-xs" onClick={refetchSubs}>
              Retry
            </Button>
          </div>
        )}

        {!subsLoading && !subsError && (
          <DataTable
            columns={subColumns}
            rows={subscriptions}
            getRowKey={(sub) => sub._id || sub.id}
            className="border-0 bg-transparent shadow-none"
          />
        )}
      </SectionCard>
    </div>
  );
}
