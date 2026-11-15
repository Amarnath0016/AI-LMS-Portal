import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Zap,
  Target,
  Users,
  ChevronRight,
  Sparkles,
  Flame,
  Award,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Button } from "@/components/common/button";
import { CourseCard } from "@/components/ui/CourseCard";
import { useApiQuery } from "@/hooks/useApi";
import { courseApi, mentorApi, leaderboardApi } from "@/api/endpoints";

const stats = [
  { value: "50,000+", label: "Active Learners" },
  { value: "10+", label: "AI Celebrity Mentors" },
  { value: "1,200+", label: "League Hours" },
  { value: "98%", label: "Satisfaction" },
];

const features = [
  { icon: Zap, title: "Earn XP", desc: "Gain experience with every quest and lesson" },
  { icon: Trophy, title: "Climb Leaderboard", desc: "Win prizes in global league competitions" },
  { icon: Award, title: "Achievements", desc: "Tamper-proof certificates with verification codes" },
  { icon: Flame, title: "Maintain Streaks", desc: "Build consistent daily learning discipline" },
  { icon: Target, title: "Daily Challenges", desc: "Weekly and daily programming quests" },
  { icon: Users, title: "Community", desc: "Connect with learners in discussion forums" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeCard, setActiveCard] = useState(0);

  const { data: courses = [] } = useApiQuery(() => courseApi.getAll({ status: "approved" }), []);
  const { data: mentors = [] } = useApiQuery(() => mentorApi.getAll(), []);
  const { data: leaderboardData } = useApiQuery(() => leaderboardApi.get(), []);

  const leaderboard = leaderboardData?.allTime || leaderboardData?.weekly || [];

  useEffect(() => {
    if (mentors.length === 0) return;
    const timer = setInterval(() => {
      setActiveCard((p) => (p + 1) % mentors.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [mentors.length]);

  const approvedCourses = Array.isArray(courses) ? courses.slice(0, 6) : [];

  return (
    <div className="min-h-screen bg-upto-dark text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(37,99,235,0.18),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgba(255,107,0,0.08),transparent)]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-4 lg:grid-cols-2 lg:px-6">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-upto-blue/30 bg-upto-blue/10 px-4 py-2 text-sm font-medium text-blue-300">
              <Sparkles className="h-4 w-4" />
              AI-Powered Celebrity Learning
            </div>

            <h1 className="text-5xl font-black leading-tight tracking-tight sm:text-6xl">
              Learn from{" "}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-orange-400 bg-clip-text text-transparent">
                Ethical AI Mentors
              </span>
            </h1>

            <p className="mt-6 text-lg text-gray-400 leading-relaxed max-w-xl">
              Study tech, engineering, and startups with specialized AI mentors like Dr. Alex Vance, Dr. Sid Rao,
              and historical figures like Ada Lovelace. Authentic synthetic voices and interactive avatars with zero unauthorized impersonation.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                variant="gradient"
                size="lg"
                onClick={() => navigate("/register")}
                className="gap-2 shadow-lg shadow-blue-500/25"
              >
                Start Learning Free <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/mentors")}
                className="border-gray-700 hover:border-gray-500 text-gray-200"
              >
                Meet the Mentors
              </Button>
            </div>

            <div className="mt-12 grid grid-cols-4 gap-4 border-t border-gray-800 pt-8">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-xl font-black text-white">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Faculty Carousel */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-upto-blue/20 to-orange-500/20 blur-2xl opacity-60" />

            <div className="relative rounded-2xl border border-gray-800 bg-upto-card p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-upto-blue">
                  AI Educational Faculty
                </span>
                <span className="flex items-center gap-1.5 text-xs text-green-400">
                  <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  Live Voice &amp; Avatar Ready
                </span>
              </div>

              {mentors.length > 0 && (
                <div
                  className="rounded-xl p-6 transition-all duration-500 min-h-[280px] flex flex-col justify-between"
                  style={{
                    background: `linear-gradient(135deg, ${mentors[activeCard]?.color || "#1a1a2e"}, #0B0F19)`,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-black text-white shadow-lg ring-2 ring-white/20"
                      style={{ background: mentors[activeCard]?.accent || "#2563EB" }}
                    >
                      {mentors[activeCard]?.initials || "EM"}
                    </div>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                      {mentors[activeCard]?.tag || "Technology"}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black">{mentors[activeCard]?.name}</h3>
                    <p className="text-sm text-gray-300 mt-1 font-medium">{mentors[activeCard]?.subject}</p>
                    <p className="mt-3 text-xs text-gray-400 italic line-clamp-2">
                      &ldquo;{mentors[activeCard]?.bio}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs text-gray-400">
                    <span>{mentors[activeCard]?.students || "50K"} students</span>
                    <span>★ {mentors[activeCard]?.rating || "4.9"} rating</span>
                    <span className="text-blue-300">{mentors[activeCard]?.courses || 5} courses</span>
                  </div>
                </div>
              )}

              {/* Dots */}
              <div className="mt-4 flex justify-center gap-2">
                {mentors.slice(0, 8).map((m, i) => (
                  <button
                    key={m.id || m._id || i}
                    onClick={() => setActiveCard(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === activeCard ? "w-6 bg-upto-blue" : "w-1.5 bg-gray-700"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-upto-orange">Curriculum</p>
              <h2 className="mt-2 text-3xl font-black">Featured Courses</h2>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/courses")}
              className="border-gray-700 text-gray-300 hover:text-white"
            >
              View All Courses →
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {approvedCourses.map((course) => (
              <CourseCard key={course.id || course._id} course={course} mentors={mentors} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-upto-card/30 border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-bold uppercase tracking-wider text-upto-blue">Gamification</p>
            <h2 className="mt-2 text-3xl font-black">Learn Like You Play</h2>
            <p className="mt-3 text-gray-400">
              XP, streaks, global leaderboards, and verified certificates transform online learning into an addictive adventure.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-gray-800 bg-upto-card p-6 hover:border-gray-700 transition-all"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-upto-blue/10 text-upto-blue mb-4">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section className="py-20 border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <p className="text-xs font-bold uppercase tracking-wider text-upto-orange">Global Rankings</p>
            <h2 className="mt-2 text-3xl font-black">Top Performers</h2>
          </div>

          <div className="max-w-2xl mx-auto rounded-2xl border border-gray-800 bg-upto-card overflow-hidden">
            {leaderboard.slice(0, 5).map((l, i) => (
              <div
                key={l.id || l.name || i}
                className="flex items-center justify-between p-4 border-b border-gray-800/50 last:border-0 hover:bg-gray-800/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                      i === 0
                        ? "bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/40"
                        : i === 1
                        ? "bg-gray-400/20 text-gray-300 ring-1 ring-gray-400/40"
                        : i === 2
                        ? "bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/40"
                        : "text-gray-500"
                    }`}
                  >
                    #{l.rank || i + 1}
                  </span>
                  <div>
                    <p className="font-bold text-sm">{l.name}</p>
                    <p className="text-xs text-gray-500">{l.title || "UptoSkills Scholar"}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-sm font-bold text-upto-orange">
                  <Zap className="h-4 w-4" />
                  {(l.xp || 0).toLocaleString()} XP
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 text-center text-xs text-gray-500">
        <p>© 2026 UptoSkills AI LMS. Final Year Engineering Project. All rights reserved.</p>
        <p className="mt-1">
          Celebrity personas are synthetic AI representations designed for educational inspiration.
        </p>
      </footer>
    </div>
  );
}
