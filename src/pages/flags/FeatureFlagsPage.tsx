import { useMemo, useState } from "react";
import { Flag, Plus, Zap } from "lucide-react";
import { Page, PageHeader } from "@/components/layout/shell";
import {
  Button,
  DeltaPill,
  EmptyState,
  ErrorState,
  Field,
  Modal,
  PanelCard,
  SkeletonTable,
  StatCard,
  StatusChip,
  inputClass,
} from "@/components/ui";
import { platformApi, computeFlagKpis } from "@/lib/platformApi";
import { useAsync } from "@/lib/useAsync";
import { describeApiError } from "@/lib/api";
import { toast } from "@/lib/toast";
import type { FeatureFlagRow } from "@/lib/platformTypes";

export function FeatureFlagsPage() {
  const { data, loading, error, reload } = useAsync(() => platformApi.listFlags(), []);
  const [newOpen, setNewOpen] = useState(false);
  const [form, setForm] = useState({ key: "", name: "", description: "" });
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [flags, setFlags] = useState<FeatureFlagRow[] | null>(null);

  const rows = flags ?? data?.items ?? [];
  const kpis = useMemo(() => computeFlagKpis(rows), [rows]);

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
      toast.success("Flag created", `${form.name.trim()} is now available (inactive by default).`);
      setNewOpen(false);
      setForm({ key: "", name: "", description: "" });
      setFlags(null);
      reload();
    } catch {
      // toast already shown by platformApi
    } finally {
      setBusy(false);
    }
  }

  async function toggleFlag(flag: FeatureFlagRow, next: boolean) {
    setFlags(rows.map((f) => (f.id === flag.id ? { ...f, isActive: next } : f)));
    try {
      await platformApi.toggleFlag({ id: flag.id, name: flag.name, description: flag.description }, next);
      toast.success(next ? "Flag enabled" : "Flag disabled", flag.name);
    } catch {
      setFlags(null);
      reload();
    }
  }

  return (
    <Page>
      <PageHeader
        breadcrumb={["WarehouseOS", "Platform Console", "Feature Flags"]}
        title="Feature Flags"
        subtitle="Control which features are available across the platform"
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
          value={kpis.total}
          icon={<Flag className="size-4" />}
          delta={<DeltaPill direction="up">{kpis.total ? "configured" : "none yet"}</DeltaPill>}
        />
        <StatCard
          label="Active"
          value={kpis.active}
          icon={<Zap className="size-4" />}
          delta={<DeltaPill direction="up">enabled platform-wide</DeltaPill>}
        />
        <StatCard
          label="Inactive"
          value={kpis.disabled}
          icon={<Flag className="size-4" />}
          delta={
            kpis.disabled > 0 ? (
              <DeltaPill direction="down" tone="danger">
                disabled
              </DeltaPill>
            ) : (
              <DeltaPill direction="up">all active</DeltaPill>
            )
          }
        />
        <StatCard
          label="Per-Tenant Overrides"
          value="—"
          icon={<Flag className="size-4" />}
          delta={<DeltaPill direction="up">tenant-scoped flags pending</DeltaPill>}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 items-start gap-4">
        <PanelCard title="Feature Flags" icon={<Flag className="size-3.5" />}>
          {loading && <SkeletonTable rows={6} cols={2} />}
          {error && <ErrorState onRetry={reload} description={describeApiError(error)} />}
          {!loading && !error && rows.length === 0 && (
            <EmptyState title="No feature flags yet" description="Create your first flag with the + New Flag button." />
          )}
          {!loading &&
            !error &&
            rows.map((flag) => (
              <div key={flag.id} className="flex items-start justify-between gap-3 border-b border-[#f3f4f6] py-3 last:border-0">
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-ink-900">{flag.name}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-ink-muted">{flag.key}</p>
                  <p className="mt-0.5 text-[11px] text-ink-500">{flag.description}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusChip tone={flag.isActive ? "success" : "neutral"} label={flag.isActive ? "Active" : "Inactive"} />
                  <button
                    type="button"
                    onClick={() => toggleFlag(flag, !flag.isActive)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      flag.isActive ? "bg-success" : "bg-[#d1d5db]"
                    }`}
                    aria-label={`Toggle ${flag.name}`}
                  >
                    <span
                      className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                        flag.isActive ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
        </PanelCard>
      </div>

      <Modal open={newOpen} onClose={() => setNewOpen(false)}>
        <h3 className="text-[16px] font-bold text-ink-900">New Feature Flag</h3>
        <p className="mt-1 text-[12px] text-ink-500">Flags are created inactive; enable them with the toggle.</p>
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
