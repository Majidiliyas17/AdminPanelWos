import { useState } from "react";
import { Building2, Flag, Plus, Zap } from "lucide-react";
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
  inputClass,
  type Column,
} from "@/components/ui";
import { platformApi } from "@/lib/platformApi";
import { useAsync } from "@/lib/useAsync";
import { flagKpis, mockOverrides } from "@/mocks/platform";
import type { FeatureFlagRow } from "@/lib/platformTypes";
import { cn } from "@/lib/cn";

function PlanPill({
  label,
  on,
  onToggle,
}: {
  label: string;
  on: boolean;
  onToggle?: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      disabled={!onToggle}
      onClick={() => onToggle?.(!on)}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors",
        on ? "bg-success-tint text-success" : "bg-[#f3f4f6] text-ink-muted",
        onToggle && "hover:ring-1 hover:ring-primary/30",
      )}
    >
      <span className={cn("size-1.5 rounded-full", on ? "bg-success" : "bg-ink-muted")} />
      {label}
    </button>
  );
}

export function FeatureFlagsPage() {
  const { data, loading, error, reload } = useAsync(() => platformApi.listFlags(), []);
  const [newOpen, setNewOpen] = useState(false);
  const [form, setForm] = useState({ key: "", name: "", description: "" });
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [flags, setFlags] = useState<FeatureFlagRow[] | null>(null);

  const rows = flags ?? data?.items ?? [];

  async function createFlag() {
    setBusy(true);
    setFormError(null);
    try {
      if (!form.key.trim() || !form.name.trim()) {
        setFormError("Key and name are required.");
        return;
      }
      await platformApi.createFlag({
        key: form.key.trim().toLowerCase().replace(/\s+/g, "_"),
        name: form.name.trim(),
        description: form.description.trim(),
      });
      setNewOpen(false);
      setForm({ key: "", name: "", description: "" });
      setFlags(null);
      reload();
    } catch {
      setFormError("Could not create the flag.");
    } finally {
      setBusy(false);
    }
  }

  async function togglePlan(flag: FeatureFlagRow, plan: "starter" | "growth" | "enterprise", enabled: boolean) {
    setFlags(
      rows.map((f) => (f.id === flag.id ? { ...f, [plan]: enabled } : f)),
    );
    try {
      await platformApi.toggleFlag(flag, plan, enabled);
    } catch {
      setFlags(null);
      reload();
    }
  }

  const overrideColumns: Column<(typeof mockOverrides)[number]>[] = [
    { key: "tenant", header: "Tenant" },
    { key: "feature", header: "Feature" },
    { key: "override", header: "Override" },
    { key: "setBy", header: "Set By" },
  ];

  return (
    <Page>
      <PageHeader
        breadcrumb={["WarehouseOS", "Platform Console", "Feature Flags"]}
        title="Feature Flags"
        subtitle="Control which features are available, by plan or by tenant"
        action={
          <button
            onClick={() => setNewOpen(true)}
            className="rounded-lg bg-primary px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-primary-dark"
          >
            + New Flag
          </button>
        }
      />

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total Flags"
          value={flagKpis.total}
          icon={<Flag className="size-4" />}
          delta={<DeltaPill direction="up">{flagKpis.totalDelta}</DeltaPill>}
        />
        <StatCard
          label="Enterprise-Only"
          value={flagKpis.enterpriseOnly}
          icon={<Zap className="size-4" />}
          delta={<DeltaPill direction="up">{flagKpis.enterpriseDelta}</DeltaPill>}
        />
        <StatCard
          label="Tenant Overrides"
          value={flagKpis.overrides}
          icon={<Building2 className="size-4" />}
          delta={<DeltaPill direction="up">{flagKpis.overridesDelta}</DeltaPill>}
        />
        <StatCard
          label="Last Changed"
          value={
            <>
              {flagKpis.lastChanged}
              <span className="ml-1 text-[11px] font-medium text-ink-500">{flagKpis.lastChangedUnit}</span>
            </>
          }
          icon={<Flag className="size-4" />}
          delta={<DeltaPill direction="up">{flagKpis.lastChangedDelta}</DeltaPill>}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 items-start gap-4">
        <PanelCard title="Feature Flags by Plan" icon={<Flag className="size-3.5" />}>
          {loading && <SkeletonTable rows={6} cols={2} />}
          {error && <ErrorState onRetry={reload} />}
          {!loading &&
            !error &&
            rows.map((flag) => (
              <div key={flag.id} className="flex items-start justify-between gap-3 border-b border-[#f3f4f6] py-3 last:border-0">
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-ink-900">{flag.name}</p>
                  <p className="mt-0.5 text-[11px] text-ink-500">{flag.description}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <PlanPill label="Starter" on={flag.starter} onToggle={(v) => togglePlan(flag, "starter", v)} />
                  <PlanPill label="Growth" on={flag.growth} onToggle={(v) => togglePlan(flag, "growth", v)} />
                  <PlanPill label="Enterprise" on={flag.enterprise} onToggle={(v) => togglePlan(flag, "enterprise", v)} />
                </div>
              </div>
            ))}
        </PanelCard>

        <PanelCard title="Tenant-Specific Overrides" icon={<Building2 className="size-3.5" />}>
          <DataTable columns={overrideColumns} rows={mockOverrides} rowKey={(row) => `${row.tenant}-${row.feature}`} />
        </PanelCard>
      </div>

      <Modal open={newOpen} onClose={() => setNewOpen(false)}>
        <h3 className="text-[16px] font-bold text-ink-900">New Feature Flag</h3>
        <p className="mt-1 text-[12px] text-ink-500">Flags start Enterprise-only; enable per plan with the pills.</p>
        <div className="mt-4 space-y-3">
          <Field label="Key">
            <input
              value={form.key}
              onChange={(e) => setForm({ ...form, key: e.target.value })}
              placeholder="advanced_routing"
              className={`${inputClass} font-mono`}
            />
          </Field>
          <Field label="Display name">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Advanced Routing"
              className={inputClass}
            />
          </Field>
          <Field label="Description">
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What this flag unlocks…"
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-[12px] outline-none focus:border-primary"
            />
          </Field>
        </div>
        {formError && <p className="mt-3 rounded-lg bg-danger-tint px-3 py-2 text-[11px] text-danger">{formError}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setNewOpen(false)}>
            Cancel
          </Button>
          <Button onClick={createFlag} disabled={busy}>
            <Plus className="size-3.5" />
            {busy ? "Creating…" : "Create Flag"}
          </Button>
        </div>
      </Modal>
    </Page>
  );
}
