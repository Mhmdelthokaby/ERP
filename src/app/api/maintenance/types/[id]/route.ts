import { NextResponse } from "next/server"
import { db } from "@/db"
import { maintenanceTypes } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const [data] = await db.select().from(maintenanceTypes).where(eq(maintenanceTypes.id, params.id))
    if (!data) return NextResponse.json({ error: "Maintenance type not found" }, { status: 404 })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "Failed to fetch maintenance type" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const [data] = await db.update(maintenanceTypes).set({ ...body, updatedAt: new Date() }).where(eq(maintenanceTypes.id, params.id)).returning()
    if (!data) return NextResponse.json({ error: "Maintenance type not found" }, { status: 404 })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "Failed to update maintenance type" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const [data] = await db.delete(maintenanceTypes).where(eq(maintenanceTypes.id, params.id)).returning({ id: maintenanceTypes.id })
    if (!data) return NextResponse.json({ error: "Maintenance type not found" }, { status: 404 })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "Failed to delete maintenance type" }, { status: 500 })
  }
}
