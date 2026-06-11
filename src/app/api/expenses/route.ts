import { NextResponse } from "next/server"
import { db } from "@/db"
import { expenses } from "@/db/schema"
import { desc } from "drizzle-orm"

export async function GET() {
  try {
    const data = await db.select().from(expenses).orderBy(desc(expenses.expenseDate))
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ data: [], error: "Failed to fetch expenses" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const [data] = await db.insert(expenses).values(body).returning()
    return NextResponse.json({ data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 })
  }
}
