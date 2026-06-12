import { NextResponse } from "next/server"
import { db } from "@/db"
import { vehicleTypes } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const [data] = await db.update(vehicleTypes).set(body).where(eq(vehicleTypes.id, id)).returning()
    if (!data) return NextResponse.json({ error: "Vehicle type not found" }, { status: 404 })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "Failed to update vehicle type" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const [data] = await db.delete(vehicleTypes).where(eq(vehicleTypes.id, id)).returning()
    if (!data) return NextResponse.json({ error: "Vehicle type not found" }, { status: 404 })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "Failed to delete vehicle type" }, { status: 500 })
  }
}
