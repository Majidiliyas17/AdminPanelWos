import { useState } from "react";
import { Clock, Plus, ShieldCheck, UserCheck, Users } from "lucide-react";
import { Page, PageHeader } from "@/components/layout/shell";
import {
  Button,
  DataTable,
  DeltaPill,
  ErrorState,
  Field,
  Modal,
  PanelCard,
  SkeletonTable,
  StatCard,
  StatusChip,
  inputClass,
  type Column,
} from "@/components/ui";
import { platformApi } from "@/lib/platformApi";
import { useAsync } from "@/lib/useAsync";
import { roleCards, userKpis } from "@/mocks/platform";
import type { PlatformStaff } from "@/lib/platformTypes";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const statusTone: Record<string, Tone> = { Active: "success", Inactive: "danger" };
const ROLE_OPTIONS = ["Super Admin", "Support Lead", "Support", "Billing Ops"];

export function PlatformUsersPage() {
  const { data, loading, error, reload } = useAsync(() => platformApi.listStaff(), []);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Support" });
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ secret: string; codes: string[] } | null>(null);

  async function addStaff() {
    setBusy(true);
    setFormError(null);
    try {
      if (!form.name.trim() || !form.email.trim() || form.password.length < 12) {
        setFormError("Name, email and a password of at least 12 characters are required.");
        return;
      }
      const result = await platformApi.createStaff({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
      setCreated({ secret: result.mfaSecret, codes: [...result.recoveryCodes] });
      setAddOpen(false);
      setForm({ name: "", email: "", password: "", role: "Support" });
      reload();
    } catch {
      setFormError("Could not create the platform user.");
    } finally {
      setBusy(false);
    }
  }

  const columns: Column<PlatformStaff>[] = [
    { key: "name", header: "Name" },
    { key: "role", header: "Role" },
    { key: "email", header: "Email", mono: true },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusChip tone={statusTone[row.status] ?? "neutral"} label={row.status} />,
    },
    { key: "lastLogin", header: "Last Login", mono: true },
  ];

  return (
    <Page>
      <PageHeader
        breadcrumb={["WarehouseOS", "Platform Console", "Platform Users"]}
        title="Platform Users"
        subtitle="Staff with access to the Platform Console itself"
        action={
          <button
            onClick={() => setAddOpen(true)}
            className="rounded-lg bg-primary px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-primary-dark"
          >
            + Add Staff
          </button>
        }
      />

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Platform Staff"
          value={userKpis.staff}
          icon={<Users className="size-4" />}
          delta={<DeltaPill direction="up">{userKpis.staffDelta}</DeltaPill>}
        />
        <StatCard
          label="Super Admins"
          value={userKpis.superAdmins}
          icon={<ShieldCheck className="size-4" />}
          delta={<DeltaPill direction="up">{userKpis.superAdminsDelta}</DeltaPill>}
        />
        <StatCard
          label="Support Staff"
          value={userKpis.support}
          icon={<UserCheck className="size-4" />}
          delta={<DeltaPill direction="up">{userKpis.supportDelta}</DeltaPill>}
        />
        <StatCard
          label="Active Today"
          value={userKpis.activeToday}
          icon={<Clock className="size-4" />}
          delta={<DeltaPill direction="up">{userKpis.activeTodayDelta}</DeltaPill>}
        />
      </div>

      <div className="mt-4 grid grid-cols-4 gap-3">
        {roleCards.map((card) => (
          <div key={card.role} className="rounded-xl border border-[#ececef] bg-white p-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <p className="text-[12px] font-bold text-ink-900">{card.role}</p>
            <p className="mt-1 text-[11px] text-ink-500">{card.description}</p>
          </div>
        ))}
      </div>

      <PanelCard className="mt-4" title="Platform Staff" icon={<Users className="size-3.5" />}>
        {loading && <SkeletonTable rows={5} cols={5} />}
        {error && <ErrorState onRetry={reload} />}
        {!loading && !error && (
          <DataTable columns={columns} rows={data?.items ?? []} rowKey={(row) => row.id} empty="No platform staff yet" />
        )}
      </PanelCard>

      <Modal open={addOpen} onClose={() => setAddOpen(false)}>
        <h3 className="text-[16px] font-bold text-ink-900">Add Platform Staff</h3>
        <p className="mt-1 text-[12px] text-ink-500">MFA is enabled automatically. Secret and recovery codes show once.</p>
        <div className="mt-4 space-y-3">
          <Field label="Full name">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Amara Okonkwo"
              className={inputClass}
            />
          </Field>
          <Field label="Work email">
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="amara@warehouseos.com"
              className={inputClass}
            />
          </Field>
          <Field label="Temporary password (min 12 chars)">
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Role">
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className={inputClass}
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </Field>
        </div>
        {formError && <p className="mt-3 rounded-lg bg-danger-tint px-3 py-2 text-[11px] text-danger">{formError}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setAddOpen(false)}>
            Cancel
          </Button>
          <Button onClick={addStaff} disabled={busy}>
            <Plus className="size-3.5" />
            {busy ? "Adding…" : "Add Staff"}
          </Button>
        </div>
      </Modal>

      <Modal open={!!created} onClose={() => setCreated(null)} width="max-w-lg">
        <h3 className="text-[16px] font-bold text-ink-900">Staff created — copy now</h3>
        <p className="mt-1 text-[12px] text-ink-500">This is the only time the authenticator secret and codes are shown.</p>
        <p className="mt-3 text-[11px] font-semibold text-[#374151]">TOTP secret</p>
        <pre className="rounded-lg bg-[#f9fafb] p-2 font-mono text-[11px] break-all">{created?.secret}</pre>
        <p className="mt-3 text-[11px] font-semibold text-[#374151]">Recovery codes</p>
        <ul className="rounded-lg bg-[#f9fafb] p-2 font-mono text-[11px]">
          {created?.codes.map((code) => (
            <li key={code}>{code}</li>
          ))}
        </ul>
        <div className="mt-4 flex justify-end">
          <Button onClick={() => setCreated(null)}>I saved these</Button>
        </div>
      </Modal>
    </Page>
  );
}
