import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Copy, Check } from "lucide-react";
import { Page, PageHeader } from "@/components/layout/shell";
import {
  Button,
  ErrorState,
  PanelCard,
  Skeleton,
  Stepper,
} from "@/components/ui";
import { platformApi } from "@/lib/platformApi";
import { useAsync } from "@/lib/useAsync";
import { describeApiError } from "@/lib/api";
import { toast } from "@/lib/toast";
import type { PlatformPlan, ProvisionedTenant } from "@/lib/platformTypes";

const STEPS = [
  "Assign Plan",
  "Set Limits",
  "Generate Tenant ID",
  "Send Invite",
];

const planLabel = (plan: PlatformPlan) =>
  `${plan.name} — $${plan.monthlyPrice}/mo`;

export function ProvisionPage() {
  const { requestId = "" } = useParams();
  const navigate = useNavigate();
  const {
    data: request,
    loading,
    error,
    reload,
  } = useAsync(() => platformApi.getRequest(requestId), [requestId]);
  const { data: plansData, loading: plansLoading } = useAsync(
    () => platformApi.listPlans(),
    [],
  );

  const plans = plansData?.items ?? [];

  const [step, setStep] = useState(2);
  const [planId, setPlanId] = useState("");
  const [warehouseLimit, setWarehouseLimit] = useState("");
  const [seats, setSeats] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [trial, setTrial] = useState("14 days, no card required");
  const [provisioned, setProvisioned] = useState<ProvisionedTenant | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);

  useEffect(() => {
    if (!request || !plans.length) return;
    const match =
      plans.find((p) => p.name === request.requestedPlan) ?? plans[0];
    setPlanId(match.id);
    setWarehouseLimit(`${match.maxWarehouses} warehouses`);
    setSeats(`${match.maxUserSeats} seats`);
    if (request.country === "Australia") setCurrency("AUD");
    else if (request.country === "Germany") setCurrency("EUR");
    else if (request.country === "UAE") setCurrency("AED");
    else setCurrency("USD");
  }, [request, plans]);

  if (loading || plansLoading) {
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
        <ErrorState
          onRetry={reload}
          title="Couldn't load this request"
          description={describeApiError(error)}
        />
      </Page>
    );
  }

  const selectedPlan = plans.find((p) => p.id === planId);

  async function generateAndSend() {
    setBusy(true);
    try {
      let result = provisioned;
      if (!result) {
        result = await platformApi.approveRequest(request!.id);
        setProvisioned(result);
        setStep(3);
        toast.success(
          "Tenant provisioned",
          `${request!.companyName} ke liye tenant record ban gaya.`,
        );
      } else {
        setStep(3);
      }
    } catch {
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

  function copyInvite() {
    if (!provisioned?.inviteUrl) return;
    void navigator.clipboard?.writeText(provisioned.inviteUrl);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 1500);
  }

  return (
    <Page>
      <PageHeader
        breadcrumb={[
          "WarehouseOS",
          "Platform Console",
          "Approvals",
          "Provision",
        ]}
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

        {plans.length === 0 && (
          <p className="mb-3 rounded-lg bg-warning-tint px-3 py-2 text-[11px] text-warning">
            No plans configured yet. Backend me /platform/plans par plans add
            karein.
          </p>
        )}

        <PanelCard>
          <div className="grid grid-cols-3 gap-4">
            <label className="block text-[11px] font-semibold text-[#374151]">
              Plan
              <select
                value={planId}
                disabled={step >= 3 || !plans.length}
                onChange={(e) => {
                  const next = plans.find((p) => p.id === e.target.value);
                  setPlanId(e.target.value);
                  if (next) {
                    setWarehouseLimit(`${next.maxWarehouses} warehouses`);
                    setSeats(`${next.maxUserSeats} seats`);
                  }
                  setStep(1);
                }}
                className={`mt-1 h-9 w-full rounded-lg border bg-white px-3 text-[12px] outline-none ${
                  step >= 2
                    ? "border-primary ring-1 ring-primary/30"
                    : "border-line"
                } focus:border-primary`}
              >
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {planLabel(plan)}
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
            {selectedPlan && (
              <div className="rounded-lg border border-line bg-[#fafafa] px-3 py-2">
                <p className="text-[10px] font-semibold tracking-wide text-ink-muted uppercase">
                  Selected plan
                </p>
                <p className="mt-0.5 text-[12px] font-semibold text-ink-900">
                  {selectedPlan.name} · ${selectedPlan.monthlyPrice}/mo
                </p>
                <p className="text-[11px] text-ink-500">
                  {selectedPlan.maxWarehouses} warehouses ·{" "}
                  {selectedPlan.maxUserSeats} seats
                </p>
              </div>
            )}
          </div>
        </PanelCard>

        {provisioned && (
          <div className="mt-4 rounded-xl border border-primary/20 bg-primary-tint px-6 py-5 text-center">
            <p className="text-[11px] font-medium text-ink-500">
              Generated Tenant ID
            </p>
            <button
              onClick={copyId}
              className="mt-1 inline-flex items-center gap-2 font-mono text-[20px] font-bold text-primary hover:underline"
              title="Copy tenant ID"
            >
              {provisioned.tenantCode}
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
            </button>
            <p className="mt-1 text-[11px] text-ink-500">
              This ID scopes all data, users and billing for this organization
            </p>
          </div>
        )}

        {step >= 3 && (
          <div className="mt-4 rounded-xl border border-success/20 bg-success-tint px-6 py-5 text-center">
            <p className="text-[13px] font-bold text-success">
              Invite ready for {request.email}
            </p>
            <p className="mt-1 text-[11px] text-ink-500">
              {provisioned?.inviteEmailSent
                ? `Activation email sent to ${request.email}.`
                : `Email is not configured. Share the invite link with ${request.email}.`}
            </p>
            {provisioned?.inviteUrl && (
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <code className="max-w-full break-all rounded-md border border-line bg-white px-3 py-2 text-left text-[10px]">
                  {provisioned.inviteUrl}
                </code>
                <Button variant="secondary" onClick={copyInvite}>
                  {inviteCopied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {inviteCopied ? "Copied" : "Copy invite"}
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="mt-5 flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            disabled={busy}
          >
            Back
          </Button>
          {step < 3 ? (
            <Button
              onClick={() => (step < 2 ? setStep(step + 1) : generateAndSend())}
              disabled={busy || !plans.length}
            >
              {busy
                ? "Provisioning…"
                : step < 2
                  ? "Continue"
                  : "Generate & Send Invite"}
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
