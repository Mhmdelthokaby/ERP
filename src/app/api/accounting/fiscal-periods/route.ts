import { NextResponse } from "next/server"
import { db } from "@/db"
import { fiscalPeriods } from "@/db/schema"
import { asc } from "drizzle-orm"

export async function GET() {
  try {
    const data = await db.select().from(fiscalPeriods).orderBy(asc(fiscalPeriods.startDate))
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ data: [], error: "Failed to fetch fiscal periods" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const [data] = await db.insert(fiscalPeriods).values(body).returning()
    return NextResponse.json({ data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create fiscal period" }, { status: 500 })
  }
}
