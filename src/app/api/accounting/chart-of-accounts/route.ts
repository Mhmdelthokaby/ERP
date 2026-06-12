import { NextResponse } from "next/server"
import { db } from "@/db"
import { chartOfAccounts } from "@/db/schema"
import { asc } from "drizzle-orm"

export async function GET() {
  try {
    const data = await db.select().from(chartOfAccounts).orderBy(asc(chartOfAccounts.code))
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ data: [], error: "Failed to fetch chart of accounts" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const [data] = await db.insert(chartOfAccounts).values(body).returning()
    return NextResponse.json({ data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
  }
}
