import {
  LayoutDashboard,
  Flame,
  GraduationCap,
  Trophy,
  Star,
  TrendingUp,
  UserRound,
  CreditCard,
  CalendarDays,
  Award,
  Briefcase,
  Heart,
  FileCheck,
  MessageCircle,
  Bell,
  MessageSquare,
  HelpCircle,
  FolderPlus,
  CheckSquare,
  Users,
  DollarSign,
  UserCheck,
  ShieldCheck,
  Receipt,
  Settings,
} from "lucide-react";
import { ROLE_HOME, getHomePath } from "@/utils/roleRedirect";

export { getHomePath };

export const navigationConfig = {
  student: {
    homePath: ROLE_HOME.student,
    sidebarTitle: "Student Hub",
    sidebarSections: [
      {
        title: "Student Hub",
        links: [
          { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
          { to: "/daily-challenge", label: "Daily Challenge", icon: Flame },
          { to: "/courses", label: "Course Catalog", icon: GraduationCap },
          { to: "/leagues", label: "My Leagues", icon: Trophy },
          { to: "/mentors", label: "AI Mentors", icon: Star },
          { to: "/leaderboard", label: "Leaderboard", icon: TrendingUp },
        ],
      },
      {
        title: "My Learning & Goals",
        links: [
          { to: "/profile", label: "Profile", icon: UserRound },
          { to: "/subscriptions", label: "My Subscriptions", icon: CreditCard },
          { to: "/study-planner", label: "Study Planner", icon: CalendarDays },
          { to: "/achievement-badges", label: "Achievement Badges", icon: Award },
          { to: "/career-options", label: "Career Options", icon: Briefcase },
          { to: "/wishlist", label: "Wishlist", icon: Heart },
          { to: "/certificates", label: "Certificates", icon: FileCheck },
        ],
      },
      {
        title: "Community & Support",
        links: [
          { to: "/forum", label: "Discussions", icon: MessageCircle },
          { to: "/notifications", label: "Notifications", icon: Bell },
          { to: "/feedback", label: "Feedback", icon: MessageSquare },
          { to: "/support", label: "Help & Support", icon: HelpCircle },
        ],
      },
    ],
    topNav: [
      { label: "Home", to: "/" },
      { label: "Courses", to: "/courses" },
      { label: "Subscriptions", to: "/subscriptions" },
      { label: "Leagues", to: "/leagues" },
      { label: "Dashboard", to: "/dashboard" },
      { label: "Mentors", to: "/mentors" },
    ],
    mobileNav: [
      { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { to: "/courses", label: "Catalog", icon: GraduationCap },
      { to: "/leagues", label: "Leagues", icon: Trophy },
      { to: "/profile", label: "Profile", icon: UserRound },
    ],
  },

  instructor: {
    homePath: ROLE_HOME.instructor,
    sidebarTitle: "Instructor Studio",
    sidebarSections: [
      {
        title: "Teaching",
        links: [
          { to: "/instructor-dashboard", label: "Overview", icon: LayoutDashboard },
          { to: "/instructor/courses", label: "My Courses", icon: GraduationCap },
          { to: "/instructor/builder", label: "Create Course", icon: FolderPlus },
          { to: "/instructor/assessments", label: "Quizzes & Challenges", icon: CheckSquare },
        ],
      },
      {
        title: "Students & Insights",
        links: [
          { to: "/analytics", label: "Analytics", icon: TrendingUp },
          { to: "/instructor/students", label: "Student Progress", icon: Users },
          { to: "/instructor/reviews", label: "Reviews & Ratings", icon: Star },
          { to: "/instructor/earnings", label: "Earnings", icon: DollarSign },
        ],
      },
      {
        title: "Community & Account",
        links: [
          { to: "/forum", label: "Discussions", icon: MessageCircle },
          { to: "/notifications", label: "Notifications", icon: Bell },
          { to: "/profile", label: "Profile", icon: UserRound },
          { to: "/support", label: "Help & Support", icon: HelpCircle },
        ],
      },
    ],
    topNav: [
      { label: "Dashboard", to: "/instructor-dashboard" },
      { label: "My Courses", to: "/instructor/courses" },
      { label: "Analytics", to: "/analytics" },
      { label: "Discussions", to: "/forum" },
    ],
    mobileNav: [
      { to: "/instructor-dashboard", label: "Overview", icon: LayoutDashboard },
      { to: "/instructor/courses", label: "My Courses", icon: GraduationCap },
      { to: "/analytics", label: "Analytics", icon: TrendingUp },
      { to: "/profile", label: "Profile", icon: UserRound },
    ],
  },

  admin: {
    homePath: ROLE_HOME.admin,
    sidebarTitle: "Admin Panel",
    sidebarSections: [
      {
        title: "Overview",
        links: [
          { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
          { to: "/analytics", label: "Analytics", icon: TrendingUp },
        ],
      },
      {
        title: "User Management",
        links: [
          { to: "/admin/users", label: "Users", icon: Users },
          {
            to: "/admin/instructor-applications",
            label: "Instructor Applications",
            icon: UserCheck,
            badgeKey: "pendingApplications",
          },
        ],
      },
      {
        title: "Content Management",
        links: [
          {
            to: "/admin/courses",
            label: "Course Approval",
            icon: ShieldCheck,
            badgeKey: "pendingCourses",
          },
          { to: "/admin/mentors", label: "AI Mentors", icon: Star },
          { to: "/admin/forum", label: "Forum Moderation", icon: MessageSquare },
        ],
      },
      {
        title: "Billing",
        links: [
          { to: "/admin/plans", label: "Subscription Plans", icon: CreditCard },
          { to: "/admin/subscriptions", label: "Subscriptions", icon: Receipt },
        ],
      },
      {
        title: "System",
        links: [
          { to: "/notifications", label: "Notifications", icon: Bell },
          { to: "/admin/settings", label: "Settings", icon: Settings },
          { to: "/support", label: "Help & Support", icon: HelpCircle },
        ],
      },
    ],
    topNav: [
      { label: "Dashboard", to: "/admin" },
      { label: "Users", to: "/admin/users" },
      { label: "Courses", to: "/admin/courses" },
      { label: "Analytics", to: "/analytics" },
    ],
    mobileNav: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { to: "/admin/users", label: "Users", icon: Users },
      { to: "/admin/courses", label: "Courses", icon: ShieldCheck },
      { to: "/analytics", label: "Analytics", icon: TrendingUp },
    ],
  },
};

export const publicTopNav = [
  { label: "Home", to: "/" },
  { label: "Courses", to: "/courses" },
];

export function getNavigationForRole(role) {
  return navigationConfig[role] || navigationConfig.student;
}

export default navigationConfig;
