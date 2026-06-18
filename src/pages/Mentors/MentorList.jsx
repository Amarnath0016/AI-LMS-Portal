import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/common/button";
import { MentorCard } from "@/components/ui/MentorCard";
import { HeroPanel } from "@/components/ui/dashboard";
import { useAuthContext } from "@/store/AuthContext";
import { celebrities } from "@/store/mockData";

export default function MentorList() {
  const { selectedMentor, selectMentor } = useAuthContext();
  const navigate = useNavigate();

  const handleConfirm = () => {
    if (!selectedMentor) return toast.error("Please select an AI mentor first");
    toast.success(`${selectedMentor.name} is now your AI mentor!`);
    navigate("/dashboard");
  };

  return (
    <div>
      <HeroPanel>
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm text-purple-300 mb-4">
          <Sparkles className="h-4 w-4" />
          Celebrity Face &amp; Voice · Expert AI Content
        </div>
        <h1 className="text-4xl font-black">Choose Your AI Celebrity Mentor</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Select a celebrity whose face and voice will guide your learning journey.
          The actual teaching content is delivered by our expert AI system.
        </p>
      </HeroPanel>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {celebrities.map((mentor) => (
          <MentorCard
            key={mentor.id}
            mentor={mentor}
            selected={selectedMentor?.id === mentor.id}
            onSelect={selectMentor}
          />
        ))}
      </div>

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
