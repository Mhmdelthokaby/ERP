# 01 — Database Schema

> 22 Tables · PostgreSQL · Drizzle ORM

---

## Naming Conventions

| Rule | Example |
|------|---------|
| Table names | `camelCase` (Drizzle convention) |
| Column names | `camelCase` |
| PKs | `id` SERIAL |
| FKs | `{entity}Id` e.g. `customerId` |
| Timestamps | `createdAt`, `updatedAt`, `occurredOn` |
| Soft delete | `isActive` BOOLEAN (no hard deletes on master data) |
| Money | `DECIMAL(18,2)` — always 2 decimal places |
| Exchange rate | `DECIMAL(18,6)` — 6 decimal places for precision |

---

## Group 1 — Auth & Users

### `users`

```sql
id            SERIAL PRIMARY KEY
authId        TEXT NOT NULL UNIQUE          -- BetterAuth internal user id
code          VARCHAR(50) UNIQUE            -- business code e.g. USR-001
name          VARCHAR(100) NOT NULL
email         VARCHAR(100) NOT NULL UNIQUE
role          VARCHAR(20) NOT NULL          -- Admin | Accountant | Operator | Viewer
isActive      BOOLEAN NOT NULL DEFAULT true
createdAt     TIMESTAMP NOT NULL DEFAULT now()
lastLoginAt   TIMESTAMP                     -- nullable, updated via BetterAuth after hook
```

**Notes:**
- `authId` links to BetterAuth's internal user table
- `role` is the single source of truth for RBAC — read by middleware and service layer
- Never delete users — set `isActive = false`

---

## Group 2 — Fleet Module

### `vehicles`

```sql
id            SERIAL PRIMARY KEY
plateNumber   VARCHAR(20) NOT NULL UNIQUE
model         VARCHAR(100) NOT NULL
year          INT NOT NULL
capacity      DECIMAL(10,2)                 -- tons or passengers depending on business
status        VARCHAR(20) NOT NULL          -- Active | Inactive | Maintenance
createdAt     TIMESTAMP NOT NULL DEFAULT now()
```

### `drivers`

```sql
id              SERIAL PRIMARY KEY
name            VARCHAR(100) NOT NULL
phone           VARCHAR(20)
licenseNumber   VARCHAR(50) NOT NULL UNIQUE
employmentType  VARCHAR(20) NOT NULL        -- Employee | Contractor
isActive        BOOLEAN NOT NULL DEFAULT true
createdAt       TIMESTAMP NOT NULL DEFAULT now()
```

---

## Group 3 — Operations Module

### `customers`

```sql
id          SERIAL PRIMARY KEY
name        VARCHAR(100) NOT NULL
phone       VARCHAR(20)
address     VARCHAR(200)
createdAt   TIMESTAMP NOT NULL DEFAULT now()
```

### `routes`

```sql
id              SERIAL PRIMARY KEY
fromLocation    VARCHAR(100) NOT NULL
toLocation      VARCHAR(100) NOT NULL
distanceKM      DECIMAL(10,2)
```

**Unique constraint:** `(fromLocation, toLocation)` — prevent duplicate routes

### `operationOrders`

```sql
id              SERIAL PRIMARY KEY
customerId      INT NOT NULL REFERENCES customers(id)
vehicleId       INT NOT NULL REFERENCES vehicles(id)
driverId        INT NOT NULL REFERENCES drivers(id)
routeId         INT NOT NULL REFERENCES routes(id)
tripDate        DATE NOT NULL
salePrice       DECIMAL(18,2) NOT NULL
currencyId      INT NOT NULL REFERENCES currencies(id)
exchangeRate    DECIMAL(18,6) NOT NULL DEFAULT 1
salePriceBase   DECIMAL(18,2) NOT NULL      -- salePrice * exchangeRate
status          VARCHAR(20) NOT NULL         -- Pending | InProgress | Completed | Cancelled
createdAt       TIMESTAMP NOT NULL DEFAULT now()
```

**Business rules:**
- `salePriceBase` = `salePrice × exchangeRate` — calculated on insert/update
- Status transitions: `Pending → InProgress → Completed` or `Pending → Cancelled`
- Once `Completed`, triggers `TripCompleted` outbox event → journal entry

---

## Group 4 — Expenses Module

### `currencies`

```sql
id       SERIAL PRIMARY KEY
code     VARCHAR(10) NOT NULL UNIQUE    -- USD | EGP | EUR
name     VARCHAR(50) NOT NULL
isBase   BOOLEAN NOT NULL DEFAULT false  -- only ONE row can be true
```

**Constraint:** `CHECK` or application rule — exactly one `isBase = true` at all times

### `vehicleExpenses`

```sql
id              SERIAL PRIMARY KEY
vehicleId       INT NOT NULL REFERENCES vehicles(id)
expenseType     VARCHAR(50) NOT NULL     -- Fuel | Maintenance | Tires | Oil | Tolls
amount          DECIMAL(18,2) NOT NULL
currencyId      INT NOT NULL REFERENCES currencies(id)
exchangeRate    DECIMAL(18,6) NOT NULL DEFAULT 1
amountBase      DECIMAL(18,2) NOT NULL   -- amount * exchangeRate
expenseDate     DATE NOT NULL
paymentMethod   VARCHAR(20) NOT NULL     -- Cash | Bank
notes           TEXT
```

### `tripExpenses`

```sql
id                  SERIAL PRIMARY KEY
operationOrderId    INT NOT NULL REFERENCES operationOrders(id)
expenseType         VARCHAR(50) NOT NULL
amount              DECIMAL(18,2) NOT NULL
currencyId          INT NOT NULL REFERENCES currencies(id)
exchangeRate        DECIMAL(18,6) NOT NULL DEFAULT 1
amountBase          DECIMAL(18,2) NOT NULL
```

---

## Group 5 — Accounting Core

### `costCenters`

```sql
id        SERIAL PRIMARY KEY
name      VARCHAR(100) NOT NULL
type      VARCHAR(50) NOT NULL     -- Vehicle | Route | Admin
isActive  BOOLEAN NOT NULL DEFAULT true
```

### `accounts`

```sql
id              SERIAL PRIMARY KEY
parentId        INT REFERENCES accounts(id)  -- nullable → root accounts
code            VARCHAR(20) NOT NULL UNIQUE
name            VARCHAR(100) NOT NULL
type            VARCHAR(20) NOT NULL         -- Asset | Liability | Revenue | Expense | Equity
normalBalance   VARCHAR(10) NOT NULL         -- Debit | Credit
isActive        BOOLEAN NOT NULL DEFAULT true
```

**Chart of Accounts structure:**
```
1xxx  →  Assets        (normalBalance: Debit)
2xxx  →  Liabilities   (normalBalance: Credit)
3xxx  →  Equity        (normalBalance: Credit)
4xxx  →  Revenue       (normalBalance: Credit)
5xxx  →  Expenses      (normalBalance: Debit)
```

**Tree structure:** `parentId` enables unlimited hierarchy depth. Leaf accounts (no children) are the only ones that receive journal entry lines.

### `fiscalYears`

```sql
id          SERIAL PRIMARY KEY
startDate   DATE NOT NULL
endDate     DATE NOT NULL
isClosed    BOOLEAN NOT NULL DEFAULT false
```

**Constraint:** No overlapping date ranges between fiscal years

### `fiscalPeriods`

```sql
id              SERIAL PRIMARY KEY
fiscalYearId    INT NOT NULL REFERENCES fiscalYears(id)
startDate       DATE NOT NULL
endDate         DATE NOT NULL
periodType      VARCHAR(20) NOT NULL    -- Opening | Normal | Closing
isClosed        BOOLEAN NOT NULL DEFAULT false
```

**Types:**
- `Opening` — period for opening balances (beginning of year)
- `Normal` — regular monthly periods (Jan, Feb, ... Dec)
- `Closing` — year-end closing entries period

---

## Group 6 — Journal Ledger

### `journalEntries`

```sql
id              SERIAL PRIMARY KEY
number          VARCHAR(30) NOT NULL UNIQUE    -- e.g. JE-2024-00001 (sequential)
fiscalPeriodId  INT NOT NULL REFERENCES fiscalPeriods(id)
entryDate       DATE NOT NULL
description     TEXT NOT NULL
source          VARCHAR(50) NOT NULL           -- Manual | TripCompleted | Payment | Reversal
createdBy       INT NOT NULL REFERENCES users(id)
createdAt       TIMESTAMP NOT NULL DEFAULT now()
createdFromIp   VARCHAR(50)
isReversed      BOOLEAN NOT NULL DEFAULT false
reversalOfId    INT REFERENCES journalEntries(id)   -- nullable → points to original entry
```

**Critical rules:**
- **NO UPDATE** allowed on any column after creation
- **NO DELETE** ever
- `isReversed = true` means this entry has been reversed by another entry
- `reversalOfId IS NOT NULL` means this entry IS a reversal of another

### `journalEntryLines`

```sql
id              SERIAL PRIMARY KEY
journalEntryId  INT NOT NULL REFERENCES journalEntries(id)
accountId       INT NOT NULL REFERENCES accounts(id)
currencyId      INT NOT NULL REFERENCES currencies(id)
costCenterId    INT REFERENCES costCenters(id)     -- nullable
debit           DECIMAL(18,2) NOT NULL DEFAULT 0
credit          DECIMAL(18,2) NOT NULL DEFAULT 0
exchangeRate    DECIMAL(18,6) NOT NULL DEFAULT 1
debitBase       DECIMAL(18,2) NOT NULL DEFAULT 0   -- debit * exchangeRate
creditBase      DECIMAL(18,2) NOT NULL DEFAULT 0   -- credit * exchangeRate
```

**Constraint:** For each line: `(debit = 0 AND credit > 0) OR (debit > 0 AND credit = 0)`
**Entry-level constraint:** `SUM(debitBase) = SUM(creditBase)` across all lines

---

## Group 7 — AR / AP

### `customerInvoices`

```sql
id                  SERIAL PRIMARY KEY
customerId          INT NOT NULL REFERENCES customers(id)
operationOrderId    INT REFERENCES operationOrders(id)    -- nullable for standalone invoices
journalEntryId      INT NOT NULL REFERENCES journalEntries(id)
invoiceNumber       VARCHAR(30) NOT NULL UNIQUE
invoiceDate         DATE NOT NULL
dueDate             DATE NOT NULL
totalAmount         DECIMAL(18,2) NOT NULL
paidAmount          DECIMAL(18,2) NOT NULL DEFAULT 0
status              VARCHAR(20) NOT NULL                  -- Draft | Posted | PartiallyPaid | Paid
```

### `customerPayments`

```sql
id              SERIAL PRIMARY KEY
customerId      INT NOT NULL REFERENCES customers(id)
invoiceId       INT NOT NULL REFERENCES customerInvoices(id)
journalEntryId  INT NOT NULL REFERENCES journalEntries(id)
paymentDate     DATE NOT NULL
amount          DECIMAL(18,2) NOT NULL
method          VARCHAR(20) NOT NULL    -- Cash | Bank
```

### `suppliers`

```sql
id          SERIAL PRIMARY KEY
name        VARCHAR(100) NOT NULL
phone       VARCHAR(20)
address     VARCHAR(200)
```

### `supplierInvoices`

```sql
id                  SERIAL PRIMARY KEY
supplierId          INT NOT NULL REFERENCES suppliers(id)
operationOrderId    INT REFERENCES operationOrders(id)
journalEntryId      INT NOT NULL REFERENCES journalEntries(id)
invoiceNumber       VARCHAR(30) NOT NULL UNIQUE
invoiceDate         DATE NOT NULL
dueDate             DATE NOT NULL
totalAmount         DECIMAL(18,2) NOT NULL
paidAmount          DECIMAL(18,2) NOT NULL DEFAULT 0
status              VARCHAR(20) NOT NULL    -- Draft | Posted | PartiallyPaid | Paid
```

### `supplierPayments`

```sql
id              SERIAL PRIMARY KEY
supplierId      INT NOT NULL REFERENCES suppliers(id)
invoiceId       INT NOT NULL REFERENCES supplierInvoices(id)
journalEntryId  INT NOT NULL REFERENCES journalEntries(id)
paymentDate     DATE NOT NULL
amount          DECIMAL(18,2) NOT NULL
method          VARCHAR(20) NOT NULL    -- Cash | Bank
```

---

## Group 8 — Outbox & Audit

### `outboxMessages`

```sql
id              SERIAL PRIMARY KEY
eventType       VARCHAR(100) NOT NULL   -- TripCompleted | PaymentReceived | ExpenseRecorded
payload         JSONB NOT NULL
status          VARCHAR(20) NOT NULL DEFAULT 'Pending'  -- Pending | Processing | Processed | Failed
retryCount      INT NOT NULL DEFAULT 0
occurredOn      TIMESTAMP NOT NULL DEFAULT now()
processedOn     TIMESTAMP               -- nullable
errorMessage    TEXT                    -- nullable, last error for debugging
```

**Worker behavior:**
- Poll every 30 seconds for `status = 'Pending'`
- Set `status = 'Processing'` before starting (prevents duplicate processing)
- On success: `status = 'Processed'`, set `processedOn`
- On failure: increment `retryCount`, set `errorMessage`, revert to `'Pending'` if `retryCount < 3`, else `'Failed'`

### `auditLogs`

```sql
id          SERIAL PRIMARY KEY
userId      INT NOT NULL REFERENCES users(id)
tableName   VARCHAR(100) NOT NULL
action      VARCHAR(20) NOT NULL     -- Insert | Update | Delete
oldValues   JSONB                    -- nullable on Insert
newValues   JSONB NOT NULL
timestamp   TIMESTAMP NOT NULL DEFAULT now()
ipAddress   VARCHAR(50)
```

**Covered tables:** `users`, `vehicles`, `drivers`, `customers`, `accounts`, `fiscalPeriods`

---

## Table Count Summary

| Group | Tables | Count |
|-------|--------|-------|
| Auth & Users | users | 1 |
| Fleet | vehicles, drivers | 2 |
| Operations | customers, routes, operationOrders | 3 |
| Expenses | currencies, vehicleExpenses, tripExpenses | 3 |
| Accounting Core | costCenters, accounts, fiscalYears, fiscalPeriods | 4 |
| Journal Ledger | journalEntries, journalEntryLines | 2 |
| AR / AP | customerInvoices, customerPayments, suppliers, supplierInvoices, supplierPayments | 5 |
| Outbox & Audit | outboxMessages, auditLogs | 2 |
| **Total** | | **22** |

---

## Drizzle Schema File Map

```
src/lib/schema/
├── users.ts          →  users
├── fleet.ts          →  vehicles, drivers
├── operations.ts     →  customers, routes, operationOrders
├── expenses.ts       →  currencies, vehicleExpenses, tripExpenses
├── accounting.ts     →  costCenters, accounts, fiscalYears, fiscalPeriods,
│                        journalEntries, journalEntryLines,
│                        customerInvoices, customerPayments,
│                        suppliers, supplierInvoices, supplierPayments
├── outbox.ts         →  outboxMessages, auditLogs
└── index.ts          →  re-exports everything
```
