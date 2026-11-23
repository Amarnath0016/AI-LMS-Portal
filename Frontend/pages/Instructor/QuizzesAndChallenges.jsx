import { useState } from "react";
import { CheckSquare, Flame, HelpCircle, Plus, Sparkles, Trophy, Clock } from "lucide-react";
import { Button } from "@/components/common/button";
import { HeroPanel, SectionCard, EmptyState, StatusBadge } from "@/components/ui/dashboard";

export default function QuizzesAndChallenges() {
  const [activeTab, setActiveTab] = useState("quizzes");

  return (
    <div className="space-y-6">
      <HeroPanel>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-upto-orange">
              Evaluation & Gamification
            </p>
            <h1 className="mt-1 text-2xl font-black text-[hsl(var(--foreground))] sm:text-3xl">
              Quizzes & Challenges
            </h1>
            <p className="mt-1 text-sm text-muted">
              Author interactive quiz assessments, league milestones, and daily coding challenges for your learners.
            </p>
          </div>
          <Button variant="gradient" className="self-start sm:self-auto">
            <Plus className="mr-2 h-4 w-4" />
            New Assessment
          </Button>
        </div>

        <div className="mt-6 flex gap-2 border-b border-[hsl(var(--border))] pb-3">
          {[
            { id: "quizzes", label: "Module Quizzes", icon: CheckSquare },
            { id: "challenges", label: "Daily Challenges", icon: Flame },
            { id: "leagues", label: "League Exams", icon: Trophy },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === id
                  ? "bg-upto-blue text-white"
                  : "text-muted hover:bg-[hsl(var(--surface))] hover:text-[hsl(var(--foreground))]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </HeroPanel>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="app-card rounded-xl p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Total Assessments</p>
          <p className="mt-2 text-3xl font-black text-[hsl(var(--foreground))]">18</p>
          <p className="mt-1 text-xs text-muted">Across all active courses</p>
        </div>
        <div className="app-card rounded-xl p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Avg Completion Rate</p>
          <p className="mt-2 text-3xl font-black text-upto-green">84.2%</p>
          <p className="mt-1 text-xs text-muted">Learners scoring &gt; 70%</p>
        </div>
        <div className="app-card rounded-xl p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Total Submissions</p>
          <p className="mt-2 text-3xl font-black text-upto-blue">1,240</p>
          <p className="mt-1 text-xs text-muted">Evaluated via AI auto-grader</p>
        </div>
      </div>

      <SectionCard
        title="Assessment Authoring Studio"
        description="Build multi-choice quizzes, code validation exercises, and AI-graded prompts."
      >
        <EmptyState
          icon={Sparkles}
          title="Interactive Assessment Builder — Coming Soon"
          description="We are enhancing the instructor assessment engine with automated rubric generation and instant live grading. In the meantime, use Course Builder to attach module-level quizzes."
          action={
            <Button variant="outline" onClick={() => window.history.back()}>
              Back to Studio
            </Button>
          }
        />
      </SectionCard>
    </div>
  );
}
