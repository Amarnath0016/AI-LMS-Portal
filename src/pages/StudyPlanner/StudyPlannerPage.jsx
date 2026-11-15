import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Target,
  TrendingUp,
  BrainCircuit,
  Filter,
  Check,
  ChevronRight,
  Zap,
  BookOpen,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/common/button";
import { HeroPanel, SectionCard, StatusBadge } from "@/components/ui/dashboard";
import { toast } from "sonner";

// Mock initial study tasks
const initialTasks = [
  { id: 1, title: "Complete Module 4: Asynchronous JavaScript & Promises", category: "Course", day: "Monday", time: "09:00 AM - 10:30 AM", duration: "1.5 hrs", priority: "High", completed: true },
  { id: 2, title: "Practice 2 Daily Challenges: Array Methods & Recursion", category: "Practice", day: "Monday", time: "04:00 PM - 05:00 PM", duration: "1.0 hr", priority: "Medium", completed: true },
  { id: 3, title: "Build React Portfolio Filter & Search Component", category: "Project", day: "Tuesday", time: "10:00 AM - 12:00 PM", duration: "2.0 hrs", priority: "High", completed: false },
  { id: 4, title: "Review AI Prompt Engineering Course Notes", category: "Revision", day: "Wednesday", time: "02:00 PM - 03:00 PM", duration: "1.0 hr", priority: "Low", completed: false },
  { id: 5, title: "Take Cyber Defense Mock Quiz Level 1", category: "Quiz", day: "Thursday", time: "06:00 PM - 07:00 PM", duration: "1.0 hr", priority: "High", completed: false },
  { id: 6, title: "Read Jensen Huang's AI Hardware Architecture Paper", category: "Reading", day: "Friday", time: "11:00 AM - 12:00 PM", duration: "1.0 hr", priority: "Medium", completed: false },
];

const weeklyDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function StudyPlannerPage() {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("All");
  const [activeDay, setActiveDay] = useState("Monday");
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAiPlanModal, setShowAiPlanModal] = useState(false);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("Course");
  const [newTaskDay, setNewTaskDay] = useState("Monday");
  const [newTaskTime, setNewTaskTime] = useState("09:00 AM - 10:00 AM");
  const [newTaskDuration, setNewTaskDuration] = useState("1.0 hr");
  const [newTaskPriority, setNewTaskPriority] = useState("Medium");

  // Pomodoro Timer State
  const [pomodoroMode, setPomodoroMode] = useState(25 * 60); // 25 min in seconds
  const [timerLeft, setTimerLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(3);

  // Timer Ticking Logic
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerLeft > 0) {
      interval = setInterval(() => {
        setTimerLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setSessionsCompleted((prev) => prev + 1);
      toast.success("🔔 Focus Session Completed! Time for a 5-minute break.");
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerLeft]);

  const switchPomodoroMode = (mins) => {
    setIsTimerRunning(false);
    setPomodoroMode(mins * 60);
    setTimerLeft(mins * 60);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerLeft(pomodoroMode);
  };

  const toggleTaskCompletion = (taskId) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === taskId) {
          const updated = !t.completed;
          if (updated) {
            toast.success(`Task Completed: "${t.title}" (+50 XP)`);
          }
          return { ...t, completed: updated };
        }
        return t;
      })
    );
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
    toast.info("Task removed from study plan.");
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask = {
      id: Date.now(),
      title: newTaskTitle,
      category: newTaskCategory,
      day: newTaskDay,
      time: newTaskTime,
      duration: newTaskDuration,
      priority: newTaskPriority,
      completed: false,
    };

    setTasks([...tasks, newTask]);
    setShowAddTaskModal(false);
    setNewTaskTitle("");
    toast.success("New study task scheduled successfully!");
  };

  const handleGenerateAiPlan = (planType) => {
    setShowAiPlanModal(false);
    toast.success(`✨ AI Study Plan Created: "${planType}" loaded into your weekly schedule!`);
  };

  // Calculations
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesCategory = activeCategoryFilter === "All" || task.category === activeCategoryFilter;
    return matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <HeroPanel className="relative overflow-hidden border-upto-blue/20 bg-gradient-to-r from-upto-blue/10 via-purple-500/5 to-emerald-500/10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-upto-blue/15 px-3 py-1 text-xs font-black uppercase tracking-wider text-upto-blue">
                <CalendarIcon className="h-4 w-4" /> Weekly Study Schedule
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <Target className="h-3.5 w-3.5" /> Goal Progress: {progressPercent}% Completed
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-[hsl(var(--foreground))] sm:text-4xl">
              Smart AI Study Planner
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted leading-relaxed">
              Organize your learning routine, set goal deadlines, track study hours, and boost focus with our built-in Pomodoro workspace.
            </p>
          </div>

          {/* Quick Actions Header */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button variant="outline" className="gap-2" onClick={() => setShowAiPlanModal(true)}>
              <BrainCircuit className="h-4 w-4 text-upto-blue" /> AI Schedule Generator
            </Button>
            <Button variant="gradient" className="gap-2" onClick={() => setShowAddTaskModal(true)}>
              <Plus className="h-4 w-4" /> Add Study Task
            </Button>
          </div>
        </div>

        {/* Progress Bar & Key Metrics */}
        <div className="mt-6 border-t border-[hsl(var(--border))] pt-4">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-muted">Weekly Goals Completion</span>
            <span className="text-upto-blue">{completedCount} of {totalCount} Tasks Done</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-[hsl(var(--surface))] overflow-hidden">
            <div
              className="h-full rounded-full upto-gradient transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </HeroPanel>

      {/* Main Grid: Schedule & Pomodoro */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column (8 cols): Task Manager & Weekly Schedule */}
        <div className="lg:col-span-8 space-y-6">
          <SectionCard
            title={
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-upto-blue" />
                  <span>Interactive Study Tasks</span>
                </div>
                {/* Category Filters */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {["All", "Course", "Practice", "Project", "Quiz", "Revision"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategoryFilter(cat)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                        activeCategoryFilter === cat
                          ? "bg-upto-blue text-white shadow-sm"
                          : "bg-[hsl(var(--surface))] text-muted hover:text-[hsl(var(--foreground))]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            }
          >
            {/* Day Selector Tabs */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2 border-b border-[hsl(var(--border))]">
              {weeklyDays.map((d) => {
                const dayTaskCount = tasks.filter((t) => t.day === d).length;
                const isSelected = activeDay === d;
                return (
                  <button
                    key={d}
                    onClick={() => setActiveDay(d)}
                    className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shrink-0 ${
                      isSelected
                        ? "bg-upto-blue text-white shadow-md shadow-blue-500/20"
                        : "bg-[hsl(var(--surface))] text-muted hover:text-[hsl(var(--foreground))]"
                    }`}
                  >
                    <span>{d}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[9px] font-black ${
                        isSelected ? "bg-white/20 text-white" : "bg-muted/20 text-muted"
                      }`}
                    >
                      {dayTaskCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Tasks List for Selected Day */}
            <div className="space-y-3">
              {filteredTasks
                .filter((t) => t.day === activeDay)
                .map((task) => (
                  <div
                    key={task.id}
                    className={`group relative flex flex-col gap-3 rounded-2xl border p-4 transition-all sm:flex-row sm:items-center sm:justify-between ${
                      task.completed
                        ? "border-emerald-500/30 bg-emerald-500/5 opacity-80"
                        : "border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-upto-blue/40 shadow-sm"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <button
                        onClick={() => toggleTaskCompletion(task.id)}
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-all ${
                          task.completed
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-gray-400 hover:border-upto-blue"
                        }`}
                      >
                        {task.completed && <Check className="h-3.5 w-3.5" />}
                      </button>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-black uppercase ${
                              task.category === "Course"
                                ? "bg-blue-500/15 text-blue-500"
                                : task.category === "Project"
                                ? "bg-purple-500/15 text-purple-500"
                                : task.category === "Quiz"
                                ? "bg-orange-500/15 text-orange-500"
                                : "bg-emerald-500/15 text-emerald-500"
                            }`}
                          >
                            {task.category}
                          </span>
                          <span className="text-[10px] font-bold text-muted flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {task.time} ({task.duration})
                          </span>
                        </div>

                        <h4
                          className={`mt-1.5 text-sm font-extrabold ${
                            task.completed ? "line-through text-muted" : "text-[hsl(var(--foreground))]"
                          }`}
                        >
                          {task.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          task.priority === "High"
                            ? "bg-rose-500/15 text-rose-500"
                            : task.priority === "Medium"
                            ? "bg-amber-500/15 text-amber-500"
                            : "bg-gray-500/15 text-gray-500"
                        }`}
                      >
                        {task.priority} Priority
                      </span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-muted opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-all"
                        title="Delete task"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}

              {filteredTasks.filter((t) => t.day === activeDay).length === 0 && (
                <div className="text-center py-12 text-muted space-y-2 border border-dashed border-[hsl(var(--border))] rounded-2xl">
                  <CalendarIcon className="h-8 w-8 mx-auto text-muted/50" />
                  <p className="text-xs font-semibold">No tasks scheduled for {activeDay}.</p>
                  <Button size="sm" variant="outline" onClick={() => setShowAddTaskModal(true)}>
                    + Add Task for {activeDay}
                  </Button>
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Right Column (4 cols): Pomodoro Timer & Quick Stats */}
        <div className="lg:col-span-4 space-y-6">
          {/* Pomodoro Focus Timer Card */}
          <SectionCard
            title={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-upto-orange" />
                  <span>Pomodoro Focus Timer</span>
                </div>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-muted hover:text-[hsl(var(--foreground))]"
                  title={isMuted ? "Unmute Ambient Sound" : "Mute Sound"}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-upto-orange" />}
                </button>
              </div>
            }
          >
            <div className="text-center space-y-6">
              {/* Duration Mode Selector */}
              <div className="flex justify-center gap-1.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-1">
                {[
                  { label: "Focus (25m)", mins: 25 },
                  { label: "Short Break (5m)", mins: 5 },
                  { label: "Long Break (15m)", mins: 15 },
                ].map((mode) => (
                  <button
                    key={mode.mins}
                    onClick={() => switchPomodoroMode(mode.mins)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                      pomodoroMode === mode.mins * 60
                        ? "bg-upto-orange text-white shadow-sm"
                        : "text-muted hover:text-[hsl(var(--foreground))]"
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {/* Dynamic Digital Clock Display */}
              <div className="relative mx-auto flex h-44 w-44 items-center justify-center rounded-full border-4 border-upto-orange/20 bg-gradient-to-br from-upto-orange/10 to-transparent shadow-xl">
                <div className="text-center">
                  <p className="font-mono text-4xl font-black tracking-widest text-[hsl(var(--foreground))]">
                    {formatTime(timerLeft)}
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    {isTimerRunning ? "Focus Session Running..." : "Session Paused"}
                  </p>
                </div>
              </div>

              {/* Timer Controls */}
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant={isTimerRunning ? "outline" : "gradient"}
                  size="lg"
                  className="w-32 gap-2"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                >
                  {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white" />}
                  {isTimerRunning ? "Pause" : "Start"}
                </Button>

                <Button variant="ghost" size="icon" onClick={resetTimer} title="Reset Timer">
                  <RotateCcw className="h-4 w-4 text-muted" />
                </Button>
              </div>

              {/* Completed Sessions Stats */}
              <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-3 text-xs font-bold text-muted flex items-center justify-around">
                <span>Completed Today:</span>
                <span className="text-upto-orange text-sm font-extrabold">{sessionsCompleted} Sessions</span>
                <span>({sessionsCompleted * 25} min)</span>
              </div>
            </div>
          </SectionCard>

          {/* AI Focus Tip Box */}
          <div className="rounded-2xl border border-upto-blue/30 bg-upto-blue/5 p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-upto-blue">
              <Sparkles className="h-4 w-4" /> AI Study Tip of the Day
            </div>
            <p className="text-xs text-[hsl(var(--foreground))] leading-relaxed">
              "Studies show that studying in 25-minute focused bursts with 5-minute active recovery breaks improves long-term code retention by over 40%."
            </p>
          </div>
        </div>
      </div>

      {/* Add New Study Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <h3 className="text-sm font-extrabold text-[hsl(var(--foreground))]">Schedule New Study Task</h3>
              <button onClick={() => setShowAddTaskModal(false)} className="text-muted font-bold">✕</button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Build React Custom Hook"
                  className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3.5 py-2 text-xs font-semibold outline-none focus:border-upto-blue"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted block mb-1">Category</label>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value)}
                    className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-xs font-semibold outline-none"
                  >
                    <option value="Course">Course</option>
                    <option value="Practice">Practice</option>
                    <option value="Project">Project</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Revision">Revision</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted block mb-1">Target Day</label>
                  <select
                    value={newTaskDay}
                    onChange={(e) => setNewTaskDay(e.target.value)}
                    className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-xs font-semibold outline-none"
                  >
                    {weeklyDays.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted block mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={newTaskTime}
                    onChange={(e) => setNewTaskTime(e.target.value)}
                    className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-xs font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-muted block mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-xs font-semibold outline-none"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowAddTaskModal(false)}>
                  Cancel
                </Button>
                <Button variant="gradient" size="sm" type="submit">
                  Save Study Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Schedule Generator Modal */}
      {showAiPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <div className="flex items-center gap-2.5">
                <BrainCircuit className="h-5 w-5 text-upto-blue" />
                <h3 className="text-sm font-extrabold text-[hsl(var(--foreground))]">AI Study Plan Assistant</h3>
              </div>
              <button onClick={() => setShowAiPlanModal(false)} className="text-muted font-bold">✕</button>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              Select a learning goal to generate a customized 4-week study schedule tailored to your available time.
            </p>

            <div className="space-y-3">
              {[
                { title: "Frontend Engineering Interview Sprint", desc: "React 19, Next.js, System Design & 10 Code Challenges", duration: "2 hrs / day" },
                { title: "Python & Machine Learning Foundations", desc: "NumPy, Pandas, Scikit-Learn, PyTorch basics", duration: "1.5 hrs / day" },
                { title: "Cyber Security & Defensive Ops Sprint", desc: "Network security, CTF labs, Ethical Hacking basics", duration: "1 hr / day" },
              ].map((plan, idx) => (
                <div
                  key={idx}
                  className="group rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 hover:border-upto-blue transition-all cursor-pointer flex items-center justify-between"
                  onClick={() => handleGenerateAiPlan(plan.title)}
                >
                  <div>
                    <h4 className="text-xs font-extrabold text-[hsl(var(--foreground))] group-hover:text-upto-blue transition-colors">
                      {plan.title}
                    </h4>
                    <p className="text-[11px] text-muted mt-0.5">{plan.desc}</p>
                    <span className="inline-block mt-2 text-[9px] font-black uppercase text-upto-orange bg-upto-orange/10 px-2 py-0.5 rounded">
                      Pace: {plan.duration}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted group-hover:text-upto-blue transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
