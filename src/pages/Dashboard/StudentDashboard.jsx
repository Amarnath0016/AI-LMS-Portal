import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Award,
  BookOpen,
  ChevronRight,
  Flame,
  MessageCircle,
  PlayCircle,
  Trophy,
  UserRound,
  Zap,
  Calendar,
  CheckSquare,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { CourseCard } from "@/components/ui/CourseCard";
import { LineChart } from "@/components/ui/charts";
import { DashboardSkeleton, HeroPanel, LiveUpdateBar, MetricCard, QuickActions, SectionCard } from "@/components/ui/dashboard";
import { useAuthContext } from "@/store/AuthContext";
import { courses, leaderboard } from "@/store/mockData";
import { toast } from "sonner";

export default function StudentDashboard() {
  const {
    user,
    selectedMentor,
    courseProgress,
    wishlist,
    certificates,
    quizAttempts,
    forumPosts,
    addForumReply,
  } = useAuthContext();
  
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // Discussion section states
  const [discussionInput, setDiscussionInput] = useState("");
  const [discussionIndex, setDiscussionIndex] = useState(0);

  // Dynamic enrolled courses: any course with progress, default to Python (1) and Communication (4)
  const enrolledCourses = useMemo(() => {
    return courses.filter((c) => {
      const isApproved = c.status === "approved";
      const hasProgress = courseProgress[c.id] !== undefined;
      return isApproved && (hasProgress || c.id === 1 || c.id === 4);
    });
  }, [courseProgress]);

  const totalXp = user?.xp ?? 17111;
  const streak = user?.streak ?? 7;
  const dailyGoalHours = user?.preferences?.dailyGoal ?? 2;

  const chartData = [
    { label: "Mon", value: 180 },
    { label: "Tue", value: 320 },
    { label: "Wed", value: 280 },
    { label: "Thu", value: 460 },
    { label: "Fri", value: 540 },
    { label: "Sat", value: 400 },
    { label: "Sun", value: 650 },
  ];

  // Checklist of mock tasks
  const [checklist, setChecklist] = useState([
    { id: 1, text: "Finish Python Functions & Modules lesson", done: false },
    { id: 2, text: "Earn XP in React Battle League Part 1", done: true },
    { id: 3, text: "Ask a question in Discussion Forum", done: false },
  ]);

  const toggleChecklist = (id) => {
    setChecklist((current) =>
      current.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
    toast.success("Task status updated!");
  };

  useEffect(() => {
    const loadTimer = setTimeout(() => setLoading(false), 500);
    const refreshTimer = setInterval(() => setLastUpdated(new Date()), 15000);
    return () => {
      clearTimeout(loadTimer);
      clearInterval(refreshTimer);
    };
  }, []);

  const sendDiscussionReply = () => {
    const message = discussionInput.trim();
    if (!message) {
      toast.error("Write a reply before sending");
      return;
    }
    // Adds reply to the active forum thread (default ID 1)
    addForumReply(1, message);
    setDiscussionInput("");
  };

  // Get active forum thread default replies
  const activeThread = forumPosts.find((p) => p.id === 1) || { comments: [] };

  // Next up lesson calculation
  const getNextLesson = (course) => {
    const progress = courseProgress[course.id] ?? (course.id === 1 ? 40 : 0);
    if (progress === 100) return "Course completed! Certificate unlocked.";
    
    // Find first uncompleted lesson
    const totalLessons = course.lessons || [];
    const completedCount = Math.floor((progress / 100) * totalLessons.length);
    const nextLesson = totalLessons[completedCount] || totalLessons[0];
    return nextLesson ? `Next up: ${nextLesson.title} (${nextLesson.duration})` : "Next lesson pending";
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div>
      <HeroPanel>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-upto-orange">Student Hub</p>
            <h1 className="mt-2 text-3xl font-black text-[hsl(var(--foreground))] sm:text-4xl">
              Welcome back, {user?.name || "Learner"}!
            </h1>
            <p className="mt-2 max-w-xl text-muted">
              Keep your streak alive, finish today&apos;s league tasks, and climb the leaderboard.
            </p>
            <LiveUpdateBar label="Dashboard updated at" updatedAt={lastUpdated} />
          </div>
          <QuickActions
            actions={[
              { label: "Continue Python", icon: PlayCircle, onClick: () => navigate("/courses/1"), variant: "gradient" },
              { label: "Ask Community", icon: MessageCircle, onClick: () => navigate("/forum") },
              { label: "Play Leagues", icon: Trophy, onClick: () => navigate("/leagues") },
              { label: "Saved Courses", icon: UserRound, onClick: () => navigate("/wishlist") },
            ]}
          />
        </div>
      </HeroPanel>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <MetricCard icon={Zap} label="Total XP" value={totalXp.toLocaleString()} helper="All leagues combined" tone="blue" trend="+12%" />
        <MetricCard icon={Flame} label="Daily Streak" value={`${streak} Days`} helper="Keep learning daily!" tone="orange" />
        <MetricCard icon={BookOpen} label="Enrolled Courses" value={enrolledCourses.length} helper="Across technical cohorts" tone="purple" />
        <MetricCard icon={Award} label="Certificates" value={certificates.length} helper="Verified achievements" tone="green" />
      </div>

      {/* Celebrity Mentor Panel */}
      {selectedMentor && (
        <div className="mb-8 flex items-center gap-5 rounded-lg border border-upto-blue/30 bg-upto-blue/5 p-6 shadow-sm shadow-blue-500/5">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-lg text-xl font-black text-white"
            style={{ background: selectedMentor.accent }}
          >
            {selectedMentor.initials}
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-upto-blue">Your Active AI Mentor</p>
            <h3 className="text-xl font-bold">{selectedMentor.name}</h3>
            <p className="text-sm text-muted">{selectedMentor.subject}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/mentors")}>
            Change Mentor
          </Button>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Enrolled Courses & Progress */}
        <div className="lg:col-span-2 space-y-8">
          <SectionCard
            title={
              <span className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-upto-blue" />
                My Enrolled Courses
              </span>
            }
            description="Detail progress and next lessons for your active technical modules."
          >
            <div className="space-y-6">
              {enrolledCourses.map((course) => {
                const prog = courseProgress[course.id] ?? (course.id === 1 ? 40 : 0);
                return (
                  <div key={course.id} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-black text-[hsl(var(--foreground))]">{course.title}</h4>
                        <p className="text-[10px] text-muted font-semibold uppercase mt-0.5">{course.tag} &bull; {course.level}</p>
                      </div>
                      <span className="text-xs font-black text-upto-orange">{prog}% Done</span>
                    </div>

                    <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                      <div className="h-full rounded-full upto-gradient" style={{ width: `${prog}%` }} />
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-[hsl(var(--border))]">
                      <span className="font-medium">{getNextLesson(course)}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/courses/${course.id}`)}
                        className="h-8 text-[11px] font-bold text-upto-blue"
                      >
                        Launch Lecture &rarr;
                      </Button>
                    </div>
                  </div>
                );
              })}
              {enrolledCourses.length === 0 && (
                <p className="text-xs text-muted text-center py-6">No enrolled courses. Start browsing catalog!</p>
              )}
            </div>
          </SectionCard>

          {/* Weekly Learning Analytics */}
          <SectionCard title="Weekly Learning Analytics" description="XP activity and skill points update automatically.">
            <LineChart data={chartData} className="border-0 bg-transparent p-0 shadow-none" />
          </SectionCard>
        </div>

        {/* Right Sidebar: Schedule & Live Forum */}
        <div className="space-y-8">
          {/* Today's study goal and checklist */}
          <SectionCard
            title={
              <span className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-upto-orange" />
                Schedule & Checklist
              </span>
            }
            description={`Daily Goal: ${dailyGoalHours} hours study`}
          >
            <div className="space-y-4">
              <div className="rounded-lg bg-upto-blue/5 border border-upto-blue/20 p-4 text-xs leading-relaxed">
                <span className="flex items-center gap-1.5 font-bold text-upto-blue uppercase tracking-wider mb-1">
                  <Sparkles className="h-3.5 w-3.5" /> Streak Reminder
                </span>
                <p className="text-muted">You are only 1 task away from maintaining your {streak}-day learning streak today!</p>
              </div>

              <div className="space-y-2">
                {checklist.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleChecklist(item.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--surface))] text-left transition-all text-xs"
                  >
                    <CheckSquare className={`h-4.5 w-4.5 shrink-0 ${item.done ? "text-upto-green" : "text-muted/40"}`} />
                    <span className={`font-semibold ${item.done ? "line-through text-muted" : "text-[hsl(var(--foreground))]"}`}>
                      {item.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* Leaderboard snapshot */}
          <SectionCard title="Top Leaderboard">
            <div className="space-y-3">
              {leaderboard.slice(0, 5).map((l) => (
                <div key={l.rank} className="flex items-center gap-3 rounded-lg bg-[hsl(var(--surface))] p-3">
                  <span className="w-5 text-xs font-bold text-muted">#{l.rank}</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full upto-gradient text-xs font-bold text-white">
                    {l.initials}
                  </div>
                  <span className="flex-1 text-sm font-medium">{l.name}</span>
                  <span className="text-xs font-bold text-upto-orange">{l.xp.toLocaleString()} XP</span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Quick Active Discussion */}
          <div id="student-discussion" className="app-card rounded-lg p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[hsl(var(--foreground))]">Course Discussion</h2>
              <span className="rounded-full bg-upto-green/10 px-3 py-1 text-xs font-bold text-upto-green">Live</span>
            </div>
            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
              {activeThread.comments.map((comm, idx) => (
                <div key={idx} className="rounded-lg bg-[hsl(var(--surface))] p-3 text-xs leading-relaxed">
                  <p className="font-bold text-upto-blue">{comm.author}</p>
                  <p className="mt-1 text-muted">{comm.content}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Input
                placeholder="Write a reply..."
                value={discussionInput}
                onChange={(event) => setDiscussionInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") sendDiscussionReply();
                }}
              />
              <Button variant="gradient" onClick={sendDiscussionReply}>Send</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

