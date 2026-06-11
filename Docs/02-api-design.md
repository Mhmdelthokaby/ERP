# 02 — API Design

> All endpoints under `/api/` · Next.js Route Handlers · REST conventions

---

## Conventions

| Convention | Rule |
|------------|------|
| Method | `GET` read · `POST` create · `PUT` full update · `PATCH` partial update · `DELETE` soft delete |
| Auth | Every endpoint checks BetterAuth session cookie |
| Role | Role extracted from session → checked against allowed roles per endpoint |
| Input | Request body parsed and validated with Zod before service call |
| Response | `{ data: T }` on success · `{ error: string, details?: ZodIssue[] }` on failure |
| Status codes | `200` OK · `201` Created · `400` Validation error · `401` Not authenticated · `403` Forbidden · `404` Not found · `409` Conflict · `500` Server error |
| Pagination | `?page=1&pageSize=20` — response includes `{ data, total, page, pageSize }` |
| Soft delete | `DELETE /resource/:id` sets `isActive = false` — never drops the row |

---

## Authentication

### `POST /api/auth/sign-in`
BetterAuth handler — do not implement manually.

```
Body:   { email: string, password: string }
Returns: session cookie (HttpOnly)
```

### `POST /api/auth/sign-out`
BetterAuth handler.

### `GET /api/auth/session`
Returns current session + user role.

```json
{
  "data": {
    "userId": 1,
    "name": "Mohamed Emad",
    "role": "Admin",
    "email": "m@company.com"
  }
}
```

---

## Fleet Module

### Vehicles

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/fleet/vehicles` | Admin, Operator, Accountant, Viewer | List all vehicles |
| GET | `/api/fleet/vehicles/:id` | Admin, Operator, Accountant, Viewer | Get vehicle detail |
| POST | `/api/fleet/vehicles` | Admin | Create vehicle |
| PUT | `/api/fleet/vehicles/:id` | Admin | Update vehicle |
| PATCH | `/api/fleet/vehicles/:id/status` | Admin, Operator | Change status only |
| DELETE | `/api/fleet/vehicles/:id` | Admin | Deactivate vehicle |

**GET `/api/fleet/vehicles` response:**
```json
{
  "data": [
    {
      "id": 1,
      "plateNumber": "ABC-123",
      "model": "Mercedes Actros",
      "year": 2020,
      "capacity": 20.00,
      "status": "Active"
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 20
}
```

### Drivers

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/fleet/drivers` | Admin, Operator, Accountant, Viewer | List drivers |
| GET | `/api/fleet/drivers/:id` | Admin, Operator, Accountant, Viewer | Driver detail |
| POST | `/api/fleet/drivers` | Admin | Create driver |
| PUT | `/api/fleet/drivers/:id` | Admin | Update driver |
| DELETE | `/api/fleet/drivers/:id` | Admin | Deactivate driver |

---

## Operations Module

### Customers

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/customers` | Admin, Operator, Accountant, Viewer | List customers |
| GET | `/api/customers/:id` | Admin, Operator, Accountant, Viewer | Customer + invoices summary |
| POST | `/api/customers` | Admin, Operator | Create customer |
| PUT | `/api/customers/:id` | Admin, Operator | Update customer |

### Routes

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/routes` | Admin, Operator | List routes |
| POST | `/api/routes` | Admin | Create route |
| PUT | `/api/routes/:id` | Admin | Update route |

### Operation Orders (Trips)

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/trips` | Admin, Operator, Accountant, Viewer | List orders (filterable) |
| GET | `/api/trips/:id` | Admin, Operator, Accountant, Viewer | Order detail with expenses |
| POST | `/api/trips` | Admin, Operator | Create order |
| PUT | `/api/trips/:id` | Admin, Operator | Update order (only if Pending) |
| POST | `/api/trips/:id/start` | Admin, Operator | Transition: Pending → InProgress |
| POST | `/api/trips/:id/complete` | Admin, Operator | Transition: InProgress → Completed → fires outbox |
| POST | `/api/trips/:id/cancel` | Admin | Transition: Pending → Cancelled |

**GET `/api/trips` query params:**
```
?status=Completed
?customerId=5
?vehicleId=2
?dateFrom=2024-01-01&dateTo=2024-03-31
?page=1&pageSize=20
```

**POST `/api/trips/:id/complete` — triggers:**
1. Sets `status = 'Completed'`
2. Inserts `outboxMessages` row (same transaction)
3. Outbox worker creates journal entry async

---

## Expenses Module

### Vehicle Expenses

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/expenses/vehicle` | Admin, Operator, Accountant, Viewer | List vehicle expenses |
| GET | `/api/expenses/vehicle/:id` | Admin, Operator, Accountant, Viewer | Expense detail |
| POST | `/api/expenses/vehicle` | Admin, Operator | Record vehicle expense |
| PUT | `/api/expenses/vehicle/:id` | Admin | Update (only if no journal entry linked) |

### Trip Expenses

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/expenses/trip/:orderId` | Admin, Operator, Accountant, Viewer | List expenses for an order |
| POST | `/api/expenses/trip` | Admin, Operator | Add trip expense |
| DELETE | `/api/expenses/trip/:id` | Admin | Remove trip expense (only if order not Completed) |

### Currencies

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/currencies` | All roles | List currencies |
| POST | `/api/currencies` | Admin | Add currency |
| PATCH | `/api/currencies/:id/rate` | Admin, Accountant | Update exchange rate |

---

## Accounting Module

### Chart of Accounts

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/accounting/accounts` | Admin, Accountant | Full tree |
| GET | `/api/accounting/accounts/:id` | Admin, Accountant | Account + balance |
| POST | `/api/accounting/accounts` | Admin, Accountant | Create account |
| PUT | `/api/accounting/accounts/:id` | Admin, Accountant | Update account |
| DELETE | `/api/accounting/accounts/:id` | Admin | Deactivate account |

**GET `/api/accounting/accounts` response (tree):**
```json
{
  "data": [
    {
      "id": 1,
      "code": "1000",
      "name": "Assets",
      "type": "Asset",
      "normalBalance": "Debit",
      "children": [
        {
          "id": 2,
          "code": "1100",
          "name": "Cash",
          "type": "Asset",
          "normalBalance": "Debit",
          "children": []
        }
      ]
    }
  ]
}
```

### Journal Entries

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/accounting/journal` | Admin, Accountant, Viewer | List entries (filterable) |
| GET | `/api/accounting/journal/:id` | Admin, Accountant, Viewer | Entry + lines |
| POST | `/api/accounting/journal` | Accountant | Create manual entry |
| POST | `/api/accounting/journal/:id/reverse` | Accountant | Reverse an entry |

**Critical: NO PUT / PATCH / DELETE on journal entries — ever.**

**POST `/api/accounting/journal` body:**
```json
{
  "fiscalPeriodId": 3,
  "entryDate": "2024-03-15",
  "description": "Manual adjustment",
  "lines": [
    { "accountId": 5, "currencyId": 1, "debit": 1000.00, "credit": 0, "exchangeRate": 1 },
    { "accountId": 12, "currencyId": 1, "debit": 0, "credit": 1000.00, "exchangeRate": 1 }
  ]
}
```

**Validation:**
- `SUM(debit * exchangeRate) === SUM(credit * exchangeRate)` — reject if not balanced
- `fiscalPeriod.isClosed === false` — reject if period is closed
- Minimum 2 lines per entry

### Fiscal Periods

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/accounting/fiscal-periods` | Admin, Accountant | List periods |
| POST | `/api/accounting/fiscal-periods` | Admin, Accountant | Create period |
| POST | `/api/accounting/fiscal-periods/:id/close` | Admin, Accountant | Close a period |

**POST `/api/accounting/fiscal-periods/:id/close` — checks:**
- All journal entries in period are balanced
- No pending outbox messages for dates in this period

### Cost Centers

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/accounting/cost-centers` | Admin, Accountant | List cost centers |
| POST | `/api/accounting/cost-centers` | Admin | Create |
| PUT | `/api/accounting/cost-centers/:id` | Admin | Update |

---

## AR / AP Module

### Customer Invoices

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/ar/invoices` | Admin, Accountant | List invoices |
| GET | `/api/ar/invoices/:id` | Admin, Accountant | Invoice detail |
| POST | `/api/ar/invoices` | Admin, Accountant | Create invoice |
| POST | `/api/ar/invoices/:id/post` | Accountant | Post invoice (Draft → Posted) |

### Customer Payments

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/ar/payments` | Admin, Accountant | List payments |
| POST | `/api/ar/payments` | Admin, Accountant | Record payment → fires outbox |

### Supplier Invoices & Payments

Same structure as AR, under `/api/ap/invoices` and `/api/ap/payments`.

---

## Reports Module

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/reports/trial-balance` | Admin, Accountant | Trial balance |
| GET | `/api/reports/income-statement` | Admin, Accountant, Operator (read) | Income statement |
| GET | `/api/reports/balance-sheet` | Admin, Accountant | Balance sheet |
| GET | `/api/reports/cash-flow` | Admin, Accountant | Cash flow statement |

**Common query params for all reports:**
```
?fiscalPeriodId=3
?dateFrom=2024-01-01&dateTo=2024-03-31
```

**GET `/api/reports/trial-balance` response:**
```json
{
  "data": {
    "period": "Q1 2024",
    "generatedAt": "2024-04-01T09:00:00Z",
    "accounts": [
      {
        "code": "1100",
        "name": "Cash",
        "type": "Asset",
        "debitTotal": 150000.00,
        "creditTotal": 50000.00,
        "balance": 100000.00
      }
    ],
    "totals": {
      "totalDebit": 500000.00,
      "totalCredit": 500000.00
    }
  }
}
```

---

## Settings Module

### Users (Admin only)

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/settings/users` | Admin | List users |
| POST | `/api/settings/users` | Admin | Create user |
| PATCH | `/api/settings/users/:id/role` | Admin | Change role |
| PATCH | `/api/settings/users/:id/deactivate` | Admin | Deactivate user |

---

## Error Response Format

```json
{
  "error": "Validation failed",
  "details": [
    { "field": "lines", "message": "Journal entry is not balanced" }
  ]
}
```

```json
{
  "error": "Fiscal period is closed"
}
```

```json
{
  "error": "Unauthorized"
}
```
