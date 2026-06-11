import { NextResponse } from "next/server"
import { db } from "@/db"
import { operationOrders } from "@/db/schema"
import { desc } from "drizzle-orm"

export async function GET() {
  try {
    const data = await db.select().from(operationOrders).orderBy(desc(operationOrders.createdAt))
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ data: [], error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const [data] = await db.insert(operationOrders).values(body).returning()
    return NextResponse.json({ data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
