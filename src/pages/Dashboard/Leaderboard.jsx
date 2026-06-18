import { useState } from "react";
import { useAuthContext } from "@/store/AuthContext";
import { Trophy, TrendingUp, Zap, Calendar, Medal, Award } from "lucide-react";
import { FilterTabs, HeroPanel, MetricCard, SectionCard } from "@/components/ui/dashboard";
import { LineChart } from "@/components/ui/charts";

const weeklyLearners = [
  { rank: 1, name: "Shailesh Chaudhari", xp: 3200, initials: "SC", title: "Python Sprint Champion" },
  { rank: 2, name: "Kolluru Bindu", xp: 2850, initials: "KB", title: "React Prodigy" },
  { rank: 3, name: "Ashadapu Ashwitha", xp: 2400, initials: "AA", title: "Node API Master" },
  { rank: 4, name: "Varsha K", xp: 2200, initials: "VK", title: "DSA Expert" },
  { rank: 5, name: "Sindhu Gangi", xp: 1950, initials: "SG", title: "ML Scholar" },
  { rank: 6, name: "Priya Verma", xp: 1800, initials: "PV", title: "Cyber Shield" },
  { rank: 7, name: "Aarav Sharma", xp: 1650, initials: "AS", title: "Cloud Scout" },
];

const allTimeLearners = [
  { rank: 1, name: "Shailesh Chaudhari", xp: 17111, initials: "SC", title: "Uptoskills Scholar" },
  { rank: 2, name: "Kolluru Bindu", xp: 13403, initials: "KB", title: "React Master" },
  { rank: 3, name: "Ashadapu Ashwitha", xp: 13122, initials: "AA", title: "Algorithms Guru" },
  { rank: 4, name: "Varsha K", xp: 11049, initials: "VK", title: "Full-Stack Dev" },
  { rank: 5, name: "Sindhu Gangi", xp: 9394, initials: "SG", title: "Deep Learning Wizard" },
  { rank: 6, name: "Zoya Khan", xp: 8100, initials: "ZK", title: "Tech Lead" },
  { rank: 7, name: "Priya Verma", xp: 7500, initials: "PV", title: "Cyber Sentinel" },
];

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

  const learners = timeframe === "Weekly" ? weeklyLearners : allTimeLearners;
  const userRank = timeframe === "Weekly" ? 1 : 1; // Shailesh is #1 in both mocks

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
        <MetricCard icon={Trophy} label="Your Rank" value={`#${userRank}`} helper="Top 1% of all students" tone="orange" />
        <MetricCard icon={Zap} label="Your Total XP" value={user?.xp?.toLocaleString() || "17,111"} helper="Synchronized from quiz attempts" tone="blue" />
        <MetricCard icon={TrendingUp} label="Standing" value="Climbing" helper="+4 ranks since last week" tone="green" />
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted">
          <Calendar className="h-4 w-4" /> Filter Rankings:
        </div>
        <FilterTabs options={["Weekly", "All-Time"]} value={timeframe} onChange={setTimeframe} />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Rankings Table */}
        <div className="lg:col-span-2 space-y-8">
          <SectionCard title={`${timeframe} Standings`} description={`Top learners sorted by technical XP points earned this ${timeframe.toLowerCase()}.`}>
            <div className="space-y-3">
              {learners.map((learner) => {
                const isCurrentUser = learner.name === user?.name || (learner.name === "Shailesh Chaudhari" && !user);
                return (
                  <div
                    key={learner.rank}
                    className={`flex items-center gap-4 rounded-xl p-4 border transition-all ${
                      isCurrentUser
                        ? "border-upto-blue/40 bg-upto-blue/5 shadow-md shadow-blue-500/5 scale-[1.01]"
                        : "border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--surface))]"
                    }`}
                  >
                    {/* Rank Badge */}
                    <div className="flex h-8 w-8 items-center justify-center shrink-0">
                      {learner.rank === 1 ? (
                        <Medal className="h-6 w-6 text-yellow-500" />
                      ) : learner.rank === 2 ? (
                        <Medal className="h-6 w-6 text-slate-400" />
                      ) : learner.rank === 3 ? (
                        <Medal className="h-6 w-6 text-amber-700" />
                      ) : (
                        <span className="text-xs font-black text-muted">#{learner.rank}</span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-upto-blue to-purple-500 text-xs font-black text-white shrink-0 shadow-sm">
                      {learner.initials}
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
                      <p className="text-[10px] text-muted truncate mt-0.5">{learner.title}</p>
                    </div>

                    {/* Points */}
                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-upto-orange">{learner.xp.toLocaleString()}</span>
                      <span className="block text-[9px] font-bold text-muted uppercase">XP</span>
                    </div>
                  </div>
                );
              })}
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
                  <span className="text-muted">Total Cohort Members:</span>
                  <span className="text-[hsl(var(--foreground))] font-extrabold">2,410 Students</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted">Percentile:</span>
                  <span className="text-upto-green font-extrabold">99.8th Percentile</span>
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
    </div>
  );
}
