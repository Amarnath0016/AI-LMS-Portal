import { useState } from "react";
import {
  Settings,
  Shield,
  Save,
  Bell,
  Cpu,
  Lock,
  Database,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { Field } from "@/components/ui/form";
import { HeroPanel, SectionCard } from "@/components/ui/dashboard";

export default function AdminSettings() {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    platformName: "UptoSkills AI LMS",
    supportEmail: "support@uptoskills.com",
    allowRegistration: true,
    maintenanceMode: false,
    requireAdmin2FA: true,
    aiModelProvider: "Google DeepMind Gemini 2.5 Flash",
    maxTokensPerRequest: 4096,
    defaultCurrency: "INR",
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Admin system settings updated successfully!");
    }, 600);
  };

  return (
    <div className="space-y-6">
      <HeroPanel>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-upto-orange">
              System Administration
            </p>
            <h1 className="mt-1 text-2xl font-black text-[hsl(var(--foreground))] sm:text-3xl">
              Platform Settings
            </h1>
            <p className="mt-1 text-sm text-muted">
              Configure environment parameters, security guardrails, AI synthetic providers, and database flags.
            </p>
          </div>
          <Button
            variant="gradient"
            onClick={handleSave}
            disabled={saving}
            className="self-start sm:self-auto"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </HeroPanel>

      <form onSubmit={handleSave} className="space-y-6">
        <SectionCard title="General Platform Settings" description="Core domain identifiers and support contact information.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="platformName"
              label="Platform Name"
              value={settings.platformName}
              onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
            />
            <Field
              id="supportEmail"
              label="Support Email"
              type="email"
              value={settings.supportEmail}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
            />
            <Field
              id="defaultCurrency"
              label="Default Currency"
              value={settings.defaultCurrency}
              onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
            />
            <Field
              id="aiModelProvider"
              label="Primary AI Engine"
              value={settings.aiModelProvider}
              onChange={(e) => setSettings({ ...settings, aiModelProvider: e.target.value })}
            />
          </div>
        </SectionCard>

        <SectionCard title="Security & Access Policies" description="Safeguards for authentication, registrations, and administrative second-factor checks.">
          <div className="space-y-4">
            <label className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 cursor-pointer">
              <div>
                <p className="text-sm font-bold text-[hsl(var(--foreground))]">
                  Require Admin Second Factor (Security Code)
                </p>
                <p className="text-xs text-muted">
                  Enforce server-side access code validation for all administrative logins.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.requireAdmin2FA}
                onChange={(e) => setSettings({ ...settings, requireAdmin2FA: e.target.checked })}
                className="h-4 w-4 rounded border-gray-600 text-upto-blue focus:ring-upto-blue"
              />
            </label>

            <label className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 cursor-pointer">
              <div>
                <p className="text-sm font-bold text-[hsl(var(--foreground))]">
                  Allow Public User Registration
                </p>
                <p className="text-xs text-muted">
                  Permit new student learners to self-register via email OTP verification.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.allowRegistration}
                onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
                className="h-4 w-4 rounded border-gray-600 text-upto-blue focus:ring-upto-blue"
              />
            </label>

            <label className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 cursor-pointer">
              <div>
                <p className="text-sm font-bold text-[hsl(var(--foreground))]">
                  Maintenance Mode
                </p>
                <p className="text-xs text-muted">
                  Direct non-admin visitors to an operational maintenance standby window.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="h-4 w-4 rounded border-gray-600 text-upto-blue focus:ring-upto-blue"
              />
            </label>
          </div>
        </SectionCard>
      </form>
    </div>
  );
}
