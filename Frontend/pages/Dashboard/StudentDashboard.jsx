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
  Heart,
  Zap,
  Calendar,
  CheckSquare,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { LineChart } from "@/components/ui/charts";
import {
  HeroPanel,
  LiveUpdateBar,
  MetricCard,
  QuickActions,
  SectionCard,
} from "@/components/ui/dashboard";
import { useAuthContext } from "@/store/AuthContext";
import {
  enrollmentApi,
  certificateApi,
  leaderboardApi,
  forumApi,
} from "@/api/endpoints";
import { useApiQuery } from "@/hooks/useApi";
import { toast } from "sonner";

export default function StudentDashboard() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Discussion section states
  const [discussionInput, setDiscussionInput] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  // Enrollments
  const {
    data: enrollmentsData,
    loading: enrollmentsLoading,
    error: enrollmentsError,
    refetch: refetchEnrollments,
  } = useApiQuery(() => enrollmentApi.getMyEnrollments(), []);

  const enrollments = useMemo(() => {
    return Array.isArray(enrollmentsData) ? enrollmentsData : enrollmentsData?.data || [];
  }, [enrollmentsData]);

  // Certificates
  const { data: certsData } = useApiQuery(() => certificateApi.getAll(), []);
  const certificates = useMemo(() => {
    return Array.isArray(certsData) ? certsData : certsData?.data || [];
  }, [certsData]);

  // Leaderboard
  const { data: lbData } = useApiQuery(() => leaderboardApi.get({ limit: 5 }), []);
  const leaderboard = useMemo(() => {
    return Array.isArray(lbData) ? lbData : lbData?.data || [];
  }, [lbData]);

  // Forum latest thread
  const {
    data: forumData,
    refetch: refetchForum,
  } = useApiQuery(() => forumApi.getAll({ limit: 1 }), []);

  const forumPosts = useMemo(() => {
    return Array.isArray(forumData) ? forumData : forumData?.data || [];
  }, [forumData]);

  const activeThread = forumPosts[0] || { comments: [] };

  const totalXp = user?.xp ?? 0;
  const streak = user?.streak ?? 1;
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

  // Checklist of tasks
  const [checklist, setChecklist] = useState([
    { id: 1, text: "Finish today's AI lecture module", done: false },
    { id: 2, text: "Score 80%+ in Quiz League challenge", done: true },
    { id: 3, text: "Participate in Course Community Discussion", done: false },
  ]);

  const toggleChecklist = (id) => {
    setChecklist((current) =>
      current.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
    toast.success("Task status updated!");
  };

  useEffect(() => {
    const refreshTimer = setInterval(() => setLastUpdated(new Date()), 30000);
    return () => clearInterval(refreshTimer);
  }, []);

  const sendDiscussionReply = async () => {
    const message = discussionInput.trim();
    if (!message) return toast.error("Write a reply before sending");
    if (!activeThread._id && !activeThread.id) {
      return toast.error("No active thread found to reply to");
    }

    setSubmittingReply(true);
    try {
      const threadId = activeThread._id || activeThread.id;
      await forumApi.addComment(threadId, { content: message });
      toast.success("Comment added to community thread!");
      setDiscussionInput("");
      refetchForum();
    } catch (err) {
      toast.error("Failed to post comment: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingReply(false);
    }
  };

  const selectedMentor = user?.mentor || null;

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
            <LiveUpdateBar label="Dashboard synchronized at" updatedAt={lastUpdated} />
          </div>
          <QuickActions
            actions={[
              {
                label: "Browse Courses",
                icon: PlayCircle,
                onClick: () => navigate("/courses"),
                variant: "gradient",
              },
              { label: "Ask Community", icon: MessageCircle, onClick: () => navigate("/forum") },
              { label: "Play Leagues", icon: Trophy, onClick: () => navigate("/leagues") },
              { label: "Saved Courses", icon: Heart, onClick: () => navigate("/wishlist") },
            ]}
          />
        </div>
      </HeroPanel>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <MetricCard icon={Zap} label="Total XP" value={totalXp.toLocaleString()} helper="Verified server activity" tone="blue" trend="+12%" />
        <MetricCard icon={Flame} label="Daily Streak" value={`${streak} Days`} helper="Keep learning daily!" tone="orange" />
        <MetricCard icon={BookOpen} label="Enrolled Courses" value={enrollments.length} helper="Across active cohorts" tone="purple" />
        <MetricCard icon={Award} label="Certificates" value={certificates.length} helper="Verified achievements" tone="green" />
      </div>

      {/* Celebrity Mentor Panel */}
      {selectedMentor && (
        <div className="mb-8 flex items-center gap-5 rounded-lg border border-upto-blue/30 bg-upto-blue/5 p-6 shadow-sm shadow-blue-500/5">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-lg text-xl font-black text-white"
            style={{ background: selectedMentor.accent || "#3B82F6" }}
          >
            {selectedMentor.initials || "AI"}
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-upto-blue">Your Active AI Mentor</p>
            <h3 className="text-xl font-bold">{selectedMentor.name}</h3>
            <p className="text-sm text-muted">{selectedMentor.subject || selectedMentor.tag}</p>
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
            description="Detailed progress and next lessons for your active technical modules."
          >
            {enrollmentsLoading && (
              <div className="flex h-36 flex-col items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-upto-blue" />
                <p className="text-xs text-muted">Loading your enrolled courses...</p>
              </div>
            )}

            {enrollmentsError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center">
                <p className="text-xs font-semibold text-red-300">Failed to load enrollments</p>
                <Button variant="outline" size="sm" className="mt-2 text-xs" onClick={refetchEnrollments}>
                  Retry
                </Button>
              </div>
            )}

            {!enrollmentsLoading && !enrollmentsError && enrollments.length === 0 && (
              <div className="p-8 text-center border border-dashed rounded-xl border-[hsl(var(--border))]">
                <p className="text-xs text-muted mb-3">You are not enrolled in any courses yet.</p>
                <Button variant="gradient" size="sm" onClick={() => navigate("/courses")}>
                  Explore Courses
                </Button>
              </div>
            )}

            {!enrollmentsLoading && !enrollmentsError && enrollments.length > 0 && (
              <div className="space-y-6">
                {enrollments.map((enr) => {
                  const course = enr.course || {};
                  const courseId = course._id || course.id || enr.courseId;
                  const prog = enr.progress ?? 0;
                  const lessons = course.lessons || [];
                  const completedCount = enr.completedLessons?.length || 0;
                  const nextLesson = lessons[completedCount] || lessons[0];

                  return (
                    <div
                      key={enr._id || courseId}
                      className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-black text-[hsl(var(--foreground))]">
                            {course.title || `Course #${courseId}`}
                          </h4>
                          <p className="text-[10px] text-muted font-semibold uppercase mt-0.5">
                            {course.tag || "Technical Track"} &bull; {course.level || "All Levels"}
                          </p>
                        </div>
                        <span className="text-xs font-black text-upto-orange">{prog}% Done</span>
                      </div>

                      <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                        <div
                          className="h-full rounded-full upto-gradient transition-all duration-500"
                          style={{ width: `${prog}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-[hsl(var(--border))]">
                        <span className="font-medium truncate max-w-[280px]">
                          {prog === 100
                            ? "Course 100% completed! Certificate issued."
                            : nextLesson
                            ? `Next up: ${nextLesson.title}`
                            : "Course in progress"}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/courses/${courseId}`)}
                          className="h-8 text-[11px] font-bold text-upto-blue"
                        >
                          Launch Course &rarr;
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          {/* Weekly Learning Analytics */}
          <SectionCard title="Weekly Learning Analytics" description="XP activity and skill points update automatically.">
            <LineChart data={chartData} className="border-0 bg-transparent p-0 shadow-none" />
          </SectionCard>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          {/* Today's study goal and checklist */}
          <SectionCard
            title={
              <span className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-upto-orange" />
                Schedule &amp; Checklist
              </span>
            }
            description={`Daily Goal: ${dailyGoalHours} hours study`}
          >
            <div className="space-y-4">
              <div className="rounded-lg bg-upto-blue/5 border border-upto-blue/20 p-4 text-xs leading-relaxed">
                <span className="flex items-center gap-1.5 font-bold text-upto-blue uppercase tracking-wider mb-1">
                  <Sparkles className="h-3.5 w-3.5" /> Streak Reminder
                </span>
                <p className="text-muted">
                  Keep active today to maintain your {streak}-day learning streak!
                </p>
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
              {leaderboard.map((l) => (
                <div key={l.rank || l.id} className="flex items-center gap-3 rounded-lg bg-[hsl(var(--surface))] p-3">
                  <span className="w-5 text-xs font-bold text-muted">#{l.rank}</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full upto-gradient text-xs font-bold text-white">
                    {l.initials || l.avatar || l.name?.slice(0, 2).toUpperCase() || "US"}
                  </div>
                  <span className="flex-1 text-sm font-medium truncate">{l.name}</span>
                  <span className="text-xs font-bold text-upto-orange">{(l.xp || 0).toLocaleString()} XP</span>
                </div>
              ))}
              {leaderboard.length === 0 && (
                <p className="text-xs text-muted text-center py-4">No active leaderboard data yet.</p>
              )}
            </div>
          </SectionCard>

          {/* Quick Active Discussion */}
          <div id="student-discussion" className="app-card rounded-lg p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[hsl(var(--foreground))]">Course Discussion</h2>
              <span className="rounded-full bg-upto-green/10 px-3 py-1 text-xs font-bold text-upto-green">Live</span>
            </div>
            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
              {(activeThread.comments || []).map((comm, idx) => (
                <div key={idx} className="rounded-lg bg-[hsl(var(--surface))] p-3 text-xs leading-relaxed">
                  <p className="font-bold text-upto-blue">{comm.author || "Student"}</p>
                  <p className="mt-1 text-muted">{comm.content}</p>
                </div>
              ))}
              {(!activeThread.comments || activeThread.comments.length === 0) && (
                <p className="text-xs text-muted py-2">No comments in this thread yet.</p>
              )}
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
              <Button variant="gradient" disabled={submittingReply} onClick={sendDiscussionReply}>
                {submittingReply ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
