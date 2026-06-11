# 00 — Architecture Overview

> Transportation & Tourism ERP · Blueprint v1.0

---

## 1. System Philosophy

| Principle | Decision |
|-----------|----------|
| **Simplicity first** | No microservices — single Next.js monolith with clear internal layers |
| **Accounting is the source of truth** | Every financial fact lives in `journalEntries` / `journalEntryLines` |
| **Immutable ledger** | Journal entries are never updated or deleted — corrections via reversal only |
| **Event-driven accounting** | Operational events (TripCompleted, PaymentReceived) trigger journal entries via Outbox pattern |
| **Multi-currency** | Always store both original currency amount AND base currency equivalent |
| **RBAC** | Four roles enforced at middleware + service layer — never rely on UI hiding alone |

---

## 2. Tech Stack

```
Layer           Technology
─────────────────────────────────────────────
Frontend        Next.js 14 (App Router)
Backend         Next.js API Routes
Database        PostgreSQL
ORM             Drizzle ORM
Auth            BetterAuth
UI              shadcn/ui + Tailwind CSS
Language        TypeScript (strict)
Validation      Zod
State (client)  React Query (TanStack Query)
```

---

## 3. Architectural Layers

```
┌─────────────────────────────────────────────┐
│              Next.js App Router              │
│   (app/(dashboard)/...  +  app/(auth)/...)   │
└─────────────────┬───────────────────────────┘
                  │  HTTP / RSC
┌─────────────────▼───────────────────────────┐
│           Custom Hooks (Client)              │
│   useTrips · useJournal · useSession         │
└─────────────────┬───────────────────────────┘
                  │  fetch() / React Query
┌─────────────────▼───────────────────────────┐
│           API Routes  /api/...               │
│   Input validation (Zod) · Auth check        │
└─────────────────┬───────────────────────────┘
                  │  function call
┌─────────────────▼───────────────────────────┐
│           Service Layer                      │
│   trip.service · journal.service             │
│   expense.service · report.service           │
└─────────────────┬───────────────────────────┘
                  │  Drizzle queries
┌─────────────────▼───────────────────────────┐
│           Drizzle ORM                        │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│           PostgreSQL                         │
└─────────────────────────────────────────────┘
```

---

## 4. Module Map

```
┌─────────────────────────────────────────────────────────────────┐
│                        ERP Modules                              │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  Fleet   │  │Operations│  │ Expenses │  │  Accounting   │  │
│  │──────────│  │──────────│  │──────────│  │───────────────│  │
│  │ vehicles │  │customers │  │ vehicle  │  │  chart-of-    │  │
│  │ drivers  │  │ routes   │  │ expenses │  │  accounts     │  │
│  └──────────┘  │ orders   │  │ trip     │  │  journal      │  │
│                └────┬─────┘  │ expenses │  │  entries      │  │
│                     │        └──────────┘  │  fiscal       │  │
│                     │                      │  periods      │  │
│                     └──────────────────────►  AR / AP      │  │
│                        Outbox Events       └───────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Key Architectural Decisions

### 5.1 Why Next.js API Routes (not separate backend)?

- Single deployment unit → lower ops overhead
- Shared TypeScript types between frontend and backend
- Server Actions available for simple mutations
- Can extract to separate service later if needed

### 5.2 Why Drizzle ORM (not Prisma)?

- SQL-first — generated queries are predictable and inspectable
- Lightweight runtime, no query engine process
- Better TypeScript inference for complex joins
- Migrations are plain SQL files — easy to audit

### 5.3 Why Outbox Pattern for Accounting?

- Operational DB write + outbox message in ONE transaction → atomicity guaranteed
- Journal entries created asynchronously → no blocking the user
- Failed accounting doesn't lose the original business event
- Retry logic built-in (retryCount, errorMessage)

### 5.4 Why BetterAuth?

- TypeScript-native, no external auth server needed
- Hooks allow reading custom role from `users` table after sign-in
- Session stored in HttpOnly cookie → XSS safe
- Easy to add OAuth providers later

---

## 6. Data Flow — Full Request Lifecycle

```
1. User action in browser (e.g. Complete Trip)
        │
2. Custom hook calls API
   useTrips → fetch('/api/trips/{id}/complete', { method: 'POST' })
        │
3. API Route receives request
   - Validates session cookie (BetterAuth)
   - Checks role permission (Operator or Admin)
   - Parses & validates body with Zod schema
        │
4. Calls Service Layer
   trip.service.completeTrip(id, userId)
        │
5. Service opens DB transaction:
   a. UPDATE operationOrders SET status = 'Completed'
   b. INSERT outboxMessages (eventType: 'TripCompleted', payload: {...})
   COMMIT
        │
6. API returns 200 to client
        │
7. Outbox Worker (runs every 30s):
   - Polls outboxMessages WHERE status = 'Pending'
   - Calls journal.service.processEvent(message)
   - Creates JournalEntry + JournalEntryLines
   - Updates outboxMessages SET status = 'Processed'
```

---

## 7. Security Model

```
Layer           Mechanism
──────────────────────────────────────────────────
Transport       HTTPS only (enforced by hosting)
Auth            BetterAuth · HttpOnly session cookie
Route Guard     middleware.ts · roleRoutes map
API Guard       auth check in every API route handler
Data Guard      Service layer checks ownership / role
Audit           auditLogs table for all mutations
IP Logging      journalEntries.createdFromIp
```

---

## 8. Environment Variables

```bash
# Required
DATABASE_URL=postgresql://user:pass@host:5432/erp_db
BETTER_AUTH_SECRET=<random-32-char-string>
BETTER_AUTH_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## 9. Non-Goals (v1.0)

- No real-time notifications (WebSocket / SSE)
- No mobile app
- No external API integrations (ERP-to-ERP)
- No multi-tenant / multi-company
- No automated bank reconciliation
- No inventory module
