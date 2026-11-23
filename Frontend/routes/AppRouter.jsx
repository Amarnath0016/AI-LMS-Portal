import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthLayout } from "@/layouts/AuthLayout";
import { MainLayout } from "@/layouts/MainLayout";
import { PrivateRoute } from "@/routes/PrivateRoute";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import RouteLoadingSkeleton from "@/components/common/LoadingSkeleton";
import { useAuth } from "@/hooks/useAuth";
import { getHomePath } from "@/config/navigation";

// Route-Level Code Splitting (React.lazy)
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const Login = lazy(() => import("@/pages/Auth/Login"));
const Register = lazy(() => import("@/pages/Auth/Register"));
const ForgotPassword = lazy(() => import("@/pages/Auth/ForgotPassword"));
const OtpVerification = lazy(() => import("@/pages/Auth/OtpVerification"));
const CourseList = lazy(() => import("@/pages/Courses/CourseList"));
const CourseDetails = lazy(() => import("@/pages/Courses/CourseDetails"));
const LeagueList = lazy(() => import("@/pages/Leagues/LeagueList"));
const StudentDashboard = lazy(() => import("@/pages/Dashboard/StudentDashboard"));
const InstructorDashboard = lazy(() => import("@/pages/Dashboard/InstructorDashboard"));
const AdminDashboard = lazy(() => import("@/pages/Admin/AdminDashboard"));
const UserManagement = lazy(() => import("@/pages/Admin/UserManagement"));
const CourseApproval = lazy(() => import("@/pages/Admin/CourseApproval"));
const AnalyticsPage = lazy(() => import("@/pages/Analytics/AnalyticsPage"));
const MentorList = lazy(() => import("@/pages/Mentors/MentorList"));

// Sub-pages lazy imports
const ProfilePage = lazy(() => import("@/pages/Dashboard/Profile"));
const AchievementsPage = lazy(() => import("@/pages/Dashboard/Achievements"));
const LeaderboardPage = lazy(() => import("@/pages/Dashboard/Leaderboard"));
const WishlistPage = lazy(() => import("@/pages/Dashboard/Wishlist"));
const ForumPage = lazy(() => import("@/pages/Dashboard/Forum"));
const NotificationsPage = lazy(() => import("@/pages/Dashboard/Notifications"));
const CertificatesPage = lazy(() => import("@/pages/Dashboard/Certificates"));
const FeedbackPage = lazy(() => import("@/pages/Dashboard/Feedback"));
const SupportPage = lazy(() => import("@/pages/Dashboard/Support"));

// Core Learning & Career Pages lazy imports
const DailyChallengePage = lazy(() => import("@/pages/DailyChallenge/DailyChallengePage"));
const StudyPlannerPage = lazy(() => import("@/pages/StudyPlanner/StudyPlannerPage"));
const AchievementBadgesPage = lazy(() => import("@/pages/AchievementBadges/AchievementBadgesPage"));
const CareerOptionsPage = lazy(() => import("@/pages/CareerOptions/CareerOptionsPage"));
const VerifyCertificate = lazy(() => import("@/pages/Certificates/VerifyCertificate"));
const CourseBuilder = lazy(() => import("@/pages/Instructor/CourseBuilder"));
const SubscriptionPage = lazy(() => import("@/pages/Subscription/SubscriptionPage"));
const MySubscriptionsPage = lazy(() => import("@/pages/Subscription/MySubscriptionsPage"));

// New Instructor Pages
const InstructorMyCourses = lazy(() => import("@/pages/Instructor/MyCourses"));
const InstructorAssessments = lazy(() => import("@/pages/Instructor/QuizzesAndChallenges"));
const InstructorStudents = lazy(() => import("@/pages/Instructor/StudentProgress"));
const InstructorReviews = lazy(() => import("@/pages/Instructor/ReviewsAndRatings"));
const InstructorEarnings = lazy(() => import("@/pages/Instructor/Earnings"));

// New Admin Pages
const InstructorApplications = lazy(() => import("@/pages/Admin/InstructorApplications"));
const AdminAIMentors = lazy(() => import("@/pages/Admin/AIMentors"));
const AdminForumModeration = lazy(() => import("@/pages/Admin/ForumModeration"));
const AdminSubscriptionPlans = lazy(() => import("@/pages/Admin/SubscriptionPlans"));
const AdminSubscriptionsList = lazy(() => import("@/pages/Admin/SubscriptionsList"));
const AdminSettings = lazy(() => import("@/pages/Admin/AdminSettings"));

function DashboardRoute() {
  const { user } = useAuth();
  if (user?.role === "instructor") {
    return <Navigate to="/instructor-dashboard" replace />;
  }
  if (user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }
  return (
    <MainLayout>
      <StudentDashboard />
    </MainLayout>
  );
}

function WildcardRoute() {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated && user) {
    return <Navigate to={getHomePath(user.role)} replace />;
  }
  return <Navigate to="/" replace />;
}

export default function AppRouter() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<RouteLoadingSkeleton />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
            <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
            <Route path="/forgot-password" element={<AuthLayout><ForgotPassword /></AuthLayout>} />
            <Route path="/verify-otp" element={<AuthLayout><OtpVerification /></AuthLayout>} />
            <Route path="/verify/:code" element={<VerifyCertificate />} />
            <Route path="/verify" element={<VerifyCertificate />} />

            {/* Catalog & Course Viewing (Shared / Accessible) */}
            <Route
              path="/courses"
              element={
                <PrivateRoute>
                  <MainLayout><CourseList /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/courses/:id"
              element={
                <PrivateRoute>
                  <MainLayout showSidebar={false}><CourseDetails /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/mentors"
              element={
                <PrivateRoute>
                  <MainLayout><MentorList /></MainLayout>
                </PrivateRoute>
              }
            />

            {/* Student-Only Learning & Career Routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute roles={["student"]}>
                  <DashboardRoute />
                </PrivateRoute>
              }
            />
            <Route
              path="/daily-challenge"
              element={
                <PrivateRoute roles={["student"]}>
                  <MainLayout><DailyChallengePage /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/leagues"
              element={
                <PrivateRoute roles={["student"]}>
                  <MainLayout><LeagueList /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <PrivateRoute roles={["student"]}>
                  <MainLayout><LeaderboardPage /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/subscriptions"
              element={
                <PrivateRoute roles={["student"]}>
                  <MainLayout><MySubscriptionsPage /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/subscribe"
              element={
                <PrivateRoute roles={["student"]}>
                  <MainLayout><SubscriptionPage /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/my-subscriptions"
              element={<Navigate to="/subscriptions" replace />}
            />
            <Route
              path="/study-planner"
              element={
                <PrivateRoute roles={["student"]}>
                  <MainLayout><StudyPlannerPage /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/achievement-badges"
              element={
                <PrivateRoute roles={["student"]}>
                  <MainLayout><AchievementBadgesPage /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/achievements"
              element={
                <PrivateRoute roles={["student"]}>
                  <MainLayout><AchievementsPage /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/career-options"
              element={
                <PrivateRoute roles={["student"]}>
                  <MainLayout><CareerOptionsPage /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <PrivateRoute roles={["student"]}>
                  <MainLayout><WishlistPage /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/certificates"
              element={
                <PrivateRoute roles={["student"]}>
                  <MainLayout><CertificatesPage /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/feedback"
              element={
                <PrivateRoute roles={["student"]}>
                  <MainLayout><FeedbackPage /></MainLayout>
                </PrivateRoute>
              }
            />

            {/* Shared Authenticated Routes (All Roles) */}
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <MainLayout><ProfilePage /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/forum"
              element={
                <PrivateRoute>
                  <MainLayout><ForumPage /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <PrivateRoute>
                  <MainLayout><NotificationsPage /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/support"
              element={
                <PrivateRoute>
                  <MainLayout><SupportPage /></MainLayout>
                </PrivateRoute>
              }
            />

            {/* Analytics Route (Instructor + Admin) */}
            <Route
              path="/analytics"
              element={
                <PrivateRoute roles={["instructor", "admin"]}>
                  <MainLayout><AnalyticsPage /></MainLayout>
                </PrivateRoute>
              }
            />

            {/* Instructor Routes */}
            <Route
              path="/instructor-dashboard"
              element={
                <PrivateRoute roles={["instructor", "admin"]}>
                  <MainLayout><InstructorDashboard /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/instructor/courses"
              element={
                <PrivateRoute roles={["instructor", "admin"]}>
                  <MainLayout><InstructorMyCourses /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/instructor/builder/:id?"
              element={
                <PrivateRoute roles={["instructor", "admin"]}>
                  <MainLayout><CourseBuilder /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/instructor/assessments"
              element={
                <PrivateRoute roles={["instructor", "admin"]}>
                  <MainLayout><InstructorAssessments /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/instructor/students"
              element={
                <PrivateRoute roles={["instructor", "admin"]}>
                  <MainLayout><InstructorStudents /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/instructor/reviews"
              element={
                <PrivateRoute roles={["instructor", "admin"]}>
                  <MainLayout><InstructorReviews /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/instructor/earnings"
              element={
                <PrivateRoute roles={["instructor", "admin"]}>
                  <MainLayout><InstructorEarnings /></MainLayout>
                </PrivateRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <PrivateRoute roles={["admin"]}>
                  <MainLayout><AdminDashboard /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <PrivateRoute roles={["admin"]}>
                  <MainLayout><UserManagement /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/instructor-applications"
              element={
                <PrivateRoute roles={["admin"]}>
                  <MainLayout><InstructorApplications /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/courses"
              element={
                <PrivateRoute roles={["admin"]}>
                  <MainLayout><CourseApproval /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/mentors"
              element={
                <PrivateRoute roles={["admin"]}>
                  <MainLayout><AdminAIMentors /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/forum"
              element={
                <PrivateRoute roles={["admin"]}>
                  <MainLayout><AdminForumModeration /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/plans"
              element={
                <PrivateRoute roles={["admin"]}>
                  <MainLayout><AdminSubscriptionPlans /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/subscriptions"
              element={
                <PrivateRoute roles={["admin"]}>
                  <MainLayout><AdminSubscriptionsList /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <PrivateRoute roles={["admin"]}>
                  <MainLayout><AdminSettings /></MainLayout>
                </PrivateRoute>
              }
            />

            {/* Wildcard Fallback */}
            <Route path="*" element={<WildcardRoute />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
