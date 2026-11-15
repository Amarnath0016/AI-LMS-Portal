import { useState, useMemo } from "react";
import { useAuthContext } from "@/store/AuthContext";
import { Trophy, TrendingUp, Zap, Calendar, Medal, Award, Loader2, AlertCircle } from "lucide-react";
import { FilterTabs, HeroPanel, MetricCard, SectionCard } from "@/components/ui/dashboard";
import { LineChart } from "@/components/ui/charts";
import { leaderboardApi } from "@/api/endpoints";
import { useApiQuery } from "@/hooks/useApi";
import { Button } from "@/components/common/button";

const xpHistoryData = [
  { label: "Week 1", value: 1200 },
  { label: "Week 2", value: 3400 },
  { label: "Week 3", value: 6800 },
  { label: "Week 4", value: 10400 },
  { label: "Week 5", value: 13120 },
  { label: "Week 6", value: 17111 },
];

export default function LeaderboardPage() {
  const { user } = useAuthContext();
  const [timeframe, setTimeframe] = useState("Weekly");

  const {
    data: leaderboardData,
    loading,
    error,
    refetch,
  } = useApiQuery(() => leaderboardApi.get({ limit: 20 }), []);

  const learners = useMemo(() => {
    return Array.isArray(leaderboardData) ? leaderboardData : leaderboardData?.data || [];
  }, [leaderboardData]);

  // Compute user's rank from list if present
  const myRank = useMemo(() => {
    if (!user || !learners.length) return 1;
    const idx = learners.findIndex(
      (l) => l._id === user._id || l.id === user.id || l.name === user.name || l.email === user.email
    );
    return idx !== -1 ? idx + 1 : 1;
  }, [learners, user]);

  return (
    <div className="space-y-8">
      <HeroPanel>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-upto-orange">Leaderboard</p>
        <h1 className="mt-2 text-3xl font-black text-[hsl(var(--foreground))] sm:text-4xl">Weekly Rankings</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Compare your progress, review the top learners, and check your ranking stands globally across technical cohorts.
        </p>
      </HeroPanel>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard icon={Trophy} label="Your Rank" value={`#${myRank}`} helper="Server-computed standing" tone="orange" />
        <MetricCard icon={Zap} label="Your Total XP" value={(user?.xp || 0).toLocaleString()} helper="Earned from lessons & quizzes" tone="blue" />
        <MetricCard icon={TrendingUp} label="Daily Streak" value={`${user?.streak || 1} Days`} helper="Keep your streak alive!" tone="green" />
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted">
          <Calendar className="h-4 w-4" /> Filter Rankings:
        </div>
        <FilterTabs options={["Weekly", "All-Time"]} value={timeframe} onChange={setTimeframe} />
      </div>

      {loading && (
        <div className="flex h-48 flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-upto-blue" />
          <p className="text-sm text-muted">Loading live leaderboard from server...</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-400 mb-2" />
          <p className="font-semibold text-red-300">Failed to load leaderboard</p>
          <p className="text-sm text-red-400/80 mt-1">{error}</p>
          <Button variant="outline" className="mt-4" onClick={refetch}>
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Rankings Table */}
          <div className="lg:col-span-2 space-y-8">
            <SectionCard title={`${timeframe} Standings`} description={`Top learners sorted by technical XP points computed server-side.`}>
              <div className="space-y-3">
                {learners.map((learner, idx) => {
                  const rank = learner.rank || idx + 1;
                  const isCurrentUser =
                    user &&
                    (learner._id === user._id ||
                      learner.id === user.id ||
                      learner.email === user.email ||
                      learner.name === user.name);

                  return (
                    <div
                      key={learner._id || learner.id || rank}
                      className={`flex items-center gap-4 rounded-xl p-4 border transition-all ${
                        isCurrentUser
                          ? "border-upto-blue/40 bg-upto-blue/5 shadow-md shadow-blue-500/5 scale-[1.01]"
                          : "border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--surface))]"
                      }`}
                    >
                      {/* Rank Badge */}
                      <div className="flex h-8 w-8 items-center justify-center shrink-0">
                        {rank === 1 ? (
                          <Medal className="h-6 w-6 text-yellow-500" />
                        ) : rank === 2 ? (
                          <Medal className="h-6 w-6 text-slate-400" />
                        ) : rank === 3 ? (
                          <Medal className="h-6 w-6 text-amber-700" />
                        ) : (
                          <span className="text-xs font-black text-muted">#{rank}</span>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-upto-blue to-purple-500 text-xs font-black text-white shrink-0 shadow-sm">
                        {learner.initials || learner.avatar || learner.name?.[0]?.toUpperCase() || "L"}
                      </div>

                      {/* Learner Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-extrabold text-[hsl(var(--foreground))] flex items-center gap-1.5">
                          {learner.name}
                          {isCurrentUser && (
                            <span className="rounded-full bg-upto-blue/10 px-2 py-0.5 text-[9px] font-black uppercase text-upto-blue">
                              You
                            </span>
                          )}
                        </h4>
                        <p className="text-[10px] text-muted truncate mt-0.5">
                          {learner.title || (learner.streak ? `${learner.streak}-day streak` : "Active Scholar")}
                        </p>
                      </div>

                      {/* Points */}
                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-upto-orange">
                          {(learner.xp || 0).toLocaleString()}
                        </span>
                        <span className="block text-[9px] font-bold text-muted uppercase">XP</span>
                      </div>
                    </div>
                  );
                })}
                {learners.length === 0 && (
                  <p className="text-sm text-muted text-center py-6">No learners registered yet.</p>
                )}
              </div>
            </SectionCard>
          </div>

          {/* Analytics Breakdown */}
          <div className="space-y-8">
            <SectionCard
              title={
                <span className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-upto-blue" />
                  XP Growth Trend
                </span>
              }
              description="Your weekly XP collection and progress report."
            >
              <div className="space-y-6">
                <LineChart data={xpHistoryData} className="border-0 bg-transparent p-0 shadow-none" />

                <div className="rounded-lg bg-[hsl(var(--surface))] p-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Standings Summary</h4>
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted">Total Learners:</span>
                    <span className="text-[hsl(var(--foreground))] font-extrabold">{learners.length} active</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted">Your Streak:</span>
                    <span className="text-upto-green font-extrabold">{user?.streak || 1} Days</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted">Current League Tier:</span>
                    <span className="text-upto-orange font-extrabold">Diamond Tier</span>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      )}
    </div>
  );
}
