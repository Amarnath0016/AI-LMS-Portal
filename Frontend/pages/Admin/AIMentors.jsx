import { useState, useMemo } from "react";
import {
  Star,
  CheckCircle,
  XCircle,
  Search,
  Sparkles,
  Shield,
  Loader2,
  AlertCircle,
  Power,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { HeroPanel, SectionCard, EmptyState, StatusBadge } from "@/components/ui/dashboard";
import { adminApi } from "@/api/endpoints";
import { useApiQuery } from "@/hooks/useApi";

export default function AIMentors() {
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const {
    data: mentorsData,
    loading,
    error,
    refetch,
  } = useApiQuery(() => adminApi.getMentors(), []);

  const mentors = useMemo(() => {
    return Array.isArray(mentorsData) ? mentorsData : mentorsData?.data || [];
  }, [mentorsData]);

  const filtered = useMemo(() => {
    return mentors.filter((m) =>
      !search ||
      [m.name, m.role, m.expertise, m.status]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [mentors, search]);

  const handleToggleStatus = async (mentor) => {
    const mentorId = mentor._id || mentor.id;
    const newStatus = mentor.status === "active" ? "inactive" : "active";
    try {
      setUpdatingId(mentorId);
      await adminApi.updateMentorStatus(mentorId, {
        status: newStatus,
        licenseInfo: mentor.licenseInfo || "Verified Synthetic AI License v2",
      });
      toast.success(`Mentor ${mentor.name} set to ${newStatus}`);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update mentor status.");
    } finally {
      setUpdatingId(mentorId);
    }
  };

  return (
    <div className="space-y-6">
      <HeroPanel>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-upto-orange">
              AI Infrastructure
            </p>
            <h1 className="mt-1 text-2xl font-black text-[hsl(var(--foreground))] sm:text-3xl">
              AI Mentors Management
            </h1>
            <p className="mt-1 text-sm text-muted">
              Configure synthetic persona licensing, consent documents, and active conversational availability.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              type="text"
              placeholder="Search AI mentors..."
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
          <p className="text-sm text-muted">Loading AI mentors...</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-400" />
          <p className="mt-2 text-sm text-red-300">Failed to load mentors.</p>
          <Button variant="outline" size="sm" onClick={refetch} className="mt-3">
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          icon={Sparkles}
          title="No AI mentors found"
          description="No AI mentors match your search query."
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((mentor) => {
            const mentorId = mentor._id || mentor.id;
            const isUpdating = updatingId === mentorId;
            const isActive = mentor.status === "active";

            return (
              <div
                key={mentorId}
                className="app-card flex flex-col justify-between rounded-xl p-5"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-upto-blue/10 text-upto-blue font-black text-lg">
                        {mentor.name ? mentor.name.charAt(0) : "M"}
                      </div>
                      <div>
                        <h3 className="font-bold text-[hsl(var(--foreground))]">{mentor.name}</h3>
                        <p className="text-xs text-muted">{mentor.role || "AI Mentor"}</p>
                      </div>
                    </div>
                    <StatusBadge tone={isActive ? "green" : "red"}>
                      {isActive ? "Active" : "Inactive"}
                    </StatusBadge>
                  </div>

                  <p className="mt-4 text-xs text-muted line-clamp-3">
                    {mentor.bio || mentor.description || "Interactive synthetic persona with voice synthesis capabilities."}
                  </p>

                  <div className="mt-4 space-y-1.5 border-t border-[hsl(var(--border))] pt-3 text-xs text-muted">
                    <p className="flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5 text-upto-blue" />
                      Ethics Consent: {mentor.consentApproved !== false ? "Verified" : "Pending"}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <FileCheck className="h-3.5 w-3.5 text-upto-green" />
                      Persona: {mentor.type || "synthetic-persona"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[hsl(var(--border))] pt-3">
                  <span className="text-[11px] text-muted">ID: {mentorId}</span>
                  <Button
                    variant={isActive ? "outline" : "gradient"}
                    size="sm"
                    disabled={isUpdating}
                    onClick={() => handleToggleStatus(mentor)}
                  >
                    <Power className="mr-1.5 h-3.5 w-3.5" />
                    {isActive ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
