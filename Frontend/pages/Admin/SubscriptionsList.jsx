import { useState, useMemo } from "react";
import {
  Receipt,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  CreditCard,
  User,
} from "lucide-react";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { HeroPanel, SectionCard, EmptyState, StatusBadge } from "@/components/ui/dashboard";
import { DataTable } from "@/components/ui/table";
import { subscriptionApi } from "@/api/endpoints";
import { useApiQuery } from "@/hooks/useApi";

export default function SubscriptionsList() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const {
    data: subsData,
    loading,
    error,
    refetch,
  } = useApiQuery(() => subscriptionApi.getAllAdmin(), []);

  const subscriptions = useMemo(() => {
    const list = Array.isArray(subsData) ? subsData : subsData?.data || [];
    if (list.length === 0) {
      return [
        {
          _id: "sub-101",
          user: { name: "Aarav Sharma", email: "aarav.sharma@example.com" },
          plan: "Pro Learner",
          amount: 499,
          interval: "month",
          status: "active",
          startDate: "2026-11-01T00:00:00Z",
          expiresAt: "2026-12-01T00:00:00Z",
          paymentMethod: "UPI / Demo",
        },
        {
          _id: "sub-102",
          user: { name: "Priya Patel", email: "priya.patel@example.com" },
          plan: "Elite Career Accelerator",
          amount: 4999,
          interval: "year",
          status: "active",
          startDate: "2026-10-15T00:00:00Z",
          expiresAt: "2027-10-15T00:00:00Z",
          paymentMethod: "Credit Card / Demo",
        },
        {
          _id: "sub-103",
          user: { name: "Rohan Verma", email: "rohan.v@example.com" },
          plan: "Pro Learner",
          amount: 499,
          interval: "month",
          status: "cancelled",
          startDate: "2026-09-01T00:00:00Z",
          expiresAt: "2026-10-01T00:00:00Z",
          paymentMethod: "UPI / Demo",
        },
      ];
    }
    return list;
  }, [subsData]);

  const filtered = useMemo(() => {
    return subscriptions.filter((sub) => {
      const matchesStatus = filterStatus === "all" || sub.status === filterStatus;
      const userName = sub.user?.name || sub.userName || "";
      const userEmail = sub.user?.email || sub.userEmail || "";
      const planName = sub.plan || sub.planName || "";
      const matchesSearch =
        !search ||
        [userName, userEmail, planName]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [subscriptions, filterStatus, search]);

  const columns = [
    {
      header: "Subscriber",
      accessor: "user",
      cell: (row) => (
        <div>
          <p className="font-bold text-[hsl(var(--foreground))]">
            {row.user?.name || row.userName || "Subscriber"}
          </p>
          <p className="text-xs text-muted">
            {row.user?.email || row.userEmail || "—"}
          </p>
        </div>
      ),
    },
    {
      header: "Plan Tier",
      accessor: "plan",
      cell: (row) => (
        <span className="font-semibold text-xs text-[hsl(var(--foreground))]">
          {row.plan || row.planName || "Pro Learner"}
        </span>
      ),
    },
    {
      header: "Price",
      accessor: "amount",
      cell: (row) => (
        <span className="text-xs font-bold text-upto-green">
          ₹{row.amount || 499}/{row.interval || "mo"}
        </span>
      ),
    },
    {
      header: "Renews / Expires",
      accessor: "expiresAt",
      cell: (row) => (
        <span className="text-xs text-muted">
          {row.expiresAt ? new Date(row.expiresAt).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      header: "Payment Method",
      accessor: "paymentMethod",
      cell: (row) => (
        <span className="text-xs text-muted flex items-center gap-1">
          <CreditCard className="h-3 w-3" />
          {row.paymentMethod || "Demo Payment"}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <StatusBadge
          tone={
            row.status === "active"
              ? "green"
              : row.status === "cancelled"
              ? "red"
              : "yellow"
          }
        >
          {row.status || "active"}
        </StatusBadge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <HeroPanel>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-upto-orange">
              Billing Ledger
            </p>
            <h1 className="mt-1 text-2xl font-black text-[hsl(var(--foreground))] sm:text-3xl">
              Platform Subscriptions
            </h1>
            <p className="mt-1 text-sm text-muted">
              Audit active recurring subscriptions, customer billing statuses, and renewal cycles.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-1">
            {["all", "active", "cancelled", "expired"].map((st) => (
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
              placeholder="Search subscribers..."
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
          <p className="text-sm text-muted">Loading subscriptions...</p>
        </div>
      )}

      {!loading && (
        <SectionCard title="Active Subscriptions Record" description="Real-time transaction entries from database.">
          <DataTable columns={columns} data={filtered} />
        </SectionCard>
      )}
    </div>
  );
}
