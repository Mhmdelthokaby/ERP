# ERP — Project Map

> Generated: 2026-06-14 · Protocol: Flow Adherence

---

## SYSTEM_FLOW

```
[Auth] → [Dashboard SPA] → [Module Selection]
   └─ login/register          ├─ DashboardHome (KPIs, charts, recent trips)
                               ├─ LegsPage (route legs table + toggle)
                               ├─ FleetPage (vehicles + types tables, drivers in LegsPage)
                              ├─ TripsPage (operations orders + workflow)
                              ├─ ExpensesPage (pie chart, trend, expenses tables, currencies)
                              ├─ AccountingPage (CoA tree, journal, periods, cost centers)
                              ├─ ArApPage (AR/AP invoices/payments tabs)
                               ├─ ReportsPage (trial balance, income statement, balance sheet)
                               ├─ SuppliersPage (supplier records table + add/edit/delete)
                               └─ SettingsPage (users, outbox, audit log)

[AppProvider Context] ← [useState<AppData>] ← [all CRUD actions]
   └─ Hybrid data layer: API first → mock fallback
```

---

## SPA ARCHITECTURE

The entire dashboard is a single client component (`page.tsx`) serving as the root route (`/`), using state-based page switching via React Context. No page reloads — all navigation is instant. Unauthenticated users are redirected to `/login` by the middleware and the `useSession()` guard.

| Layer | File | Purpose |
|-------|------|---------|
| Arabic strings | `src/lib/ar.ts` | All Arabic translations organized by component section |
| State + Types | `src/lib/store.ts` | All TypeScript interfaces, mock data arrays, helper utilities |
| Context | `src/lib/app-context.tsx` | `AppProvider` + `useApp()` hook — holds all data + CRUD actions |
| Layout | `src/components/layout/Sidebar.tsx` | Sidebar nav with 3 sections (Main, Finance, System) |
| Layout | `src/components/layout/Header.tsx` | Header with sidebar toggle, title/breadcrumb, search, notifications, date |
| Shared | `src/components/shared/StatusBadge.tsx` | StatusBadge, RoleBadge, SourceBadge |
| Shared | `src/components/shared/KpiCard.tsx` | KPI card with icon, label, value, children |
| Shared | `src/components/shared/ToastContainer.tsx` | Toast notifications with auto-dismiss |
| Shared | `src/components/shared/Modal.tsx` | Reusable modal overlay + content |
| Dashboard | `src/components/dashboard/DashboardHome.tsx` | 4 KPIs, revenue vs expenses chart, fleet status bars, recent trips/invoices |
| Legs | `src/components/dashboard/LegsPage.tsx` | Drivers + License Grades tabs; drivers table (6 cols), full detail pane (10 fields + linked vehicle link), active toggle with confirmation modal, add/edit via modal, auto-close sidebar; license grades CRUD table with add/edit/delete |
| Fleet | `src/components/dashboard/FleetPage.tsx` | Vehicles + types tabs, detail pane with edit button + status toggle, history table (8 cols: date/plate/engine/licenseDate/licenseExpiry/licenseType/active/owner), active toggle with confirmation modal (開く driver pattern) |
| Trips | `src/components/dashboard/TripsPage.tsx` | Status/date filters, workflow widget, start/cancel/complete actions |
| Expenses | `src/components/dashboard/ExpensesPage.tsx` | Canvas pie chart, trend bar chart, 3-tab tables |
| Accounting | `src/components/dashboard/AccountingPage.tsx` | CoA recursive tree, journal table with reverse, periods, cost centers |
| AR/AP | `src/components/dashboard/ArApPage.tsx` | 4-tab layout (AR invoices, payments, AP invoices, payments) |
| Reports | `src/components/dashboard/ReportsPage.tsx` | Trial balance, income statement, balance sheet grid |
| Suppliers | `src/components/dashboard/SuppliersPage.tsx` | Suppliers table (code/name/taxNumber/phone/notes), detail panel with close button, add/edit/delete actions |
| Settings | `src/components/dashboard/SettingsPage.tsx` | Users CRUD, outbox messages, audit log |
| Modals | `src/components/modals/ModalForms.tsx` | AddVehicle (+ driver + type selects), EditVehicle, AddDriver (license grade from DB dropdown), EditDriver, AddLicenseGrade, EditLicenseGrade, AddVehicleType, EditVehicleType, AddSupplier, EditSupplier, AddTrip, AddExpense, AddJournal, AddAccount, AddUser form modals |
| Entry | `src/app/(dashboard)/page.tsx` | Wraps AppProvider → Sidebar + Header + current page (with cross-page vehicle/driver navigation via pendingVehicleView/pendingDriverView) + modals + toasts |

---

## LINKED FEATURES

| Feature | Status | File(s) | Notes |
|---------|--------|---------|-------|
| Auth – BetterAuth config | ✅ | `src/lib/auth/index.ts` | Drizzle adapter, email+password, role field, experimental joins |
| Auth – API route | ✅ | `src/app/api/auth/[...all]` | BetterAuth API handler |
| Auth – Login page | ✅ | `src/app/(auth)/login/page.tsx` | BetterAuth client form → redirects to `/` (dashboard) |
| Auth – Register page | ✅ | `src/app/(auth)/register/page.tsx` | BetterAuth client form w/ redirect |
| Auth – Middleware guard | ✅ | `src/middleware.ts` | BetterAuth cookie-based route protection |
| Auth – Session check | ✅ | `src/app/(dashboard)/page.tsx` | useSession() → spinner/redirect |
| Root route | ✅ | `src/app/(dashboard)/page.tsx` | `/` serves the SPA dashboard (landing page removed) |
| SPA Dashboard | ✅ | `page.tsx + all components` | Fully functional with mock data |
| Dashboard KPIs + charts | ✅ | `DashboardHome.tsx` | 4 KPIs, bar chart, canvas pie chart |
| Fleet CRUD | ✅ | `FleetPage.tsx + ModalForms.tsx + DashboardHome` | Vehicles CRUD (+ type select from DB); Drivers CRUD; Vehicle Types CRUD (name/code/model/modelCode); detail pane with edit/toggle; history table with full columns; async add/update with UUID conversion; form data sync via useEffect |
| Legs CRUD | ✅ | `LegsPage.tsx + app-context.tsx + drivers toggle API` | Drivers/operators + license grades tabs; drivers table from DB, full detail pane, add/edit modals with all fields (license grade from DB dropdown), active toggle; license grades CRUD table with add/edit/delete modals |
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
| Suppliers CRUD | ✅ | `SuppliersPage.tsx + ModalForms.tsx + app-context.tsx` | Suppliers table with details panel, add/edit modals (name/taxNumber/phone/notes), delete confirmation; API routes (GET/POST/PUT/DELETE) |
| Toast notifications | ✅ | `ToastContainer.tsx + context` | 4 types with auto-dismiss |
| Modals | ✅ | `ModalForms.tsx + Modal.tsx` | 14 form modals — add/edit Driver, add/edit Vehicle, add VehicleType, edit VehicleType, add LicenseGrade, edit LicenseGrade, add Supplier, edit Supplier, add Trip, add Expense, add Journal, add Account, add User |
| DB – PostgreSQL | ✅ | localhost:5432 | PostgreSQL 17 running, `erp_db` created |
| DB – Drizzle schema | ✅ | `src/db/schema/index.ts` | 23 tables: suppliers, license_grades, vehicle_types, vehicle_history (incl. owner_name), drivers code→serial; overhauled vehicles/drivers |
| DB – Drizzle relations | ✅ | `src/db/relations.ts` | All relations: auth, vehicle→type, vehicle→history, driver→orders |
| DB – Connection | ✅ | `src/db/index.ts` | Drizzle + postgres driver wired |
| DB – Migrations | ✅ | `src/db/migrations/` | Generated + applied (0000–0008); 0005 vehicles.code text→serial; 0006 vehicle_history.owner_name; 0007 vehicles.fuel_consumption; 0008 suppliers table |
| DB – Seed script | ✅ | `src/db/seed.ts` | Vehicle types, vehicles (new fields), drivers (fullName/nationalId/grade/salary/hireDate), customers, routes, orders, expenses, CoA, periods |
| API routes (CRUD + fleet) | ✅ | `src/app/api/*` | 35 typed endpoints — vehicles with JOINs (type + driver), toggle, history; vehicle-types CRUD; license-grades CRUD; drivers toggle; suppliers CRUD |
| API client | ✅ | `src/lib/api.ts` | Typed fetch client, all endpoints |
| Context → API wiring | ✅ | `src/lib/app-context.tsx` | Fetches API on mount, falls back to mock |
| Services (Outbox) | ⚠️ | `src/services/*` | Exists but not wired to real outbox table |
| Worker – Outbox Poller | ⚠️ | `src/workers/outbox.worker.ts` | Not wired |
| Fonts (next/font) | ✅ | `src/app/layout.tsx` | DM Sans + Space Grotesk via next/font |
| Tailwind font config | ✅ | `tailwind.config.ts` | font-display + font-body CSS variables |
| Font Awesome CDN | ⚠️ | `src/app/layout.tsx` | Still CDN — not installed as npm dep |
| Arabic UI translation | ✅ | `ar.ts` + all dashboard components + modals + layout | All user-facing strings in Arabic; `ar-EG` date/number locale; left-to-right layout |
| BetterAuth client | ✅ | `src/lib/auth/client.ts` | createAuthClient export |

---

## ORPHANS & PENDING

Items not yet implemented or not wired:

| Item | Type | Notes |
|------|------|-------|
| Auth guard / role enforcement | Security | SPA has no role-based UI filtering |
| Outbox worker auto-start | Worker | Not wired to server lifecycle |
| RTL layout | UX | LTR kept — Arabic business software convention |
| Dark mode toggle | UX | Not wired (`next-themes` installed) |
| Font Awesome npm | Config | Loaded from CDN — not installed as npm dep |

---

## NEXT ACTIONS

1. ✅ Fleet backend wiring: driverId FK, isActive history, toggle/history API, JOINs, enriched returns
2. ✅ Fleet frontend wiring: detail pane, history table, active toggle, driver assignment in add modal, Add/Edit Driver modal, Edit Vehicle modal, independent data loading
3. ✅ Vehicle Types CRUD: backend API (GET/POST/PUT/DELETE), frontend Types tab, add/edit modals, vehicle forms load types from DB
4. ✅ Arabic UI: all dashboard pages, modals, layout, shared components translated; `ar.ts` with comprehensive translations; `ar-EG` locale
5. ✅ Driver code auto-generation: DB `code` changed from `text` to `serial` — numeric, auto-incremented, removed from user forms
6. ✅ License Grades CRUD: DB `license_grades` table, API (GET/POST/PUT/DELETE), frontend tab in LegsPage, add/edit modals, driver forms load grades from DB
7. ✅ Vehicle toggle switch: replaced power-off icon with toggle switch + confirmation modal (matching driver UX)
8. ✅ Vehicle history table: 8 columns (date, plate, engine, licenseDate, licenseExpiry, licenseType, active, ownerName); migration 0006 adds owner_name
9. ✅ Edit form data sync: useEffect in EditVehicleModal populates fields from context on open
10. ✅ Details panel: edit button + status toggle in vehicle detail pane
11. ✅ Toggle auto-refresh: toggleVehicleActive calls fetchVehicleHistory after success
12. ✅ Server-side pagination + filters for vehicles API (search, model, year, licenseExpiry, isActive, page, pageSize)
13. ✅ Fuel consumption field: DB column, migration 0007, forms, details display
14. ✅ Suppliers page: DB schema + migration 0008, API routes, table + details panel, add/edit modals
15. ✅ Button styling: all primary add buttons use p-3 rounded-xl text-white (suppliers, fleet, legs pages)
16. Add role-based UI filtering using `session.user.role`
17. Wire outbox worker to start on server init
18. Install Font Awesome as npm dependency (remove CDN)
19. Seed more realistic data (journal entries, AR/AP, outbox messages)
