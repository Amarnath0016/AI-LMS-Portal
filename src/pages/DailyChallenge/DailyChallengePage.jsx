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
} from "lucide-react";
import { Button } from "@/components/common/button";
import { HeroPanel, SectionCard, StatusBadge } from "@/components/ui/dashboard";
import { toast } from "sonner";

// Mock problem of the day
const todayProblem = {
  id: "dc-2026-07-19",
  title: "Build a Debounce Function with Immediate Execution Option",
  difficulty: "Medium",
  category: "JavaScript / Frontend Engineering",
  xpReward: 200,
  streakBonus: 50,
  timeRemaining: "11h 42m 15s",
  participants: 1420,
  description: `Implement a \`debounce\` function that delays processing expensive tasks until after a specified \`wait\` time has elapsed since the last time the function was invoked.

### Requirements:
1. Return a function that delays execution of \`func\` by \`wait\` milliseconds.
2. If \`immediate\` option is \`true\`, trigger the function on the leading edge instead of trailing.
3. Preserve the function context (\`this\`) and pass all arguments correctly.
4. Support a \`cancel()\` method on the returned function to reset timer.`,
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
    { id: 1, name: "Test 1: Delays execution until wait time passes", passed: true, output: "Passed in 12ms" },
    { id: 2, name: "Test 2: Rapid calls execute only once on trailing edge", passed: true, output: "Passed in 45ms" },
    { id: 3, name: "Test 3: Leading edge execution when immediate = true", passed: true, output: "Passed in 8ms" },
  ],
  hints: [
    "Hint 1: Use `clearTimeout` to cancel existing pending timers before setting a new one.",
    "Hint 2: Store the `timeout` variable in the outer closure so it persists across calls.",
    "Hint 3: For immediate execution, check if `timeout` is null when called, and only invoke `func` if true.",
  ],
};

// Past challenges archive data
const pastChallenges = [
  { id: "dc-2026-07-18", title: "Flatten Nested Array with Depth Control", difficulty: "Easy", category: "Algorithms", xp: 150, status: "Completed", date: "Yesterday" },
  { id: "dc-2026-07-17", title: "LRU Cache Implementation with O(1) Operations", difficulty: "Hard", category: "Data Structures", xp: 300, status: "Completed", date: "July 17" },
  { id: "dc-2026-07-16", title: "Custom Promises & Promise.allSettled Polyfill", difficulty: "Medium", category: "JavaScript", xp: 200, status: "Attempted", date: "July 16" },
  { id: "dc-2026-07-15", title: "Deep Merge Objects with Circular Ref Handling", difficulty: "Hard", category: "Frontend", xp: 250, status: "Completed", date: "July 15" },
  { id: "dc-2026-07-14", title: "Binary Search Tree Lowest Common Ancestor", difficulty: "Medium", category: "Trees", xp: 200, status: "Completed", date: "July 14" },
];

// Streak rewards
const streakMilestones = [
  { days: 3, reward: "+100 XP Bonus", achieved: true },
  { days: 7, reward: "Flame Streak Badge 🔥", achieved: true },
  { days: 14, reward: "Master Solver Title 👑", achieved: false },
  { days: 30, reward: "Legendary Cyber Shield 🛡️", achieved: false },
];

export default function DailyChallengePage() {
  const [activeTab, setActiveTab] = useState("editor"); // 'editor' | 'test'
  const [userCode, setUserCode] = useState(todayProblem.starterCode);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [streakCount, setStreakCount] = useState(12);
  const [unlockedHints, setUnlockedHints] = useState([]);
  const [showAiModal, setShowAiModal] = useState(false);
  const [searchArchive, setSearchArchive] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");

  const handleRunCode = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setTestResults(todayProblem.testCases);
      setActiveTab("test");
      toast.info("Tests executed successfully! All test cases passed.");
    }, 900);
  };

  const handleSubmit = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setTestResults(todayProblem.testCases);
      setIsSubmitted(true);
      setStreakCount((prev) => prev + 1);
      toast.success("🎉 Challenge Submitted! You earned +250 XP and extended your streak to 13 days!");
    }, 1200);
  };

  const unlockHint = (index) => {
    if (unlockedHints.includes(index)) return;
    setUnlockedHints([...unlockedHints, index]);
    toast.success(`Hint ${index + 1} unlocked! (-10 XP deducted)`);
  };

  const filteredArchive = pastChallenges.filter((ch) => {
    const matchesSearch = ch.title.toLowerCase().includes(searchArchive.toLowerCase()) || ch.category.toLowerCase().includes(searchArchive.toLowerCase());
    const matchesDiff = difficultyFilter === "All" || ch.difficulty === difficultyFilter;
    return matchesSearch && matchesDiff;
  });

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <HeroPanel className="relative overflow-hidden border-upto-orange/20 bg-gradient-to-r from-orange-500/10 via-upto-blue/5 to-purple-500/10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-upto-orange/15 px-3 py-1 text-xs font-black uppercase tracking-wider text-upto-orange">
                <Flame className="h-4 w-4 fill-upto-orange animate-bounce" /> {streakCount}-Day Streak Active
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-upto-blue/15 px-3 py-1 text-xs font-bold text-upto-blue">
                <Zap className="h-3.5 w-3.5" /> +{todayProblem.xpReward} XP Base + {todayProblem.streakBonus} XP Streak Bonus
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-[hsl(var(--foreground))] sm:text-4xl">
              Daily Skill Challenge
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted leading-relaxed">
              Sharpen your problem-solving skills every day. Solve today's task to maintain your streak, earn bonus XP, and climb the global leaderboard!
            </p>
          </div>

          {/* Dynamic Stats Box */}
          <div className="flex flex-wrap gap-4 shrink-0">
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/90 p-4 shadow-sm backdrop-blur-md">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted">
                <Clock className="h-4 w-4 text-upto-orange" /> Time Left
              </p>
              <p className="mt-1 text-xl font-black text-[hsl(var(--foreground))] tracking-wider">
                {todayProblem.timeRemaining}
              </p>
            </div>
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/90 p-4 shadow-sm backdrop-blur-md">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted">
                <Trophy className="h-4 w-4 text-upto-blue" /> Today Solved
              </p>
              <p className="mt-1 text-xl font-black text-upto-blue">
                {todayProblem.participants.toLocaleString()} Solvers
              </p>
            </div>
          </div>
        </div>

        {/* Streak Roadmap Bar */}
        <div className="mt-6 border-t border-[hsl(var(--border))] pt-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3 flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-500" /> Streak Milestone Rewards
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {streakMilestones.map((m) => (
              <div
                key={m.days}
                className={`flex items-center gap-3 rounded-xl border p-3 text-xs font-bold transition-all ${
                  m.achieved
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-muted"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    m.achieved ? "bg-emerald-500 text-white" : "bg-gray-300 dark:bg-gray-700 text-gray-500"
                  }`}
                >
                  {m.achieved ? <Check className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />}
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black tracking-wide text-muted">{m.days} Days</p>
                  <p className="text-xs font-extrabold leading-snug">{m.reward}</p>
                </div>
              </div>
            ))}
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
                  <span className="rounded bg-amber-500/15 px-2 py-0.5 text-[10px] font-black uppercase text-amber-500">
                    {todayProblem.difficulty}
                  </span>
                  <span className="text-xs font-bold text-muted">{todayProblem.category}</span>
                </div>
                <h2 className="text-lg font-black text-[hsl(var(--foreground))]">{todayProblem.title}</h2>
              </div>
            }
          >
            <div className="prose prose-sm dark:prose-invert max-w-none text-xs text-[hsl(var(--foreground))] space-y-4 leading-relaxed">
              {todayProblem.description.split("\n\n").map((paragraph, idx) => (
                <div key={idx}>
                  {paragraph.startsWith("###") ? (
                    <h4 className="mt-3 mb-2 text-sm font-bold text-upto-blue">{paragraph.replace("### ", "")}</h4>
                  ) : (
                    <p className="whitespace-pre-line leading-relaxed">{paragraph}</p>
                  )}
                </div>
              ))}
            </div>

            {/* AI Mentor Assistant Trigger */}
            <div className="mt-6 rounded-xl border border-upto-blue/30 bg-upto-blue/5 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-upto-blue text-white shadow-md shadow-blue-500/20">
                    <BrainCircuit className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-[hsl(var(--foreground))]">Stuck? Ask AI Mentor</h4>
                    <p className="text-[11px] text-muted">Get hints or concept breakdowns without spoiling full solution.</p>
                  </div>
                </div>
                <Button size="sm" variant="gradient" onClick={() => setShowAiModal(true)}>
                  Ask AI
                </Button>
              </div>
            </div>

            {/* Hints Accordion */}
            <div className="mt-6 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-upto-orange" /> Hints & Guidance
              </h4>
              {todayProblem.hints.map((hint, idx) => {
                const isUnlocked = unlockedHints.includes(idx);
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-3.5 transition-all"
                  >
                    {isUnlocked ? (
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                        {hint}
                      </p>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted">Hint #{idx + 1} (Locked)</span>
                        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => unlockHint(idx)}>
                          Unlock Hint (-10 XP)
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>

        {/* Right Column: Code Editor & Test Runner Workspace */}
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
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping inline-block ml-0.5" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs gap-1 text-muted hover:text-[hsl(var(--foreground))]"
                  onClick={() => setUserCode(todayProblem.starterCode)}
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1.5"
                  onClick={handleRunCode}
                  disabled={isRunning}
                >
                  <Play className="h-3.5 w-3.5 text-emerald-500 fill-emerald-500" /> Run Tests
                </Button>
                <Button
                  size="sm"
                  variant="gradient"
                  className="h-8 text-xs gap-1.5"
                  onClick={handleSubmit}
                  disabled={isRunning || isSubmitted}
                >
                  <Send className="h-3.5 w-3.5" /> {isSubmitted ? "Submitted ✓" : "Submit Solution"}
                </Button>
              </div>
            </div>

            {/* Code Input Area */}
            {activeTab === "editor" ? (
              <div className="relative font-mono text-xs">
                <textarea
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  className="w-full min-h-[420px] resize-y bg-slate-950 p-4 text-emerald-400 font-mono text-xs leading-relaxed outline-none focus:ring-1 focus:ring-upto-blue rounded-b-2xl border-none"
                  placeholder="// Write your solution here..."
                  spellCheck="false"
                />
              </div>
            ) : (
              /* Test Results Tab */
              <div className="p-6 min-h-[420px] bg-slate-950/90 text-slate-200 rounded-b-2xl space-y-6 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <span className="text-sm font-bold text-white flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-upto-blue" /> Execution Test Suite
                  </span>
                  <StatusBadge tone={testResults ? "green" : "blue"}>
                    {testResults ? "3 / 3 Test Cases Passed" : "Ready to Execute"}
                  </StatusBadge>
                </div>

                {testResults ? (
                  <div className="space-y-4">
                    {testResults.map((tc) => (
                      <div
                        key={tc.id}
                        className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-100 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> {tc.name}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                            {tc.output}
                          </span>
                        </div>
                      </div>
                    ))}

                    {isSubmitted && (
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center space-y-2">
                        <Sparkles className="h-8 w-8 text-emerald-400 mx-auto animate-bounce" />
                        <h4 className="text-base font-extrabold text-emerald-400">Congratulations! Challenge Passed!</h4>
                        <p className="text-xs text-slate-300">
                          You earned <strong className="text-amber-400">+250 XP</strong> and extended your streak to <strong>13 days</strong>!
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16 text-slate-500 space-y-3">
                    <Play className="h-10 w-10 mx-auto text-slate-700" />
                    <p>Click "Run Tests" or "Submit Solution" to evaluate your code execution.</p>
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
          {filteredArchive.map((challenge) => (
            <div
              key={challenge.id}
              className="app-card rounded-2xl p-5 border border-[hsl(var(--border))] hover:border-upto-blue/40 transition-all space-y-4 group"
            >
              <div className="flex items-center justify-between">
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
                <span className="text-[10px] font-bold text-muted">{challenge.date}</span>
              </div>

              <div>
                <h4 className="text-sm font-extrabold text-[hsl(var(--foreground))] group-hover:text-upto-blue transition-colors leading-snug">
                  {challenge.title}
                </h4>
                <p className="mt-1 text-xs text-muted">{challenge.category}</p>
              </div>

              <div className="flex items-center justify-between border-t border-[hsl(var(--border))] pt-3 text-xs font-bold">
                <span className="flex items-center gap-1 text-upto-orange">
                  <Zap className="h-3.5 w-3.5" /> +{challenge.xp} XP
                </span>
                <span
                  className={`flex items-center gap-1 text-[11px] ${
                    challenge.status === "Completed" ? "text-emerald-500" : "text-amber-500"
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> {challenge.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* AI Mentor Guidance Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-upto-blue text-white">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[hsl(var(--foreground))]">AI Learning Assistant</h3>
                  <p className="text-[10px] text-muted">Concept Clarification for Today's Challenge</p>
                </div>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-muted hover:text-[hsl(var(--foreground))] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-[hsl(var(--foreground))] leading-relaxed bg-[hsl(var(--surface))] p-4 rounded-xl border border-[hsl(var(--border))]">
              <p className="font-bold text-upto-blue">💡 Core Concept Breakdown:</p>
              <p>
                <strong>Debouncing</strong> ensures a function is not called too frequently. Imagine an elevator door: every time someone pushes the button, the door timer resets for 5 seconds before closing.
              </p>
              <p>
                When <code>immediate = true</code>, the function triggers on the leading edge (the first push), and subsequent pushes within the wait period are ignored until silence resumes!
              </p>
            </div>

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
