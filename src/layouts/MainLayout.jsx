import { Navbar } from "@/components/ui/Navbar";
import { Sidebar } from "@/components/ui/Sidebar";
import { useAuth } from "@/hooks/useAuth";

export function MainLayout({ children, showSidebar = true }) {
  const { user } = useAuth();
  const role = user?.role || "student";

  return (
    <div className="app-shell min-h-screen">
      <Navbar />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 pb-24 pt-24 lg:px-6 lg:pb-12">
        {showSidebar && <Sidebar role={role} />}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
