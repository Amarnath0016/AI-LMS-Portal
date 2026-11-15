import { useState, useEffect } from "react";
import { courseApi } from "@/api/endpoints";
import { getCourseById, getMentorById } from "@/store/mockData";

export function useFetchCourse(courseId) {
  const [course, setCourse] = useState(null);
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!courseId) return;
    let isMounted = true;
    setLoading(true);

    const fetchCourse = async () => {
      try {
        const response = await courseApi.getById(courseId);
        if (isMounted && response.data?.data) {
          const courseData = response.data.data;
          setCourse(courseData);
          setMentor(courseData.mentor || getMentorById(courseData.mentorId));
          setError(null);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Backend fetch failed, using fallback data:", err.message);
      }

      // Resilient fallback to local store
      if (isMounted) {
        const found = getCourseById(courseId);
        if (found) {
          setCourse(found);
          setMentor(getMentorById(found.mentorId));
          setError(null);
        } else {
          setError("Course not found");
        }
        setLoading(false);
      }
    };

    fetchCourse();

    return () => {
      isMounted = false;
    };
  }, [courseId]);

  return { course, mentor, loading, error };
}
