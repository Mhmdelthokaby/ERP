import { NextResponse } from "next/server"
import { db } from "@/db"
import { suppliers } from "@/db/schema"
import { eq, or, sql } from "drizzle-orm"

export async function GET() {
  try {
    const data = await db.select().from(suppliers).orderBy(suppliers.createdAt)
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!body.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }
    const [data] = await db.insert(suppliers).values({
      name: body.name,
      taxNumber: body.taxNumber || null,
      phone: body.phone || null,
      notes: body.notes || null,
    }).returning()
    return NextResponse.json({ data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create supplier" }, { status: 500 })
  }
}
