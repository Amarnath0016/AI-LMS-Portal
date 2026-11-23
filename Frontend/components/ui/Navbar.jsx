import { useState, useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Bell, Menu, Moon, Sun, Trophy, LogOut, X, Heart } from "lucide-react";
import { Button } from "@/components/common/button";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { useAuth } from "@/hooks/useAuth";
import { useAuthContext } from "@/store/AuthContext";
import { useWishlist } from "@/hooks/useWishlist";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Courses", to: "/courses" },
  { label: "Leagues", to: "/leagues" },
  { label: "Dashboard", to: "/dashboard" },
  { label: "Mentors", to: "/mentors" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    "New Python League lesson unlocked",
    "Your dashboard data refreshed",
  ]);
  const { isAuthenticated } = useAuth();
  const { logout, theme, toggleTheme } = useAuthContext();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    const timer = setInterval(() => {
      setNotifications((current) => [
        `Live update: ${Math.floor(Math.random() * 12) + 1} learners active now`,
        ...current,
      ].slice(0, 5));
    }, 12000);
    return () => clearInterval(timer);
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleMyXp = () => {
    navigate("/dashboard", { state: { focusXp: true, from: location.pathname } });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/95 shadow-sm backdrop-blur-xl"
          : "bg-[hsl(var(--background))]/80 backdrop-blur-xl"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
        <BrandLogo />

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[hsl(var(--surface))] text-[hsl(var(--foreground))]"
                    : "text-muted hover:bg-[hsl(var(--surface))] hover:text-[hsl(var(--foreground))]"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Saved courses"
                title="My Wishlist"
                onClick={() => navigate("/wishlist")}
                className="relative"
              >
                <Heart className={`h-4 w-4 ${wishlistCount > 0 ? "fill-red-500 text-red-500" : ""}`} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                    {wishlistCount > 9 ? "9+" : wishlistCount}
                  </span>
                )}
              </Button>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Live notifications"
                  onClick={() => setNotificationsOpen((open) => !open)}
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-upto-orange" />
                </Button>
                {notificationsOpen && (
                  <div className="app-card absolute right-0 mt-3 w-80 rounded-lg p-3 shadow-2xl">
                    <div className="mb-2 flex items-center justify-between px-2">
                      <p className="text-sm font-bold text-[hsl(var(--foreground))]">Live Notifications</p>
                      <span className="rounded-full bg-upto-blue/10 px-2 py-0.5 text-xs font-bold text-upto-blue">
                        {notifications.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {notifications.map((note) => (
                        <div key={note} className="rounded-lg bg-[hsl(var(--surface))] px-3 py-2 text-sm text-[hsl(var(--foreground))]">
                          {note}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggleTheme}>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleMyXp}>
                <Trophy className="mr-1.5 h-4 w-4 text-upto-orange" />
                My XP
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-1.5 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggleTheme}>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                Sign In
              </Button>
              <Button variant="gradient" size="sm" onClick={() => navigate("/register")}>
                Start Journey
              </Button>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-muted hover:bg-[hsl(var(--surface))] md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Open menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background))]/98 px-4 py-4 md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-4 py-3 text-sm font-medium text-muted hover:bg-[hsl(var(--surface))] hover:text-[hsl(var(--foreground))]"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-3 flex flex-col gap-2 border-t border-[hsl(var(--border))] pt-3">
            <Button variant="ghost" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </Button>
            {isAuthenticated ? (
              <>
                <Link
                  to="/wishlist"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium text-muted hover:bg-[hsl(var(--surface))] hover:text-[hsl(var(--foreground))]"
                >
                  <span className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                    My Wishlist
                  </span>
                  {wishlistCount > 0 && (
                    <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-bold text-red-400">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/login")}>Sign In</Button>
                <Button variant="gradient" onClick={() => navigate("/register")}>Start Journey</Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
