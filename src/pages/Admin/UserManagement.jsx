import { useState } from "react";
import { Search, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { Field, FormMessage } from "@/components/ui/form";
import { EmptyState, HeroPanel, SectionCard, StatusBadge } from "@/components/ui/dashboard";
import { DataTable } from "@/components/ui/table";
import { adminUsers } from "@/store/mockData";

export default function UserManagement() {
  const [search, setSearch] = useState("");
  const [users] = useState(adminUsers);
  const [managedUsers, setManagedUsers] = useState(users);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invite, setInvite] = useState({ name: "", email: "", role: "student" });
  const [inviteErrors, setInviteErrors] = useState({});
  const [inviteMessage, setInviteMessage] = useState(null);

  const filtered = managedUsers.filter((u) =>
    [u.name, u.email, u.role, u.status].join(" ").toLowerCase().includes(search.toLowerCase()),
  );

  const submitInvite = (event) => {
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

    const newUser = {
      id: Date.now(),
      name: invite.name.trim(),
      email: invite.email.trim(),
      role: invite.role,
      status: "Active",
      xp: 0,
    };
    setManagedUsers((current) => [newUser, ...current]);
    setInvite({ name: "", email: "", role: "student" });
    setInviteMessage({ type: "success", text: "Invite sent and user added to the table." });
    toast.success("Invite sent");
  };
  const columns = [
    {
      key: "user",
      header: "User",
      cell: (user) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg upto-gradient text-sm font-bold text-white">
            {user.name[0]}
          </div>
          <div>
            <p className="font-semibold text-[hsl(var(--foreground))]">{user.name}</p>
            <p className="text-xs text-muted">{user.email}</p>
          </div>
        </div>
      ),
    },
    { key: "role", header: "Role", cell: (user) => <span className="capitalize">{user.role}</span> },
    {
      key: "status",
      header: "Status",
      cell: (user) => <StatusBadge tone={user.status === "Active" ? "green" : "red"}>{user.status}</StatusBadge>,
    },
    { key: "xp", header: "XP", cell: (user) => <span className="font-semibold text-upto-orange">{user.xp.toLocaleString()}</span> },
    { key: "actions", header: "Actions", cell: () => <Button variant="ghost" size="sm">Edit</Button> },
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
        <SectionCard title="Invite New User" description="Send an invite and add the user to the admin table." className="mb-8">
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
            <Button type="submit" variant="gradient" className="h-11">
              Send Invite
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
        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={(user) => user.id}
          className="border-0 bg-transparent shadow-none"
          emptyState={<EmptyState icon={Users} title="No users found" description="Try adjusting the search query or invite a new user." />}
        />
      </SectionCard>
    </div>
  );
}
