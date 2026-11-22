import { useState } from "react";
import { useAuthContext } from "@/store/AuthContext";
import { UserRound, Mail, Phone, MapPin, GraduationCap, Edit, Plus, X, Check, Save } from "lucide-react";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { HeroPanel, SectionCard } from "@/components/ui/dashboard";

const availableAvatars = [
  { code: "AY", name: "Amarnath Yadav", bg: "from-blue-600 to-indigo-600" },
  { code: "SC", name: "Shailesh", bg: "from-blue-600 to-indigo-600" },
  { code: "AV", name: "Alex Vance", bg: "from-slate-800 to-slate-900" },
  { code: "SR", name: "Sid Rao", bg: "from-blue-900 to-cyan-900" },
  { code: "EM", name: "Elena Montague", bg: "from-orange-800 to-red-800" },
  { code: "KJ", name: "Kai Jensen", bg: "from-emerald-800 to-green-900" },
  { code: "VM", name: "Vik Malhotra", bg: "from-rose-800 to-red-950" },
  { code: "AL", name: "Ada Lovelace", bg: "from-purple-900 to-indigo-950" },
];

export default function ProfilePage() {
  const { user, updateProfile } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: user?.location || "",
    bio: user?.bio || "",
    education: user?.education || "",
    avatar: user?.avatar || "SC",
    preferences: user?.preferences || {
      pace: "Moderate",
      delivery: "Visual",
      dailyGoal: 2,
      timezone: "IST (UTC+5:30)",
    },
  });

  const [skills, setSkills] = useState(user?.skills || []);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState("Beginner");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePreferenceChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, [key]: value },
    }));
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    if (skills.some((s) => s.name.toLowerCase() === newSkillName.trim().toLowerCase())) {
      setNewSkillName("");
      return;
    }
    const updatedSkills = [...skills, { name: newSkillName.trim(), level: newSkillLevel }];
    setSkills(updatedSkills);
    setNewSkillName("");
  };

  const handleRemoveSkill = (skillName) => {
    const updated = skills.filter((s) => s.name !== skillName);
    setSkills(updated);
  };

  const handleSave = () => {
    updateProfile({
      ...formData,
      skills: skills,
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-8">
      <HeroPanel>
        <div className="flex flex-col gap-6 md:flex-row md:items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-upto-blue to-upto-orange text-2xl font-black text-white shadow-lg ring-4 ring-upto-blue/30">
                {formData.avatar}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-upto-orange">Student Profile</p>
              <h1 className="mt-1 text-2xl font-black text-[hsl(var(--foreground))] sm:text-3xl">
                {user?.name || "Learner Profile"}
              </h1>
              <p className="text-sm text-muted">XP Points: <span className="font-extrabold text-upto-blue">{user?.xp?.toLocaleString()}</span></p>
            </div>
          </div>
          <Button
            variant={isEditing ? "outline" : "gradient"}
            onClick={() => {
              if (isEditing) handleSave();
              else setIsEditing(true);
            }}
            className="gap-2"
          >
            {isEditing ? (
              <>
                <Save className="h-4 w-4" /> Save Details
              </>
            ) : (
              <>
                <Edit className="h-4 w-4" /> Edit Profile
              </>
            )}
          </Button>
        </div>
      </HeroPanel>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Personal Details */}
        <div className="lg:col-span-2 space-y-8">
          <SectionCard
            title="Personal Details"
            description="Manage your contact info, location, and professional summary."
          >
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted">Full Name</label>
                    <Input name="name" value={formData.name} onChange={handleInputChange} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted">Email Address</label>
                    <Input name="email" value={formData.email} onChange={handleInputChange} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted">Phone Number</label>
                    <Input name="phone" value={formData.phone} onChange={handleInputChange} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted">Location</label>
                    <Input name="location" value={formData.location} onChange={handleInputChange} className="mt-1" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted">Education</label>
                  <Input name="education" value={formData.education} onChange={handleInputChange} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted">Bio / Summary</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="mt-1 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 text-sm text-[hsl(var(--foreground))] outline-none focus:ring-2 focus:ring-upto-blue"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-sm text-[hsl(var(--foreground))] italic bg-[hsl(var(--surface))] p-4 rounded-lg">
                  &ldquo;{formData.bio || "Write a bio to tell other students about yourself!"}&rdquo;
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <UserRound className="h-4 w-4 text-upto-blue" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted">Name</p>
                      <p className="text-sm font-semibold">{formData.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-upto-blue" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted">Email</p>
                      <p className="text-sm font-semibold">{formData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-upto-blue" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted">Phone</p>
                      <p className="text-sm font-semibold">{formData.phone || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-upto-blue" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted">Location</p>
                      <p className="text-sm font-semibold">{formData.location || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:col-span-2">
                    <GraduationCap className="h-4 w-4 text-upto-blue" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted">Education</p>
                      <p className="text-sm font-semibold">{formData.education || "Not provided"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </SectionCard>

          {/* Profile Picture Selector */}
          <SectionCard
            title="Profile Picture & Avatar"
            description="Choose a stylized avatar to represent you across leagues."
          >
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
              {availableAvatars.map((av) => (
                <button
                  key={av.code}
                  disabled={!isEditing}
                  onClick={() => setFormData((prev) => ({ ...prev, avatar: av.code }))}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    formData.avatar === av.code
                      ? "border-upto-blue bg-upto-blue/5 scale-105"
                      : "border-[hsl(var(--border))] hover:bg-[hsl(var(--surface))]"
                  } ${!isEditing && "opacity-80"}`}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${av.bg} text-sm font-extrabold text-white`}>
                    {av.code}
                  </div>
                  <span className="text-[10px] font-bold">{av.name}</span>
                </button>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Skills & Preferences */}
        <div className="space-y-8">
          {/* Skills Management */}
          <SectionCard title="My Skills" description="Specify what technical abilities you possess.">
            {isEditing && (
              <form onSubmit={handleAddSkill} className="mb-4 space-y-2">
                <Input
                  placeholder="e.g. JavaScript, Python, UI Design"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                />
                <div className="flex gap-2">
                  <select
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(e.target.value)}
                    className="flex-1 h-9 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-xs text-[hsl(var(--foreground))] outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  <Button type="submit" size="sm" variant="gradient" className="px-3">
                    <Plus className="h-4 w-4" /> Add
                  </Button>
                </div>
              </form>
            )}

            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <div
                  key={skill.name}
                  className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 px-3 py-1.5 text-xs"
                >
                  <span className="font-semibold text-[hsl(var(--foreground))]">{skill.name}</span>
                  <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                    skill.level === "Advanced"
                      ? "bg-red-500/10 text-red-400"
                      : skill.level === "Intermediate"
                      ? "bg-yellow-500/10 text-yellow-400"
                      : "bg-blue-500/10 text-blue-400"
                  }`}>
                    {skill.level}
                  </span>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill.name)}
                      className="ml-1 text-muted hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
              {skills.length === 0 && (
                <p className="text-xs text-muted">No skills listed yet. Click edit profile to add yours!</p>
              )}
            </div>
          </SectionCard>

          {/* Learning Preferences */}
          <SectionCard title="Learning Preferences" description="Configure how you prefer to digest courses.">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Pacing Preference</p>
                <div className="grid grid-cols-3 gap-2">
                  {["Self-paced", "Moderate", "Fast"].map((p) => (
                    <button
                      key={p}
                      disabled={!isEditing}
                      onClick={() => handlePreferenceChange("pace", p)}
                      className={`py-2 px-1 rounded-lg text-xs font-bold border ${
                        formData.preferences.pace === p
                          ? "border-upto-blue bg-upto-blue/10 text-upto-blue"
                          : "border-[hsl(var(--border))] hover:bg-[hsl(var(--surface))]"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Content Delivery</p>
                <div className="grid grid-cols-2 gap-2">
                  {["Visual", "Auditory", "Text-Based", "Practical Lab"].map((d) => (
                    <button
                      key={d}
                      disabled={!isEditing}
                      onClick={() => handlePreferenceChange("delivery", d)}
                      className={`py-2 px-2 rounded-lg text-xs font-bold border ${
                        formData.preferences.delivery === d
                          ? "border-upto-blue bg-upto-blue/10 text-upto-blue"
                          : "border-[hsl(var(--border))] hover:bg-[hsl(var(--surface))]"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Daily Study Goal</p>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="8"
                    disabled={!isEditing}
                    value={formData.preferences.dailyGoal}
                    onChange={(e) => handlePreferenceChange("dailyGoal", Number(e.target.value))}
                    className="flex-1 accent-upto-blue"
                  />
                  <span className="text-sm font-black text-upto-blue">
                    {formData.preferences.dailyGoal} hrs/day
                  </span>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
