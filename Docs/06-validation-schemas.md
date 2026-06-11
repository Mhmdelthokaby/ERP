# 06 — Validation Schemas

> Zod Schemas for all API inputs · TypeScript types inferred from schemas

---

## Setup

```typescript
import { z } from 'zod';

// Shared helpers
const positiveDecimal = z.string().regex(/^\d+(\.\d{1,2})?$/, 'Must be a positive decimal with max 2 decimal places');
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be a date in YYYY-MM-DD format');
const id = z.number().int().positive();
```

---

## Auth Schemas

```typescript
// POST /api/auth/sign-in
export const SignInSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type SignInInput = z.infer<typeof SignInSchema>;
```

---

## User Schemas

```typescript
// POST /api/settings/users
export const CreateUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(['Admin', 'Accountant', 'Operator', 'Viewer']),
});

// PATCH /api/settings/users/:id/role
export const UpdateUserRoleSchema = z.object({
  role: z.enum(['Admin', 'Accountant', 'Operator', 'Viewer']),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserRoleInput = z.infer<typeof UpdateUserRoleSchema>;
```

---

## Fleet Schemas

```typescript
// POST/PUT /api/fleet/vehicles
export const VehicleSchema = z.object({
  plateNumber: z.string().min(1).max(20),
  model: z.string().min(1).max(100),
  year: z.number().int().min(1990).max(new Date().getFullYear() + 1),
  capacity: z.number().positive().optional(),
  status: z.enum(['Active', 'Inactive', 'Maintenance']),
});

// PATCH /api/fleet/vehicles/:id/status
export const VehicleStatusSchema = z.object({
  status: z.enum(['Active', 'Inactive', 'Maintenance']),
});

// POST/PUT /api/fleet/drivers
export const DriverSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().max(20).optional(),
  licenseNumber: z.string().min(1).max(50),
  employmentType: z.enum(['Employee', 'Contractor']),
  isActive: z.boolean().default(true),
});

export type VehicleInput = z.infer<typeof VehicleSchema>;
export type DriverInput = z.infer<typeof DriverSchema>;
```

---

## Operations Schemas

```typescript
// POST/PUT /api/customers
export const CustomerSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().max(20).optional(),
  address: z.string().max(200).optional(),
});

// POST /api/routes
export const RouteSchema = z.object({
  fromLocation: z.string().min(1).max(100),
  toLocation: z.string().min(1).max(100),
  distanceKM: z.number().positive().optional(),
});

// POST /api/trips
export const CreateOperationOrderSchema = z.object({
  customerId: id,
  vehicleId: id,
  driverId: id,
  routeId: id,
  tripDate: isoDate,
  salePrice: z.number().positive(),
  currencyId: id,
  exchangeRate: z.number().positive().default(1),
}).refine(
  (data) => data.exchangeRate > 0,
  { message: 'Exchange rate must be positive', path: ['exchangeRate'] }
);

// PUT /api/trips/:id (only if status = Pending)
export const UpdateOperationOrderSchema = CreateOperationOrderSchema.partial();

export type CreateOperationOrderInput = z.infer<typeof CreateOperationOrderSchema>;
```

---

## Expense Schemas

```typescript
const ExpenseType = z.enum(['Fuel', 'Maintenance', 'Tires', 'Oil', 'Tolls', 'Other']);
const PaymentMethod = z.enum(['Cash', 'Bank']);

// POST /api/expenses/vehicle
export const VehicleExpenseSchema = z.object({
  vehicleId: id,
  expenseType: ExpenseType,
  amount: z.number().positive(),
  currencyId: id,
  exchangeRate: z.number().positive().default(1),
  expenseDate: isoDate,
  paymentMethod: PaymentMethod,
  notes: z.string().max(500).optional(),
});

// POST /api/expenses/trip
export const TripExpenseSchema = z.object({
  operationOrderId: id,
  expenseType: ExpenseType,
  amount: z.number().positive(),
  currencyId: id,
  exchangeRate: z.number().positive().default(1),
});

// PATCH /api/currencies/:id/rate
export const UpdateExchangeRateSchema = z.object({
  exchangeRate: z.number().positive(),
});

export type VehicleExpenseInput = z.infer<typeof VehicleExpenseSchema>;
export type TripExpenseInput = z.infer<typeof TripExpenseSchema>;
```

---

## Accounting Schemas

```typescript
const AccountType = z.enum(['Asset', 'Liability', 'Revenue', 'Expense', 'Equity']);
const NormalBalance = z.enum(['Debit', 'Credit']);

// POST /api/accounting/accounts
export const CreateAccountSchema = z.object({
  parentId: id.optional(),
  code: z.string().min(1).max(20).regex(/^\d+$/, 'Account code must be numeric'),
  name: z.string().min(2).max(100),
  type: AccountType,
  normalBalance: NormalBalance,
}).refine(
  (data) => {
    // Validate normalBalance matches type convention
    const debitTypes = ['Asset', 'Expense'];
    if (debitTypes.includes(data.type) && data.normalBalance !== 'Debit') return false;
    if (!debitTypes.includes(data.type) && data.normalBalance !== 'Credit') return false;
    return true;
  },
  {
    message: 'normalBalance must be Debit for Asset/Expense, Credit for Liability/Equity/Revenue',
    path: ['normalBalance'],
  }
);

// POST /api/accounting/fiscal-periods
export const CreateFiscalPeriodSchema = z.object({
  fiscalYearId: id,
  startDate: isoDate,
  endDate: isoDate,
  periodType: z.enum(['Opening', 'Normal', 'Closing']),
}).refine(
  (data) => new Date(data.startDate) < new Date(data.endDate),
  { message: 'startDate must be before endDate', path: ['endDate'] }
);

// POST /api/accounting/cost-centers
export const CostCenterSchema = z.object({
  name: z.string().min(2).max(100),
  type: z.enum(['Vehicle', 'Route', 'Admin']),
});

export type CreateAccountInput = z.infer<typeof CreateAccountSchema>;
```

---

## Journal Entry Schema

```typescript
// Individual line
export const JournalLineSchema = z.object({
  accountId: id,
  currencyId: id,
  costCenterId: id.optional(),
  debit: z.number().min(0).default(0),
  credit: z.number().min(0).default(0),
  exchangeRate: z.number().positive().default(1),
}).refine(
  (line) => (line.debit > 0) !== (line.credit > 0),  // XOR — exactly one must be > 0
  { message: 'Each line must have either a debit OR a credit, not both or neither' }
);

// Full entry
export const CreateJournalEntrySchema = z.object({
  fiscalPeriodId: id,
  entryDate: isoDate,
  description: z.string().min(1).max(500),
  lines: z.array(JournalLineSchema).min(2, 'Journal entry requires at least 2 lines'),
}).refine(
  (entry) => {
    const totalDebitBase = entry.lines.reduce(
      (sum, line) => sum + line.debit * line.exchangeRate, 0
    );
    const totalCreditBase = entry.lines.reduce(
      (sum, line) => sum + line.credit * line.exchangeRate, 0
    );
    // Allow tiny floating-point differences
    return Math.abs(totalDebitBase - totalCreditBase) < 0.01;
  },
  { message: 'Journal entry is not balanced: total debits must equal total credits' }
);

export type CreateJournalEntryInput = z.infer<typeof CreateJournalEntrySchema>;
export type JournalLineInput = z.infer<typeof JournalLineSchema>;
```

---

## AR / AP Schemas

```typescript
// POST /api/ar/invoices
export const CreateCustomerInvoiceSchema = z.object({
  customerId: id,
  operationOrderId: id.optional(),
  invoiceDate: isoDate,
  dueDate: isoDate,
  totalAmount: z.number().positive(),
}).refine(
  (data) => new Date(data.dueDate) >= new Date(data.invoiceDate),
  { message: 'dueDate must be on or after invoiceDate', path: ['dueDate'] }
);

// POST /api/ar/payments
export const CreateCustomerPaymentSchema = z.object({
  customerId: id,
  invoiceId: id,
  paymentDate: isoDate,
  amount: z.number().positive(),
  method: z.enum(['Cash', 'Bank']),
});

// POST /api/ap/invoices
export const CreateSupplierInvoiceSchema = CreateCustomerInvoiceSchema
  .omit({ customerId: true })
  .extend({ supplierId: id });

// POST /api/ap/payments
export const CreateSupplierPaymentSchema = CreateCustomerPaymentSchema
  .omit({ customerId: true, invoiceId: true })
  .extend({
    supplierId: id,
    invoiceId: id,  // supplierInvoices.id
  });

export type CreateCustomerInvoiceInput = z.infer<typeof CreateCustomerInvoiceSchema>;
export type CreateCustomerPaymentInput = z.infer<typeof CreateCustomerPaymentSchema>;
```

---

## Query / Filter Schemas

```typescript
// Shared pagination
export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

// Trip list filters
export const TripFilterSchema = PaginationSchema.extend({
  status: z.enum(['Pending', 'InProgress', 'Completed', 'Cancelled']).optional(),
  customerId: z.coerce.number().int().positive().optional(),
  vehicleId: z.coerce.number().int().positive().optional(),
  dateFrom: isoDate.optional(),
  dateTo: isoDate.optional(),
});

// Report filters
export const ReportFilterSchema = z.object({
  fiscalPeriodId: z.coerce.number().int().positive().optional(),
  dateFrom: isoDate.optional(),
  dateTo: isoDate.optional(),
}).refine(
  (data) => {
    if (data.dateFrom && data.dateTo) {
      return new Date(data.dateFrom) <= new Date(data.dateTo);
    }
    return true;
  },
  { message: 'dateFrom must be before or equal to dateTo' }
);

export type PaginationInput = z.infer<typeof PaginationSchema>;
export type TripFilterInput = z.infer<typeof TripFilterSchema>;
export type ReportFilterInput = z.infer<typeof ReportFilterSchema>;
```

---

## Validation Helper for API Routes

```typescript
// src/lib/validate.ts
import { ZodSchema, ZodError } from 'zod';
import { NextResponse } from 'next/server';

export function validateBody<T>(schema: ZodSchema<T>, body: unknown):
  | { success: true; data: T }
  | { success: false; response: NextResponse }
{
  const result = schema.safeParse(body);

  if (!result.success) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: 'Validation failed',
          details: result.error.issues.map((i) => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400 }
      ),
    };
  }

  return { success: true, data: result.data };
}

// Usage in API route:
// const validation = validateBody(CreateOperationOrderSchema, await req.json());
// if (!validation.success) return validation.response;
// const data = validation.data;
```
