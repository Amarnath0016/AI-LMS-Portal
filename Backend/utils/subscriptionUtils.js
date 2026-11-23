import mongoose from "mongoose";
import Subscription from "../models/Subscription.js";
import Enrollment from "../models/Enrollment.js";

/**
 * Lazy expiry update & periodic cleaner
 * Updates active subscriptions whose expiresAt has passed to "expired".
 */
export const markExpiredSubscriptions = async () => {
  try {
    const now = new Date();
    const result = await Subscription.updateMany(
      { status: "active", expiresAt: { $lt: now } },
      { $set: { status: "expired" } }
    );
    return result;
  } catch (error) {
    console.error("[Subscription] Failed to mark expired subscriptions:", error.message);
    return null;
  }
};

/**
 * Production Payment Mode Security Guard
 * Enforces that in production, PAYMENT_MODE=demo must explicitly have ALLOW_DEMO_PAYMENTS=true.
 */
export const verifyProductionPaymentGuard = (env = process.env) => {
  const nodeEnv = env.NODE_ENV || "development";
  const paymentMode = (env.PAYMENT_MODE || "demo").toLowerCase();
  const allowDemo = env.ALLOW_DEMO_PAYMENTS === "true";

  if (nodeEnv === "production" && paymentMode === "demo" && !allowDemo) {
    const errorMsg =
      "CRITICAL SECURITY: In production environment with PAYMENT_MODE=demo, ALLOW_DEMO_PAYMENTS=true is required. Refusing to start with simulated payments.";
    return { allowed: false, message: errorMsg };
  }

  return { allowed: true };
};

/**
 * Access Control Helper: hasCourseAccess
 * Determines whether a user has permission to access a course's learning materials,
 * audio/video generation, quizzes, certificates, and AI mentor conversations.
 *
 * Rules:
 * 1. Course is free (accessType === "free" or price === 0) -> true
 * 2. User is admin or course instructor -> true
 * 3. User has an active, unexpired Subscription covering the course -> true
 * 4. User has an active verified paid Enrollment record -> true
 * 5. Otherwise -> false
 */
export const hasCourseAccess = async (user, course) => {
  if (!course) return false;

  // 1. Free Course Check: course is free only if it has not been marked paid or given a price > 0
  const isPaid = course.accessType === "paid" || (course.price !== undefined && course.price > 0);
  if (!isPaid) {
    return true;
  }

  // If course is paid and no user authenticated -> no access
  if (!user) return false;

  const userRole = user.role;
  const userId = user._id || user.id;

  // 2. Admin / Instructor Exemption
  if (userRole === "admin") return true;
  if (
    userRole === "instructor" &&
    course.instructorId &&
    String(course.instructorId) === String(userId)
  ) {
    return true;
  }

  // 3. Subscription Check with Lazy Expiry Update
  await markExpiredSubscriptions();

  const now = new Date();
  const activeSubs = await Subscription.find({
    userId,
    status: "active",
    expiresAt: { $gt: now },
  }).populate("planId");

  const courseIdStr = String(course._id || course.id);
  const courseNumericId = course.id !== undefined ? String(course.id) : null;

  for (const sub of activeSubs) {
    // If subscription is expired or cancelled, ignore
    if (sub.status !== "active" || sub.expiresAt <= now) continue;

    // 1. If subscription specifies courseIds, it is COURSE-SPECIFIC:
    if (Array.isArray(sub.courseIds) && sub.courseIds.length > 0) {
      const match = sub.courseIds.some(
        (id) => String(id) === courseIdStr || (courseNumericId && String(id) === courseNumericId)
      );
      if (match) return true;
      // If course-specific subscription did not match this course, do NOT fall through!
      continue;
    }

    // 2. If subscription plan is "Single Course Pass", it can only grant access if course was matched
    const planName = (sub.planId?.name || "").toLowerCase();
    if (planName.includes("single")) {
      continue;
    }

    // 3. Plan-level coverage (only for genuine all-access plans like Pro Monthly / Pro Yearly)
    if (sub.planId) {
      const planCourseIds = sub.planId.courseIds;
      // An empty plan courseIds array covers ALL paid courses ONLY for all-access passes
      if (!Array.isArray(planCourseIds) || planCourseIds.length === 0) {
        return true;
      }
      const planMatch = planCourseIds.some(
        (id) => String(id) === courseIdStr || (courseNumericId && String(id) === courseNumericId)
      );
      if (planMatch) return true;
    }
  }

  // 4. Backward-compatible verified paid enrollment check
  const enrollment = await Enrollment.findOne({
    userId,
    courseId: course._id || course.id,
    $or: [{ isPaid: true }, { paymentConfirmed: true }],
  });

  if (enrollment) return true;

  return false;
};
