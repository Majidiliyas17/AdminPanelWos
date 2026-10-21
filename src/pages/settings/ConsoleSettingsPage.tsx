import { useState } from "react";
import { KeyRound, Lock, Save, ShieldCheck, User } from "lucide-react";
import { Page, PageHeader } from "@/components/layout/shell";
import {
  Button,
  Field,
  PanelCard,
  StatusChip,
  inputClass,
} from "@/components/ui";
import { useAdminAuth } from "@/lib/auth";
import { toast } from "@/lib/toast";

export function ConsoleSettingsPage() {
  const { user } = useAdminAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [sessionMinutes, setSessionMinutes] = useState("60");

  function saveProfile() {
    toast.warning(
      "Profile update API not available",
      "Backend me /platform/me PUT endpoint abhi exist nahi karta. Change save nahi hoga.",
      "settings-profile",
    );
  }

  function saveSecurity() {
    toast.warning(
      "Password change API not available",
      "Backend me platform staff password-change endpoint abhi exist nahi karta.",
      "settings-security",
    );
  }

  return (
    <Page>
      <PageHeader
        breadcrumb={["WarehouseOS", "Platform Console", "Settings"]}
        title="Console Settings"
        subtitle="Platform staff profile, security and session policy"
      />

      <div className="grid grid-cols-2 items-start gap-4">
        <PanelCard title="Profile" icon={<User className="size-3.5" />}>
          <Field label="Display name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Work email" className="mt-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Role" className="mt-3">
            <div className="mt-1 flex h-9 items-center gap-2 rounded-lg border border-line bg-[#f9fafb] px-3">
              <span className="text-[12px] font-semibold text-ink-900">
                {user?.role || "SuperAdmin"}
              </span>
              <StatusChip tone="info" label="Read-only" />
            </div>
          </Field>
          <div className="mt-4 flex items-center gap-2">
            <Button onClick={saveProfile}>
              <Save className="size-3.5" />
              Save Profile
            </Button>
          </div>
        </PanelCard>

        <div className="space-y-4">
          <PanelCard title="Security" icon={<Lock className="size-3.5" />}>
            <div className="mb-3 flex items-center justify-between rounded-lg border border-line bg-[#f9fafb] px-3 py-2">
              <span className="text-[12px] text-ink-500">
                Two-factor authentication
              </span>
              <StatusChip tone="success" label="Enabled" />
            </div>
            <Field label="Current password">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="New password" className="mt-3">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
              />
            </Field>
            <div className="mt-4 flex items-center gap-2">
              <Button
                onClick={saveSecurity}
                disabled={currentPassword.length < 8 || newPassword.length < 12}
              >
                <KeyRound className="size-3.5" />
                Update Password
              </Button>
            </div>
          </PanelCard>

          <PanelCard
            title="Session Policy"
            icon={<ShieldCheck className="size-3.5" />}
          >
            <Field label="Idle timeout (minutes)">
              <select
                value={sessionMinutes}
                onChange={(e) => setSessionMinutes(e.target.value)}
                className={inputClass}
              >
                {["15", "30", "60", "120", "240"].map((value) => (
                  <option key={value} value={value}>
                    {value} minutes
                  </option>
                ))}
              </select>
            </Field>
            <p className="mt-3 text-[11px] text-ink-500">
              Super Admin sessions expire after the idle timeout. Impersonation
              tokens are always capped at 15 minutes.
            </p>
          </PanelCard>
        </div>
      </div>
    </Page>
  );
}
