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
import { celebrities, courses, leaderboard } from "@/store/mockData";

const stats = [
  { value: "50,000+", label: "Active Learners" },
  { value: "120+", label: "AI Celebrity Mentors" },
  { value: "1,200+", label: "League Hours" },
  { value: "98%", label: "Satisfaction" },
];

const features = [
  { icon: Zap, title: "Earn XP", desc: "Gain experience with every quest" },
  { icon: Trophy, title: "Climb Leaderboard", desc: "Win prizes in league competitions" },
  { icon: Award, title: "Achievements", desc: "Proof of your learning journey" },
  { icon: Flame, title: "Maintain Streaks", desc: "Stay at the top daily" },
  { icon: Target, title: "Daily Challenges", desc: "Weekly and daily quests" },
  { icon: Users, title: "Community", desc: "Connect with learners" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCard((p) => (p + 1) % celebrities.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const approvedCourses = courses.filter((c) => c.status === "approved").slice(0, 6);

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

            <p className="text-sm font-bold uppercase tracking-[0.3em] text-upto-orange">
              Transform Your Skill
            </p>
            <h1 className="mt-3 text-5xl font-black leading-[1.05] tracking-tight lg:text-6xl">
              Learn From Your{" "}
              <span className="upto-gradient-text">Favorite Celebrities</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-gray-400">
              Real celebrity faces &amp; voices. Expert AI content. Master skills through
              gamified leagues — just like UptoSkills, powered by AI mentors.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button variant="gradient" size="lg" onClick={() => navigate("/register")}>
                Start My Journey
                <ChevronRight className="ml-1 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/courses")}>
                Explore Leagues
              </Button>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-6 border-t border-gray-800 pt-8 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-extrabold text-upto-blue">{s.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Celebrity carousel */}
          <div className="relative flex flex-col items-center">
            <div className="relative h-[420px] w-full max-w-sm">
              {celebrities.slice(0, 4).map((c, i) => (
                <div
                  key={c.id}
                  onClick={() => setActiveCard(i)}
                  className="absolute left-1/2 w-72 -translate-x-1/2 cursor-pointer rounded-2xl border border-gray-700/50 p-6 shadow-2xl transition-all duration-500"
                  style={{
                    background: c.color,
                    transform: `translateX(-50%) rotate(${(i - activeCard) * 5}deg) translateY(${Math.abs(i - activeCard) * 12}px)`,
                    zIndex: i === activeCard ? 10 : 5 - Math.abs(i - activeCard),
                    opacity: i === activeCard ? 1 : 0.65,
                  }}
                >
                  {i === activeCard && (
                    <span className="absolute right-4 top-4 rounded-full bg-upto-blue/30 px-2.5 py-1 text-[10px] font-bold text-blue-200">
                      AI MENTOR
                    </span>
                  )}
                  <div
                    className="mb-4 flex h-14 w-14 items-center justify-center rounded-full text-lg font-black text-white"
                    style={{ background: c.accent }}
                  >
                    {c.initials}
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-upto-orange">{c.tag}</p>
                  <h3 className="mt-1 text-xl font-bold">{c.name}</h3>
                  <p className="mt-1 text-sm text-gray-400">{c.subject}</p>
                  <div className="mt-3 flex gap-3 text-xs text-gray-500">
                    <span>⭐ {c.rating}</span>
                    <span>👥 {c.students}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-2">
              {celebrities.slice(0, 4).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveCard(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === activeCard ? "w-6 bg-upto-blue" : "w-2 bg-gray-700"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-gray-800/60 py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-upto-orange">The Magic</p>
            <h2 className="mt-3 text-4xl font-black">How AI Celebrity Learning Works</h2>
            <p className="mx-auto mt-4 max-w-xl text-gray-400">
              Celebrity appearance + voice clone. Expert-crafted AI curriculum. Gamified UptoSkills experience.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: "01", icon: "🎭", title: "Celebrity AI Clone", desc: "Advanced AI recreates celebrity faces and voice patterns for an immersive experience." },
              { step: "02", icon: "🧠", title: "Expert AI Content", desc: "Subject matter experts craft every lesson. The AI mentor delivers verified knowledge." },
              { step: "03", icon: "🎯", title: "Gamified Leagues", desc: "Earn XP, climb leaderboards, and compete in leagues — the UptoSkills way." },
              { step: "04", icon: "🏆", title: "Earn & Grow", desc: "Complete courses, earn certificates, and unlock real career opportunities." },
            ].map((item) => (
              <div key={item.step} className="relative rounded-2xl border border-gray-800 bg-upto-card p-6">
                <span className="absolute right-5 top-5 text-5xl font-black text-gray-800">{item.step}</span>
                <div className="text-4xl">{item.icon}</div>
                <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learn Compete Win */}
      <section className="border-t border-gray-800/60 py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="text-center">
            <h2 className="text-4xl font-black">
              Learn. <span className="text-upto-blue">Compete.</span>{" "}
              <span className="text-upto-orange">Win.</span>
            </h2>
            <p className="mt-3 text-gray-400">
              Join 50,000+ learners earning XP, unlocking achievements, and winning real rewards
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-800 bg-upto-card p-6">
              <h3 className="mb-4 text-lg font-bold">Top Learners</h3>
              <div className="space-y-3">
                {leaderboard.map((l) => (
                  <div key={l.rank} className="flex items-center gap-4 rounded-xl bg-upto-dark p-3">
                    <span className="w-6 text-center text-sm font-bold text-gray-500">#{l.rank}</span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full upto-gradient text-xs font-bold">
                      {l.initials}
                    </div>
                    <span className="flex-1 font-medium">{l.name}</span>
                    <span className="text-sm font-bold text-upto-orange">{l.xp.toLocaleString()} XP</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {features.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-2xl border border-gray-800 bg-upto-card p-4">
                  <Icon className="h-6 w-6 text-upto-blue" />
                  <h4 className="mt-3 text-sm font-bold">{title}</h4>
                  <p className="mt-1 text-xs text-gray-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Leagues */}
      <section className="border-t border-gray-800/60 py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-upto-orange">Explore Leagues</p>
              <h2 className="mt-2 text-4xl font-black">Featured AI Courses</h2>
            </div>
            <Button variant="ghost" onClick={() => navigate("/courses")}>
              View All →
            </Button>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {approvedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-800/60 py-24">
        <div className="mx-auto max-w-3xl px-4 text-center lg:px-6">
          <h2 className="text-4xl font-black">
            Let&apos;s Make <span className="upto-gradient-text">Freshers Employable</span>
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Start your AI celebrity learning journey today. Free leagues available.
          </p>
          <Button variant="gradient" size="lg" className="mt-8" onClick={() => navigate("/register")}>
            Start My Journey →
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg upto-gradient text-sm font-black">U</div>
              <span className="font-extrabold">Upto<span className="text-upto-orange">Skills</span></span>
            </div>
            <p className="text-xs text-gray-500">
              © 2026 UptoSkills. AI-generated celebrity content for educational purposes.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
