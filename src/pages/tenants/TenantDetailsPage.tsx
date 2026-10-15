import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BarChart3, CheckCircle2, FileText, Users, Home, ShieldAlert, UserCog } from "lucide-react";
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

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const statusTone: Record<string, Tone> = {
  Active: "success",
  Trial: "warning",
  Suspended: "danger",
  Provisioning: "info",
};

export function TenantDetailsPage() {
  const { tenantId = "" } = useParams();
  const navigate = useNavigate();
  const { data: tenant, loading, error, reload } = useAsync(() => platformApi.getTenant(tenantId), [tenantId]);

  const [suspendOpen, setSuspendOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [impersonateOpen, setImpersonateOpen] = useState(false);
  const [ticket, setTicket] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [impersonation, setImpersonation] = useState<{ token: string; email: string } | null>(null);

  if (loading) {
    return (
      <Page>
        <Skeleton className="mb-4 h-14" />
        <div className="grid grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[110px]" />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </Page>
    );
  }

  if (error || !tenant) {
    return (
      <Page>
        <ErrorState onRetry={reload} />
      </Page>
    );
  }

  const isSuspended = tenant.status === "Suspended";

  async function suspend() {
    if (!reason.trim()) return;
    setBusy(true);
    setActionError(null);
    try {
      await platformApi.suspendTenant(tenant!.id);
      setSuspendOpen(false);
      setReason("");
      reload();
    } catch {
      setActionError("Could not suspend this tenant.");
    } finally {
      setBusy(false);
    }
  }

  async function reactivate() {
    setBusy(true);
    setActionError(null);
    try {
      await platformApi.reactivateTenant(tenant!.id);
      reload();
    } catch {
      setActionError("Could not reactivate this tenant.");
    } finally {
      setBusy(false);
    }
  }

  async function impersonate() {
    if (ticket.trim().length < 5) return;
    setBusy(true);
    setActionError(null);
    try {
      const session = await platformApi.impersonateTenant(tenant!.id, ticket.trim());
      setImpersonation({ token: session.token, email: session.email });
      setImpersonateOpen(false);
    } catch {
      setActionError("Impersonation failed. Tenant or target user may not exist.");
    } finally {
      setBusy(false);
    }
  }

  const infoRows: Array<[string, React.ReactNode]> = [
    [
      "Tenant ID",
      <span key="id" className="font-mono text-[12px] font-semibold text-primary">
        {tenant.code}
      </span>,
    ],
    ["Plan", tenant.plan],
    ["Warehouses", tenant.plan === "Enterprise" ? `${tenant.warehouses} of unlimited` : `${tenant.warehouses}`],
    ["User Seats", `${tenant.activeUsers} of ${tenant.userSeats}`],
    ["Billing Currency", tenant.currency],
    ["Region", `${tenant.regionCount} region${tenant.regionCount === 1 ? "" : "s"}`],
    ["Member Since", tenant.memberSince],
  ];

  const usageColumns: Column<(typeof tenant.usage)[number]>[] = [
    { key: "metric", header: "Metric" },
    { key: "current", header: "Current", mono: true },
    { key: "limit", header: "Limit / Detail", mono: true },
  ];

  const invoiceColumns: Column<(typeof tenant.platformInvoices)[number]>[] = [
    { key: "invoice", header: "Invoice", mono: true },
    { key: "period", header: "Period" },
    { key: "amount", header: "Amount", mono: true },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusChip tone={statusTone[row.status] ?? "neutral"} label={row.status} />,
    },
  ];

  return (
    <Page>
      <PageHeader
        breadcrumb={["WarehouseOS", "Platform Console", "Tenants", tenant.name]}
        title={tenant.name}
        subtitle={`${tenant.code} · ${tenant.plan} · Customer since ${tenant.memberSince}`}
        action={
          <>
            <Button variant="secondary" onClick={() => setImpersonateOpen(true)}>
              <UserCog className="size-3.5" />
              Impersonate
            </Button>
            {isSuspended ? (
              <Button variant="secondary" onClick={reactivate} disabled={busy}>
                Reactivate Tenant
              </Button>
            ) : (
              <button
                onClick={() => setSuspendOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-danger bg-white px-3.5 py-2 text-[13px] font-semibold text-danger hover:bg-danger-tint"
              >
                <ShieldAlert className="size-3.5" />
                Suspend Tenant
              </button>
            )}
          </>
        }
      />

      {actionError && <p className="mb-3 rounded-lg bg-danger-tint px-3 py-2 text-[11px] text-danger">{actionError}</p>}

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="MRR"
          value={`$${tenant.mrr.toLocaleString("en-US")}`}
          icon={<FileText className="size-4" />}
          delta={<DeltaPill direction="up">{tenant.plan} plan</DeltaPill>}
        />
        <StatCard
          label="Warehouses"
          value={tenant.warehouses}
          icon={<Home className="size-4" />}
          delta={<DeltaPill direction="up">{tenant.country}</DeltaPill>}
        />
        <StatCard
          label="Active Users"
          value={
            <>
              {tenant.activeUsers}
              <span className="ml-1 text-[11px] font-medium text-ink-500">of {tenant.userSeats} seats</span>
            </>
          }
          icon={<Users className="size-4" />}
          delta={<DeltaPill direction="up">up</DeltaPill>}
        />
        <StatCard
          label="Health Score"
          value={
            <>
              {tenant.healthScore}
              <span className="ml-1 text-[11px] font-medium text-ink-500">/100</span>
            </>
          }
          icon={<CheckCircle2 className="size-4" />}
          delta={
            tenant.healthScore >= 70 ? (
              <DeltaPill direction="up">no open issues</DeltaPill>
            ) : (
              <DeltaPill direction="down" tone="danger">
                attention needed
              </DeltaPill>
            )
          }
        />
      </div>

      <div className="mt-4 grid grid-cols-2 items-start gap-4">
        <PanelCard title="Tenant Information" icon={<Building2Icon />}>
          <dl>
            {infoRows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between border-b border-[#f3f4f6] py-2.5 last:border-0">
                <dt className="text-[12px] text-ink-500">{label}</dt>
                <dd className="text-[12px] font-semibold text-ink-900">{value}</dd>
              </div>
            ))}
          </dl>
        </PanelCard>

        <PanelCard title="Platform Usage" icon={<BarChart3 className="size-3.5" />}>
          {tenant.usage.length === 0 ? (
            <p className="text-[12px] text-ink-500">No usage recorded yet.</p>
          ) : (
            <DataTable columns={usageColumns} rows={tenant.usage} rowKey={(row) => row.metric} />
          )}
        </PanelCard>
      </div>

      <PanelCard
        className="mt-4"
        title="Platform Invoices"
        icon={<FileText className="size-3.5" />}
        action={
          <Link to="/billing" className="text-[11px] font-semibold text-primary hover:underline">
            View All
          </Link>
        }
      >
        {tenant.platformInvoices.length === 0 ? (
          <p className="text-[12px] text-ink-500">No platform invoices yet.</p>
        ) : (
          <DataTable columns={invoiceColumns} rows={tenant.platformInvoices} rowKey={(row) => row.invoice} />
        )}
      </PanelCard>

      <Modal open={suspendOpen} onClose={() => setSuspendOpen(false)}>
        <span className="grid size-10 place-items-center rounded-xl bg-danger-tint text-danger">
          <ShieldAlert className="size-5" />
        </span>
        <h3 className="mt-3 text-[16px] font-bold text-ink-900">Suspend {tenant.name}?</h3>
        <p className="mt-1 text-[12px] text-ink-500">
          All {tenant.warehouses} warehouses, {tenant.activeUsers} users and API access will be immediately blocked. Data
          is retained for 90 days. This action is logged and can be reversed by a Super Admin.
        </p>
        <Field label="Reason (required, visible in audit log)" className="mt-4">
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Overdue payment · 45 days"
            className={inputClass}
          />
        </Field>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setSuspendOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={suspend} disabled={busy || !reason.trim()}>
            Suspend Tenant
          </Button>
        </div>
      </Modal>

      <Modal open={impersonateOpen} onClose={() => setImpersonateOpen(false)}>
        <span className="grid size-10 place-items-center rounded-xl bg-primary-tint text-primary">
          <UserCog className="size-5" />
        </span>
        <h3 className="mt-3 text-[16px] font-bold text-ink-900">Impersonate {tenant.name}?</h3>
        <p className="mt-1 text-[12px] text-ink-500">
          Opens a short-lived tenant session (15 min, no refresh). A mandatory reference ticket is written to the audit
          log.
        </p>
        <Field label="Reference ticket (required)" className="mt-4">
          <input
            value={ticket}
            onChange={(e) => setTicket(e.target.value)}
            placeholder="support ticket #4021"
            className={inputClass}
          />
        </Field>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setImpersonateOpen(false)}>
            Cancel
          </Button>
          <Button onClick={impersonate} disabled={busy || ticket.trim().length < 5}>
            Start Impersonation
          </Button>
        </div>
      </Modal>

      <Modal open={!!impersonation} onClose={() => setImpersonation(null)} width="max-w-lg">
        <h3 className="text-[16px] font-bold text-ink-900">Impersonation session ready</h3>
        <p className="mt-1 text-[12px] text-ink-500">
          Signed in as <strong>{impersonation?.email}</strong>. Hand this short-lived token to the Frontend app via its
          impersonation entry point.
        </p>
        <pre className="mt-3 max-h-32 overflow-auto rounded-lg bg-[#f9fafb] p-3 font-mono text-[10px] break-all whitespace-pre-wrap">
          {impersonation?.token}
        </pre>
        <div className="mt-4 flex justify-end gap-2">
          <Button onClick={() => navigate("/audit-log")}>View Audit Log</Button>
        </div>
      </Modal>

      <p className="mt-4 text-[11px] text-ink-500">
        <Link to="/tenants" className="font-semibold text-primary hover:underline">
          ← Back to tenants
        </Link>
      </p>
    </Page>
  );
}

function Building2Icon() {
  return <Home className="size-3.5" />;
}
