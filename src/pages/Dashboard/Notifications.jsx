import { useState } from "react";
import { useAuthContext } from "@/store/AuthContext";
import { Bell, BookOpen, Clock, Calendar, CheckCheck, Trash } from "lucide-react";
import { Button } from "@/components/common/button";
import { HeroPanel, SectionCard, EmptyState } from "@/components/ui/dashboard";

export default function NotificationsPage() {
  const { notifications, markNotificationsAsRead } = useAuthContext();
  const [filter, setFilter] = useState("All");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "Unread") return !n.read;
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case "reminder":
        return <Clock className="h-5 w-5 text-yellow-400" />;
      case "announcement":
        return <Calendar className="h-5 w-5 text-emerald-400" />;
      default:
        return <BookOpen className="h-5 w-5 text-blue-400" />;
    }
  };

  const getToneClass = (type) => {
    switch (type) {
      case "reminder":
        return "bg-yellow-500/10 border-yellow-500/20";
      case "announcement":
        return "bg-emerald-500/10 border-emerald-500/20";
      default:
        return "bg-blue-500/10 border-blue-500/20";
    }
  };

  return (
    <div className="space-y-8">
      <HeroPanel>
        <div className="flex flex-col gap-6 md:flex-row md:items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-upto-orange">Alerts</p>
            <h1 className="mt-2 text-3xl font-black text-[hsl(var(--foreground))] sm:text-4xl">Notifications</h1>
            <p className="mt-2 max-w-xl text-muted">
              Stay up to date with new course releases, assignment timelines, and server-wide milestones.
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markNotificationsAsRead} className="gap-1.5 shrink-0 self-start md:self-center">
              <CheckCheck className="h-4 w-4" /> Mark all as read
            </Button>
          )}
        </div>
      </HeroPanel>

      <div className="flex gap-2">
        {["All", "Unread"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              filter === tab
                ? "bg-upto-blue text-white"
                : "bg-[hsl(var(--surface))] text-muted hover:text-[hsl(var(--foreground))]"
            }`}
          >
            {tab} {tab === "Unread" && unreadCount > 0 && `(${unreadCount})`}
          </button>
        ))}
      </div>

      <SectionCard title={`Active Notifications (${filteredNotifications.length})`}>
        {filteredNotifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="All caught up!"
            description={
              filter === "Unread"
                ? "You have read all notifications. Switch to 'All' to view older logs."
                : "Your notifications list is empty."
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`flex items-start gap-4 rounded-xl border p-4 transition-all ${
                  notif.read
                    ? "border-[hsl(var(--border))] bg-[hsl(var(--card))]/50 opacity-70"
                    : "border-upto-blue/30 bg-upto-blue/5 shadow-sm shadow-blue-500/5"
                }`}
              >
                {/* Icon wrapper */}
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${getToneClass(notif.type)}`}>
                  {getIcon(notif.type)}
                </div>

                {/* message text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-extrabold text-[hsl(var(--foreground))] truncate">
                      {notif.title}
                    </h4>
                    {!notif.read && (
                      <span className="h-2 w-2 rounded-full bg-upto-blue animate-pulse" />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted leading-relaxed">
                    {notif.message}
                  </p>
                  <span className="mt-2 block text-[9px] font-bold text-muted uppercase">
                    {notif.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
