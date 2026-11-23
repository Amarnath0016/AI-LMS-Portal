import { useState, useMemo } from "react";
import {
  UserCheck,
  UserX,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  FileText,
  Mail,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { HeroPanel, SectionCard, EmptyState, StatusBadge } from "@/components/ui/dashboard";
import { adminApi } from "@/api/endpoints";
import { useApiQuery } from "@/hooks/useApi";

export default function InstructorApplications() {
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("pending");

  const {
    data: applicationsData,
    loading,
    error,
    refetch,
  } = useApiQuery(() => adminApi.getInstructorApplications(), []);

  const applications = useMemo(() => {
    return Array.isArray(applicationsData)
      ? applicationsData
      : applicationsData?.data || [];
  }, [applicationsData]);

  const filtered = useMemo(() => {
    return applications.filter((app) => {
      const matchesStatus = filterStatus === "all" || (app.status || "pending") === filterStatus;
      const matchesSearch =
        !search ||
        [app.name, app.email, app.expertise, app.bio]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [applications, filterStatus, search]);

  const handleApprove = async (id) => {
    try {
      setProcessingId(id);
      await adminApi.approveInstructorApplication(id);
      toast.success("Instructor application approved! User role updated to instructor.");
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve application.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setProcessingId(id);
      await adminApi.rejectInstructorApplication(id, { reason: "Application criteria not met" });
      toast.info("Instructor application rejected.");
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject application.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <HeroPanel>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-upto-orange">
              Administration & Governance
            </p>
            <h1 className="mt-1 text-2xl font-black text-[hsl(var(--foreground))] sm:text-3xl">
              Instructor Applications
            </h1>
            <p className="mt-1 text-sm text-muted">
              Review credential submissions, verify instructor portfolios, and grant teaching privileges.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-1">
            {["all", "pending", "approved", "rejected"].map((st) => (
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
              placeholder="Search applications..."
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
          <p className="text-sm text-muted">Loading instructor applications...</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-400" />
          <p className="mt-2 text-sm text-red-300">Failed to load applications.</p>
          <Button variant="outline" size="sm" onClick={refetch} className="mt-3">
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          icon={CheckCircle}
          title="No applications found"
          description={
            filterStatus === "pending"
              ? "All pending instructor applications have been reviewed."
              : "No instructor applications match the selected filter."
          }
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((app) => {
            const appId = app._id || app.id;
            const isProcessing = processingId === appId;
            const status = app.status || "pending";

            return (
              <div
                key={appId}
                className="app-card flex flex-col justify-between gap-4 rounded-xl p-5 md:flex-row md:items-center"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-base text-[hsl(var(--foreground))]">
                      {app.name || "Anonymous Applicant"}
                    </span>
                    <span className="text-xs text-muted flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      {app.email}
                    </span>
                    <StatusBadge
                      tone={status === "approved" ? "green" : status === "rejected" ? "red" : "yellow"}
                    >
                      {status}
                    </StatusBadge>
                  </div>

                  {app.expertise && (
                    <p className="text-xs font-semibold text-upto-blue">
                      Domain Expertise: {app.expertise}
                    </p>
                  )}

                  <p className="text-xs text-muted max-w-2xl line-clamp-2">
                    {app.bio || app.message || "No bio provided."}
                  </p>

                  <p className="text-[11px] text-muted">
                    Submitted: {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : "Recent"}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {status === "pending" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isProcessing}
                        onClick={() => handleReject(appId)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <UserX className="mr-1.5 h-3.5 w-3.5" />
                        Reject
                      </Button>
                      <Button
                        variant="gradient"
                        size="sm"
                        disabled={isProcessing}
                        onClick={() => handleApprove(appId)}
                      >
                        {isProcessing ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <UserCheck className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        Approve
                      </Button>
                    </>
                  )}
                  {status !== "pending" && (
                    <span className="text-xs font-bold text-muted capitalize">
                      Decision Recorded
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
