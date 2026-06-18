import { useAuthContext } from "@/store/AuthContext";
import { Award, ShieldAlert, Sparkles, CheckCircle, Trophy, Zap, Share2, Download, Calendar } from "lucide-react";
import { Button } from "@/components/common/button";
import { HeroPanel, SectionCard } from "@/components/ui/dashboard";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const availableBadges = [
  { id: "streak-3", title: "Streak Champion", desc: "Maintained a 7-day study streak.", icon: Trophy, color: "from-amber-500 to-orange-600", unlocked: true },
  { id: "xp-10k", title: "XP Overlord", desc: "Crossed 10,000 total XP points.", icon: Zap, color: "from-blue-500 to-indigo-600", unlocked: true },
  { id: "cert-2", title: "Double Graduate", desc: "Earned 2 or more course certificates.", icon: Award, color: "from-emerald-500 to-green-600", unlocked: true },
  { id: "quiz-perfect", title: "Perfect Scorer", desc: "Scored 100% on any quiz part.", icon: Sparkles, color: "from-purple-500 to-pink-600", unlocked: false },
  { id: "mentor-swapper", title: "celebrity Pupil", desc: "Swapped or learned from 3+ AI mentors.", icon: CheckCircle, color: "from-teal-500 to-cyan-600", unlocked: false },
  { id: "hacker-novice", title: "Security Cadet", desc: "Completed Cyber Defense League.", icon: ShieldAlert, color: "from-red-500 to-rose-600", unlocked: false },
];

const milestones = [
  { id: 1, title: "Account Created", desc: "Joined Uptoskills technical platform.", date: "Jan 12, 2026", done: true },
  { id: 2, title: "First Course Enrolled", desc: "Started Python programming course.", date: "Feb 05, 2026", done: true },
  { id: 3, title: "Streak Master", desc: "Completed 7 days in a row.", date: "Feb 12, 2026", done: true },
  { id: 4, title: "Earned Python Certificate", desc: "Graduated from Python: The First Steps course.", date: "May 12, 2026", done: true },
  { id: 5, title: "Crossed 15K XP", desc: "Climbed up the leaderboard to Top 3.", date: "June 08, 2026", done: true },
  { id: 6, title: "Unlock Advanced Machine Learning", desc: "Get Jensen Huang's certificate.", date: "In Progress", done: false },
];

export default function AchievementsPage() {
  const { certificates } = useAuthContext();
  const navigate = useNavigate();

  const handleShare = (certTitle) => {
    toast.success(`Share link generated for "${certTitle}" certificate!`);
  };

  return (
    <div className="space-y-8">
      <HeroPanel>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-upto-orange">Achievements</p>
        <h1 className="mt-2 text-3xl font-black text-[hsl(var(--foreground))] sm:text-4xl">Badges & Milestones</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Track your learning milestones, unlock professional skill badges, and review your verified course certificates.
        </p>
      </HeroPanel>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Badges Unlocked */}
        <div className="lg:col-span-2 space-y-8">
          <SectionCard
            title={
              <span className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-upto-orange" />
                Skill Badges
              </span>
            }
            description="Badges earned by completing challenges, quizzes, and course milestones."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {availableBadges.map((badge) => {
                const Icon = badge.icon;
                return (
                  <div
                    key={badge.id}
                    className={`relative overflow-hidden rounded-xl border p-5 transition-all hover:shadow-lg ${
                      badge.unlocked
                        ? "border-upto-blue/20 bg-gradient-to-br from-upto-blue/5 to-transparent shadow-sm hover:border-upto-blue/40"
                        : "border-[hsl(var(--border))] bg-gray-500/5 opacity-50"
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${badge.color} text-white shadow-md shadow-slate-900/20`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-[hsl(var(--foreground))]">{badge.title}</h4>
                        <p className="mt-1 text-xs text-muted leading-relaxed">{badge.desc}</p>
                        <span className={`mt-2 inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                          badge.unlocked ? "bg-upto-green/10 text-upto-green" : "bg-muted/10 text-muted"
                        }`}>
                          {badge.unlocked ? "Unlocked" : "Locked"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* Certificates Earned */}
          <SectionCard
            title={
              <span className="flex items-center gap-2">
                <Award className="h-5 w-5 text-upto-blue" />
                Certificates Earned
              </span>
            }
            description="Verified certifications received upon 100% completion of enrolled courses."
          >
            <div className="space-y-4">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="flex flex-col gap-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-upto-orange/10 text-upto-orange">
                      <Award className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[hsl(var(--foreground))] leading-snug">{cert.title}</h4>
                      <p className="mt-1 text-xs text-muted flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Issued: {cert.date} &bull; Mentor: {cert.mentor}
                      </p>
                      <p className="mt-1 text-[10px] font-bold text-upto-blue">Code: {cert.verificationCode}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleShare(cert.title)}>
                      <Share2 className="h-3.5 w-3.5" /> Share
                    </Button>
                    <Button
                      variant="gradient"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => navigate("/certificates")}
                    >
                      <Download className="h-3.5 w-3.5" /> View / Download
                    </Button>
                  </div>
                </div>
              ))}
              {certificates.length === 0 && (
                <p className="text-sm text-muted text-center py-6">No certificates earned yet. Finish a course to generate one!</p>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Milestones Timeline */}
        <div className="space-y-8">
          <SectionCard title="Learning Milestones" description="Your timeline of progress and achievements.">
            <div className="relative border-l border-[hsl(var(--border))] pl-5 ml-3 space-y-6">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="relative">
                  {/* Indicator Dot */}
                  <span className={`absolute -left-[27px] top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full ring-4 ring-[hsl(var(--card))] ${
                    milestone.done ? "bg-upto-green" : "bg-gray-300 dark:bg-gray-800"
                  }`} />
                  <div>
                    <h5 className={`text-xs font-extrabold ${milestone.done ? "text-[hsl(var(--foreground))]" : "text-muted"}`}>
                      {milestone.title}
                    </h5>
                    <p className="mt-1 text-xs text-muted">{milestone.desc}</p>
                    <span className="mt-1 block text-[10px] font-bold text-upto-orange">{milestone.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
