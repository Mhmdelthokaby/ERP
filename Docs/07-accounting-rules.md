# 07 — Accounting Rules

> Chart of Accounts · Journal Templates · Closing Procedures · Critical Rules

---

## 1. The 10 Immutable Laws

```
1.  Every journal entry:        Debit = Credit (always balanced)
2.  Journal entries:            Immutable — no UPDATE, no DELETE
3.  Corrections:                Reverse the wrong entry + create new correct entry
4.  Closed periods:             No new entries allowed
5.  Profit/Loss:                Never stored — always calculated from Revenue - Expenses
6.  Financial truth:            Only from Journal Ledger — no shortcuts
7.  Multi-currency:             Always store original amount + base amount
8.  Account balances:           Always calculated from journal lines — never cached
9.  Reversal entries:           Must reference the original entry (reversalOfId)
10. System accounts:            Leaf nodes only receive journal lines (no parent accounts)
```

---

## 2. Chart of Accounts — Default Structure

### Root Structure

```
1xxx  Assets          (Normal Balance: Debit)
2xxx  Liabilities     (Normal Balance: Credit)
3xxx  Equity          (Normal Balance: Credit)
4xxx  Revenue         (Normal Balance: Credit)
5xxx  Expenses        (Normal Balance: Debit)
```

### Full Default CoA

```
─────────────────────────────────────────────────────
Code   Name                          Type        NB
─────────────────────────────────────────────────────
1000   Assets                        Asset       Dr
  1100   Cash on Hand                Asset       Dr
  1101   Cash at Bank                Asset       Dr
  1200   Accounts Receivable         Asset       Dr
  1300   Prepaid Expenses            Asset       Dr
  1500   Fixed Assets                Asset       Dr
    1510   Vehicles                  Asset       Dr
    1511   Accumulated Depr. (Veh.)  Asset       Cr *
    1520   Equipment                 Asset       Dr
─────────────────────────────────────────────────────
2000   Liabilities                   Liability   Cr
  2100   Accounts Payable            Liability   Cr
  2200   Accrued Expenses            Liability   Cr
  2300   Deferred Revenue            Liability   Cr
─────────────────────────────────────────────────────
3000   Equity                        Equity      Cr
  3100   Owner's Capital             Equity      Cr
  3200   Retained Earnings           Equity      Cr
─────────────────────────────────────────────────────
4000   Revenue                       Revenue     Cr
  4100   Transportation Revenue      Revenue     Cr
  4200   Tourism Revenue             Revenue     Cr
  4900   Other Revenue               Revenue     Cr
─────────────────────────────────────────────────────
5000   Expenses                      Expense     Dr
  5100   Fuel Expense                Expense     Dr
  5200   Maintenance Expense         Expense     Dr
  5300   Tires Expense               Expense     Dr
  5400   Oil & Lubricants            Expense     Dr
  5500   Tolls & Permits             Expense     Dr
  5600   Driver Wages                Expense     Dr
  5700   Depreciation Expense        Expense     Dr
  5800   Administrative Expense      Expense     Dr
  5900   Other Expenses              Expense     Dr
─────────────────────────────────────────────────────

* 1511 Accumulated Depreciation: contra-asset, credit balance reduces asset value
```

---

## 3. Journal Templates

Each template shows the accounts debited and credited for a given business event.

---

### Template 1: Trip Completed — Revenue Recognition

**Trigger:** `operationOrders` status → `Completed`

```
DR  1200  Accounts Receivable     [salePriceBase]
CR  4100  Transportation Revenue  [salePriceBase]

Description: Trip #[orderId] · [fromLocation] → [toLocation] · [customerName]
Source: TripCompleted
Cost Center: Route:[routeId]
```

---

### Template 2: Customer Payment Received

**Trigger:** `customerPayments` created

```
If method = 'Cash':
  DR  1100  Cash on Hand        [amountBase]
  CR  1200  Accounts Receivable [amountBase]

If method = 'Bank':
  DR  1101  Cash at Bank        [amountBase]
  CR  1200  Accounts Receivable [amountBase]

Description: Payment · Invoice [invoiceNumber] · [customerName]
Source: PaymentReceived
```

---

### Template 3: Vehicle Expense Recorded

**Trigger:** `vehicleExpenses` created

```
Fuel:
  DR  5100  Fuel Expense        [amountBase]
  CR  2100  Accounts Payable    [amountBase]   (if on credit)
  -- OR --
  CR  1100  Cash on Hand        [amountBase]   (if paymentMethod = Cash)
  -- OR --
  CR  1101  Cash at Bank        [amountBase]   (if paymentMethod = Bank)

Maintenance:
  DR  5200  Maintenance Expense [amountBase]
  CR  [same Cash/Bank/Payable logic]

Tires:
  DR  5300  Tires Expense       [amountBase]
  CR  [same]

Oil:
  DR  5400  Oil & Lubricants    [amountBase]
  CR  [same]

Tolls:
  DR  5500  Tolls & Permits     [amountBase]
  CR  [same]

Description: [expenseType] · Vehicle [plateNumber]
Source: ExpenseRecorded
Cost Center: Vehicle:[vehicleId]
```

---

### Template 4: Supplier Invoice Received

**Trigger:** `supplierInvoices` posted

```
DR  5xxx  [relevant expense account]   [totalAmount]
CR  2100  Accounts Payable             [totalAmount]

Description: Supplier Invoice [invoiceNumber] · [supplierName]
Source: InvoicePosted
```

---

### Template 5: Supplier Payment Made

**Trigger:** `supplierPayments` created

```
DR  2100  Accounts Payable   [amountBase]
CR  1100  Cash on Hand       [amountBase]   (if Cash)
-- OR --
CR  1101  Cash at Bank       [amountBase]   (if Bank)

Description: Payment · Supplier Invoice [invoiceNumber] · [supplierName]
Source: SupplierPaymentMade
```

---

### Template 6: Reversal Entry

**Trigger:** Manual reversal by Accountant

```
[Mirror of original entry with Debit ↔ Credit swapped]

Description: Reversal of [originalEntryNumber] — [reason]
Source: Reversal
reversalOfId: [originalEntry.id]
```

---

### Template 7: Opening Balances (Year Start)

**Trigger:** Manual entry at beginning of fiscal year

```
DR  [each asset account]       [opening balance]
DR  [expense accounts]         [if any opening balance]
CR  [each liability account]   [opening balance]
CR  [equity accounts]          [opening balance]
CR  [revenue accounts]         [if any opening balance]

All entries in period of type 'Opening'
Description: Opening Balances FY[year]
Source: Manual
```

---

### Template 8: Closing Entry (Year End)

**Trigger:** Manual closing entries by Accountant

```
Step 1 — Close Revenue:
  DR  4100  Transportation Revenue  [total revenue balance]
  DR  4200  Tourism Revenue         [total revenue balance]
  CR  3200  Retained Earnings       [total revenue]

Step 2 — Close Expenses:
  DR  3200  Retained Earnings       [total expenses]
  CR  5100  Fuel Expense            [balance]
  CR  5200  Maintenance Expense     [balance]
  ... [all expense accounts]

Net effect: Revenue and Expense accounts zeroed out,
            Retained Earnings reflects net profit/loss
```

---

## 4. Account Balance Calculation

**Never store balance on the account row.** Always calculate:

```typescript
async function getAccountBalance(accountId: number, asOfDate?: Date) {
  const lines = await db
    .select({
      totalDebitBase: sum(journalEntryLines.debitBase),
      totalCreditBase: sum(journalEntryLines.creditBase),
    })
    .from(journalEntryLines)
    .innerJoin(journalEntries, eq(journalEntryLines.journalEntryId, journalEntries.id))
    .where(
      and(
        eq(journalEntryLines.accountId, accountId),
        asOfDate ? lte(journalEntries.entryDate, asOfDate) : undefined,
      )
    );

  const debit = Number(lines[0]?.totalDebitBase ?? 0);
  const credit = Number(lines[0]?.totalCreditBase ?? 0);

  return { debit, credit, balance: debit - credit };
  // Positive balance = net debit
  // For Debit-normal accounts (Asset, Expense): positive means asset/expense exists
  // For Credit-normal accounts (Liability, Revenue, Equity): negative means balance exists
}
```

---

## 5. Trial Balance Logic

```typescript
async function getTrialBalance(fiscalPeriodId: number) {
  // Sum journal lines grouped by account
  const rows = await db
    .select({
      accountId: journalEntryLines.accountId,
      accountCode: accounts.code,
      accountName: accounts.name,
      accountType: accounts.type,
      normalBalance: accounts.normalBalance,
      totalDebit: sum(journalEntryLines.debitBase),
      totalCredit: sum(journalEntryLines.creditBase),
    })
    .from(journalEntryLines)
    .innerJoin(journalEntries, eq(journalEntryLines.journalEntryId, journalEntries.id))
    .innerJoin(accounts, eq(journalEntryLines.accountId, accounts.id))
    .where(eq(journalEntries.fiscalPeriodId, fiscalPeriodId))
    .groupBy(
      journalEntryLines.accountId,
      accounts.code, accounts.name, accounts.type, accounts.normalBalance
    );

  const totalDebit = rows.reduce((s, r) => s + Number(r.totalDebit), 0);
  const totalCredit = rows.reduce((s, r) => s + Number(r.totalCredit), 0);

  // Sanity check — should always be equal
  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw new Error('Trial balance does not balance — data integrity issue');
  }

  return { accounts: rows, totalDebit, totalCredit };
}
```

---

## 6. Income Statement Logic

```
Revenue:
  SUM(creditBase - debitBase) WHERE accounts.type = 'Revenue'

Expenses:
  SUM(debitBase - creditBase) WHERE accounts.type = 'Expense'

Net Profit = Revenue - Expenses

Both calculated from journalEntryLines for the selected period.
NEVER from a stored profit field.
```

---

## 7. Multi-Currency Rules

```
1. Every transaction records:
   - Original currency (currencyId)
   - Original amount (amount / debit / credit)
   - Exchange rate at time of transaction (exchangeRate)
   - Base currency equivalent (amountBase / debitBase / creditBase)

2. The base currency is defined by currencies WHERE isBase = true

3. All financial reports use BASE currency columns (debitBase, creditBase)

4. Exchange rate changes after posting:
   → Do NOT retroactively update journal lines
   → FX gain/loss is a separate journal entry if needed

5. exchangeRate = (1 unit of foreign currency) / (1 unit of base currency)
   Example: if base = EGP, and 1 USD = 31 EGP → exchangeRate = 31
   amountBase = amount * exchangeRate
```

---

## 8. Period Closing Checklist

Before closing a fiscal period, the Accountant must verify:

```
Pre-close checklist:
  □ All outboxMessages in this period are status = 'Processed'
  □ Trial balance is balanced (totalDebit = totalCredit)
  □ All customer invoices are Posted (no Drafts)
  □ All supplier invoices are Posted (no Drafts)
  □ Bank reconciliation done (if applicable)
  □ Depreciation entries posted (if applicable)

On close:
  UPDATE fiscalPeriods SET isClosed = true

Post-close:
  □ Generate Income Statement for the period
  □ Generate Balance Sheet as of period end
  □ Archive reports as PDF
```

---

## 9. Fiscal Year Closing Procedure

```
1. Close all Normal periods of the year
2. Create Closing period (type = 'Closing')
3. Post closing entries (Template 8):
   - Close Revenue → Retained Earnings
   - Close Expenses → Retained Earnings
4. Close the Closing period
5. Close the Fiscal Year (fiscalYears SET isClosed = true)
6. Create new Fiscal Year
7. Create Opening period for new year
8. Post opening balances (Template 7)
```
