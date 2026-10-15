# WarehouseOS — Admin Panel Milestones (Platform Console)

> Source of truth: `WarehouseOS_Product_Design_Phase6_SuperAdmin.pdf` (pages 143–158 of the 158-screen deck).
> Admin covers **Phase 6 · 12 Platform Console screens** (+ 3 public pages shipped in Frontend — see `Frontend/MILESTONES.md` FM17).
> Backend = `E:\Practice\WarehouseOS\Backend` → **Milestone 2 (Platform Console)**, controllers: `PlatformController`, `TenantRequestsController`, `PaymentsController` (platform invoices).
> Shared contract: `E:\Practice\WarehouseOS\SYNC.md`

**Stack:** React 19 + Vite + TypeScript + Tailwind CSS v4 + React Router v6 (same stack as Frontend — no Recharts needed, Phase 6 has **no charts**).
**Ports:** Admin `5174` · API `https://localhost:8443`.

**Admin design tokens (violet console — different from tenant app):**
- Logo/brand violet `#7C3AED`, primary action indigo `#4F46E5`
- Sidebar `#14122A`, active pill `#2A2549`, workspace card `#1F1B3A`
- Canvas `#F7F7F8`, card `#FFFFFF` border `#ECECEF` radius 12
- Chips: green `#16A34A/#E7F7EF`, amber `#D97706/#FDF0DE`, red `#DC2626/#FDECEC`, blue `#2563EB/#E7EEFE`
- User: `RK · Riya Kapoor · Super Admin`; topbar search placeholder `Search tenants, requests, invoices…` + `ctrl K`
- Sidebar nav (8): `Dashboard, Tenants, Approvals, Billing & Plans, Feature Flags, Platform Users, Audit Log, Settings`
- Footer strip: `WarehouseOS | Platform Console · <screen> | Page NNN / 158`

**Rule for every milestone (Definition of Done):**
1. Screen matches Phase 6 PDF page exactly (copy, columns, chips, KPI values).
2. Real API from `PlatformController` / `TenantRequestsController`; mock fallback in `src/mocks/` otherwise.
3. `npm run build` passes.
4. Loading/Empty/Error states present.
5. Route added to `SYNC.md`.

---

## AM0 — Foundation & Console Shell ✅ (scaffold)

- Vite + React + TS + Tailwind, path aliases, ESLint
- Tokens above + Inter / JetBrains Mono
- **Console shell:** violet-mark logo + `WarehouseOS` + `PLATFORM CONSOLE`; workspace card `Super Admin / All Tenants · Global`; 8 nav items; footer user `RK Riya Kapoor / Super Admin`; white topbar (search + 4 icon buttons + user chip); deck footer strip
- **UI kit:** `StatCard`, `PanelCard`, `DataTable`, `StatusChip`, `DeltaPill`, `Tabs`, `PaginationLine`, `Button` (primary indigo / ghost / danger-red), `Stepper`, `Modal`, `EmptyState`, `Skeleton`, `ErrorState`
- **API layer:** same Axios pattern, but platform auth (`PlatformController` login, `Platform@12345` seed) — separate token storage key from Frontend
- **DoD:** all 8 routes placeholder-render inside shell; build passes.

---

## AM1 — Super Admin Login + Platform Dashboard (2 screens) ✅ (2026-10-15)

| Screen | PDF | Route |
|---|---|---|
| Super Admin Sign In (email, password, 2FA code, violet button `Sign In to Console`) | Ph6 p01 (143/158) | `/login` |
| Platform Dashboard — 4 KPIs (Total Tenants 64, Active 58, Pending Approvals 7, MRR $412K), `Pending Tenant Requests` mini-cards ×3, `Top Tenants by MRR` table (5 rows incl. Suspended `—` row) | Ph6 p02 (144/158) | `/dashboard` |

**Backend:** platform auth + `GET /api/v1/platform/dashboard` (or seed-mocked).
**DoD:** login → dashboard; every sign-in logged; unauthenticated → `/login`.

---

## AM2 — Tenant Approval Queue & Provisioning (3 screens) ✅ (2026-10-15)

| Screen | PDF | Route |
|---|---|---|
| Approval Queue — 4 KPIs, 5 tabs (All/Pending/In Review/Approved/Rejected), 5-row table | Ph6 p03 (145/158) | `/approvals` |
| Request Review — KPIs (4 of 4 checks), Application Details (8 rows), Automated Verification (4 ✓), Internal Notes textarea, header `Reject` + `✓ Approve & Provision` | Ph6 p04 (146/158) | `/approvals/:requestId` |
| Approve & Provision — 4-step stepper (Assign Plan → Set Limits → **Generate Tenant ID** → Send Invite), form card, generated ID callout `tnt_southerncross_8214`, `Back` / `Generate & Send Invite →` | Ph6 p05 (147/158) | `/approvals/:requestId/provision` |

**Backend:** `TenantRequestsController` (list/review/approve/provision), provisioning M2 flow.
**DoD:** request → review → approve → tenant ID generated → tenant appears in Tenants list with `Provisioning` chip; invite mail/link triggered (Frontend `/invite/:token`).

---

## AM3 — Tenants (3 screens) ✅ (2026-10-15)

| Screen | PDF | Route |
|---|---|---|
| Tenants list — 4 KPIs, tabs (All/Active/Trial/Suspended), search, 6-row table (tenant ID mono, chips incl. `Provisioning`), `+ Provision Tenant` | Ph6 p06 (148/158) | `/tenants` |
| Tenant Details — 4 KPIs, Tenant Information card (mono indigo tenant ID), Platform Usage mini-table, Platform Invoices table, header `Impersonate` + red-outline `Suspend Tenant` | Ph6 p07 (149/158) | `/tenants/:tenantId` |
| Suspend Tenant modal — red icon tile, reason field (required), `Cancel` / red `Suspend Tenant` | Ph6 p08 (150/158) | modal over detail |

**Backend:** `PlatformController` (tenants CRUD-ish, suspend, impersonate).
**DoD:** suspend → status `Suspended` + audit log entry; impersonate → opens tenant session (handoff URL to Frontend) and logs event.

---

## AM4 — Billing & Plans + Feature Flags (2 screens) ✅ (2026-10-15)

| Screen | PDF | Route |
|---|---|---|
| Billing & Plans — 4 KPIs, 3 plan tier cards (Growth highlighted indigo border), Platform Invoices table, `+ New Plan` | Ph6 p09 (151/158) | `/billing` |
| Feature Flags — 4 KPIs, `Feature Flags by Plan` (6 flags × 3 plan toggle pills on/off), `Tenant-Specific Overrides` table (2 rows), `+ New Flag` | Ph6 p10 (152/158) | `/feature-flags` |

**Backend:** platform billing/plans + feature-flag tables (Platform module).
**DoD:** plan edit persists; flag toggle changes plan pills and persists per tenant override.

---

## AM5 — Platform Users, Audit Log & Settings (3 screens) ✅ (2026-10-15)

| Screen | PDF | Route |
|---|---|---|
| Platform Users — 4 KPIs, 4 role definition cards, staff table (5 rows, email mono), `+ Add Staff` | Ph6 p11 (153/158) | `/users` |
| Audit Log — 4 KPIs, timeline list (6 events, tinted icon tiles, mono timestamps), `⤓ Export` | Ph6 p12 (154/158) | `/audit-log` |
| Settings (nav item exists, no mockup — build consistent with console tokens: profile, security, 2FA, session policy) | — | `/settings` |

**Backend:** platform staff identity + audit trail endpoints.
**DoD:** every AM1–AM4 action (approve, suspend, impersonate, plan change, flag change) writes an Audit Log row visible here; export downloads CSV.

---

## Milestone → Backend sync

| Admin | Backend | Design |
|---|---|---|
| AM0 | — (M2 foundation) | Ph6 shell |
| AM1 | M2 · Platform auth + dashboard | Ph6 p01–02 |
| AM2 | M2 · Tenant provisioning | Ph6 p03–05 |
| AM3 | M2 · Tenant management | Ph6 p06–08 |
| AM4 | M2 · Plans + flags | Ph6 p09–10 |
| AM5 | M2 · Platform staff + audit | Ph6 p11–12 |

**Order:** AM0 → AM1 → AM2 → AM3 → AM4 → AM5. (AM2 depends on Frontend FM17 invite page for the end-to-end provisioning loop.)

**End-to-end sync test (teeno project):**
`/request-access` (Frontend) → Admin Approval Queue → Approve & Provision → invite link → Frontend `/invite/:token` → `/onboarding` → tenant login → tenant dashboard, and the whole chain visible in Admin Audit Log.
