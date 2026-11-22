import { useState, useEffect, useCallback } from "react";
import { courseApi } from "@/api/endpoints";

export function useFetchCourse(courseId) {
  const [course, setCourse] = useState(null);
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourse = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await courseApi.getById(courseId);
      if (response.data?.data) {
        const courseData = response.data.data;
        setCourse(courseData);
        setMentor(courseData.mentor || null);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load course");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  return { course, mentor, loading, error, refetch: fetchCourse };
}
