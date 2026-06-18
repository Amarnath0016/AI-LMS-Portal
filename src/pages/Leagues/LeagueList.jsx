import { useMemo, useState } from "react";
import { CheckCircle2, Filter, Search, Trophy, Zap, Lock, Unlock, ArrowRight, X, Sparkles, Star, Award } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { EmptyState, FilterTabs, HeroPanel, MetricCard, StatusBadge } from "@/components/ui/dashboard";
import { quizLeagues } from "@/store/mockData";
import { quizzesByLeague } from "@/store/quizData";
import { useAuthContext } from "@/store/AuthContext";
import { PieChart } from "@/components/ui/charts";

const levels = ["All", "Beginner", "Intermediate", "Advanced"];
const categories = ["All", ...Array.from(new Set(quizLeagues.map((league) => league.category)))];

export default function LeagueList() {
  const { quizAttempts, completeQuizPart, user } = useAuthContext();
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("All");
  const [category, setCategory] = useState("All");

  // Quiz Modal States
  const [activeLeague, setActiveLeague] = useState(null);
  const [activePartId, setActivePartId] = useState(null);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [showResult, setShowResult] = useState(false);

  // Filters leagues
  const filtered = quizLeagues
    .filter((league) => {
      const q = search.toLowerCase();
      return league.title.toLowerCase().includes(q) || league.category.toLowerCase().includes(q);
    })
    .filter((league) => level === "All" || league.level === level)
    .filter((league) => category === "All" || league.category === category);

  // Checks if a league is completed (all 3 parts done)
  const isLeagueComplete = (leagueId) => {
    return [1, 2, 3].every((partId) => quizAttempts[`${leagueId}-${partId}`] !== undefined);
  };

  // Calculates total XP gained in leagues
  const earnedXp = useMemo(() => {
    return Object.values(quizAttempts).reduce((sum, attempt) => sum + (attempt.xpAward || 0), 0);
  }, [quizAttempts]);

  // Calculates total number of completed leagues
  const completedLeaguesCount = useMemo(() => {
    return quizLeagues.filter((l) => isLeagueComplete(l.id)).length;
  }, [quizAttempts]);

  // Quiz flow methods
  const openQuiz = (league) => {
    setActiveLeague(league);
    setActivePartId(null);
    setShowResult(false);
  };

  const closeQuiz = () => {
    setActiveLeague(null);
    setActivePartId(null);
    setShowResult(false);
  };

  const startPart = (partId) => {
    setActivePartId(partId);
    setCurrentQIdx(0);
    setSelectedOpt(null);
    setIsAnswerChecked(false);
    setCorrectCount(0);
    setShowResult(false);
  };

  const handleSelectOption = (optIdx) => {
    if (isAnswerChecked) return;
    setSelectedOpt(optIdx);
  };

  const handleCheckAnswer = (partQuestions) => {
    if (selectedOpt === null) return;
    const currentQ = partQuestions[currentQIdx];
    if (selectedOpt === currentQ.correctIndex) {
      setCorrectCount((prev) => prev + 1);
    }
    setIsAnswerChecked(true);
  };

  const handleNextQuestion = (partQuestions, partXpAward) => {
    if (currentQIdx + 1 < partQuestions.length) {
      setCurrentQIdx((prev) => prev + 1);
      setSelectedOpt(null);
      setIsAnswerChecked(false);
    } else {
      // Finished all questions in part
      completeQuizPart(activeLeague.id, activePartId, correctCount, partQuestions.length, partXpAward);
      setShowResult(true);
    }
  };

  return (
    <div>
      <HeroPanel>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-upto-orange">Leagues</p>
        <h1 className="mt-2 text-3xl font-black text-[hsl(var(--foreground))] sm:text-4xl">Quiz & XP Leagues</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Play quiz leagues, solve challenges, test yourself, and earn XP based on your performance.
        </p>
      </HeroPanel>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard icon={Trophy} label="Available Leagues" value={quizLeagues.length} helper="Across technical categories" tone="blue" />
        <MetricCard icon={Zap} label="XP Earned Here" value={earnedXp.toLocaleString()} helper="From completed quiz leagues" tone="orange" />
        <MetricCard icon={CheckCircle2} label="Completed Leagues" value={completedLeaguesCount} helper="All parts completed" tone="green" />
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input placeholder="Search leagues..." value={search} onChange={(event) => setSearch(event.target.value)} className="pl-10" />
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <span className="mr-2 flex items-center gap-1 text-xs text-muted">
          <Filter className="h-3.5 w-3.5" /> Level:
        </span>
        <FilterTabs options={levels} value={level} onChange={setLevel} />
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <span className="mr-2 self-center text-xs text-muted">Category:</span>
        <FilterTabs options={categories} value={category} onChange={setCategory} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Search} title="No quiz leagues found" description="Try changing category, level, or search." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((league) => {
            const isComplete = isLeagueComplete(league.id);
            return (
              <article key={league.id} className="app-card rounded-lg p-5 transition-all hover:-translate-y-1 hover:border-upto-blue/40">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-upto-orange">{league.category}</p>
                    <h2 className="mt-1 text-lg font-black text-[hsl(var(--foreground))]">{league.title}</h2>
                  </div>
                  <StatusBadge tone={league.level === "Advanced" ? "red" : league.level === "Intermediate" ? "yellow" : "blue"}>
                    {league.level}
                  </StatusBadge>
                </div>
                <p className="mt-3 text-sm text-muted">{league.description}</p>
                <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg bg-[hsl(var(--surface))] p-3 text-center text-xs">
                  <div>
                    <p className="font-black text-[hsl(var(--foreground))]">{league.quizzes}</p>
                    <p className="text-muted">Parts</p>
                  </div>
                  <div>
                    <p className="font-black text-upto-orange">{league.xp}</p>
                    <p className="text-muted">Total XP</p>
                  </div>
                  <div>
                    <p className="font-black text-[hsl(var(--foreground))]">{league.players}</p>
                    <p className="text-muted">Players</p>
                  </div>
                </div>
                <Button
                  variant={isComplete ? "outline" : "gradient"}
                  className="mt-5 w-full"
                  onClick={() => openQuiz(league)}
                >
                  {isComplete ? "Review Quiz / Play" : "Start Quiz & Earn XP"}
                </Button>
              </article>
            );
          })}
        </div>
      )}

      {/* QUIZ INTERACTIVE MODAL OVERLAY */}
      {activeLeague && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl p-6 md:p-8 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[hsl(var(--border))] pb-4 mb-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-upto-orange">
                  {activeLeague.category} &bull; {activeLeague.level}
                </span>
                <h3 className="text-xl font-black text-[hsl(var(--foreground))] mt-1">
                  {activeLeague.title}
                </h3>
              </div>
              <button
                onClick={closeQuiz}
                className="rounded-full p-2 text-muted hover:bg-[hsl(var(--surface))] hover:text-[hsl(var(--foreground))] transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* SCREEN 1: PART SELECTION */}
            {activePartId === null && (
              <div className="space-y-4">
                <p className="text-xs text-muted mb-4 leading-relaxed">
                  Quizzes are split into modules. Complete them sequentially to earn badge rewards and unlock advanced parts!
                </p>
                <div className="space-y-3">
                  {[1, 2, 3].map((partId) => {
                    const quizData = quizzesByLeague[activeLeague.id];
                    const part = quizData?.parts.find((p) => p.partId === partId);
                    const attempt = quizAttempts[`${activeLeague.id}-${partId}`];
                    
                    // Unlock logic: Part 1 is always unlocked. Others unlock if previous part has attempts.
                    const isUnlocked = partId === 1 || quizAttempts[`${activeLeague.id}-${partId - 1}`] !== undefined;

                    return (
                      <div
                        key={partId}
                        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-xl border p-4 transition-all ${
                          isUnlocked
                            ? "border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:bg-[hsl(var(--border))]/20"
                            : "border-[hsl(var(--border))] bg-gray-500/5 opacity-55"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
                            attempt
                              ? "bg-upto-green/15 border-upto-green/30 text-upto-green"
                              : isUnlocked
                              ? "bg-upto-blue/10 border-upto-blue/20 text-upto-blue"
                              : "bg-muted/10 border-muted/20 text-muted"
                          }`}>
                            {attempt ? <CheckCircle2 className="h-5 w-5" /> : isUnlocked ? <Unlock className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-[hsl(var(--foreground))]">
                              {part?.title || `Part ${partId}: Challenges`}
                            </h4>
                            <p className="text-[10px] text-muted font-semibold mt-0.5">
                              Questions: {part?.questions.length || 5} &bull; Reward: +{part?.xpAward || 400} XP
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 sm:mt-0 self-end sm:self-center flex items-center gap-3">
                          {attempt && (
                            <span className="text-xs font-black text-upto-green">
                              Score: {attempt.score}/{attempt.maxQuestions}
                            </span>
                          )}
                          <Button
                            variant={attempt ? "outline" : "gradient"}
                            size="sm"
                            disabled={!isUnlocked}
                            onClick={() => startPart(partId)}
                            className="text-xs py-1.5 px-4"
                          >
                            {attempt ? "Replay" : "Start Quiz"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SCREEN 2: ACTIVE MCQ QUIZ GAMEPLAY */}
            {activePartId !== null && !showResult && (() => {
              const quizData = quizzesByLeague[activeLeague.id];
              const part = quizData?.parts.find((p) => p.partId === activePartId);
              const questions = part?.questions || [];
              const currentQ = questions[currentQIdx];

              if (!currentQ) return <p className="text-center text-xs text-muted">Loading questions...</p>;

              return (
                <div className="space-y-6">
                  {/* Progress Header */}
                  <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3 text-xs text-muted font-bold">
                    <span>Part {activePartId}: Question {currentQIdx + 1} of {questions.length}</span>
                    <span className="text-upto-orange">Score: {correctCount}/{questions.length}</span>
                  </div>

                  {/* Question Text */}
                  <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5">
                    <h4 className="text-sm sm:text-base font-black text-[hsl(var(--foreground))] leading-relaxed">
                      {currentQ.question}
                    </h4>
                  </div>

                  {/* Options List */}
                  <div className="grid gap-3">
                    {currentQ.options.map((opt, idx) => {
                      // Option styling classes depending on select/submit state
                      let optionStyle = "border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--surface))]";
                      
                      if (selectedOpt === idx) {
                        optionStyle = "border-upto-blue bg-upto-blue/15 text-upto-blue font-extrabold";
                      }
                      
                      if (isAnswerChecked) {
                        if (idx === currentQ.correctIndex) {
                          optionStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-extrabold";
                        } else if (selectedOpt === idx) {
                          optionStyle = "border-red-500 bg-red-500/10 text-red-400 font-extrabold";
                        } else {
                          optionStyle = "border-[hsl(var(--border))] bg-gray-500/5 text-muted opacity-50";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={isAnswerChecked}
                          onClick={() => handleSelectOption(idx)}
                          className={`w-full text-left rounded-xl border p-4 text-xs font-bold transition-all flex items-center justify-between ${optionStyle}`}
                        >
                          <span>{opt}</span>
                          {isAnswerChecked && idx === currentQ.correctIndex && (
                            <span className="text-[10px] font-black uppercase text-emerald-400">Correct</span>
                          )}
                          {isAnswerChecked && selectedOpt === idx && idx !== currentQ.correctIndex && (
                            <span className="text-[10px] font-black uppercase text-red-400">Incorrect</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation Block */}
                  {isAnswerChecked && (
                    <div className="rounded-lg border border-upto-blue/20 bg-upto-blue/5 p-4 text-xs leading-relaxed animate-in fade-in slide-in-from-top-2">
                      <p className="font-extrabold text-upto-blue uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" /> Explanation
                      </p>
                      <p className="text-muted">{currentQ.explanation}</p>
                    </div>
                  )}

                  {/* Action Footer */}
                  <div className="flex justify-end pt-4 border-t border-[hsl(var(--border))]">
                    {!isAnswerChecked ? (
                      <Button
                        variant="gradient"
                        disabled={selectedOpt === null}
                        onClick={() => handleCheckAnswer(questions)}
                        className="gap-1.5 text-xs py-2 px-6"
                      >
                        Check Answer
                      </Button>
                    ) : (
                      <Button
                        variant="gradient"
                        onClick={() => handleNextQuestion(questions, part.xpAward)}
                        className="gap-1.5 text-xs py-2 px-6"
                      >
                        {currentQIdx + 1 < questions.length ? (
                          <>
                            Next Question <ArrowRight className="h-4 w-4" />
                          </>
                        ) : (
                          "View Performance Report"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* SCREEN 3: PERFORMANCE CHART & REWARDS REPORT */}
            {activePartId !== null && showResult && (() => {
              const quizData = quizzesByLeague[activeLeague.id];
              const part = quizData?.parts.find((p) => p.partId === activePartId);
              const maxQ = part?.questions.length || 5;
              const correctPct = Math.round((correctCount / maxQ) * 100);
              
              // Prepare data for custom PieChart
              const chartData = [
                { label: "Correct", value: correctPct, color: "#10B981" },
                { label: "Incorrect", value: 100 - correctPct, color: "#EF4444" },
              ];

              // Reward logic
              let rewardTitle = "Bronze Star Badge";
              let badgeColor = "from-amber-700 to-amber-900";
              let medalIcon = "🥉";

              if (correctCount === maxQ) {
                rewardTitle = "Gold Master Cup";
                badgeColor = "from-yellow-400 to-yellow-600";
                medalIcon = "🏆";
              } else if (correctCount >= maxQ - 1) {
                rewardTitle = "Silver Scholar Medal";
                badgeColor = "from-slate-400 to-slate-600";
                medalIcon = "🥈";
              }

              return (
                <div className="space-y-6 text-center">
                  <h4 className="text-lg font-black text-upto-gradient-text uppercase tracking-wider">
                    Performance Report
                  </h4>
                  <p className="text-xs text-muted max-w-sm mx-auto">
                    Congratulations on completing Part {activePartId} of {activeLeague.title}! Here is your scorecard summary.
                  </p>

                  <div className="grid gap-6 md:grid-cols-2 items-center justify-center py-4">
                    {/* Performance chart */}
                    <div>
                      <PieChart data={chartData} className="border-0 bg-transparent p-0 shadow-none flex justify-center" />
                    </div>

                    {/* Stats & Rewards Details */}
                    <div className="space-y-4 text-left">
                      <div className="rounded-lg bg-[hsl(var(--surface))] p-4 space-y-2.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-muted">Correct Answers:</span>
                          <span className="text-upto-green font-extrabold">{correctCount} of {maxQ}</span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-muted">XP Points Added:</span>
                          <span className="text-upto-orange font-extrabold">+{part?.xpAward || 400} XP</span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-muted">Passing Status:</span>
                          <span className={`font-extrabold ${correctCount >= 3 ? "text-upto-green" : "text-red-400"}`}>
                            {correctCount >= 3 ? "Passed (Unlocked next part)" : "Failed (Try again to unlock)"}
                          </span>
                        </div>
                      </div>

                      {/* Reward Card */}
                      {correctCount >= 3 && (
                        <div className={`rounded-xl border border-amber-500/20 bg-gradient-to-br ${badgeColor} p-4 text-white shadow-lg flex items-center gap-3`}>
                          <span className="text-3xl">{medalIcon}</span>
                          <div>
                            <h5 className="text-[10px] font-black uppercase tracking-wider text-amber-300">Reward Unlocked</h5>
                            <h4 className="text-sm font-black">{rewardTitle}</h4>
                            <p className="text-[9px] text-white/80 leading-snug">Added to your achievements tab!</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Return Actions */}
                  <div className="flex justify-center pt-4 border-t border-[hsl(var(--border))] gap-3">
                    <Button variant="outline" onClick={() => startPart(activePartId)} className="text-xs py-2 px-6">
                      Play Again
                    </Button>
                    <Button variant="gradient" onClick={() => openQuiz(activeLeague)} className="text-xs py-2 px-6">
                      Return to Part Selection
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
