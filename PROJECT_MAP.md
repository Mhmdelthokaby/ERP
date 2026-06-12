# ERP — Project Map

> Generated: 2026-06-12 · Protocol: Flow Adherence

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
   └─ Hybrid data layer: API first → mock fallback
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
| Auth – BetterAuth config | ✅ | `src/lib/auth/index.ts` | Drizzle adapter, email+password, role field, experimental joins |
| Auth – API route | ✅ | `src/app/api/auth/[...all]` | BetterAuth API handler |
| Auth – Login page | ✅ | `src/app/(auth)/login/page.tsx` | BetterAuth client form w/ redirect |
| Auth – Register page | ✅ | `src/app/(auth)/register/page.tsx` | BetterAuth client form w/ redirect |
| Auth – Middleware guard | ✅ | `src/middleware.ts` | BetterAuth cookie-based route protection |
| Auth – Session check | ✅ | `src/app/(dashboard)/page.tsx` | useSession() → spinner/redirect |
| SPA Dashboard | ✅ | `page.tsx + all components` | Fully functional with mock data |
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
| DB – PostgreSQL | ✅ | localhost:5432 | PostgreSQL 17 running, `erp_db` created |
| DB – Drizzle schema | ✅ | `src/db/schema/index.ts` | 19 tables fully defined |
| DB – Drizzle relations | ✅ | `src/db/relations.ts` | Auth relations (user→sessions, user→accounts) |
| DB – Connection | ✅ | `src/db/index.ts` | Drizzle + postgres driver wired |
| DB – Migrations | ✅ | `src/db/migrations/` | Generated + applied (0000_glossy_epoch) |
| DB – Seed script | ✅ | `src/db/seed.ts` | Manager+vehicles+drivers+customers+routes+orders+expenses+CoA+periods |
| API routes (CRUD) | ✅ | `src/app/api/*` | 20 typed endpoints with Drizzle queries |
| API client | ✅ | `src/lib/api.ts` | Typed fetch client, all endpoints |
| Context → API wiring | ✅ | `src/lib/app-context.tsx` | Fetches API on mount, falls back to mock |
| Services (Outbox) | ⚠️ | `src/services/*` | Exists but not wired to real outbox table |
| Worker – Outbox Poller | ⚠️ | `src/workers/outbox.worker.ts` | Not wired |
| Fonts (next/font) | ✅ | `src/app/layout.tsx` | DM Sans + Space Grotesk via next/font |
| Tailwind font config | ✅ | `tailwind.config.ts` | font-display + font-body CSS variables |
| Font Awesome CDN | ⚠️ | `src/app/layout.tsx` | Still CDN — not installed as npm dep |
| BetterAuth client | ✅ | `src/lib/auth/client.ts` | createAuthClient export |

---

## ORPHANS & PENDING

Items not yet implemented or not wired:

| Item | Type | Notes |
|------|------|-------|
| Auth guard / role enforcement | Security | SPA has no role-based UI filtering |
| Real API layer → SPA full wiring | Integration | Context fetches on mount but falls back to mock on any failure |
| Outbox worker auto-start | Worker | Not wired to server lifecycle |
| i18n / RTL | UX | Not started |
| Dark mode toggle | UX | Not wired (`next-themes` installed) |
| Font Awesome npm | Config | Loaded from CDN — not installed as npm dep |

---

## NEXT ACTIONS

1. Fix login: verify experimental joins actually enable account lookup (DB adapter logs show "falling back to regular query")
2. Add role-based UI filtering using `session.user.role`
3. Wire outbox worker to start on server init
4. Install Font Awesome as npm dependency (remove CDN)
5. Seed more realistic data (journal entries, AR/AP, outbox messages)
