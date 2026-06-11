import { NextResponse } from "next/server"
import { db } from "@/db"
import { routesTable } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const [data] = await db.select().from(routesTable).where(eq(routesTable.id, params.id))
    if (!data) return NextResponse.json({ error: "Route not found" }, { status: 404 })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "Failed to fetch route" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const [data] = await db.update(routesTable).set({ ...body, updatedAt: new Date() }).where(eq(routesTable.id, params.id)).returning()
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "Failed to update route" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await db.delete(routesTable).where(eq(routesTable.id, params.id))
    return NextResponse.json({ data: { id: params.id } })
  } catch {
    return NextResponse.json({ error: "Failed to delete route" }, { status: 500 })
  }
}
