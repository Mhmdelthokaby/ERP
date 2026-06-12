import { NextResponse } from "next/server"
import { db } from "@/db"
import { operationOrders } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const [data] = await db.select().from(operationOrders).where(eq(operationOrders.id, params.id))
    if (!data) return NextResponse.json({ error: "Order not found" }, { status: 404 })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const [data] = await db.update(operationOrders).set({ ...body, updatedAt: new Date() }).where(eq(operationOrders.id, params.id)).returning()
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await db.delete(operationOrders).where(eq(operationOrders.id, params.id))
    return NextResponse.json({ data: { id: params.id } })
  } catch {
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 })
  }
}
