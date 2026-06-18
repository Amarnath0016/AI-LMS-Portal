import { useAuthContext } from "@/store/AuthContext";

export function useCourseProgress(courseId) {
  const { courseProgress, updateProgress } = useAuthContext();
  const progress = courseProgress[courseId] ?? 0;

  const setProgress = (value) => {
    updateProgress(courseId, Math.min(100, Math.max(0, value)));
  };

  return { progress, setProgress, updateProgress: setProgress };
}
