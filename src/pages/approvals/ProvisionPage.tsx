import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Copy, Check } from "lucide-react";
import { Page, PageHeader } from "@/components/layout/shell";
import { Button, ErrorState, PanelCard, Skeleton, Stepper } from "@/components/ui";
import { platformApi } from "@/lib/platformApi";
import { useAsync } from "@/lib/useAsync";
import type { ProvisionedTenant } from "@/lib/platformTypes";

const STEPS = ["Assign Plan", "Set Limits", "Generate Tenant ID", "Send Invite"];

const PLAN_LIMITS: Record<string, { warehouses: string; seats: string }> = {
  Starter: { warehouses: "Up to 2 warehouses", seats: "10 included" },
  Growth: { warehouses: "Up to 10 warehouses", seats: "25 included" },
  Enterprise: { warehouses: "Unlimited warehouses", seats: "Unlimited seats" },
};

const PLAN_PRICES: Record<string, string> = {
  Starter: "Starter — $390/mo",
  Growth: "Growth — $1,900/mo",
  Enterprise: "Enterprise — Custom",
};

export function ProvisionPage() {
  const { requestId = "" } = useParams();
  const navigate = useNavigate();
  const { data: request, loading, error, reload } = useAsync(() => platformApi.getRequest(requestId), [requestId]);

  const [step, setStep] = useState(2);
  const [plan, setPlan] = useState("Growth");
  const [warehouseLimit, setWarehouseLimit] = useState("Up to 10 warehouses");
  const [seats, setSeats] = useState("25 included");
  const [currency, setCurrency] = useState("USD");
  const [trial, setTrial] = useState("14 days, no card required");
  const [provisioned, setProvisioned] = useState<ProvisionedTenant | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (request) {
      setPlan(request.requestedPlan || "Growth");
      const limits = PLAN_LIMITS[request.requestedPlan] ?? PLAN_LIMITS.Growth;
      setWarehouseLimit(limits.warehouses);
      setSeats(limits.seats);
      if (request.country === "Australia") setCurrency("AUD");
      else if (request.country === "Germany") setCurrency("EUR");
      else if (request.country === "UAE") setCurrency("AED");
      else setCurrency("USD");
    }
  }, [request]);

  if (loading) {
    return (
      <Page>
        <Skeleton className="mb-6 h-10" />
        <Skeleton className="mx-auto h-72 max-w-xl" />
      </Page>
    );
  }

  if (error || !request) {
    return (
      <Page>
        <ErrorState onRetry={reload} />
      </Page>
    );
  }

  async function generateAndSend() {
    setBusy(true);
    setActionError(null);
    try {
      let result = provisioned;
      if (!result) {
        result = await platformApi.approveRequest(request!.id);
        setProvisioned(result);
        setStep(3);
      } else {
        setStep(3);
      }
    } catch {
      setActionError("Provisioning failed. The request may already be approved or rejected.");
    } finally {
      setBusy(false);
    }
  }

  function copyId() {
    if (!provisioned) return;
    void navigator.clipboard?.writeText(provisioned.tenantCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Page>
      <PageHeader
        breadcrumb={["WarehouseOS", "Platform Console", "Approvals", "Provision"]}
        title="Approve & Provision"
        subtitle={`${request.companyName} · Step ${Math.min(step + 1, 4)} of 4`}
      />

      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Stepper steps={STEPS} current={step} />
        </div>

        <h2 className="text-center text-[20px] font-bold text-ink-900">
          Provisioning {request.companyName}
        </h2>
        <p className="mt-1 mb-5 text-center text-[12px] text-ink-500">
          {step < 3
            ? "Confirm plan and limits, then generate the tenant record."
            : "Tenant generated. Invite is ready for the organization owner."}
        </p>

        {actionError && (
          <p className="mb-3 rounded-lg bg-danger-tint px-3 py-2 text-[11px] text-danger">{actionError}</p>
        )}

        <PanelCard>
          <div className="grid grid-cols-3 gap-4">
            <label className="block text-[11px] font-semibold text-[#374151]">
              Plan
              <select
                value={plan}
                disabled={step >= 3}
                onChange={(e) => {
                  setPlan(e.target.value);
                  const limits = PLAN_LIMITS[e.target.value] ?? PLAN_LIMITS.Growth;
                  setWarehouseLimit(limits.warehouses);
                  setSeats(limits.seats);
                  setStep(1);
                }}
                className={`mt-1 h-9 w-full rounded-lg border bg-white px-3 text-[12px] outline-none ${
                  step >= 2 ? "border-primary ring-1 ring-primary/30" : "border-line"
                } focus:border-primary`}
              >
                {["Starter", "Growth", "Enterprise"].map((name) => (
                  <option key={name} value={name}>
                    {PLAN_PRICES[name]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-[11px] font-semibold text-[#374151]">
              Warehouse Limit
              <input
                value={warehouseLimit}
                disabled={step >= 3}
                onChange={(e) => setWarehouseLimit(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-line bg-white px-3 text-[12px] outline-none focus:border-primary"
              />
            </label>
            <label className="block text-[11px] font-semibold text-[#374151]">
              User Seats
              <input
                value={seats}
                disabled={step >= 3}
                onChange={(e) => setSeats(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-line bg-white px-3 text-[12px] outline-none focus:border-primary"
              />
            </label>
            <label className="block text-[11px] font-semibold text-[#374151]">
              Billing Currency
              <input
                value={currency}
                disabled={step >= 3}
                onChange={(e) => setCurrency(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-line bg-white px-3 text-[12px] outline-none focus:border-primary"
              />
            </label>
            <label className="block text-[11px] font-semibold text-[#374151]">
              Trial Period
              <input
                value={trial}
                disabled={step >= 3}
                onChange={(e) => setTrial(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-line bg-white px-3 text-[12px] outline-none focus:border-primary"
              />
            </label>
          </div>
        </PanelCard>

        {provisioned && (
          <div className="mt-4 rounded-xl border border-primary/20 bg-primary-tint px-6 py-5 text-center">
            <p className="text-[11px] font-medium text-ink-500">Generated Tenant ID</p>
            <button
              onClick={copyId}
              className="mt-1 inline-flex items-center gap-2 font-mono text-[20px] font-bold text-primary hover:underline"
              title="Copy tenant ID"
            >
              {provisioned.tenantCode}
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </button>
            <p className="mt-1 text-[11px] text-ink-500">This ID scopes all data, users and billing for this organization</p>
          </div>
        )}

        {step >= 3 && (
          <div className="mt-4 rounded-xl border border-success/20 bg-success-tint px-6 py-5 text-center">
            <p className="text-[13px] font-bold text-success">Invite ready for {request.email}</p>
            <p className="mt-1 text-[11px] text-ink-500">
              Frontend handoff: <code className="font-mono">/invite/&lt;token&gt;</code> → onboarding. Invite link is logged
              by the platform service.
            </p>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between">
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={busy}>
            Back
          </Button>
          {step < 3 ? (
            <Button onClick={() => (step < 2 ? setStep(step + 1) : generateAndSend())} disabled={busy}>
              {busy ? "Provisioning…" : step < 2 ? "Continue" : "Generate & Send Invite"}
              <ArrowRight className="size-3.5" />
            </Button>
          ) : (
            <Link to="/tenants">
              <Button>
                View in Tenants
                <ArrowRight className="size-3.5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Page>
  );
}
