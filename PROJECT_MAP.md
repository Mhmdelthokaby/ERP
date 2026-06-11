# ERP — Project Map

> Generated: 2026-06-11 · Protocol: Flow Adherence

---

## SYSTEM_FLOW

```
[Auth] → [Dashboard SPA] → [Module Selection]
   └─ login/register          ├─ DashboardHome (KPIs, charts, recent trips)
                              ├─ FleetPage (vehicles + drivers tables)
                              ├─ TripsPage (operations orders + workflow)
                              ├─ ExpensesPage (pie chart, trend, expenses tables, currencies)
                              ├─ AccountingPage (CoA tree, journal, periods, cost centers)
                              ├─ ArApPage (AR/AP invoices/payments tabs)
                              ├─ ReportsPage (trial balance, income statement, balance sheet)
                              └─ SettingsPage (users, outbox, audit log)

[AppProvider Context] ← [useState<AppData>] ← [all CRUD actions]
   └─ Client-side state only (no API layer)
```

---

## SPA ARCHITECTURE

The entire dashboard is a single client component (`page.tsx`) using state-based page switching via React Context, matching the original HTML SPA behavior. No page reloads — all navigation is instant.

| Layer | File | Purpose |
|-------|------|---------|
| State + Types | `src/lib/store.ts` | All TypeScript interfaces, mock data arrays, helper utilities |
| Context | `src/lib/app-context.tsx` | `AppProvider` + `useApp()` hook — holds all data + CRUD actions |
| Layout | `src/components/layout/Sidebar.tsx` | Sidebar nav with 3 sections (Main, Finance, System) |
| Layout | `src/components/layout/Header.tsx` | Header with title/breadcrumb, search, notifications, date |
| Shared | `src/components/shared/StatusBadge.tsx` | StatusBadge, RoleBadge, SourceBadge |
| Shared | `src/components/shared/KpiCard.tsx` | KPI card with icon, label, value, children |
| Shared | `src/components/shared/ToastContainer.tsx` | Toast notifications with auto-dismiss |
| Shared | `src/components/shared/Modal.tsx` | Reusable modal overlay + content |
| Dashboard | `src/components/dashboard/DashboardHome.tsx` | 4 KPIs, revenue vs expenses chart, fleet status bars, recent trips/invoices |
| Fleet | `src/components/dashboard/FleetPage.tsx` | Vehicles + drivers tabs, deactivate action |
| Trips | `src/components/dashboard/TripsPage.tsx` | Status/date filters, workflow widget, start/cancel/complete actions |
| Expenses | `src/components/dashboard/ExpensesPage.tsx` | Canvas pie chart, trend bar chart, 3-tab tables |
| Accounting | `src/components/dashboard/AccountingPage.tsx` | CoA recursive tree, journal table with reverse, periods, cost centers |
| AR/AP | `src/components/dashboard/ArApPage.tsx` | 4-tab layout (AR invoices, payments, AP invoices, payments) |
| Reports | `src/components/dashboard/ReportsPage.tsx` | Trial balance table, income statement, balance sheet grid |
| Settings | `src/components/dashboard/SettingsPage.tsx` | Users CRUD, outbox messages, audit log |
| Modals | `src/components/modals/ModalForms.tsx` | AddVehicle, AddTrip, AddExpense, AddJournal, AddAccount, AddUser form modals |
| Entry | `src/app/(dashboard)/page.tsx` | Wraps AppProvider → Sidebar + Header + current page + modals + toasts |

---

## LINKED FEATURES

| Feature | Status | File(s) | Notes |
|---------|--------|---------|-------|
| Auth – BetterAuth setup | ✅ | `src/lib/auth/index.ts` | Exists but not wired to SPA |
| Auth – Login form | ⚠️ | `src/app/(auth)/login/page.tsx` | Separate route — not yet integrated |
| Auth – Register form | ⚠️ | `src/app/(auth)/register/page.tsx` | Separate route — not yet integrated |
| SPA Dashboard | ✅ | `page.tsx + all components above` | Fully functional with mock data |
| Dashboard KPIs + charts | ✅ | `DashboardHome.tsx` | 4 KPIs, bar chart, canvas pie chart |
| Fleet CRUD | ✅ | `FleetPage.tsx + AddVehicleModal` | Add + deactivate vehicles |
| Operations workflow | ✅ | `TripsPage.tsx + AddTripModal` | Status transitions, outbox + journal simulation |
| Expenses | ✅ | `ExpensesPage.tsx + AddExpenseModal` | Pie chart, trend, CRUD |
| Accounting – CoA | ✅ | `AccountingPage.tsx + AddAccountModal` | Recursive tree, add account |
| Accounting – Journal | ✅ | `AccountingPage.tsx + AddJournalModal` | Manual entry with line validation, reversal, detail modal |
| Accounting – Periods | ✅ | `AccountingPage.tsx` | Fiscal periods table |
| Accounting – Cost Centers | ✅ | `AccountingPage.tsx` | Cost centers table |
| AR/AP | ✅ | `ArApPage.tsx` | 4-tab invoice tables |
| Reports | ✅ | `ReportsPage.tsx` | Trial balance, income statement, balance sheet |
| Settings – Users | ✅ | `SettingsPage.tsx + AddUserModal` | Create + deactivate users |
| Settings – Outbox | ✅ | `SettingsPage.tsx` | Outbox messages table |
| Settings – Audit Log | ✅ | `SettingsPage.tsx` | Audit log table |
| Toast notifications | ✅ | `ToastContainer.tsx + context` | 4 types with auto-dismiss |
| Modals | ✅ | `ModalForms.tsx + Modal.tsx` | 6 form modals with validation |
| DB – Drizzle schema | ✅ | `src/db/schema/index.ts` | Exists but unused in SPA |
| DB – Connection | ✅ | `src/db/index.ts` | Exists but unused |
| API routes (CRUD stubs) | ✅ | `src/app/api/*` | Exist but unused in SPA |
| Services (Outbox, Journal) | ⚠️ | `src/services/*` | Simulated in context via setTimeout |
| Worker – Outbox Poller | ⚠️ | `src/workers/outbox.worker.ts` | Not wired |

---

## ORPHANS & PENDING

Items not yet implemented or not wired:

| Item | Type | Notes |
|------|------|-------|
| Login/Register forms → BetterAuth | Auth flow | Separate page routes exist — no integration with SPA |
| Auth guard / role enforcement | Security | SPA has no login requirement |
| Real API layer | Integration | All data is client-side mock — no server calls |
| Drizzle migrations | DB | Schema defined but not migrated |
| Seed data script | DB | Not created |
| API routes → SPA wiring | Integration | 15+ API stubs exist but SPA doesn't call them |
| Outbox worker auto-start | Worker | Not wired to server lifecycle |
| i18n / RTL | UX | Not started |
| Dark mode toggle | UX | Not wired (`next-themes` installed) |
| Font Awesome npm | Config | Loaded from CDN in HTML — not installed as npm dep |
| Google Fonts via next/font | Config | Loaded from CDN — not using next/font |

---

## NEXT ACTIONS

1. Connect SPA to real API layer (replace context mock data with API calls)
2. Wire Login/Register pages → BetterAuth → SPA redirect
3. Add role-based UI filtering
4. Start outbox worker on server init
5. Generate + run Drizzle migrations
6. Install Font Awesome as npm dependency (remove CDN)
7. Migrate fonts to `next/font`
