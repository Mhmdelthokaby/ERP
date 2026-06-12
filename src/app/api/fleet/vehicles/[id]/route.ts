import { NextResponse } from "next/server"
import { db } from "@/db"
import { vehicles } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const [data] = await db.select().from(vehicles).where(eq(vehicles.id, params.id))
    if (!data) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "Failed to fetch vehicle" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const [data] = await db.update(vehicles).set({ ...body, updatedAt: new Date() }).where(eq(vehicles.id, params.id)).returning()
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "Failed to update vehicle" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await db.delete(vehicles).where(eq(vehicles.id, params.id))
    return NextResponse.json({ data: { id: params.id } })
  } catch {
    return NextResponse.json({ error: "Failed to delete vehicle" }, { status: 500 })
  }
}
