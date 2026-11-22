import { useState, useEffect } from "react";
import {
  Flame,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  Send,
  HelpCircle,
  Award,
  Sparkles,
  Search,
  Check,
  ChevronRight,
  Code2,
  Terminal,
  RotateCcw,
  MessageSquare,
  Lock,
  Trophy,
  BrainCircuit,
  Filter,
  Loader2,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/common/button";
import { HeroPanel, SectionCard, StatusBadge } from "@/components/ui/dashboard";
import { toast } from "sonner";
import { useAuthContext } from "@/store/AuthContext";
import { challengeApi, aiApi } from "@/api/endpoints";

// Fallback problem while loading
const defaultProblem = {
  id: "dc-2026-07-19",
  title: "Build a Debounce Function with Immediate Execution Option",
  difficulty: "Medium",
  category: "JavaScript / Frontend Engineering",
  xpReward: 200,
  streakBonus: 50,
  participants: 1420,
  description: `Implement a \`debounce\` function that delays processing expensive tasks until after a specified \`wait\` time has elapsed since the last time the function was invoked.

### Requirements:
1. Return a function that delays execution of \`func\` by \`wait\` milliseconds.
2. If \`immediate\` option is \`true\`, trigger the function on the leading edge instead of trailing.
3. Preserve the function context (\`this\`) and pass all arguments correctly.
4. Support rapid calls without executing multiple times.`,
  starterCode: `/**
 * @param {Function} func
 * @param {number} wait
 * @param {boolean} [immediate=false]
 * @returns {Function}
 */
function debounce(func, wait, immediate = false) {
  let timeout = null;

  return function (...args) {
    const context = this;
    const callNow = immediate && !timeout;

    clearTimeout(timeout);

    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    }, wait);

    if (callNow) {
      func.apply(context, args);
    }
  };
}`,
  testCases: [
    { name: "Test 1: Returns a debounced function wrapper", passed: true, output: "Sample test" },
    { name: "Test 2: Delays execution until wait time passes", passed: true, output: "Sample test" },
    { name: "Test 3: Leading edge execution when immediate = true", passed: true, output: "Sample test" },
  ],
  hints: [
    { index: 0, hint: null, cost: 10, unlocked: false },
    { index: 1, hint: null, cost: 10, unlocked: false },
    { index: 2, hint: null, cost: 10, unlocked: false },
  ],
};

const streakMilestones = [
  { days: 3, reward: "+100 XP Bonus" },
  { days: 7, reward: "Flame Streak Badge 🔥" },
  { days: 14, reward: "Master Solver Title 👑" },
  { days: 30, reward: "Legendary Cyber Shield 🛡️" },
];

export default function DailyChallengePage() {
  const { user } = useAuthContext();

  const [challenge, setChallenge] = useState(defaultProblem);
  const [activeTab, setActiveTab] = useState("editor"); // 'editor' | 'test'
  const [userCode, setUserCode] = useState(defaultProblem.starterCode);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState(null);
  const [streakCount, setStreakCount] = useState(user?.streak || 1);
  const [currentXp, setCurrentXp] = useState(user?.xp || 0);
  const [hints, setHints] = useState(defaultProblem.hints);
  const [pastChallenges, setPastChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // AI Mentor Guidance Modal
  const [showAiModal, setShowAiModal] = useState(false);
  const [isEvaluatingAi, setIsEvaluatingAi] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);

  // Search & Filter
  const [searchArchive, setSearchArchive] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");

  // Fetch real challenge and archive data on mount
  useEffect(() => {
    let isMounted = true;

    async function loadChallengeData() {
      try {
        setIsLoading(true);
        const [todayRes, archiveRes] = await Promise.all([
          challengeApi.getToday().catch(() => null),
          challengeApi.getAll().catch(() => null),
        ]);

        if (todayRes?.data?.data && isMounted) {
          const ch = todayRes.data.data;
          setChallenge(ch);
          setUserCode(ch.starterCode || defaultProblem.starterCode);
          setHints(ch.hints || []);
          if (ch.userStreak !== undefined) setStreakCount(ch.userStreak);
          if (ch.userXp !== undefined) setCurrentXp(ch.userXp);
          if (ch.completedToday) setIsSubmitted(true);
        }

        if (archiveRes?.data?.data && isMounted) {
          setPastChallenges(archiveRes.data.data);
        }
      } catch (err) {
        console.error("Failed to load daily challenge data:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadChallengeData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Update streak if user changes
  useEffect(() => {
    if (user?.streak) {
      setStreakCount(user.streak);
    }
    if (user?.xp !== undefined) {
      setCurrentXp(user.xp);
    }
  }, [user]);

  // 1. Run Tests against Visible Sample Cases via Real Sandbox
  const handleRunCode = async () => {
    if (!userCode.trim()) {
      toast.error("Please enter code before running tests.");
      return;
    }

    setIsRunning(true);
    try {
      const res = await challengeApi.runCode(challenge.id, { code: userCode });
      const data = res?.data;

      if (data?.success) {
        setTestResults(data.results || []);
        setActiveTab("test");

        if (data.passed) {
          toast.success("All visible sample test cases passed!");
        } else {
          toast.error("Some visible test cases failed. Check test output.");
        }
      } else {
        toast.error(data?.message || "Execution encountered an error.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Sandbox runner execution failed.");
    } finally {
      setIsRunning(false);
    }
  };

  // 2. Submit Solution for Real Evaluation (Visible + Hidden Test Cases)
  const handleSubmit = async () => {
    if (!userCode.trim()) {
      toast.error("Please enter code before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await challengeApi.submitCode(challenge.id, {
        code: userCode,
        language: "javascript",
      });
      const data = res?.data;

      if (data?.success) {
        setTestResults(data.results || []);
        setActiveTab("test");
        setSubmissionFeedback(data);

        if (data.passed) {
          setIsSubmitted(true);
          if (data.streak !== undefined) setStreakCount(data.streak);
          if (data.userXp !== undefined) setCurrentXp(data.userXp);

          if (data.alreadyCompletedToday) {
            toast.info("🎉 Challenge verified! Already completed today.");
          } else {
            toast.success(
              `🎉 Challenge Passed! Earned +${data.xpEarned} XP! Streak is now ${data.streak} days!`
            );
          }
        } else {
          toast.error(data.message || "Failed one or more test cases. Please refine your solution.");
        }
      } else {
        toast.error(data?.message || "Submission evaluation failed.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to evaluate submission in sandbox.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Unlock Hint Server-Side with XP Deduction
  const unlockHint = async (index) => {
    try {
      const res = await challengeApi.unlockHint(challenge.id, index);
      const data = res?.data;

      if (data?.success) {
        setHints((prev) =>
          prev.map((h, i) =>
            i === index ? { ...h, hint: data.hint, unlocked: true } : h
          )
        );
        if (data.currentXp !== undefined) setCurrentXp(data.currentXp);

        if (data.alreadyUnlocked) {
          toast.info("Hint is already unlocked!");
        } else {
          toast.success(`Hint #${index + 1} unlocked! (-${data.cost} XP deducted)`);
        }
      } else {
        toast.error(data?.message || "Failed to unlock hint.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to unlock hint.");
    }
  };

  // 4. Request Advisory Code Evaluation from AI Mentor
  const handleAskAiMentor = async () => {
    setShowAiModal(true);
    if (!aiFeedback && userCode.trim()) {
      setIsEvaluatingAi(true);
      try {
        const res = await aiApi.evaluateCode({
          code: userCode,
          language: "javascript",
          problemTitle: challenge.title,
        });
        if (res?.data?.data) {
          setAiFeedback(res.data.data);
        }
      } catch (err) {
        console.warn("AI review request failed:", err);
      } finally {
        setIsEvaluatingAi(false);
      }
    }
  };

  // 5. Select Challenge from Past Archive
  const handleSelectChallenge = async (chId) => {
    try {
      setIsLoading(true);
      const res = await challengeApi.getById(chId);
      if (res?.data?.data) {
        const ch = res.data.data;
        setChallenge(ch);
        setUserCode(ch.starterCode || "");
        setHints(ch.hints || []);
        setTestResults(null);
        setIsSubmitted(ch.completedToday || false);
        setActiveTab("editor");
        window.scrollTo({ top: 0, behavior: "smooth" });
        toast.info(`Loaded challenge: "${ch.title}"`);
      }
    } catch (err) {
      toast.error("Failed to load selected challenge.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredArchive = pastChallenges.filter((ch) => {
    const matchesSearch =
      ch.title.toLowerCase().includes(searchArchive.toLowerCase()) ||
      ch.category?.toLowerCase().includes(searchArchive.toLowerCase());
    const matchesDiff = difficultyFilter === "All" || ch.difficulty === difficultyFilter;
    return matchesSearch && matchesDiff;
  });

  const passedTestsCount = testResults ? testResults.filter((r) => r.passed).length : 0;
  const totalTestsCount = testResults ? testResults.length : 0;

  return (
    <div className="space-y-8">
      {/* Hero Header with Real Streak and Real DB XP */}
      <HeroPanel className="relative overflow-hidden border-upto-orange/20 bg-gradient-to-r from-orange-500/10 via-upto-blue/5 to-purple-500/10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-upto-orange/15 px-3 py-1 text-xs font-black uppercase tracking-wider text-upto-orange">
                <Flame className="h-4 w-4 fill-upto-orange animate-bounce" /> {streakCount}-Day Streak Active
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-upto-blue/15 px-3 py-1 text-xs font-bold text-upto-blue">
                <Zap className="h-3.5 w-3.5" /> +{challenge.xpReward} XP Base + {challenge.streakBonus} XP Streak Bonus
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-[hsl(var(--foreground))] sm:text-4xl">
              Daily Skill Challenge
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted leading-relaxed">
              Sharpen your problem-solving skills with verified sandboxed evaluation. Solve today's task to maintain your streak and climb the global leaderboard!
            </p>
          </div>

          {/* Dynamic Stats Box */}
          <div className="flex flex-wrap gap-4 shrink-0">
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/90 p-4 shadow-sm backdrop-blur-md">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted">
                <Zap className="h-4 w-4 text-amber-500" /> Current Balance
              </p>
              <p className="mt-1 text-xl font-black text-[hsl(var(--foreground))] tracking-wider">
                {currentXp.toLocaleString()} XP
              </p>
            </div>
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/90 p-4 shadow-sm backdrop-blur-md">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted">
                <Trophy className="h-4 w-4 text-upto-blue" /> Participants
              </p>
              <p className="mt-1 text-xl font-black text-upto-blue">
                {(challenge.participants || 0).toLocaleString()} Solvers
              </p>
            </div>
          </div>
        </div>

        {/* Real Streak Roadmap Bar */}
        <div className="mt-6 border-t border-[hsl(var(--border))] pt-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3 flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-500" /> Streak Milestone Rewards
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {streakMilestones.map((m) => {
              const isAchieved = streakCount >= m.days;
              return (
                <div
                  key={m.days}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-xs font-bold transition-all ${
                    isAchieved
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-muted"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      isAchieved
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-300 dark:bg-gray-700 text-gray-500"
                    }`}
                  >
                    {isAchieved ? <Check className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-wide text-muted">{m.days} Days</p>
                    <p className="text-xs font-extrabold leading-snug">{m.reward}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </HeroPanel>

      {/* Main Content Layout */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Problem Statement & Hints */}
        <div className="lg:col-span-5 space-y-6">
          <SectionCard
            title={
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-black uppercase ${
                      challenge.difficulty === "Easy"
                        ? "bg-emerald-500/15 text-emerald-500"
                        : challenge.difficulty === "Medium"
                        ? "bg-amber-500/15 text-amber-500"
                        : "bg-rose-500/15 text-rose-500"
                    }`}
                  >
                    {challenge.difficulty}
                  </span>
                  <span className="text-xs font-bold text-muted">{challenge.category}</span>
                </div>
                <h2 className="text-lg font-black text-[hsl(var(--foreground))]">{challenge.title}</h2>
              </div>
            }
          >
            <div className="prose prose-sm dark:prose-invert max-w-none text-xs text-[hsl(var(--foreground))] space-y-4 leading-relaxed">
              {(challenge.description || "").split("\n\n").map((paragraph, idx) => (
                <div key={idx}>
                  {paragraph.startsWith("###") ? (
                    <h4 className="mt-3 mb-2 text-sm font-bold text-upto-blue">
                      {paragraph.replace("### ", "")}
                    </h4>
                  ) : (
                    <p className="whitespace-pre-line leading-relaxed">{paragraph}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Advisory AI Mentor Assistant Trigger */}
            <div className="mt-6 rounded-xl border border-upto-blue/30 bg-upto-blue/5 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-upto-blue text-white shadow-md shadow-blue-500/20">
                    <BrainCircuit className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-[hsl(var(--foreground))]">
                      Advisory AI Mentor Review
                    </h4>
                    <p className="text-[11px] text-muted">
                      Get complexity analysis and optimizations. (Advisory only)
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="gradient" onClick={handleAskAiMentor}>
                  Ask AI
                </Button>
              </div>
            </div>

            {/* Server-Side Hints Accordion */}
            <div className="mt-6 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-upto-orange" /> Hints & Guidance
              </h4>
              {hints.map((hint, idx) => {
                const isUnlocked = hint.unlocked || Boolean(hint.hint);
                return (
                  <div
                    key={hint.id || idx}
                    className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-3.5 transition-all"
                  >
                    {isUnlocked ? (
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                        {hint.hint}
                      </p>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted">
                          Hint #{idx + 1} (Locked)
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[11px]"
                          onClick={() => unlockHint(idx)}
                        >
                          Unlock Hint (-{hint.cost || 10} XP)
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>

        {/* Right Column: Code Editor & Real Sandbox Test Runner */}
        <div className="lg:col-span-7 space-y-6">
          <div className="app-card rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg">
            {/* Editor Header Navigation */}
            <div className="flex flex-wrap items-center justify-between border-b border-[hsl(var(--border))] px-4 py-3 bg-[hsl(var(--surface))] rounded-t-2xl gap-2">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5 mr-2">
                  <span className="h-3 w-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-yellow-500/80 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-green-500/80 inline-block" />
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("editor")}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    activeTab === "editor"
                      ? "bg-upto-blue text-white shadow-sm"
                      : "text-muted hover:text-[hsl(var(--foreground))]"
                  }`}
                >
                  <Code2 className="h-3.5 w-3.5" /> Code Editor
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("test")}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    activeTab === "test"
                      ? "bg-upto-blue text-white shadow-sm"
                      : "text-muted hover:text-[hsl(var(--foreground))]"
                  }`}
                >
                  <Terminal className="h-3.5 w-3.5" /> Test Results
                  {testResults && (
                    <span
                      className={`h-2 w-2 rounded-full inline-block ml-0.5 ${
                        passedTestsCount === totalTestsCount ? "bg-emerald-400" : "bg-rose-400"
                      }`}
                    />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs gap-1 text-muted hover:text-[hsl(var(--foreground))]"
                  onClick={() => setUserCode(challenge.starterCode || defaultProblem.starterCode)}
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1.5"
                  onClick={handleRunCode}
                  disabled={isRunning || isSubmitting}
                >
                  {isRunning ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5 text-emerald-500 fill-emerald-500" />
                  )}
                  {isRunning ? "Running Sandbox..." : "Run Tests"}
                </Button>
                <Button
                  size="sm"
                  variant="gradient"
                  className="h-8 text-xs gap-1.5"
                  onClick={handleSubmit}
                  disabled={isRunning || isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  {isSubmitting ? "Evaluating..." : isSubmitted ? "Submit Again" : "Submit Solution"}
                </Button>
              </div>
            </div>

            {/* Code Input Area */}
            {activeTab === "editor" ? (
              <div className="relative font-mono text-xs">
                <textarea
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  className="w-full min-h-[440px] resize-y bg-slate-950 p-4 text-emerald-400 font-mono text-xs leading-relaxed outline-none focus:ring-1 focus:ring-upto-blue rounded-b-2xl border-none"
                  placeholder="// Write your JavaScript solution here..."
                  spellCheck="false"
                />
              </div>
            ) : (
              /* Real Sandbox Test Results Tab */
              <div className="p-6 min-h-[440px] bg-slate-950/90 text-slate-200 rounded-b-2xl space-y-6 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <span className="text-sm font-bold text-white flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-upto-blue" /> Execution Test Suite (Sandbox Runner)
                  </span>
                  <StatusBadge tone={testResults ? (passedTestsCount === totalTestsCount ? "green" : "red") : "blue"}>
                    {testResults
                      ? `${passedTestsCount} / ${totalTestsCount} Test Cases Passed`
                      : "Ready to Execute"}
                  </StatusBadge>
                </div>

                {testResults ? (
                  <div className="space-y-4">
                    {testResults.map((tc, idx) => (
                      <div
                        key={idx}
                        className={`rounded-xl border p-4 space-y-2 ${
                          tc.passed
                            ? "border-emerald-500/30 bg-emerald-950/20"
                            : "border-rose-500/30 bg-rose-950/20"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-100 flex items-center gap-2">
                            {tc.passed ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <XCircle className="h-4 w-4 text-rose-400" />
                            )}
                            {tc.name}
                            {tc.hidden && (
                              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono">
                                Hidden Test
                              </span>
                            )}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                              tc.passed
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-rose-500/10 text-rose-400"
                            }`}
                          >
                            {tc.passed
                              ? `Passed in ${tc.executionTimeMs ?? 0}ms`
                              : `Failed in ${tc.executionTimeMs ?? 0}ms`}
                          </span>
                        </div>

                        {/* Error or Value Mismatch details */}
                        {!tc.passed && tc.error && (
                          <div className="mt-2 text-rose-300 bg-rose-900/30 p-2.5 rounded font-mono text-[11px] leading-relaxed">
                            <strong>Error:</strong> {tc.error}
                          </div>
                        )}

                        {!tc.passed && !tc.error && !tc.hidden && (
                          <div className="mt-2 text-slate-300 bg-slate-900/80 p-2.5 rounded font-mono text-[11px] space-y-1">
                            <div>
                              <span className="text-muted">Expected:</span>{" "}
                              <code className="text-emerald-400">{JSON.stringify(tc.expected)}</code>
                            </div>
                            <div>
                              <span className="text-muted">Actual:</span>{" "}
                              <code className="text-rose-400">{JSON.stringify(tc.actual)}</code>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Completion Notification Card */}
                    {isSubmitted && submissionFeedback?.passed && (
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center space-y-2">
                        <Sparkles className="h-8 w-8 text-emerald-400 mx-auto animate-bounce" />
                        <h4 className="text-base font-extrabold text-emerald-400">
                          Congratulations! Challenge Solved!
                        </h4>
                        <p className="text-xs text-slate-300">
                          {submissionFeedback.alreadyCompletedToday ? (
                            <span>You have already completed today's challenge. Your streak remains active!</span>
                          ) : (
                            <span>
                              You earned{" "}
                              <strong className="text-amber-400">+{submissionFeedback.xpEarned} XP</strong> and
                              maintained your streak at{" "}
                              <strong className="text-emerald-400">{streakCount} days</strong>!
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16 text-slate-500 space-y-3">
                    <Play className="h-10 w-10 mx-auto text-slate-700" />
                    <p>Click "Run Tests" or "Submit Solution" to execute your code in the isolated runner.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Archive Section: Past Daily Challenges */}
      <SectionCard
        title={
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-upto-orange" />
            <span>Past Daily Challenges Archive</span>
          </div>
        }
        description="Review and replay previous daily challenges to sharpen your skills."
      >
        {/* Search & Filter Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
            <input
              type="text"
              value={searchArchive}
              onChange={(e) => setSearchArchive(e.target.value)}
              placeholder="Search past challenges..."
              className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] pl-9 pr-4 py-2 text-xs font-semibold outline-none focus:border-upto-blue"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted" />
            <span className="text-xs font-bold text-muted">Difficulty:</span>
            {["All", "Easy", "Medium", "Hard"].map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setDifficultyFilter(diff)}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  difficultyFilter === diff
                    ? "bg-upto-blue text-white"
                    : "bg-[hsl(var(--surface))] text-muted hover:text-[hsl(var(--foreground))]"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of Past Challenges */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredArchive.map((ch) => (
            <div
              key={ch.id}
              onClick={() => handleSelectChallenge(ch.id)}
              className="app-card rounded-2xl p-5 border border-[hsl(var(--border))] hover:border-upto-blue/40 transition-all space-y-4 group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-black uppercase ${
                    ch.difficulty === "Easy"
                      ? "bg-emerald-500/15 text-emerald-500"
                      : ch.difficulty === "Medium"
                      ? "bg-amber-500/15 text-amber-500"
                      : "bg-rose-500/15 text-rose-500"
                  }`}
                >
                  {ch.difficulty}
                </span>
                <span className="text-[10px] font-bold text-muted">{ch.date}</span>
              </div>

              <div>
                <h4 className="text-sm font-extrabold text-[hsl(var(--foreground))] group-hover:text-upto-blue transition-colors leading-snug">
                  {ch.title}
                </h4>
                <p className="mt-1 text-xs text-muted">{ch.category}</p>
              </div>

              <div className="flex items-center justify-between border-t border-[hsl(var(--border))] pt-3 text-xs font-bold">
                <span className="flex items-center gap-1 text-upto-orange">
                  <Zap className="h-3.5 w-3.5" /> +{ch.xp} XP
                </span>
                <span
                  className={`flex items-center gap-1 text-[11px] ${
                    ch.status === "Completed" ? "text-emerald-500" : "text-amber-500"
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> {ch.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Advisory AI Mentor Guidance Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-upto-blue text-white">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[hsl(var(--foreground))]">
                    AI Mentor Advisory Code Review
                  </h3>
                  <p className="text-[10px] text-muted">
                    Pedagogical guidance only (does not decide pass/fail)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-muted hover:text-[hsl(var(--foreground))] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Advisory Notice */}
            <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>
                AI Feedback is advisory only. Challenge pass/fail is determined solely by sandbox test execution.
              </span>
            </div>

            {isEvaluatingAi ? (
              <div className="py-8 text-center space-y-2 text-xs text-muted">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-upto-blue" />
                <p>AI Mentor is reviewing your code complexity and optimizations...</p>
              </div>
            ) : aiFeedback ? (
              <div className="space-y-3 text-xs text-[hsl(var(--foreground))] leading-relaxed bg-[hsl(var(--surface))] p-4 rounded-xl border border-[hsl(var(--border))]">
                <div className="flex justify-between items-center border-b border-[hsl(var(--border))] pb-2">
                  <span className="font-bold text-upto-blue">Advisory Code Quality:</span>
                  <span className="font-mono text-emerald-500 font-bold">
                    {aiFeedback.score ? `${aiFeedback.score} / 100` : "Reviewed"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-muted font-bold">Time Complexity:</span>{" "}
                    <span className="font-mono text-amber-500">{aiFeedback.timeComplexity || "O(N)"}</span>
                  </div>
                  <div>
                    <span className="text-muted font-bold">Space Complexity:</span>{" "}
                    <span className="font-mono text-amber-500">{aiFeedback.spaceComplexity || "O(1)"}</span>
                  </div>
                </div>

                {aiFeedback.feedback && (
                  <p className="mt-2 text-slate-300 leading-relaxed">{aiFeedback.feedback}</p>
                )}

                {aiFeedback.optimizations && aiFeedback.optimizations.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-[hsl(var(--border))] space-y-1">
                    <p className="font-bold text-upto-blue text-[11px]">Recommended Optimizations:</p>
                    <ul className="list-disc pl-4 space-y-0.5 text-muted text-[11px]">
                      {aiFeedback.optimizations.map((opt, i) => (
                        <li key={i}>{opt}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 text-xs text-[hsl(var(--foreground))] leading-relaxed bg-[hsl(var(--surface))] p-4 rounded-xl border border-[hsl(var(--border))]">
                <p className="font-bold text-upto-blue">💡 Core Concept Breakdown:</p>
                <p>
                  <strong>Debouncing</strong> ensures a function is not called too frequently. Every time an event triggers within the wait window, the timer resets before execution.
                </p>
                <p>
                  When <code>immediate = true</code>, the function triggers on the leading edge (the first call), and subsequent calls within the wait period are ignored until silence resumes!
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowAiModal(false)}>
                Got it, Thanks!
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
