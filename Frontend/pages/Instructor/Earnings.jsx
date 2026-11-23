import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Download,
  Calendar,
  CheckCircle,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import { Button } from "@/components/common/button";
import { HeroPanel, SectionCard, StatusBadge } from "@/components/ui/dashboard";
import { DataTable } from "@/components/ui/table";

export default function Earnings() {
  const [period, setPeriod] = useState("all-time");

  const payouts = [
    {
      id: "PO-9921",
      date: "Nov 01, 2026",
      amount: "₹48,500",
      method: "Bank Transfer (HDFC)",
      status: "Paid",
    },
    {
      id: "PO-9410",
      date: "Oct 01, 2026",
      amount: "₹42,200",
      method: "Bank Transfer (HDFC)",
      status: "Paid",
    },
    {
      id: "PO-8832",
      date: "Sep 01, 2026",
      amount: "₹36,800",
      method: "Bank Transfer (HDFC)",
      status: "Paid",
    },
  ];

  const columns = [
    { header: "Payout ID", accessor: "id" },
    { header: "Date", accessor: "date" },
    {
      header: "Amount",
      accessor: "amount",
      cell: (row) => <span className="font-bold text-upto-green">{row.amount}</span>,
    },
    { header: "Method", accessor: "method" },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => <StatusBadge tone="green">{row.status}</StatusBadge>,
    },
  ];

  return (
    <div className="space-y-6">
      <HeroPanel>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-upto-orange">
              Financial Overview
            </p>
            <h1 className="mt-1 text-2xl font-black text-[hsl(var(--foreground))] sm:text-3xl">
              Instructor Earnings
            </h1>
            <p className="mt-1 text-sm text-muted">
              Track course revenue, subscriber royalties, and automated payout distributions.
            </p>
          </div>
          <Button variant="gradient" className="self-start sm:self-auto">
            <Download className="mr-2 h-4 w-4" />
            Download Tax Invoice
          </Button>
        </div>
      </HeroPanel>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="app-card rounded-xl p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Total Net Revenue</p>
          <p className="mt-2 text-3xl font-black text-[hsl(var(--foreground))]">₹1,27,500</p>
          <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-upto-green">
            <ArrowUpRight className="h-3.5 w-3.5" /> +18.4% this month
          </span>
        </div>
        <div className="app-card rounded-xl p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">This Month's Earnings</p>
          <p className="mt-2 text-3xl font-black text-upto-green">₹54,200</p>
          <p className="mt-1 text-xs text-muted">Accruing for next payout</p>
        </div>
        <div className="app-card rounded-xl p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Pending Payout</p>
          <p className="mt-2 text-3xl font-black text-upto-blue">₹54,200</p>
          <p className="mt-1 text-xs text-muted">Scheduled for Dec 01, 2026</p>
        </div>
        <div className="app-card rounded-xl p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Paid Enrollments</p>
          <p className="mt-2 text-3xl font-black text-[hsl(var(--foreground))]">216</p>
          <p className="mt-1 text-xs text-muted">Lifetime student buyers</p>
        </div>
      </div>

      <SectionCard title="Payout History" description="Historical settlement logs transferred to your verified account.">
        <DataTable columns={columns} data={payouts} />
      </SectionCard>
    </div>
  );
}
