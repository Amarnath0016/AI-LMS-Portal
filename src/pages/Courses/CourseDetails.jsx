import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Circle, Zap, Clock, Users, Play, Award, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/common/button";
import { PageLoader } from "@/components/common/Spinner";
import { AIMentorPlayer } from "@/components/ui/AIMentorPlayer";
import { MentorCard } from "@/components/ui/MentorCard";
import { useFetchCourse } from "@/hooks/useFetchCourse";
import { useCourseProgress } from "@/hooks/useCourseProgress";
import { useApiQuery } from "@/hooks/useApi";
import { mentorApi, courseApi } from "@/api/endpoints";
import { formatCurrency } from "@/utils";
import { toast } from "sonner";

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { course, mentor, loading: courseLoading, error: courseError, refetch: refetchCourse } = useFetchCourse(id);
  const { progress, isEnrolled, completeLesson, refetch: refetchProgress } = useCourseProgress(id);
  const { data: allMentors = [] } = useApiQuery(() => mentorApi.getAll(), []);

  const [activeLesson, setActiveLesson] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [enrolling, setEnrolling] = useState(false);

  if (courseLoading) return <PageLoader />;

  if (courseError || !course) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-400">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-xl font-bold">Course Not Found</h2>
        <p className="mt-2 text-sm text-muted">{courseError || "The requested course could not be retrieved."}</p>
        <div className="mt-6 flex justify-center gap-4">
          <Button variant="outline" onClick={() => navigate("/courses")}>
            Back to Courses
          </Button>
          {refetchCourse && (
            <Button onClick={refetchCourse} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  const currentMentor = selectedMentor || mentor || allMentors[0];
  const lessons = course.lessons || [];

  const handleEnrollNow = async () => {
    try {
      setEnrolling(true);
      const res = await courseApi.enroll(course.id || course._id, { paymentConfirmed: true });
      toast.success(res.data?.message || `Enrolled in "${course.title}" successfully!`);
      await refetchProgress();
    } catch (err) {
      toast.error(err.response?.data?.message || "Enrollment failed. Please try again.");
    } finally {
      setEnrolling(false);
    }
  };

  const handleLessonComplete = async () => {
    if (!activeLesson) return;
    try {
      const res = await completeLesson(activeLesson.id || activeLesson._id);
      if (res?.alreadyCompleted) {
        toast.info("Lesson already completed previously.");
      } else {
        toast.success(`Lesson completed! +${res?.earnedXp || 100} XP earned!`);
        if (res?.certificateIssued) {
          toast.success("🏆 Congratulations! Course Completed & Certificate Earned!");
        }
      }
      await refetchProgress();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save lesson progress.");
    }
  };

  return (
    <div>
      <button
        onClick={() => navigate("/courses")}
        className="mb-6 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Courses
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
                {course.duration || "10h"}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-upto-blue" />
                {course.enrolled || "12K"} enrolled
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-upto-orange" />
                {course.xp || 1000} XP
              </span>
              <span className="rounded-full bg-gray-800 px-3 py-0.5 text-xs font-semibold">
                {course.level}
              </span>
            </div>

            <div className="mt-5">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>Course Progress</span>
                <span className="font-bold text-upto-blue">{progress}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-gray-800 overflow-hidden">
                <div
                  className="h-full rounded-full upto-gradient transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
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
              <p className="text-base font-medium">Select a lesson below to start learning with your AI mentor</p>
              <p className="mt-1 text-xs text-gray-500">
                Interactive celebrity persona delivers interactive lecture, doubt clearance, and code evaluation.
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-gray-800 bg-upto-card p-6">
            <h2 className="text-lg font-bold mb-4">Course Curriculum ({lessons.length} Lessons)</h2>
            <div className="space-y-2">
              {lessons.map((lesson, i) => (
                <button
                  key={lesson.id || lesson._id || i}
                  onClick={() => setActiveLesson(lesson)}
                  className={`flex w-full items-center gap-4 rounded-xl p-4 text-left transition-all ${
                    activeLesson?.id === lesson.id || activeLesson?._id === lesson._id
                      ? "bg-upto-blue/15 border border-upto-blue/40"
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
                    <p className="text-xs text-gray-500">{lesson.duration || "15 min"}</p>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-upto-blue font-semibold">
                    <Play className="h-3.5 w-3.5" /> Start Lesson
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-800 bg-upto-card p-6">
            <h3 className="font-bold mb-1">Enrollment Status</h3>
            <p className="text-3xl font-black mt-2">
              {!course.price || course.price === 0 ? "Free" : formatCurrency(course.price)}
            </p>

            {isEnrolled ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-3 text-xs font-bold text-green-400 border border-green-500/20">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  Enrolled & Active in this Course
                </div>
                {lessons.length > 0 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setActiveLesson(lessons[0])}
                  >
                    Continue Learning →
                  </Button>
                )}
              </div>
            ) : (
              <Button
                variant="gradient"
                className="mt-4 w-full"
                onClick={handleEnrollNow}
                disabled={enrolling}
              >
                {enrolling ? "Enrolling..." : !course.price || course.price === 0 ? "Start Free" : "Enroll Now"}
              </Button>
            )}
          </div>

          <div>
            <h3 className="font-bold mb-3">Choose Your AI Mentor</h3>
            <p className="text-xs text-gray-500 mb-4">
              Switch celebrity personas to study with different voices and philosophies.
            </p>
            <div className="space-y-4">
              {currentMentor && (
                <MentorCard
                  mentor={currentMentor}
                  selected={true}
                  onSelect={setSelectedMentor}
                />
              )}
            </div>

            {allMentors.length > 1 && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-upto-blue font-medium">
                  Switch to another celebrity persona
                </summary>
                <div className="mt-3 space-y-3 max-h-80 overflow-y-auto">
                  {allMentors
                    .filter((c) => (c.id || c._id) !== (currentMentor?.id || currentMentor?._id))
                    .map((c) => (
                      <MentorCard
                        key={c.id || c._id}
                        mentor={c}
                        selected={(selectedMentor?.id || selectedMentor?._id) === (c.id || c._id)}
                        onSelect={setSelectedMentor}
                      />
                    ))}
                </div>
              </details>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
