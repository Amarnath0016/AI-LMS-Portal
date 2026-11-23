import { useState, useEffect, useCallback } from "react";
import { subscriptionApi } from "@/api/endpoints";
import { useAuthContext } from "@/store/AuthContext";
import { subscriptionPlans as mockPlans } from "@/store/mockData";

export function useSubscription() {
  const { user, isAuthenticated } = useAuthContext();
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState(mockPlans);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSubscriptions = useCallback(async () => {
    let localSubs = [];
    try {
      localSubs = JSON.parse(localStorage.getItem("upto_demo_subscriptions") || "[]");
    } catch {
      localSubs = [];
    }

    if (!isAuthenticated) {
      setSubscriptions(localSubs);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await subscriptionApi.getMySubscriptions();
      const apiSubs = res.data?.data || [];
      // Merge unique by _id or demoReference
      const all = [...apiSubs];
      for (const ls of localSubs) {
        if (!all.some((s) => s.demoReference === ls.demoReference || s._id === ls._id)) {
          all.push(ls);
        }
      }
      setSubscriptions(all);
    } catch (err) {
      setSubscriptions(localSubs);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchPlans = useCallback(async () => {
    try {
      const res = await subscriptionApi.getPlans();
      if (res.data?.data && res.data.data.length > 0) {
        setPlans(res.data.data);
      }
    } catch {
      // Fallback to mockPlans
      setPlans(mockPlans);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
    fetchPlans();
  }, [fetchSubscriptions, fetchPlans]);

  const isSubscribedToCourse = useCallback(
    (course) => {
      if (!course) return false;
      const courseIdStr = String(course._id || course.id);
      const courseNumId = course.id !== undefined ? String(course.id) : null;
      const now = new Date();

      return subscriptions.some((sub) => {
        if (sub.status !== "active") return false;
        if (sub.expiresAt && new Date(sub.expiresAt) <= now) return false;

        // 1. If subscription specifies courseIds, it is COURSE-SPECIFIC:
        if (Array.isArray(sub.courseIds) && sub.courseIds.length > 0) {
          const matched = sub.courseIds.some(
            (id) => String(id) === courseIdStr || (courseNumId && String(id) === courseNumId)
          );
          // Return matched strictly: if false, THIS subscription does NOT cover this course!
          return matched;
        }

        // 2. Single Course Pass without matched courseIds does NOT cover other courses
        const planName = (sub.planId?.name || sub.planName || "").toLowerCase();
        if (planName.includes("single")) {
          return false;
        }

        // 3. Genuine all-access plans (Pro Monthly, Pro Yearly) cover all paid courses
        if (sub.planId) {
          const planCourseIds = sub.planId.courseIds;
          if (!Array.isArray(planCourseIds) || planCourseIds.length === 0) {
            return true;
          }
          return planCourseIds.some(
            (id) => String(id) === courseIdStr || (courseNumId && String(id) === courseNumId)
          );
        }

        return false;
      });
    },
    [subscriptions]
  );

  const hasAccess = useCallback(
    (course) => {
      if (!course) return false;
      const isFree =
        course.accessType === "free" ||
        (!course.accessType && (!course.price || course.price === 0));
      if (isFree) return true;

      if (user?.role === "admin") return true;
      if (isSubscribedToCourse(course)) return true;
      if (course.hasAccess === true && !course.isLocked) return true;

      return false;
    },
    [user, isSubscribedToCourse]
  );

  const cancel = async (subId) => {
    const res = await subscriptionApi.cancel(subId);
    await fetchSubscriptions();
    return res.data;
  };

  return {
    subscriptions,
    plans,
    loading,
    error,
    refetch: fetchSubscriptions,
    refetchPlans: fetchPlans,
    isSubscribedToCourse,
    hasAccess,
    cancel,
  };
}
