import { useState, useMemo } from "react";
import { Search, UserPlus, Users, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { Field, FormMessage } from "@/components/ui/form";
import { EmptyState, HeroPanel, SectionCard, StatusBadge } from "@/components/ui/dashboard";
import { DataTable } from "@/components/ui/table";
import { adminApi } from "@/api/endpoints";
import { useApiQuery } from "@/hooks/useApi";

export default function UserManagement() {
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invite, setInvite] = useState({ name: "", email: "", role: "student" });
  const [inviteErrors, setInviteErrors] = useState({});
  const [inviteMessage, setInviteMessage] = useState(null);
  const [inviting, setInviting] = useState(false);

  const {
    data: usersData,
    loading,
    error,
    refetch,
    isEmpty,
  } = useApiQuery(() => adminApi.getUsers(), []);

  const users = useMemo(() => {
    return Array.isArray(usersData) ? usersData : usersData?.data || [];
  }, [usersData]);

  const filtered = useMemo(() => {
    return users.filter((u) =>
      [u.name, u.email, u.role, u.status].join(" ").toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const submitInvite = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!invite.name.trim()) nextErrors.name = "Enter the user's name.";
    if (!invite.email.includes("@")) nextErrors.email = "Enter a valid email.";
    setInviteErrors(nextErrors);
    setInviteMessage(null);
    if (Object.keys(nextErrors).length) {
      setInviteMessage({ type: "error", text: "Please fix the invite details." });
      return;
    }

    setInviting(true);
    try {
      await adminApi.inviteUser({
        name: invite.name.trim(),
        email: invite.email.trim(),
        role: invite.role,
      });
      setInvite({ name: "", email: "", role: "student" });
      setInviteMessage({ type: "success", text: "Invite sent and user added to the database." });
      toast.success("User invited successfully!");
      refetch();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setInviteMessage({ type: "error", text: msg });
      toast.error("Failed to invite user: " + msg);
    } finally {
      setInviting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const id = user._id || user.id;
    const newStatus = user.status === "Active" ? "Inactive" : "Active";
    try {
      await adminApi.updateUserStatus(id, { status: newStatus });
      toast.success(`User marked as ${newStatus}`);
      refetch();
    } catch (err) {
      toast.error("Failed to update status: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteUser = async (user) => {
    const id = user._id || user.id;
    if (!window.confirm(`Are you sure you want to remove ${user.name}?`)) return;
    try {
      await adminApi.deleteUser(id);
      toast.success("User removed successfully");
      refetch();
    } catch (err) {
      toast.error("Failed to delete user: " + (err.response?.data?.message || err.message));
    }
  };

  const columns = [
    {
      key: "user",
      header: "User",
      cell: (user) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg upto-gradient text-sm font-bold text-white">
            {user.avatar || user.name[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="font-semibold text-[hsl(var(--foreground))]">{user.name}</p>
            <p className="text-xs text-muted">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      cell: (user) => <span className="capitalize">{user.role || "student"}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (user) => (
        <button
          onClick={() => handleToggleStatus(user)}
          title="Click to toggle status"
          className="cursor-pointer"
        >
          <StatusBadge tone={user.status === "Active" ? "green" : "red"}>
            {user.status || "Active"}
          </StatusBadge>
        </button>
      ),
    },
    {
      key: "xp",
      header: "XP",
      cell: (user) => (
        <span className="font-semibold text-upto-orange">
          {(user.xp || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (user) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleStatus(user)}
            className="text-xs text-muted hover:text-[hsl(var(--foreground))]"
          >
            Toggle
          </Button>
          <button
            onClick={() => handleDeleteUser(user)}
            className="text-red-400 hover:text-red-600 p-1.5 rounded transition-colors"
            title="Delete user"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <HeroPanel>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-upto-blue">Admin</p>
            <h1 className="mt-2 text-3xl font-black text-[hsl(var(--foreground))] sm:text-4xl">User Management</h1>
            <p className="mt-2 text-muted">Manage learners, instructors, subscriptions, and role-based access.</p>
          </div>
          <Button variant="gradient" onClick={() => setInviteOpen((open) => !open)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite User
          </Button>
        </div>
      </HeroPanel>

      {inviteOpen && (
        <SectionCard title="Invite New User" description="Send an invite and add the user to the admin database." className="mb-8">
          <form onSubmit={submitInvite} className="grid gap-4 lg:grid-cols-[1fr_1fr_180px_auto] lg:items-end">
            {inviteMessage && (
              <div className="lg:col-span-4">
                <FormMessage type={inviteMessage.type}>{inviteMessage.text}</FormMessage>
              </div>
            )}
            <Field
              id="invite-name"
              label="Full Name"
              placeholder="User name"
              value={invite.name}
              onChange={(event) => setInvite((current) => ({ ...current, name: event.target.value }))}
              error={inviteErrors.name}
            />
            <Field
              id="invite-email"
              label="Email"
              type="email"
              placeholder="user@example.com"
              value={invite.email}
              onChange={(event) => setInvite((current) => ({ ...current, email: event.target.value }))}
              error={inviteErrors.email}
            />
            <div>
              <label className="text-sm font-semibold text-[hsl(var(--foreground))]" htmlFor="invite-role">Role</label>
              <select
                id="invite-role"
                value={invite.role}
                onChange={(event) => setInvite((current) => ({ ...current, role: event.target.value }))}
                className="mt-2 h-11 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 text-sm text-[hsl(var(--foreground))] outline-none focus:ring-2 focus:ring-upto-blue"
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Button type="submit" variant="gradient" disabled={inviting} className="h-11">
              {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Invite"}
            </Button>
          </form>
        </SectionCard>
      )}

      <SectionCard
        title={`All Users (${filtered.length})`}
        action={
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        }
      >
        {loading && (
          <div className="flex h-48 flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-upto-blue" />
            <p className="text-sm text-muted">Loading users from database...</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center my-4">
            <AlertCircle className="mx-auto h-6 w-6 text-red-400 mb-1" />
            <p className="text-xs font-semibold text-red-300">Failed to load users: {error}</p>
            <Button variant="outline" size="sm" className="mt-2 text-xs" onClick={refetch}>
              Retry
            </Button>
          </div>
        )}

        {!loading && !error && (
          <DataTable
            columns={columns}
            rows={filtered}
            getRowKey={(user) => user._id || user.id}
            className="border-0 bg-transparent shadow-none"
            emptyState={<EmptyState icon={Users} title="No users found" description="Try adjusting the search query or invite a new user." />}
          />
        )}
      </SectionCard>
    </div>
  );
}
