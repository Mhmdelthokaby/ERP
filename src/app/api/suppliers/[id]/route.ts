import { NextResponse } from "next/server"
import { db } from "@/db"
import { suppliers } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const [data] = await db.select().from(suppliers).where(eq(suppliers.id, params.id))
    if (!data) return NextResponse.json({ error: "Supplier not found" }, { status: 404 })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "Failed to fetch supplier" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const [data] = await db.update(suppliers).set({ ...body, updatedAt: new Date() }).where(eq(suppliers.id, params.id)).returning()
    if (!data) return NextResponse.json({ error: "Supplier not found" }, { status: 404 })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "Failed to update supplier" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const [data] = await db.delete(suppliers).where(eq(suppliers.id, params.id)).returning({ id: suppliers.id })
    if (!data) return NextResponse.json({ error: "Supplier not found" }, { status: 404 })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "Failed to delete supplier" }, { status: 500 })
  }
}
