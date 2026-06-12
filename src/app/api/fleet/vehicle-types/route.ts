import { NextResponse } from "next/server"
import { db } from "@/db"
import { vehicleTypes } from "@/db/schema"

export async function GET() {
  try {
    const data = await db.select().from(vehicleTypes).orderBy(vehicleTypes.name)
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ data: [], error: "Failed to fetch vehicle types" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const [data] = await db.insert(vehicleTypes).values(body).returning()
    return NextResponse.json({ data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create vehicle type" }, { status: 500 })
  }
}
