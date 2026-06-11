import { NextResponse } from "next/server"
import { db } from "@/db"
import { journalEntries, journalEntryLines, chartOfAccounts } from "@/db/schema"
import { sql, eq } from "drizzle-orm"

export async function GET() {
  try {
    const accounts = await db.select().from(chartOfAccounts).where(sql`${chartOfAccounts.isActive} = true`).orderBy(chartOfAccounts.code)

    const trialBalance = []
    for (const acc of accounts) {
      const lines = await db.select({
        debit: sql`COALESCE(SUM(${journalEntryLines.debitAmount}::numeric), 0)`,
        credit: sql`COALESCE(SUM(${journalEntryLines.creditAmount}::numeric), 0)`,
      }).from(journalEntryLines)
        .innerJoin(journalEntries, eq(journalEntryLines.journalEntryId, journalEntries.id))
        .where(eq(journalEntryLines.accountId, acc.id))

      const debit = Number(lines[0]?.debit || 0)
      const credit = Number(lines[0]?.credit || 0)
      trialBalance.push({ code: acc.code, name: acc.name, debit, credit, balance: debit - credit })
    }

    const revenue = trialBalance.filter((a) => a.code.startsWith("4"))
    const expense = trialBalance.filter((a) => a.code.startsWith("5"))
    const totalRevenue = revenue.reduce((s, a) => s + a.credit - a.debit, 0)
    const totalExpense = expense.reduce((s, a) => s + a.debit - a.credit, 0)

    return NextResponse.json({
      data: { trialBalance, incomeStatement: { revenue, expense, totalRevenue, totalExpense, netProfit: totalRevenue - totalExpense } },
    })
  } catch {
    return NextResponse.json({ data: { trialBalance: [], incomeStatement: null } }, { status: 500 })
  }
}
