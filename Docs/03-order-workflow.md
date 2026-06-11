# 03 — Order Workflow

> State Machine · Journal Entry Timeline · Business Events

---

## 1. Operation Order — State Machine

```
                    ┌─────────┐
                    │ PENDING │ ← created by Operator/Admin
                    └────┬────┘
                         │
             ┌───────────┴────────────┐
             │ start()                │ cancel()
             ▼                        ▼
       ┌────────────┐          ┌───────────┐
       │ IN PROGRESS│          │ CANCELLED │  (terminal)
       └─────┬──────┘          └───────────┘
             │
             │ complete()
             ▼
       ┌───────────┐
       │ COMPLETED │  (terminal) → fires TripCompleted event
       └───────────┘
```

### Allowed Transitions

| From | To | Trigger | Who |
|------|----|---------|-----|
| Pending | InProgress | `POST /trips/:id/start` | Admin, Operator |
| Pending | Cancelled | `POST /trips/:id/cancel` | Admin only |
| InProgress | Completed | `POST /trips/:id/complete` | Admin, Operator |
| InProgress | Pending | ❌ Not allowed | — |
| Completed | any | ❌ Not allowed | — |
| Cancelled | any | ❌ Not allowed | — |

### Service-Level Guard

```typescript
// trip.service.ts
function validateTransition(current: OrderStatus, next: OrderStatus): void {
  const allowed: Record<OrderStatus, OrderStatus[]> = {
    Pending:    ['InProgress', 'Cancelled'],
    InProgress: ['Completed'],
    Completed:  [],
    Cancelled:  [],
  };
  if (!allowed[current].includes(next)) {
    throw new Error(`Invalid transition: ${current} → ${next}`);
  }
}
```

---

## 2. Invoice Status — State Machine

### Customer Invoices

```
  ┌───────┐
  │ DRAFT │ ← created automatically when trip completes
  └───┬───┘
      │ post()  (Accountant)
      ▼
  ┌────────┐
  │ POSTED │
  └───┬────┘
      │ payment recorded
      ▼
┌──────────────┐         ┌──────┐
│ PARTIALLY    │ ──────► │ PAID │ (terminal)
│    PAID      │         └──────┘
└──────────────┘
```

---

## 3. Journal Entry Timeline — Trip Lifecycle

### Phase 1: Trip Created (no accounting entry yet)

```
[Operator]  POST /api/trips
             └── INSERT operationOrders (status = 'Pending')
                 No journal entry — just operational data
```

### Phase 2: Trip Completed → TripCompleted Event

```
[Operator]  POST /api/trips/:id/complete
             └── DB Transaction:
                  ├── UPDATE operationOrders SET status = 'Completed'
                  └── INSERT outboxMessages {
                          eventType: 'TripCompleted',
                          payload: {
                            orderId, customerId, vehicleId,
                            salePrice, salePriceBase, currencyId,
                            tripExpenses: [...],
                            tripDate
                          }
                        }
```

### Phase 3: Outbox Worker — Creates Revenue Journal Entry

```
[Worker]  polls outboxMessages every 30s
           └── journal.service.processEvent('TripCompleted', payload)
                ├── Check: fiscalPeriod.isClosed? → if yes: Dead Letter Queue
                ├── Generate entry number: JE-2024-00042
                └── INSERT journalEntries + journalEntryLines:

  ─────────────────────────────────────────────────────────
  JE-2024-00042 | TripCompleted | 2024-03-15
  Description: Trip #42 · Cairo → Alex · Customer: ABC Corp
  ─────────────────────────────────────────────────────────
  Account                    Debit         Credit
  ─────────────────────────────────────────────────────────
  1200 Accounts Receivable   50,000.00         —
  4100 Transportation Revenue    —         50,000.00
  ─────────────────────────────────────────────────────────
  BALANCED ✓
```

### Phase 4: Customer Payment Received

```
[Accountant]  POST /api/ar/payments { invoiceId, amount, method: 'Bank' }
               └── DB Transaction:
                    ├── UPDATE customerInvoices (paidAmount, status)
                    └── INSERT outboxMessages {
                            eventType: 'PaymentReceived',
                            payload: { customerId, invoiceId, amount, method }
                          }
```

### Phase 5: Outbox Worker — Creates Payment Journal Entry

```
[Worker]  journal.service.processEvent('PaymentReceived', payload)
           └── INSERT journalEntries + journalEntryLines:

  ─────────────────────────────────────────────────────────
  JE-2024-00043 | PaymentReceived | 2024-03-20
  Description: Payment · Invoice INV-2024-042 · ABC Corp
  ─────────────────────────────────────────────────────────
  Account                    Debit         Credit
  ─────────────────────────────────────────────────────────
  1100 Cash / Bank           50,000.00         —
  1200 Accounts Receivable       —         50,000.00
  ─────────────────────────────────────────────────────────
  BALANCED ✓
```

---

## 4. Vehicle Expense — Journal Timeline

```
[Operator]  POST /api/expenses/vehicle
             └── INSERT vehicleExpenses
                  └── INSERT outboxMessages { eventType: 'ExpenseRecorded' }

[Worker]  journal.service.processEvent('ExpenseRecorded', payload)
           └── INSERT journalEntries + journalEntryLines:

  ─────────────────────────────────────────────────────────
  JE-2024-00044 | ExpenseRecorded | 2024-03-16
  Description: Fuel Expense · Truck ABC-123
  ─────────────────────────────────────────────────────────
  Account                    Debit         Credit
  ─────────────────────────────────────────────────────────
  5100 Fuel Expense          3,500.00          —
  2100 Accounts Payable / Cash   —          3,500.00
  ─────────────────────────────────────────────────────────
  BALANCED ✓
```

---

## 5. Entry Reversal Workflow

Used to correct a wrong journal entry. **Never edit the original.**

```
[Accountant]  POST /api/accounting/journal/:id/reverse

journal.service.reverseEntry(originalId):
  1. Load original entry (journalEntries + lines)
  2. Check: entry is not already reversed (isReversed = false)
  3. Check: fiscal period is not closed
  4. INSERT new journalEntry {
       source: 'Reversal',
       reversalOfId: originalId,
       description: 'Reversal of JE-2024-00042'
     }
  5. INSERT journalEntryLines — swap debit/credit for each line:
     originalLine.debit  → reversalLine.credit
     originalLine.credit → reversalLine.debit
  6. UPDATE original journalEntry SET isReversed = true
```

**Visual:**
```
  Original JE-2024-00042:
  DR Accounts Receivable   50,000
  CR Transportation Revenue          50,000

  Reversal JE-2024-00043:
  DR Transportation Revenue 50,000
  CR Accounts Receivable              50,000

  Net effect on ledger: ZERO — as if the entry never happened
```

---

## 6. Outbox Event Types

| Event | Source | Journal Template |
|-------|--------|-----------------|
| `TripCompleted` | `operationOrders.complete()` | DR AR / CR Revenue |
| `PaymentReceived` | `customerPayments.create()` | DR Cash/Bank / CR AR |
| `ExpenseRecorded` | `vehicleExpenses.create()` | DR Expense / CR Payable/Cash |
| `SupplierPayment` | `supplierPayments.create()` | DR Payable / CR Cash/Bank |
| `TripExpenseRecorded` | `tripExpenses.create()` | DR Trip Expense / CR Payable/Cash |

---

## 7. Outbox Worker — Error Handling

```
MAX_RETRIES = 3

for each Pending message:
  1. SET status = 'Processing'
  2. try {
       journal.service.processEvent(message)
       SET status = 'Processed', processedOn = now()
     } catch (err) {
       retryCount++
       errorMessage = err.message
       if retryCount < MAX_RETRIES:
         SET status = 'Pending'    // will be retried next poll
       else:
         SET status = 'Failed'     // alert admin — manual intervention needed
     }
```

**Monitoring:** Query `WHERE status = 'Failed'` in admin dashboard → shows failed events needing manual review.

---

## 8. Fiscal Period Closing Workflow

```
[Accountant]  POST /api/accounting/fiscal-periods/:id/close

Pre-close checks:
  1. No outboxMessages WHERE status IN ('Pending', 'Processing')
     AND occurredOn within period dates
  2. All journalEntries in period are balanced (sanity check)
  3. Trial balance generated and reviewed

On close:
  1. UPDATE fiscalPeriods SET isClosed = true
  2. Any new journal entry for dates in this period → REJECTED
```
