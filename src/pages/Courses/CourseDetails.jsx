import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Circle, Zap, Clock, Users } from "lucide-react";
import { Button } from "@/components/common/button";
import { PageLoader } from "@/components/common/Spinner";
import { AIMentorPlayer } from "@/components/ui/AIMentorPlayer";
import { MentorCard } from "@/components/ui/MentorCard";
import { useFetchCourse } from "@/hooks/useFetchCourse";
import { useCourseProgress } from "@/hooks/useCourseProgress";
import { celebrities } from "@/store/mockData";
import { formatCurrency } from "@/utils";
import { toast } from "sonner";

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { course, mentor, loading } = useFetchCourse(id);
  const { progress, updateProgress } = useCourseProgress(Number(id));
  const [activeLesson, setActiveLesson] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState(null);

  if (loading) return <PageLoader />;
  if (!course) return <div className="text-center text-gray-400 py-20">Course not found</div>;

  const currentMentor = selectedMentor || mentor;
  const completedLessons = course.lessons.filter((l) => l.completed).length;

  const handleLessonComplete = () => {
    const pct = Math.round(((completedLessons + 1) / course.lessons.length) * 100);
    updateProgress(pct);
    toast.success(`+${Math.round(course.xp / course.lessons.length)} XP earned!`);
  };

  return (
    <div>
      <button
        onClick={() => navigate("/courses")}
        className="mb-6 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Leagues
      </button>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-800 bg-upto-card p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-upto-orange">{course.league}</p>
            <h1 className="mt-2 text-3xl font-black">{course.title}</h1>
            <p className="mt-3 text-gray-400 leading-relaxed">{course.description}</p>

            <div className="mt-5 flex flex-wrap gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-upto-blue" />
                {course.duration}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-upto-blue" />
                {course.enrolled} enrolled
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-upto-orange" />
                {course.xp} XP
              </span>
              <span className="rounded-full bg-gray-800 px-3 py-0.5 text-xs font-semibold">
                {course.level}
              </span>
            </div>

            <div className="mt-5">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>Your Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-800">
                <div className="h-full rounded-full upto-gradient transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>

          {activeLesson ? (
            <AIMentorPlayer
              mentor={currentMentor}
              lesson={activeLesson}
              onComplete={handleLessonComplete}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-700 bg-upto-card/50 p-12 text-center text-gray-400">
              Select a lesson below to start learning with your AI mentor
            </div>
          )}

          <div className="rounded-2xl border border-gray-800 bg-upto-card p-6">
            <h2 className="text-lg font-bold mb-4">Course Curriculum</h2>
            <div className="space-y-2">
              {course.lessons.map((lesson, i) => (
                <button
                  key={lesson.id}
                  onClick={() => setActiveLesson(lesson)}
                  className={`flex w-full items-center gap-4 rounded-xl p-4 text-left transition-all ${
                    activeLesson?.id === lesson.id
                      ? "bg-upto-blue/15 border border-upto-blue/30"
                      : "bg-upto-dark hover:bg-gray-800/50"
                  }`}
                >
                  {lesson.completed ? (
                    <CheckCircle className="h-5 w-5 shrink-0 text-green-400" />
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-gray-600" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {i + 1}. {lesson.title}
                    </p>
                    <p className="text-xs text-gray-500">{lesson.duration}</p>
                  </div>
                  <span className="text-xs text-upto-blue font-semibold">Play →</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-800 bg-upto-card p-6">
            <h3 className="font-bold mb-1">Enroll in League</h3>
            <p className="text-3xl font-black mt-2">
              {course.price === 0 ? "Free" : formatCurrency(course.price)}
            </p>
            <Button variant="gradient" className="mt-4 w-full">
              {course.price === 0 ? "Start Free" : "Enroll Now"}
            </Button>
          </div>

          <div>
            <h3 className="font-bold mb-3">Choose Your AI Mentor</h3>
            <p className="text-xs text-gray-500 mb-4">
              Same celebrity face &amp; voice — expert AI delivers the content
            </p>
            <div className="space-y-4">
              <MentorCard
                mentor={mentor}
                selected={!selectedMentor || selectedMentor?.id === mentor?.id}
                onSelect={setSelectedMentor}
              />
            </div>
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-upto-blue font-medium">
                Switch to another celebrity
              </summary>
              <div className="mt-3 space-y-3 max-h-80 overflow-y-auto">
                {celebrities
                  .filter((c) => c.id !== mentor?.id)
                  .map((c) => (
                    <MentorCard
                      key={c.id}
                      mentor={c}
                      selected={selectedMentor?.id === c.id}
                      onSelect={setSelectedMentor}
                    />
                  ))}
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
