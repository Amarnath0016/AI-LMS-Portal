import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Loader2, AlertCircle, ShieldCheck, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/common/button";
import { MentorCard } from "@/components/ui/MentorCard";
import { HeroPanel } from "@/components/ui/dashboard";
import { useAuthContext } from "@/store/AuthContext";
import { mentorApi } from "@/api/endpoints";
import { useApiQuery } from "@/hooks/useApi";

export default function MentorList() {
  const { user, updateProfile } = useAuthContext();
  const navigate = useNavigate();
  const [selectedMentor, setSelectedMentor] = useState(user?.mentor || null);

  const {
    data: mentorsData,
    loading,
    error,
    refetch,
    isEmpty,
  } = useApiQuery(() => mentorApi.getAll(), []);

  const mentors = Array.isArray(mentorsData)
    ? mentorsData
    : mentorsData?.data || [];

  const handleConfirm = () => {
    if (!selectedMentor) return toast.error("Please select an AI mentor first");
    if (updateProfile) {
      updateProfile({ mentor: selectedMentor });
    }
    toast.success(`${selectedMentor.name} is now your AI mentor!`);
    navigate("/dashboard");
  };

  return (
    <div>
      <HeroPanel>
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-300 mb-4">
          <ShieldCheck className="h-4 w-4" />
          Ethical AI Mentorship · Verified Consent &amp; Licences
        </div>
        <h1 className="text-4xl font-black">Choose Your AI Mentor</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Select an AI educational persona or verified historical mentor to guide your learning journey.
          All mentors operate with documented licensing, zero living-person impersonation, and clear AI disclosures.
        </p>
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 text-xs text-amber-300 max-w-xl">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400" />
          <span>Notice: Mentors are AI-generated educational personas and not real living individuals.</span>
        </div>
      </HeroPanel>

      {loading && (
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-upto-blue" />
          <p className="text-sm text-muted">Loading AI mentors...</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-400 mb-2" />
          <p className="font-semibold text-red-300">Failed to load mentors</p>
          <p className="text-sm text-red-400/80 mt-1">{error}</p>
          <Button variant="outline" className="mt-4" onClick={refetch}>
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && isEmpty && (
        <div className="rounded-xl border border-dashed border-[hsl(var(--border))] p-12 text-center">
          <p className="text-muted">No mentors available at this time.</p>
        </div>
      )}

      {!loading && !error && mentors.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {mentors.map((mentor) => (
            <MentorCard
              key={mentor._id || mentor.id}
              mentor={mentor}
              selected={selectedMentor?.id === mentor.id || selectedMentor?._id === mentor._id}
              onSelect={setSelectedMentor}
            />
          ))}
        </div>
      )}

      {selectedMentor && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <Button variant="gradient" size="lg" onClick={handleConfirm} className="shadow-2xl">
            Continue with {selectedMentor.name} →
          </Button>
        </div>
      )}
    </div>
  );
}
