import { useState } from "react";
import { BarChart3, CheckCircle2, Clock, FileText, Plus } from "lucide-react";
import { Page, PageHeader } from "@/components/layout/shell";
import {
  Button,
  DataTable,
  DeltaPill,
  ErrorState,
  Field,
  Modal,
  PanelCard,
  Skeleton,
  StatCard,
  StatusChip,
  inputClass,
  type Column,
} from "@/components/ui";
import { platformApi } from "@/lib/platformApi";
import { useAsync } from "@/lib/useAsync";
import { billingInvoiceRows, billingKpis } from "@/mocks/platform";
import type { PlatformPlan } from "@/lib/platformTypes";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const statusTone: Record<string, Tone> = { Paid: "success", Overdue: "danger", Pending: "warning" };

export function BillingPlansPage() {
  const { data, loading, error, reload } = useAsync(() => platformApi.listPlans(), []);
  const [newOpen, setNewOpen] = useState(false);
  const [form, setForm] = useState({ name: "", monthlyPrice: "", maxWarehouses: "5", maxUserSeats: "20" });
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const invoices = data?.source === "mock" ? billingInvoiceRows : billingInvoiceRows;

  async function createPlan() {
    setBusy(true);
    setFormError(null);
    try {
      const price = Number(form.monthlyPrice);
      if (!form.name.trim() || Number.isNaN(price) || price < 0) {
        setFormError("Name and a non-negative monthly price are required.");
        return;
      }
      await platformApi.createPlan({
        name: form.name.trim(),
        monthlyPrice: price,
        maxWarehouses: Number(form.maxWarehouses) || 1,
        maxUserSeats: Number(form.maxUserSeats) || 1,
      });
      setNewOpen(false);
      setForm({ name: "", monthlyPrice: "", maxWarehouses: "5", maxUserSeats: "20" });
      reload();
    } catch {
      setFormError("Could not create the plan.");
    } finally {
      setBusy(false);
    }
  }

  const invoiceColumns: Column<(typeof billingInvoiceRows)[number]>[] = [
    { key: "tenant", header: "Tenant" },
    { key: "plan", header: "Plan" },
    { key: "amount", header: "Amount", mono: true },
    { key: "lastInvoice", header: "Last Invoice", mono: true },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusChip tone={statusTone[row.status] ?? "neutral"} label={row.status} />,
    },
  ];

  return (
    <Page>
      <PageHeader
        breadcrumb={["WarehouseOS", "Platform Console", "Billing & Plans"]}
        title="Billing & Plans"
        subtitle="Subscription tiers and platform-wide revenue"
        action={
          <button
            onClick={() => setNewOpen(true)}
            className="rounded-lg bg-primary px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-primary-dark"
          >
            + New Plan
          </button>
        }
      />

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="MRR"
          value={billingKpis.mrr}
          icon={<FileText className="size-4" />}
          delta={<DeltaPill direction="up">{billingKpis.mrrDelta}</DeltaPill>}
        />
        <StatCard
          label="Collection Rate"
          value={
            <>
              {billingKpis.collectionRate}
              <span className="ml-0.5 text-[12px] font-medium text-ink-500">{billingKpis.collectionUnit}</span>
            </>
          }
          icon={<CheckCircle2 className="size-4" />}
          delta={<DeltaPill direction="up">{billingKpis.collectionDelta}</DeltaPill>}
        />
        <StatCard
          label="Overdue Accounts"
          value={billingKpis.overdue}
          icon={<Clock className="size-4" />}
          delta={
            <DeltaPill direction="down" tone="danger">
              {billingKpis.overdueDelta}
            </DeltaPill>
          }
        />
        <StatCard
          label="Avg. Revenue / Tenant"
          value={billingKpis.avgRevenue}
          icon={<BarChart3 className="size-4" />}
          delta={<DeltaPill direction="up">{billingKpis.avgRevenueDelta}</DeltaPill>}
        />
      </div>

      {loading && <Skeleton className="mt-4 h-40" />}
      {error && (
        <div className="mt-4">
          <ErrorState onRetry={reload} />
        </div>
      )}

      {!loading && !error && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          {(data?.items ?? []).map((plan: PlatformPlan) => (
            <div
              key={plan.id}
              className={`rounded-xl border bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${
                plan.highlighted ? "border-primary ring-1 ring-primary/30" : "border-[#ececef]"
              }`}
            >
              <p className="text-[15px] font-bold text-ink-900">{plan.name}</p>
              <p className="mt-1 text-[24px] font-bold text-ink-900">
                {plan.priceLabel}
                <span className="ml-0.5 text-[11px] font-medium text-ink-500">/mo</span>
              </p>
              <p className="mt-3 text-[12px] text-ink-500">{plan.warehousesLabel}</p>
              <p className="text-[12px] text-ink-500">{plan.seatsLabel}</p>
            </div>
          ))}
        </div>
      )}

      <PanelCard className="mt-4" title="Platform Invoices Across Tenants" icon={<FileText className="size-3.5" />}>
        <DataTable columns={invoiceColumns} rows={invoices} rowKey={(row) => row.tenant} />
      </PanelCard>

      <Modal open={newOpen} onClose={() => setNewOpen(false)}>
        <h3 className="text-[16px] font-bold text-ink-900">New Plan</h3>
        <p className="mt-1 text-[12px] text-ink-500">Create a platform subscription tier.</p>
        <div className="mt-4 space-y-3">
          <Field label="Plan name">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Scale"
              className={inputClass}
            />
          </Field>
          <Field label="Monthly price (USD)">
            <input
              inputMode="decimal"
              value={form.monthlyPrice}
              onChange={(e) => setForm({ ...form, monthlyPrice: e.target.value })}
              placeholder="990"
              className={inputClass}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Max warehouses">
              <input
                inputMode="numeric"
                value={form.maxWarehouses}
                onChange={(e) => setForm({ ...form, maxWarehouses: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Max user seats">
              <input
                inputMode="numeric"
                value={form.maxUserSeats}
                onChange={(e) => setForm({ ...form, maxUserSeats: e.target.value })}
                className={inputClass}
              />
            </Field>
          </div>
        </div>
        {formError && <p className="mt-3 rounded-lg bg-danger-tint px-3 py-2 text-[11px] text-danger">{formError}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setNewOpen(false)}>
            Cancel
          </Button>
          <Button onClick={createPlan} disabled={busy}>
            <Plus className="size-3.5" />
            {busy ? "Creating…" : "Create Plan"}
          </Button>
        </div>
      </Modal>
    </Page>
  );
}
