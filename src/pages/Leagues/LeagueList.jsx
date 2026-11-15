import { useMemo, useState, useCallback } from "react";
import {
  CheckCircle2,
  Filter,
  Search,
  Trophy,
  Zap,
  Lock,
  Unlock,
  ArrowRight,
  X,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { EmptyState, FilterTabs, HeroPanel, MetricCard, StatusBadge } from "@/components/ui/dashboard";
import { useAuthContext } from "@/store/AuthContext";
import { quizApi } from "@/api/endpoints";
import { useApiQuery } from "@/hooks/useApi";
import { PieChart } from "@/components/ui/charts";

const levels = ["All", "Beginner", "Intermediate", "Advanced"];

export default function LeagueList() {
  const { user } = useAuthContext();
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("All");
  const [category, setCategory] = useState("All");

  // Fetch leagues from API
  const {
    data: leaguesData,
    loading: leaguesLoading,
    error: leaguesError,
    refetch: refetchLeagues,
    isEmpty: leaguesEmpty,
  } = useApiQuery(() => quizApi.getLeagues(), []);

  // Fetch user attempts from API
  const {
    data: attemptsData,
    refetch: refetchAttempts,
  } = useApiQuery(() => (user ? quizApi.getMyAttempts() : Promise.resolve({ data: [] })), [user]);

  const quizLeagues = useMemo(() => {
    return Array.isArray(leaguesData) ? leaguesData : leaguesData?.data || [];
  }, [leaguesData]);

  const quizAttempts = useMemo(() => {
    const list = Array.isArray(attemptsData) ? attemptsData : attemptsData?.data || [];
    const map = {};
    list.forEach((att) => {
      map[`${att.leagueId}-${att.partId}`] = att;
    });
    return map;
  }, [attemptsData]);

  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(quizLeagues.map((league) => league.category || "General")))];
  }, [quizLeagues]);

  // Quiz Modal States
  const [activeLeague, setActiveLeague] = useState(null);
  const [activePartId, setActivePartId] = useState(null);
  const [activeQuizQuestions, setActiveQuizQuestions] = useState([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [submissionResult, setSubmissionResult] = useState(null);

  // Filters leagues
  const filtered = useMemo(() => {
    return quizLeagues
      .filter((league) => {
        const q = search.toLowerCase();
        return (
          league.title.toLowerCase().includes(q) ||
          (league.category && league.category.toLowerCase().includes(q))
        );
      })
      .filter((league) => level === "All" || league.level === level)
      .filter((league) => category === "All" || league.category === category);
  }, [quizLeagues, search, level, category]);

  // Checks if a league is completed (parts 1, 2, 3 done)
  const isLeagueComplete = useCallback((leagueId) => {
    return [1, 2, 3].every((partId) => quizAttempts[`${leagueId}-${partId}`] !== undefined);
  }, [quizAttempts]);

  // Calculates total XP gained in leagues
  const earnedXp = useMemo(() => {
    return Object.values(quizAttempts).reduce(
      (sum, attempt) => sum + (attempt.earnedXp || attempt.xpAward || 0),
      0
    );
  }, [quizAttempts]);

  // Calculates total number of completed leagues
  const completedLeaguesCount = useMemo(() => {
    return quizLeagues.filter((l) => isLeagueComplete(l.id)).length;
  }, [quizLeagues, isLeagueComplete]);

  // Quiz flow methods
  const openQuiz = (league) => {
    setActiveLeague(league);
    setActivePartId(null);
    setSubmissionResult(null);
  };

  const closeQuiz = () => {
    setActiveLeague(null);
    setActivePartId(null);
    setActiveQuizQuestions([]);
    setUserAnswers({});
    setSubmissionResult(null);
  };

  const startPart = async (partId) => {
    if (!activeLeague) return;
    setActivePartId(partId);
    setCurrentQIdx(0);
    setUserAnswers({});
    setSubmissionResult(null);
    setLoadingQuiz(true);

    try {
      const res = await quizApi.get(activeLeague.id, partId);
      const data = res.data?.data || res.data;
      const questions = data?.questions || [];
      setActiveQuizQuestions(questions);
    } catch (err) {
      toast.error("Failed to load quiz questions: " + (err.response?.data?.message || err.message));
      setActivePartId(null);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleSelectOption = (qIdOrIdx, optIdx) => {
    setUserAnswers((prev) => ({
      ...prev,
      [qIdOrIdx]: optIdx,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeLeague || activePartId === null) return;
    setSubmittingQuiz(true);

    try {
      const quizIdentifier = `${activeLeague.id}-${activePartId}`;
      const payload = {
        leagueId: activeLeague.id,
        partId: activePartId,
        answers: userAnswers,
        xpAward: 300,
      };

      const res = await quizApi.submitAttempt(quizIdentifier, payload);
      const result = res.data;
      setSubmissionResult(result);
      toast.success(result.message || "Quiz submitted successfully!");
      refetchAttempts();
    } catch (err) {
      toast.error("Error submitting quiz: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingQuiz(false);
    }
  };

  return (
    <div>
      <HeroPanel>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-upto-orange">Leagues</p>
        <h1 className="mt-2 text-3xl font-black text-[hsl(var(--foreground))] sm:text-4xl">Quiz &amp; XP Leagues</h1>
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

      {leaguesLoading && (
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-upto-blue" />
          <p className="text-sm text-muted">Loading quiz leagues...</p>
        </div>
      )}

      {leaguesError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-400 mb-2" />
          <p className="font-semibold text-red-300">Failed to load quiz leagues</p>
          <p className="text-sm text-red-400/80 mt-1">{leaguesError}</p>
          <Button variant="outline" className="mt-4" onClick={refetchLeagues}>
            Retry
          </Button>
        </div>
      )}

      {!leaguesLoading && !leaguesError && (leaguesEmpty || filtered.length === 0) && (
        <EmptyState icon={Search} title="No quiz leagues found" description="Try changing category, level, or search." />
      )}

      {!leaguesLoading && !leaguesError && filtered.length > 0 && (
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
                    <p className="font-black text-[hsl(var(--foreground))]">{league.quizzes || 3}</p>
                    <p className="text-muted">Parts</p>
                  </div>
                  <div>
                    <p className="font-black text-upto-orange">{league.xp || 1200}</p>
                    <p className="text-muted">Total XP</p>
                  </div>
                  <div>
                    <p className="font-black text-[hsl(var(--foreground))]">{league.players || "10K"}</p>
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
                  Quizzes are split into parts. Complete them sequentially to earn badge rewards and unlock advanced parts!
                </p>
                <div className="space-y-3">
                  {[1, 2, 3].map((partId) => {
                    const attempt = quizAttempts[`${activeLeague.id}-${partId}`];
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
                              Part {partId}: Core Challenge Check
                            </h4>
                            <p className="text-[10px] text-muted font-semibold mt-0.5">
                              Reward: +300 XP
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
            {activePartId !== null && !submissionResult && (
              <>
                {loadingQuiz ? (
                  <div className="flex h-48 flex-col items-center justify-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-upto-blue" />
                    <p className="text-xs text-muted">Loading sanitized quiz questions from server...</p>
                  </div>
                ) : activeQuizQuestions.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-xs text-muted">No questions available for this module.</p>
                    <Button variant="outline" className="mt-4" onClick={() => setActivePartId(null)}>
                      Back to Parts
                    </Button>
                  </div>
                ) : (
                  (() => {
                    const currentQ = activeQuizQuestions[currentQIdx];
                    const qIdentifier = currentQ.id || currentQIdx;
                    const selectedOpt = userAnswers[qIdentifier];
                    const isLast = currentQIdx + 1 >= activeQuizQuestions.length;

                    return (
                      <div className="space-y-6">
                        {/* Progress Header */}
                        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3 text-xs text-muted font-bold">
                          <span>
                            Part {activePartId}: Question {currentQIdx + 1} of {activeQuizQuestions.length}
                          </span>
                          <span className="text-upto-orange">
                            Answered: {Object.keys(userAnswers).length}/{activeQuizQuestions.length}
                          </span>
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
                            const isSelected = selectedOpt === idx;
                            const optionStyle = isSelected
                              ? "border-upto-blue bg-upto-blue/15 text-upto-blue font-extrabold"
                              : "border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--surface))]";

                            return (
                              <button
                                key={idx}
                                onClick={() => handleSelectOption(qIdentifier, idx)}
                                className={`w-full text-left rounded-xl border p-4 text-xs font-bold transition-all flex items-center justify-between ${optionStyle}`}
                              >
                                <span>{opt}</span>
                                {isSelected && (
                                  <span className="text-[10px] font-black uppercase text-upto-blue">Selected</span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Navigation / Submit Footer */}
                        <div className="flex justify-between items-center pt-4 border-t border-[hsl(var(--border))]">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={currentQIdx === 0}
                            onClick={() => setCurrentQIdx((i) => i - 1)}
                          >
                            Previous
                          </Button>

                          {!isLast ? (
                            <Button
                              variant="gradient"
                              size="sm"
                              onClick={() => setCurrentQIdx((i) => i + 1)}
                              className="gap-1.5 text-xs py-2 px-6"
                            >
                              Next Question <ArrowRight className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="gradient"
                              size="sm"
                              disabled={submittingQuiz}
                              onClick={handleSubmitQuiz}
                              className="gap-1.5 text-xs py-2 px-6"
                            >
                              {submittingQuiz ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" /> Grading on Server...
                                </>
                              ) : (
                                "Submit Quiz for Grading"
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })()
                )}
              </>
            )}

            {/* SCREEN 3: PERFORMANCE CHART & REWARDS REPORT */}
            {activePartId !== null && submissionResult && (() => {
              const maxQ = submissionResult.maxQuestions || activeQuizQuestions.length || 1;
              const correctCount = submissionResult.score || 0;
              const correctPct = Math.round((correctCount / maxQ) * 100);

              const chartData = [
                { label: "Correct", value: correctPct, color: "#10B981" },
                { label: "Incorrect", value: Math.max(0, 100 - correctPct), color: "#EF4444" },
              ];

              return (
                <div className="space-y-6 text-center">
                  <h4 className="text-lg font-black text-upto-gradient-text uppercase tracking-wider">
                    Server Performance Report
                  </h4>
                  <p className="text-xs text-muted max-w-sm mx-auto">
                    {submissionResult.message}
                  </p>

                  <div className="grid gap-6 md:grid-cols-2 items-center justify-center py-4">
                    <div>
                      <PieChart data={chartData} className="border-0 bg-transparent p-0 shadow-none flex justify-center" />
                    </div>

                    <div className="space-y-4 text-left">
                      <div className="rounded-lg bg-[hsl(var(--surface))] p-4 space-y-2.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-muted">Correct Answers:</span>
                          <span className="text-upto-green font-extrabold">{correctCount} of {maxQ}</span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-muted">XP Points Awarded:</span>
                          <span className="text-upto-orange font-extrabold">+{submissionResult.earnedXp || 0} XP</span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-muted">Status:</span>
                          <span className={`font-extrabold ${submissionResult.passed ? "text-upto-green" : "text-red-400"}`}>
                            {submissionResult.passed ? "Passed ✓" : "Review Needed"}
                          </span>
                        </div>
                      </div>

                      {submissionResult.passed && (
                        <div className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-yellow-400 to-yellow-600 p-4 text-white shadow-lg flex items-center gap-3">
                          <span className="text-3xl">🏆</span>
                          <div>
                            <h5 className="text-[10px] font-black uppercase tracking-wider text-amber-200">Achievement</h5>
                            <h4 className="text-sm font-black">League Mastery Check Passed</h4>
                            <p className="text-[9px] text-white/90 leading-snug">Server has recorded your progress &amp; streak!</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

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
