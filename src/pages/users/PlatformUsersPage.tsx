import { useMemo, useState } from "react";
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
import { platformApi, computeUserKpis } from "@/lib/platformApi";
import { useAsync } from "@/lib/useAsync";
import { describeApiError } from "@/lib/api";
import { toast } from "@/lib/toast";
import { roleCards } from "@/lib/consoleConfig";
import type { PlatformStaff } from "@/lib/platformTypes";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const statusTone: Record<string, Tone> = {
  Active: "success",
  Inactive: "danger",
};
const ROLE_OPTIONS = ["SuperAdmin", "Support Lead", "Support", "Billing Ops"];

interface CreatedStaff {
  email: string;
  role: string;
}

export function PlatformUsersPage() {
  const { data, loading, error, reload } = useAsync(
    () => platformApi.listStaff(),
    [],
  );
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Support",
  });
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedStaff | null>(null);

  const staff = data?.items ?? [];
  const kpis = useMemo(() => computeUserKpis(staff), [staff]);

  async function addStaff() {
    setBusy(true);
    setFormError(null);
    try {
      if (
        !form.name.trim() ||
        !form.email.trim() ||
        form.password.length < 12
      ) {
        setFormError(
          "Name, email and a password of at least 12 characters are required.",
        );
        return;
      }
      const result = await platformApi.createStaff({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
      setCreated({
        email: result.email,
        role: result.role,
      });
      toast.success(
        "Platform user created",
        `${result.email} added as ${result.role}.`,
      );
      setAddOpen(false);
      setForm({ name: "", email: "", password: "", role: "Support" });
      reload();
    } catch {
    } finally {
      setBusy(false);
    }
  }

  const columns: Column<PlatformStaff>[] = [
    { key: "name", header: "Name" },
    { key: "role", header: "Role" },
    { key: "email", header: "Email", mono: true },
    {
      key: "isActive",
      header: "Status",
      render: (row) => (
        <StatusChip
          tone={statusTone[row.isActive ? "Active" : "Inactive"]}
          label={row.isActive ? "Active" : "Inactive"}
        />
      ),
    },
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
          value={kpis.total}
          icon={<Users className="size-4" />}
          delta={
            <DeltaPill direction="up">
              {kpis.total ? "with console access" : "none yet"}
            </DeltaPill>
          }
        />
        <StatCard
          label="Super Admins"
          value={kpis.superAdmins}
          icon={<ShieldCheck className="size-4" />}
          delta={<DeltaPill direction="up">full platform access</DeltaPill>}
        />
        <StatCard
          label="Active"
          value={kpis.active}
          icon={<UserCheck className="size-4" />}
          delta={<DeltaPill direction="up">{kpis.inactive} inactive</DeltaPill>}
        />
        <StatCard
          label="Inactive"
          value={kpis.inactive}
          icon={<Clock className="size-4" />}
          delta={
            kpis.inactive > 0 ? (
              <DeltaPill direction="down" tone="danger">
                needs attention
              </DeltaPill>
            ) : (
              <DeltaPill direction="up">all active</DeltaPill>
            )
          }
        />
      </div>

      <div className="mt-4 grid grid-cols-4 gap-3">
        {roleCards.map((card) => (
          <div
            key={card.role}
            className="rounded-xl border border-[#ececef] bg-white p-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
          >
            <p className="text-[12px] font-bold text-ink-900">{card.role}</p>
            <p className="mt-1 text-[11px] text-ink-500">{card.description}</p>
          </div>
        ))}
      </div>

      <PanelCard
        className="mt-4"
        title="Platform Staff"
        icon={<Users className="size-3.5" />}
      >
        {loading && <SkeletonTable rows={5} cols={5} />}
        {error && (
          <ErrorState onRetry={reload} description={describeApiError(error)} />
        )}
        {!loading && !error && (
          <DataTable
            columns={columns}
            rows={staff}
            rowKey={(row) => row.id}
            empty="No platform staff yet"
          />
        )}
      </PanelCard>

      <Modal open={addOpen} onClose={() => setAddOpen(false)}>
        <h3 className="text-[16px] font-bold text-ink-900">
          Add Platform Staff
        </h3>
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
        {formError && (
          <p className="mt-3 rounded-lg bg-danger-tint px-3 py-2 text-[11px] text-danger">
            {formError}
          </p>
        )}
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

      <Modal open={!!created} onClose={() => setCreated(null)}>
        <h3 className="text-[16px] font-bold text-ink-900">
          Platform staff created
        </h3>
        <p className="mt-1 text-[12px] text-ink-500">
          {created?.email} was added as {created?.role}.
        </p>
        <div className="mt-4 flex justify-end">
          <Button onClick={() => setCreated(null)}>Done</Button>
        </div>
      </Modal>
    </Page>
  );
}
