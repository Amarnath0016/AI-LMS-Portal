import { useState, useEffect, useCallback } from "react";
import { enrollmentApi } from "@/api/endpoints";

export function useCourseProgress(courseId) {
  const [progress, setProgress] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      const res = await enrollmentApi.getMyEnrollments();
      const list = res.data?.data || [];
      const match = list.find(
        (e) =>
          String(e.courseId) === String(courseId) ||
          String(e.course?.id) === String(courseId) ||
          String(e.course?._id) === String(courseId)
      );

      if (match) {
        setIsEnrolled(true);
        setProgress(match.progress || 0);
      } else {
        setIsEnrolled(false);
        setProgress(0);
      }
    } catch {
      // not enrolled or error
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const completeLesson = async (lessonId) => {
    const res = await enrollmentApi.completeLesson(lessonId, { courseId });
    if (res.data?.progress !== undefined) {
      setProgress(res.data.progress);
    }
    return res.data;
  };

  return {
    progress,
    isEnrolled,
    loading,
    refetch: fetchProgress,
    completeLesson,
    updateProgress: setProgress,
  };
}
