import { ROLES } from "@/constants";

export const ROLE_HOME = {
  [ROLES.STUDENT]: "/dashboard",
  [ROLES.INSTRUCTOR]: "/instructor-dashboard",
  [ROLES.ADMIN]: "/admin",
};

export const getHomePath = (role) => ROLE_HOME[role] || "/dashboard";

// Shared paths accessible by all authenticated roles
const SHARED_PATHS = [
  "/profile",
  "/notifications",
  "/support",
  "/forum",
  "/feedback",
  "/courses",
  "/mentors",
  "/verify",
];

// Student-only paths
const STUDENT_ONLY_PATHS = [
  "/dashboard",
  "/daily-challenge",
  "/leagues",
  "/study-planner",
  "/achievement-badges",
  "/career-options",
  "/wishlist",
  "/certificates",
  "/leaderboard",
  "/subscriptions",
  "/subscribe",
  "/achievements",
];

/**
 * Checks whether a given role is permitted to access the target path.
 *
 * Rules:
 * - "/admin" and "/admin/*": admin only
 * - "/instructor-dashboard" and "/instructor/*": instructor and admin
 * - "/analytics": instructor and admin
 * - "/dashboard": student only
 * - Shared paths (/profile, /notifications, /support, /forum, /feedback, /courses, /courses/:id): all roles
 * - Student-only paths (/daily-challenge, /leagues, /study-planner, etc.): student only
 */
export const canAccessPath = (role, path) => {
  if (!path || typeof path !== "string") return false;

  const cleanPath = path.split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";

  // Public/guest entry points
  if (["/", "/login", "/register", "/forgot-password", "/verify-otp"].includes(cleanPath)) {
    return true;
  }

  // Admin routes: admin only
  if (cleanPath === "/admin" || cleanPath.startsWith("/admin/")) {
    return role === ROLES.ADMIN;
  }

  // Instructor routes and shared instructor/admin analytics
  if (
    cleanPath === "/instructor-dashboard" ||
    cleanPath.startsWith("/instructor/") ||
    cleanPath === "/analytics"
  ) {
    return role === ROLES.INSTRUCTOR || role === ROLES.ADMIN;
  }

  // Course detail paths and verification
  if (cleanPath.startsWith("/courses/") || cleanPath.startsWith("/verify/")) {
    return true;
  }

  // Shared routes
  if (SHARED_PATHS.includes(cleanPath)) {
    return true;
  }

  // Student-only routes
  if (STUDENT_ONLY_PATHS.includes(cleanPath)) {
    return role === ROLES.STUDENT;
  }

  return false;
};
