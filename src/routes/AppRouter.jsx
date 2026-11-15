import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthLayout } from "@/layouts/AuthLayout";
import { MainLayout } from "@/layouts/MainLayout";
import { PrivateRoute } from "@/routes/PrivateRoute";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import RouteLoadingSkeleton from "@/components/common/LoadingSkeleton";

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

export default function AppRouter() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<RouteLoadingSkeleton />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />

            <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
            <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
            <Route path="/forgot-password" element={<AuthLayout><ForgotPassword /></AuthLayout>} />
            <Route path="/verify-otp" element={<AuthLayout><OtpVerification /></AuthLayout>} />
            <Route path="/verify/:code" element={<VerifyCertificate />} />
            <Route path="/verify" element={<VerifyCertificate />} />

            <Route
              path="/courses"
              element={
                <PrivateRoute>
                  <MainLayout><CourseList /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/leagues"
              element={
                <PrivateRoute>
                  <MainLayout><LeagueList /></MainLayout>
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
              path="/dashboard"
              element={
                <PrivateRoute>
                  <MainLayout><StudentDashboard /></MainLayout>
                </PrivateRoute>
              }
            />

            {/* Student Hub Routes */}
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <MainLayout><ProfilePage /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/achievements"
              element={
                <PrivateRoute>
                  <MainLayout><AchievementsPage /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <PrivateRoute>
                  <MainLayout><LeaderboardPage /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <PrivateRoute>
                  <MainLayout><WishlistPage /></MainLayout>
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
              path="/certificates"
              element={
                <PrivateRoute>
                  <MainLayout><CertificatesPage /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/feedback"
              element={
                <PrivateRoute>
                  <MainLayout><FeedbackPage /></MainLayout>
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

            {/* Core Learning & Career Routes */}
            <Route
              path="/daily-challenge"
              element={
                <PrivateRoute>
                  <MainLayout><DailyChallengePage /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/study-planner"
              element={
                <PrivateRoute>
                  <MainLayout><StudyPlannerPage /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/achievement-badges"
              element={
                <PrivateRoute>
                  <MainLayout><AchievementBadgesPage /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/career-options"
              element={
                <PrivateRoute>
                  <MainLayout><CareerOptionsPage /></MainLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/instructor-dashboard"
              element={
                <PrivateRoute roles={["instructor", "admin"]}>
                  <MainLayout><InstructorDashboard /></MainLayout>
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
              path="/mentors"
              element={
                <PrivateRoute>
                  <MainLayout><MentorList /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <PrivateRoute roles={["instructor", "admin"]}>
                  <MainLayout><AnalyticsPage /></MainLayout>
                </PrivateRoute>
              }
            />

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
              path="/admin/courses"
              element={
                <PrivateRoute roles={["admin"]}>
                  <MainLayout><CourseApproval /></MainLayout>
                </PrivateRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
