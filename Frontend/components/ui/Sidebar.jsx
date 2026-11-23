import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  GraduationCap,
  Shield,
  Star,
  Zap,
  Award,
  Trophy,
  TrendingUp,
  Heart,
  MessageCircle,
  Bell,
  FileCheck,
  MessageSquare,
  HelpCircle,
  UserRound,
  Flame,
  CalendarDays,
  Briefcase,
  CreditCard,
} from "lucide-react";
import { cn } from "@/utils";

const studentSections = [
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
];

const instructorLinks = [
  { to: "/instructor-dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/courses", label: "My Courses", icon: GraduationCap },
  { to: "/analytics", label: "Analytics", icon: Star },
];

const adminLinks = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/courses", label: "Course Approval", icon: Shield },
  { to: "/analytics", label: "Analytics", icon: Star },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ role = "student" }) {
  const isStudent = role === "student";
  const flatLinks =
    role === "admin" ? adminLinks : role === "instructor" ? instructorLinks : studentSections.flatMap(s => s.links);

  return (
    <>
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="app-card sticky top-24 rounded-lg p-4 max-h-[85vh] overflow-y-auto">
          <p className="mb-4 px-3 text-xs font-bold uppercase tracking-widest text-muted">
            {role === "admin" ? "Admin Panel" : role === "instructor" ? "Instructor" : "Student Hub"}
          </p>

          {isStudent ? (
            <div className="space-y-6">
              {studentSections.map((section) => (
                <div key={section.title}>
                  <h4 className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted/80">
                    {section.title}
                  </h4>
                  <nav className="space-y-1">
                    {section.links.map(({ to, label, icon: Icon }) => (
                      <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold transition-all",
                            isActive
                              ? "bg-upto-blue text-white shadow-md shadow-blue-500/10"
                              : "text-muted hover:bg-[hsl(var(--surface))] hover:text-[hsl(var(--foreground))]",
                          )
                        }
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {label}
                      </NavLink>
                    ))}
                  </nav>
                </div>
              ))}
            </div>
          ) : (
            <nav className="space-y-1">
              {flatLinks.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                      isActive
                        ? "bg-upto-blue text-white shadow-lg shadow-blue-500/20"
                        : "text-muted hover:bg-[hsl(var(--surface))] hover:text-[hsl(var(--foreground))]",
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </nav>
          )}

          <div className="mt-5 rounded-lg bg-[hsl(var(--surface))] p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted">
              <Zap className="h-3.5 w-3.5 text-upto-orange" />
              Live Status
            </div>
            <p className="mt-2 text-sm font-semibold text-[hsl(var(--foreground))]">
              {role === "admin"
                ? "12 reviews queued"
                : role === "instructor"
                ? "38 new submissions"
                : "Continuous Learning Active"}
            </p>
          </div>
        </div>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-4 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]/95 px-2 py-2 backdrop-blur-xl lg:hidden">
        {(isStudent
          ? [
              { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
              { to: "/courses", label: "Catalog", icon: GraduationCap },
              { to: "/leagues", label: "Leagues", icon: Trophy },
              { to: "/profile", label: "Profile", icon: UserRound },
            ]
          : flatLinks.slice(0, 4)
        ).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-bold text-center",
                isActive ? "bg-upto-blue/15 text-upto-blue" : "text-muted",
              )
            }
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}

