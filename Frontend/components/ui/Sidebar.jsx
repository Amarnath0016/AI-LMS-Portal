import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Zap } from "lucide-react";
import { cn } from "@/utils";
import { useAuth } from "@/hooks/useAuth";
import { getNavigationForRole } from "@/config/navigation";
import { courseApi, adminApi, instructorApi } from "@/api/endpoints";

export function Sidebar({ role: roleProp }) {
  const { user } = useAuth();
  const role = roleProp || user?.role || "student";
  const { sidebarTitle, sidebarSections, mobileNav } = getNavigationForRole(role);

  const [badges, setBadges] = useState({
    pendingCourses: 0,
    pendingApplications: 0,
  });

  const [liveStatusText, setLiveStatusText] = useState("");

  useEffect(() => {
    let isMounted = true;

    if (role === "admin") {
      Promise.allSettled([
        courseApi.getAll(),
        adminApi.getInstructorApplications(),
      ]).then(([coursesRes, appsRes]) => {
        if (!isMounted) return;
        let pendingCourses = 0;
        let pendingApplications = 0;

        if (coursesRes.status === "fulfilled") {
          const list = Array.isArray(coursesRes.value?.data)
            ? coursesRes.value.data
            : coursesRes.value?.data?.data || [];
          pendingCourses = list.filter((c) => c.status === "pending").length;
        }

        if (appsRes.status === "fulfilled") {
          const list = Array.isArray(appsRes.value?.data)
            ? appsRes.value.data
            : appsRes.value?.data?.data || [];
          pendingApplications = list.filter((a) => (a.status || "pending") === "pending").length;
        }

        setBadges({ pendingCourses, pendingApplications });
        const totalPending = pendingCourses + pendingApplications;
        if (totalPending > 0) {
          setLiveStatusText(`${pendingCourses} courses & ${pendingApplications} apps pending`);
        } else {
          setLiveStatusText("All reviews caught up");
        }
      });
    } else if (role === "instructor") {
      instructorApi
        .getDashboard()
        .then((res) => {
          if (!isMounted) return;
          const data = res?.data?.data || res?.data || {};
          const drafts = data.draftCourses || 0;
          const pending = data.pendingCourses || 0;
          if (drafts > 0 || pending > 0) {
            setLiveStatusText(`${drafts} draft · ${pending} in review`);
          } else {
            setLiveStatusText("Curriculum Live & Active");
          }
        })
        .catch(() => {
          if (isMounted) setLiveStatusText("Teaching Studio Ready");
        });
    } else {
      const streak = user?.streak ?? user?.gamification?.streak ?? 1;
      const xp = user?.xp ?? user?.gamification?.xp ?? 150;
      setLiveStatusText(`${streak} day streak · ${xp} XP`);
    }

    return () => {
      isMounted = false;
    };
  }, [role, user]);

  return (
    <>
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="app-card sticky top-24 rounded-lg p-4 max-h-[85vh] overflow-y-auto">
          <p className="mb-4 px-3 text-xs font-bold uppercase tracking-widest text-muted">
            {sidebarTitle}
          </p>

          <div className="space-y-6">
            {sidebarSections.map((section) => (
              <div key={section.title}>
                <h4 className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted/80">
                  {section.title}
                </h4>
                <nav className="space-y-1">
                  {section.links.map(({ to, label, icon: Icon, badgeKey }) => {
                    const badgeCount = badgeKey ? badges[badgeKey] : 0;
                    return (
                      <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all",
                            isActive
                              ? "bg-upto-blue text-white shadow-md shadow-blue-500/10"
                              : "text-muted hover:bg-[hsl(var(--surface))] hover:text-[hsl(var(--foreground))]"
                          )
                        }
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="h-4 w-4 shrink-0" />
                          <span>{label}</span>
                        </span>
                        {badgeCount > 0 && (
                          <span className="ml-2 rounded-full bg-upto-orange/20 px-1.5 py-0.5 text-[10px] font-black text-upto-orange">
                            {badgeCount}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-lg bg-[hsl(var(--surface))] p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted">
              <Zap className="h-3.5 w-3.5 text-upto-orange" />
              Live Status
            </div>
            <p className="mt-2 text-sm font-semibold text-[hsl(var(--foreground))]">
              {liveStatusText || "System Online"}
            </p>
          </div>
        </div>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-4 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]/95 px-2 py-2 backdrop-blur-xl lg:hidden">
        {mobileNav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-bold text-center",
                isActive ? "bg-upto-blue/15 text-upto-blue" : "text-muted"
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
