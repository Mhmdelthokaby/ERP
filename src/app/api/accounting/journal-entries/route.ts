import { NextResponse } from "next/server"
import { db } from "@/db"
import { journalEntries, journalEntryLines } from "@/db/schema"
import { desc, eq } from "drizzle-orm"

export async function GET() {
  try {
    const data = await db.select().from(journalEntries).orderBy(desc(journalEntries.entryDate))
    const result = []
    for (const je of data) {
      const lines = await db.select().from(journalEntryLines).where(eq(journalEntryLines.journalEntryId, je.id))
      result.push({ ...je, lines })
    }
    return NextResponse.json({ data: result })
  } catch {
    return NextResponse.json({ data: [], error: "Failed to fetch journal entries" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { description, entryDate, fiscalPeriodId, lines } = await request.json()
    const [entry] = await db.insert(journalEntries).values({
      entryNumber: `JE-${Date.now()}`,
      description,
      entryDate,
      fiscalPeriodId,
      status: "Posted",
    }).returning()

    if (lines && lines.length) {
      await db.insert(journalEntryLines).values(
        lines.map((l: Record<string, unknown>) => ({
          journalEntryId: entry.id,
          accountId: l.accountId,
          debitAmount: String(l.debit || 0),
          creditAmount: String(l.credit || 0),
          baseAmount: String(l.debit || l.credit || 0),
          description: l.description || "",
        }))
      )
    }

    return NextResponse.json({ data: entry }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create journal entry" }, { status: 500 })
  }
}
