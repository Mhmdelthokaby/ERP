# ERP — Project Map

> Generated: 2026-06-11 · Protocol: Flow Adherence

---

## SYSTEM_FLOW

```
[Auth] → [Dashboard] → [Module Selection]
   └─ login/register      ├─ Fleet (vehicles, drivers)
                           ├─ Operations (customers, routes, orders)
                           ├─ Expenses (vehicle, trip)
                           ├─ Accounting (chart-of-accounts, journal, fiscal-periods, AR/AP)
                           ├─ Reports
                           └─ Settings

[API] ← [Service Layer] ← [DB (Drizzle)]
   └─ Auth Guard           └─ Outbox → Journal
```

---

## LINKED FEATURES

| Feature | Status | Route / File | Impl? |
|---------|--------|-------------|-------|
| Auth – BetterAuth setup | ✅ | `src/lib/auth/index.ts` | Yes |
| Auth – API handler | ✅ | `src/app/api/auth/[...all]/route.ts` | Yes |
| Auth – Login page | ✅ | `src/app/(auth)/login/page.tsx` | Skeleton |
| Auth – Register page | ✅ | `src/app/(auth)/register/page.tsx` | Skeleton |
| Auth – Middleware guard | ✅ | `src/middleware.ts` | Yes |
| Dashboard layout | ✅ | `src/app/(dashboard)/layout.tsx` | Yes |
| Dashboard home | ✅ | `src/app/(dashboard)/page.tsx` | Skeleton |
| Fleet – Vehicles list | ✅ | `src/app/(dashboard)/fleet/vehicles/page.tsx` | Skeleton |
| Fleet – Drivers list | ✅ | `src/app/(dashboard)/fleet/drivers/page.tsx` | Skeleton |
| Fleet – Vehicles API | ✅ | `src/app/api/fleet/vehicles/route.ts` | CRUD stub |
| Fleet – Drivers API | ✅ | `src/app/api/fleet/drivers/route.ts` | CRUD stub |
| Operations – Orders | ✅ | `src/app/(dashboard)/operations/orders/page.tsx` | Skeleton |
| Operations – Routes | ✅ | `src/app/(dashboard)/operations/routes/page.tsx` | Skeleton |
| Operations – Customers | ✅ | `src/app/(dashboard)/operations/customers/page.tsx` | Skeleton |
| Operations – Orders API | ✅ | `src/app/api/operations/orders/route.ts` | CRUD stub |
| Operations – Routes API | ✅ | `src/app/api/operations/routes/route.ts` | CRUD stub |
| Operations – Customers API | ✅ | `src/app/api/operations/customers/route.ts` | CRUD stub |
| Expenses – Page | ✅ | `src/app/(dashboard)/expenses/page.tsx` | Skeleton |
| Expenses – Vehicle | ✅ | `src/app/(dashboard)/expenses/vehicle/page.tsx` | Skeleton |
| Expenses – Trip | ✅ | `src/app/(dashboard)/expenses/trip/page.tsx` | Skeleton |
| Expenses – API | ✅ | `src/app/api/expenses/route.ts` | CRUD stub |
| Accounting – Chart of Accounts | ✅ | `src/app/(dashboard)/accounting/chart-of-accounts/page.tsx` | Skeleton |
| Accounting – Journal | ✅ | `src/app/(dashboard)/accounting/journal/page.tsx` | Skeleton |
| Accounting – Fiscal Periods | ✅ | `src/app/(dashboard)/accounting/fiscal-periods/page.tsx` | Skeleton |
| Accounting – AR/AP | ✅ | `src/app/(dashboard)/accounting/ar-ap/page.tsx` | Skeleton |
| Accounting – Journal API | ✅ | `src/app/api/accounting/journal-entries/route.ts` | CRUD stub |
| Accounting – CoA API | ✅ | `src/app/api/accounting/chart-of-accounts/route.ts` | CRUD stub |
| Accounting – Fiscal Periods API | ✅ | `src/app/api/accounting/fiscal-periods/route.ts` | CRUD stub |
| Reports – Page | ✅ | `src/app/(dashboard)/reports/page.tsx` | Skeleton |
| Reports – API | ✅ | `src/app/api/reports/route.ts` | Stub |
| Settings | ✅ | `src/app/(dashboard)/settings/page.tsx` | Skeleton |
| DB – Schema (all tables) | ✅ | `src/db/schema/index.ts` | Yes |
| DB – Connection | ✅ | `src/db/index.ts` | Yes |
| Service – Trip (Outbox) | ✅ | `src/services/trip.service.ts` | Yes |
| Service – Journal (Event Processor) | ✅ | `src/services/journal.service.ts` | Yes |
| Worker – Outbox Poller | ✅ | `src/workers/outbox.worker.ts` | Yes |
| UI – Button component | ✅ | `src/components/ui/button.tsx` | Yes |
| Hooks – useTrips | ✅ | `src/hooks/useTrips.ts` | Yes |
| Hooks – useJournal | ✅ | `src/hooks/useJournal.ts` | Yes |
| Providers – TanStack Query | ✅ | `src/lib/providers.tsx` | Yes |
| Config – Drizzle | ✅ | `drizzle.config.ts` | Yes |
| Config – Tailwind | ✅ | `tailwind.config.ts` | Yes |
| Config – Env vars | ✅ | `.env.local` | Yes |

---

## ORPHANS & PENDING

Features not yet implemented or not linked to any route/service:

| Item | Type | Required By | Notes |
|------|------|-------------|-------|
| Login form (email + password) | UI | Auth flow | Skeleton only — needs form + BetterAuth client call |
| Register form | UI | Auth flow | Skeleton only — needs form |
| Auth session hook | Hook | All modules | `useSession` missing — needs BetterAuth client |
| Role-based route guard | Middleware | Security | Only checks `better-auth` cookie — no role enforcement |
| Vehicle form (create/edit) | UI | Fleet module | Missing CRUD forms |
| Driver form (create/edit) | UI | Fleet module | Missing CRUD forms |
| Customer form (create/edit) | UI | Operations | Missing CRUD forms |
| Route form (create/edit) | UI | Operations | Missing CRUD forms |
| Order form (create/edit) | UI | Operations | Missing CRUD forms |
| Trip completion action | UI/API | Operations | `completeTrip` service exists, no API endpoint wired |
| Expense form | UI | Expenses | Missing CRUD forms |
| Expense categories CRUD | UI/API | Expenses | Missing UI + API |
| Journal entry form | UI | Accounting | Missing CRUD forms |
| Chart of accounts form | UI | Accounting | Missing CRUD forms |
| Fiscal period form | UI | Accounting | Missing CRUD forms |
| AR/AP list + payment | UI/API | Accounting | Missing UI |
| Reports (any actual data) | UI | Reports | Skeleton only |
| Settings page content | UI | Settings | Skeleton only |
| Outbox auto-start | Worker | Accounting | `outbox.worker.ts` not called anywhere |
| Drizzle migrations | DB | Setup | `db:generate` not run yet |
| Seed data | DB | Setup | Missing seed script |
| Dashboard metrics | UI | Dashboard | No KPIs / widgets |
| i18n / RTL support | Config | UX | Not started |
| Dark mode toggle | UI | UX | Deps installed (`next-themes`), not wired |
| Toast notifications | UI | UX | Deps installed (`sonner`), not wired |
| BetterAuth OAuth providers | Auth | Auth | Only email/password enabled |

---

## NEXT ACTIONS (per FLOW)

1. Wire Login/Register forms → BetterAuth client
2. Wire Trip complete endpoint → `POST /api/operations/orders/[id]/complete`
3. Create `useSession` hook → protect UI per role
4. Start outbox worker on server init
5. Generate + run Drizzle migrations (requires live PostgreSQL)
6. Build CRUD forms for each module (beginning with Fleet)
