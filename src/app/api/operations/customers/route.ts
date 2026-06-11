import { NextResponse } from "next/server"
import { db } from "@/db"
import { customers } from "@/db/schema"
import { asc } from "drizzle-orm"

export async function GET() {
  try {
    const data = await db.select().from(customers).orderBy(asc(customers.name))
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ data: [], error: "Failed to fetch customers" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const [data] = await db.insert(customers).values(body).returning()
    return NextResponse.json({ data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
  }
}
