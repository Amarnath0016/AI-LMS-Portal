import { useState } from "react";
import {
  Trophy,
  Award,
  Zap,
  Sparkles,
  Shield,
  Star,
  CheckCircle2,
  Lock,
  Share2,
  Download,
  Search,
  Filter,
  Flame,
  Brain,
  MessageSquare,
  Users,
  Code,
  Check,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/common/button";
import { HeroPanel, SectionCard, StatusBadge } from "@/components/ui/dashboard";
import { toast } from "sonner";

// Badges Master Catalog
const badgesData = [
  {
    id: "b-streak-7",
    title: "Streak Champion",
    category: "Consistency",
    rarity: "Rare",
    desc: "Maintained an unbroken 7-day study streak on Uptoskills.",
    icon: Flame,
    color: "from-amber-500 to-orange-600",
    unlocked: true,
    unlockedDate: "July 12, 2026",
    progress: 100,
    maxProgress: 7,
    xp: 200,
  },
  {
    id: "b-xp-10k",
    title: "XP Overlord",
    category: "Coding Master",
    rarity: "Epic",
    desc: "Crossed 10,000 total experience points on the platform.",
    icon: Zap,
    color: "from-blue-500 to-indigo-600",
    unlocked: true,
    unlockedDate: "June 28, 2026",
    progress: 100,
    maxProgress: 10000,
    xp: 500,
  },
  {
    id: "b-cert-graduate",
    title: "Triple Graduate",
    category: "Certifications",
    rarity: "Epic",
    desc: "Earned 3 verified certificates in programming & AI tracks.",
    icon: Award,
    color: "from-emerald-500 to-teal-600",
    unlocked: true,
    unlockedDate: "July 01, 2026",
    progress: 100,
    maxProgress: 3,
    xp: 400,
  },
  {
    id: "b-quiz-perfect",
    title: "Perfect Scorer",
    category: "Coding Master",
    rarity: "Rare",
    desc: "Scored 100% accuracy on any module final assessment quiz.",
    icon: Sparkles,
    color: "from-purple-500 to-pink-600",
    unlocked: true,
    unlockedDate: "May 18, 2026",
    progress: 100,
    maxProgress: 100,
    xp: 150,
  },
  {
    id: "b-ai-scholar",
    title: "AI Prompt Scholar",
    category: "AI Scholar",
    rarity: "Epic",
    desc: "Completed 20 live tutoring sessions with Jensen & AI mentors.",
    icon: Brain,
    color: "from-cyan-500 to-blue-600",
    unlocked: true,
    unlockedDate: "July 14, 2026",
    progress: 100,
    maxProgress: 20,
    xp: 300,
  },
  {
    id: "b-cyber-cadet",
    title: "Security Cadet",
    category: "League Champion",
    rarity: "Rare",
    desc: "Successfully solved Cyber Defense League CTF challenge level 1.",
    icon: Shield,
    color: "from-rose-500 to-red-600",
    unlocked: true,
    unlockedDate: "July 05, 2026",
    progress: 100,
    maxProgress: 1,
    xp: 250,
  },
  {
    id: "b-daily-solver",
    title: "Daily Challenge Addict",
    category: "Consistency",
    rarity: "Epic",
    desc: "Solve 25 Daily Skill Challenges.",
    icon: Code,
    color: "from-orange-500 to-amber-600",
    unlocked: false,
    progress: 18,
    maxProgress: 25,
    xp: 350,
  },
  {
    id: "b-community-star",
    title: "Discussion Pioneer",
    category: "Community Legend",
    rarity: "Rare",
    desc: "Get 15 upvotes on forum answers helping fellow learners.",
    icon: MessageSquare,
    color: "from-violet-500 to-purple-600",
    unlocked: false,
    progress: 11,
    maxProgress: 15,
    xp: 200,
  },
  {
    id: "b-legendary-hacker",
    title: "Legendary Cyber Shield",
    category: "League Champion",
    rarity: "Legendary",
    desc: "Rank #1 in Global Cyber Defense League Championship.",
    icon: Star,
    color: "from-amber-400 via-rose-500 to-purple-600",
    unlocked: false,
    progress: 1,
    maxProgress: 5,
    xp: 1000,
  },
];

export default function AchievementBadgesPage() {
  const [filterStatus, setFilterStatus] = useState("All"); // 'All' | 'Unlocked' | 'In Progress' | 'Locked'
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBadge, setSelectedBadge] = useState(null);

  const handleShareBadge = (badgeTitle) => {
    toast.success(`Share card generated for "${badgeTitle}" badge! Copied to clipboard.`);
  };

  const handleClaimXp = (badgeTitle, xp) => {
    toast.success(`🎉 Claimed +${xp} XP bonus for unlocking "${badgeTitle}"!`);
  };

  const filteredBadges = badgesData.filter((badge) => {
    const matchesSearch =
      badge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      badge.desc.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "All"
        ? true
        : filterStatus === "Unlocked"
        ? badge.unlocked
        : filterStatus === "In Progress"
        ? !badge.unlocked && badge.progress > 0
        : !badge.unlocked && badge.progress === 0;

    const matchesCat = categoryFilter === "All" || badge.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCat;
  });

  const unlockedCount = badgesData.filter((b) => b.unlocked).length;

  return (
    <div className="space-y-8">
      {/* Hero Header & Level Banner */}
      <HeroPanel className="relative overflow-hidden border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-upto-blue/5 to-purple-500/10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-500">
                <Trophy className="h-4 w-4" /> Level 14 Tech Ninja
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-upto-blue/15 px-3 py-1 text-xs font-bold text-upto-blue">
                <Zap className="h-3.5 w-3.5" /> 14,850 / 15,000 XP (99% to Level 15)
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-[hsl(var(--foreground))] sm:text-4xl">
              Trophy Cabinet & Skill Badges
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted leading-relaxed">
              Unlock prestigious badges by mastering code challenges, maintaining streaks, completing courses, and leading community discussions.
            </p>
          </div>

          {/* Level Progress Stats Box */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 shrink-0">
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/90 p-4 text-center shadow-sm backdrop-blur-md">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Badges Unlocked</p>
              <p className="mt-1 text-2xl font-black text-amber-500">{unlockedCount} / {badgesData.length}</p>
            </div>
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/90 p-4 text-center shadow-sm backdrop-blur-md">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Global Rank</p>
              <p className="mt-1 text-2xl font-black text-upto-blue">#12</p>
            </div>
            <div className="col-span-2 sm:col-span-1 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/90 p-4 text-center shadow-sm backdrop-blur-md">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Certificates</p>
              <p className="mt-1 text-2xl font-black text-emerald-500">3 Earned</p>
            </div>
          </div>
        </div>

        {/* Level XP Meter */}
        <div className="mt-6 border-t border-[hsl(var(--border))] pt-4">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-muted">Progress to Level 15 (Master Architect)</span>
            <span className="text-amber-500">150 XP Needed</span>
          </div>
          <div className="h-3 w-full rounded-full bg-[hsl(var(--surface))] overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 w-[99%]" />
          </div>
        </div>
      </HeroPanel>

      {/* Filterable Badge Gallery */}
      <SectionCard
        title={
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              <span>Badge Catalog</span>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {["All", "Unlocked", "In Progress", "Locked"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilterStatus(st)}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                    filterStatus === st
                      ? "bg-amber-500 text-white shadow-sm"
                      : "bg-[hsl(var(--surface))] text-muted hover:text-[hsl(var(--foreground))]"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        }
      >
        {/* Search & Category Filter Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search badges by name or description..."
              className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] pl-9 pr-4 py-2 text-xs font-semibold outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {["All", "Coding Master", "Consistency", "AI Scholar", "League Champion", "Community Legend"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                  categoryFilter === cat
                    ? "bg-upto-blue text-white"
                    : "bg-[hsl(var(--surface))] text-muted hover:text-[hsl(var(--foreground))]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Badge Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBadges.map((badge) => {
            const Icon = badge.icon;
            const progressPercent = Math.round((badge.progress / badge.maxProgress) * 100);

            return (
              <div
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer ${
                  badge.unlocked
                    ? "border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-[hsl(var(--card))] to-transparent shadow-md"
                    : badge.progress > 0
                    ? "border-upto-blue/30 bg-[hsl(var(--card))]"
                    : "border-[hsl(var(--border))] bg-[hsl(var(--surface))]/50 opacity-60"
                }`}
              >
                {/* Rarity & XP Header */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`rounded px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                      badge.rarity === "Legendary"
                        ? "bg-rose-500/15 text-rose-500"
                        : badge.rarity === "Epic"
                        ? "bg-amber-500/15 text-amber-500"
                        : badge.rarity === "Rare"
                        ? "bg-purple-500/15 text-purple-500"
                        : "bg-blue-500/15 text-blue-500"
                    }`}
                  >
                    {badge.rarity}
                  </span>

                  <span className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                    <Zap className="h-3.5 w-3.5 fill-amber-500" /> +{badge.xp} XP
                  </span>
                </div>

                {/* Badge Icon & Content */}
                <div className="flex gap-4 items-start">
                  <div
                    className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${badge.color} text-white shadow-lg shadow-amber-500/10`}
                  >
                    <Icon className="h-7 w-7" />
                    {badge.unlocked && (
                      <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-[hsl(var(--card))]">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-[hsl(var(--foreground))] leading-snug">{badge.title}</h4>
                    <p className="mt-1 text-xs text-muted leading-relaxed line-clamp-2">{badge.desc}</p>
                  </div>
                </div>

                {/* Progress Bar for Locked / In Progress Badges */}
                {!badge.unlocked && (
                  <div className="mt-4 pt-3 border-t border-[hsl(var(--border))]">
                    <div className="flex justify-between text-[10px] font-bold text-muted mb-1">
                      <span>Progress</span>
                      <span>{badge.progress} / {badge.maxProgress} ({progressPercent}%)</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[hsl(var(--surface))] overflow-hidden">
                      <div className="h-full rounded-full bg-upto-blue" style={{ width: `${progressPercent}%` }} />
                    </div>
                  </div>
                )}

                {/* Unlocked Date Footer */}
                {badge.unlocked && (
                  <div className="mt-4 pt-3 border-t border-[hsl(var(--border))] flex items-center justify-between text-[10px] font-bold text-muted">
                    <span className="text-emerald-500">Unlocked: {badge.unlockedDate}</span>
                    <span className="text-upto-blue underline font-semibold">View Details</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Badge Details Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <span
                className={`rounded px-2.5 py-0.5 text-[10px] font-black uppercase ${
                  selectedBadge.rarity === "Legendary"
                    ? "bg-rose-500/15 text-rose-500"
                    : "bg-amber-500/15 text-amber-500"
                }`}
              >
                {selectedBadge.rarity} Badge
              </span>
              <button
                onClick={() => setSelectedBadge(null)}
                className="text-muted hover:text-[hsl(var(--foreground))] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Large Glowing Badge Display */}
            <div className="text-center space-y-3 py-2">
              <div
                className={`mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br ${selectedBadge.color} text-white shadow-2xl shadow-amber-500/20`}
              >
                {(() => {
                  const Icon = selectedBadge.icon;
                  return <Icon className="h-12 w-12" />;
                })()}
              </div>

              <h3 className="text-xl font-black text-[hsl(var(--foreground))]">{selectedBadge.title}</h3>
              <p className="text-xs text-muted max-w-xs mx-auto leading-relaxed">{selectedBadge.desc}</p>
            </div>

            {/* Requirements & Info Box */}
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted font-semibold">Reward Value:</span>
                <span className="font-extrabold text-amber-500 flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 fill-amber-500" /> +{selectedBadge.xp} XP
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted font-semibold">Status:</span>
                <span className={`font-bold ${selectedBadge.unlocked ? "text-emerald-500" : "text-amber-500"}`}>
                  {selectedBadge.unlocked ? `Unlocked on ${selectedBadge.unlockedDate}` : "In Progress"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              {selectedBadge.unlocked ? (
                <>
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => handleShareBadge(selectedBadge.title)}
                  >
                    <Share2 className="h-4 w-4" /> Share
                  </Button>
                  <Button
                    variant="gradient"
                    className="flex-1 gap-2"
                    onClick={() => handleClaimXp(selectedBadge.title, selectedBadge.xp)}
                  >
                    <Zap className="h-4 w-4" /> Claim XP Bonus
                  </Button>
                </>
              ) : (
                <Button variant="gradient" className="w-full" onClick={() => setSelectedBadge(null)}>
                  Close & Continue Learning
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
