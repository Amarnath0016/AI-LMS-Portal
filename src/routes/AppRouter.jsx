import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthLayout } from "@/layouts/AuthLayout";
import { MainLayout } from "@/layouts/MainLayout";
import { PrivateRoute } from "@/routes/PrivateRoute";

import LandingPage from "@/pages/LandingPage";
import Login from "@/pages/Auth/Login";
import Register from "@/pages/Auth/Register";
import ForgotPassword from "@/pages/Auth/ForgotPassword";
import OtpVerification from "@/pages/Auth/OtpVerification";
import CourseList from "@/pages/Courses/CourseList";
import CourseDetails from "@/pages/Courses/CourseDetails";
import LeagueList from "@/pages/Leagues/LeagueList";
import StudentDashboard from "@/pages/Dashboard/StudentDashboard";
import InstructorDashboard from "@/pages/Dashboard/InstructorDashboard";
import AdminDashboard from "@/pages/Admin/AdminDashboard";
import UserManagement from "@/pages/Admin/UserManagement";
import CourseApproval from "@/pages/Admin/CourseApproval";
import AnalyticsPage from "@/pages/Analytics/AnalyticsPage";
import MentorList from "@/pages/Mentors/MentorList";

// Sub-pages imports
import ProfilePage from "@/pages/Dashboard/Profile";
import AchievementsPage from "@/pages/Dashboard/Achievements";
import LeaderboardPage from "@/pages/Dashboard/Leaderboard";
import WishlistPage from "@/pages/Dashboard/Wishlist";
import ForumPage from "@/pages/Dashboard/Forum";
import NotificationsPage from "@/pages/Dashboard/Notifications";
import CertificatesPage from "@/pages/Dashboard/Certificates";
import FeedbackPage from "@/pages/Dashboard/Feedback";
import SupportPage from "@/pages/Dashboard/Support";

// New Core Pages
import DailyChallengePage from "@/pages/DailyChallenge/DailyChallengePage";
import StudyPlannerPage from "@/pages/StudyPlanner/StudyPlannerPage";
import AchievementBadgesPage from "@/pages/AchievementBadges/AchievementBadgesPage";
import CareerOptionsPage from "@/pages/CareerOptions/CareerOptionsPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
        <Route path="/forgot-password" element={<AuthLayout><ForgotPassword /></AuthLayout>} />
        <Route path="/verify-otp" element={<AuthLayout><OtpVerification /></AuthLayout>} />

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
        
        {/* New Student Hub Routes */}
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

        {/* New Core Learning & Career Routes */}
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
    </BrowserRouter>
  );
}

