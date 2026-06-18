import { useState, useEffect } from "react";
import { getCourseById, getMentorById } from "@/store/mockData";

export function useFetchCourse(courseId) {
  const [course, setCourse] = useState(null);
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    const timer = setTimeout(() => {
      const found = getCourseById(courseId);
      if (found) {
        setCourse(found);
        setMentor(getMentorById(found.mentorId));
        setError(null);
      } else {
        setError("Course not found");
      }
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [courseId]);

  return { course, mentor, loading, error };
}
