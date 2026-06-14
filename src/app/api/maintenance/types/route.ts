import { NextResponse } from "next/server"
import { db } from "@/db"
import { maintenanceTypes } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET() {
  try {
    const data = await db.select().from(maintenanceTypes).orderBy(maintenanceTypes.createdAt)
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "Failed to fetch maintenance types" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!body.name) return NextResponse.json({ error: "Name is required" }, { status: 400 })
    const [data] = await db.insert(maintenanceTypes).values({ name: body.name }).returning()
    return NextResponse.json({ data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create maintenance type" }, { status: 500 })
  }
}
