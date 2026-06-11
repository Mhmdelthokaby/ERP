# 05 — Integration Points

> Outbox Pattern · Worker · External Hooks · Future Webhooks

---

## 1. The Outbox Pattern — Why & How

### Problem it solves

```
WITHOUT outbox (WRONG):
  1. UPDATE operationOrders SET status = 'Completed'  ← DB commit
  2. Call journal.service.createEntry()               ← might fail!

  If step 2 fails → order is Completed but no journal entry exists
  → Financial data is inconsistent → disaster
```

```
WITH outbox (CORRECT):
  DB Transaction (atomic):
    1. UPDATE operationOrders SET status = 'Completed'
    2. INSERT outboxMessages (same transaction)
  COMMIT

  If journal creation fails later → message stays in outbox → retried
  → Guaranteed eventual consistency
```

### The contract

> An outbox message is created in the **same DB transaction** as the business event that caused it.

---

## 2. Outbox Message Structure

```typescript
interface OutboxMessage {
  id: number;
  eventType: OutboxEventType;
  payload: Record<string, unknown>;  // JSONB
  status: 'Pending' | 'Processing' | 'Processed' | 'Failed';
  retryCount: number;
  occurredOn: Date;
  processedOn: Date | null;
  errorMessage: string | null;
}

type OutboxEventType =
  | 'TripCompleted'
  | 'PaymentReceived'
  | 'SupplierPaymentMade'
  | 'ExpenseRecorded'
  | 'TripExpenseRecorded'
  | 'InvoicePosted';
```

---

## 3. Outbox Worker Implementation

### `src/lib/workers/outbox.worker.ts`

```typescript
import { db } from '../db';
import { outboxMessages } from '../schema/outbox';
import { journalService } from '../services/journal.service';
import { eq, and, lt } from 'drizzle-orm';

const POLL_INTERVAL_MS = 30_000;  // 30 seconds
const MAX_RETRIES = 3;

async function processNextBatch() {
  // Claim messages atomically (Postgres advisory lock or status = 'Processing')
  const messages = await db
    .update(outboxMessages)
    .set({ status: 'Processing' })
    .where(
      and(
        eq(outboxMessages.status, 'Pending'),
        lt(outboxMessages.retryCount, MAX_RETRIES)
      )
    )
    .returning();

  for (const message of messages) {
    try {
      await journalService.processEvent(message.eventType, message.payload);

      await db
        .update(outboxMessages)
        .set({ status: 'Processed', processedOn: new Date() })
        .where(eq(outboxMessages.id, message.id));

    } catch (err) {
      const newRetryCount = message.retryCount + 1;
      const isFailed = newRetryCount >= MAX_RETRIES;

      await db
        .update(outboxMessages)
        .set({
          status: isFailed ? 'Failed' : 'Pending',
          retryCount: newRetryCount,
          errorMessage: err instanceof Error ? err.message : String(err),
        })
        .where(eq(outboxMessages.id, message.id));

      console.error(`Outbox message ${message.id} failed (attempt ${newRetryCount}):`, err);
    }
  }
}

// Start polling
export function startOutboxWorker() {
  console.log('Outbox worker started');
  setInterval(processNextBatch, POLL_INTERVAL_MS);
  processNextBatch(); // Run immediately on startup
}
```

### Starting the worker

```typescript
// src/app/api/[...all]/route.ts  OR  a Next.js instrumentation file
// src/instrumentation.ts (Next.js 14 convention)

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startOutboxWorker } = await import('./lib/workers/outbox.worker');
    startOutboxWorker();
  }
}
```

---

## 4. Journal Service — Event Router

```typescript
// src/lib/services/journal.service.ts

export const journalService = {
  async processEvent(eventType: string, payload: Record<string, unknown>) {
    switch (eventType) {
      case 'TripCompleted':
        return this.handleTripCompleted(payload);
      case 'PaymentReceived':
        return this.handlePaymentReceived(payload);
      case 'ExpenseRecorded':
        return this.handleExpenseRecorded(payload);
      case 'SupplierPaymentMade':
        return this.handleSupplierPayment(payload);
      default:
        throw new Error(`Unknown event type: ${eventType}`);
    }
  },

  async handleTripCompleted(payload: unknown) {
    // 1. Validate payload
    // 2. Find open fiscal period for trip date
    // 3. Get account codes from CoA (AR account, Revenue account)
    // 4. createJournalEntry({ lines: [DR AR, CR Revenue] })
  },
  // ... other handlers
};
```

---

## 5. Payload Schemas Per Event

### `TripCompleted`
```typescript
{
  orderId: number;
  customerId: number;
  vehicleId: number;
  driverId: number;
  routeId: number;
  salePrice: string;       // Decimal as string to avoid float issues
  salePriceBase: string;
  currencyId: number;
  exchangeRate: string;
  tripDate: string;        // ISO date "2024-03-15"
  tripExpenses: Array<{
    expenseType: string;
    amountBase: string;
  }>;
}
```

### `PaymentReceived`
```typescript
{
  customerId: number;
  invoiceId: number;
  amount: string;
  amountBase: string;
  currencyId: number;
  exchangeRate: string;
  method: 'Cash' | 'Bank';
  paymentDate: string;
}
```

### `ExpenseRecorded`
```typescript
{
  vehicleId: number;
  expenseType: string;
  amountBase: string;
  paymentMethod: 'Cash' | 'Bank';
  expenseDate: string;
}
```

---

## 6. Account Code Resolution

The journal service needs to know which accounts to debit/credit. These are **system accounts** — configured once in the Chart of Accounts, referenced by code:

```typescript
// src/lib/services/journal.service.ts

const SYSTEM_ACCOUNTS = {
  ACCOUNTS_RECEIVABLE: '1200',
  CASH:                '1100',
  BANK:                '1101',
  ACCOUNTS_PAYABLE:    '2100',
  TRANSPORTATION_REVENUE: '4100',
  FUEL_EXPENSE:           '5100',
  MAINTENANCE_EXPENSE:    '5200',
  TIRES_EXPENSE:          '5300',
  OIL_EXPENSE:            '5400',
  TOLLS_EXPENSE:          '5500',
} as const;

async function resolveAccount(code: string) {
  const account = await db.query.accounts.findFirst({
    where: (a, { eq, and }) => and(
      eq(a.code, code),
      eq(a.isActive, true)
    ),
  });
  if (!account) throw new Error(`Account ${code} not found or inactive`);
  return account;
}
```

---

## 7. Fiscal Period Resolution

```typescript
async function findOpenPeriod(date: Date) {
  const period = await db.query.fiscalPeriods.findFirst({
    where: (p, { and, eq, lte, gte }) => and(
      lte(p.startDate, date),
      gte(p.endDate, date),
      eq(p.isClosed, false),
      eq(p.periodType, 'Normal')
    ),
  });

  if (!period) {
    throw new Error(`No open fiscal period found for date ${date.toISOString()}`);
  }

  return period;
}
```

---

## 8. Dead Letter Queue (DLQ)

Messages that fail 3 times move to `status = 'Failed'`. These require manual admin intervention.

**Admin view:** `/settings/outbox-failures` — shows all Failed messages

**Manual requeue:**
```
POST /api/settings/outbox/:id/requeue
  Roles: Admin only
  Action: SET status = 'Pending', retryCount = 0, errorMessage = null
```

---

## 9. Future Integration Points (v2)

### Webhooks (Outgoing)

When key events occur, the system can POST to external URLs:

```typescript
// Future: POST to client's webhook URL
POST https://client.com/erp-webhook
{
  "event": "TripCompleted",
  "timestamp": "2024-03-15T10:00:00Z",
  "data": { ... }
}
```

Delivery: via same Outbox pattern — guaranteed at-least-once delivery.

### External Currency Rate API

Future: auto-update exchange rates daily from a free API (e.g. exchangerate.host):

```typescript
// Scheduled job: daily at midnight
async function updateExchangeRates() {
  const rates = await fetch('https://api.exchangerate.host/latest?base=EGP');
  // UPDATE currencies SET ... for each code
}
```

### SMS / Email Notifications (Future)

| Event | Notification |
|-------|-------------|
| Invoice generated | Email to customer |
| Payment overdue | SMS to customer |
| Trip assigned | SMS to driver |

Same outbox pattern — add `NotificationType` to `OutboxEventType`.

---

## 10. Integration Points Summary

```
Internal integrations (v1 — implemented):
  ┌────────────────────────────────────────────┐
  │ Operations Module                          │
  │   └── Outbox ──► Journal Service           │
  │                       └── Ledger           │
  └────────────────────────────────────────────┘

External integrations (v2 — planned):
  ┌────────────────────────────────────────────┐
  │ ERP ──► Webhook ──► Client's systems       │
  │ ERP ──► Currency Rate API ──► currencies   │
  │ ERP ──► Email/SMS ──► Customers/Drivers    │
  └────────────────────────────────────────────┘
```
